-- Funções e gatilhos PostgreSQL. Reexecutável com segurança.
CREATE OR REPLACE FUNCTION tr_produto_auditoria_fn() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
 IF OLD."Estoque"<>NEW."Estoque" THEN
  INSERT INTO auditoria_estoque("ProdutoId","SaldoAnterior","SaldoAtual","DataHora") VALUES(NEW."Id",OLD."Estoque",NEW."Estoque",CURRENT_TIMESTAMP);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS tr_produto_auditoria ON produtos;
CREATE TRIGGER tr_produto_auditoria AFTER UPDATE ON produtos FOR EACH ROW EXECUTE PROCEDURE tr_produto_auditoria_fn();

CREATE OR REPLACE FUNCTION tr_movimento_imutavel_fn() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Histórico imutável. Registre uma movimentação compensatória.'; END $$;
DROP TRIGGER IF EXISTS tr_movimento_sem_edicao ON movimentacoes;
CREATE TRIGGER tr_movimento_sem_edicao BEFORE UPDATE ON movimentacoes FOR EACH ROW EXECUTE PROCEDURE tr_movimento_imutavel_fn();
DROP TRIGGER IF EXISTS tr_movimento_sem_exclusao ON movimentacoes;
CREATE TRIGGER tr_movimento_sem_exclusao BEFORE DELETE ON movimentacoes FOR EACH ROW EXECUTE PROCEDURE tr_movimento_imutavel_fn();

CREATE OR REPLACE FUNCTION sp_registrar_movimentacao(p_produto INTEGER,p_tipo VARCHAR,p_quantidade INTEGER,p_motivo VARCHAR,p_usuario INTEGER,p_chave VARCHAR)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE v_saldo INTEGER;v_nome VARCHAR(100);v_usuario VARCHAR(100);v_login VARCHAR(100);v_id INTEGER;v_match BOOLEAN;
BEGIN
 IF p_quantidade IS NULL OR p_quantidade<=0 OR p_quantidade>1000000 OR p_tipo IS NULL OR p_tipo NOT IN ('Entrada','Saida')
    OR p_chave IS NULL OR CHAR_LENGTH(p_chave)<>36 OR p_motivo IS NULL OR CHAR_LENGTH(TRIM(p_motivo))=0 THEN
  RAISE EXCEPTION 'Dados da movimentação inválidos.';
 END IF;
 SELECT "Estoque","Nome" INTO v_saldo,v_nome FROM produtos WHERE "Id"=p_produto FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Produto inexistente.';END IF;
 SELECT "Id",("ProdutoId"=p_produto AND "Tipo"=p_tipo AND "Quantidade"=p_quantidade AND "Motivo"=p_motivo AND "ResponsavelId"=p_usuario)
 INTO v_id,v_match FROM movimentacoes WHERE "ChaveOperacao"=p_chave;
 IF FOUND THEN
  IF NOT v_match THEN RAISE EXCEPTION 'Chave de operação já utilizada com outros dados.';END IF;
  RETURN v_id;
 END IF;
 SELECT "Name","Login" INTO v_usuario,v_login FROM usuarios WHERE "Id"=p_usuario AND "Ativo"=TRUE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Usuário inexistente ou inativo.';END IF;
 IF p_tipo='Saida' AND v_saldo<p_quantidade THEN RAISE EXCEPTION 'Estoque insuficiente.';END IF;
 UPDATE produtos SET "Estoque"="Estoque"+CASE WHEN p_tipo='Entrada' THEN p_quantidade ELSE -p_quantidade END WHERE "Id"=p_produto;
 INSERT INTO movimentacoes("Tipo","ProdutoId","ProdutoNome","Quantidade","Motivo","Responsavel","UsuarioId","ResponsavelId","ChaveOperacao","DataHora")
 VALUES(p_tipo,p_produto,v_nome,p_quantidade,p_motivo,v_usuario,v_login,p_usuario,p_chave,CURRENT_TIMESTAMP) RETURNING "Id" INTO v_id;
 RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION sp_resumo_estoque(p_limite INTEGER)
RETURNS TABLE(id INTEGER,sku VARCHAR,nome VARCHAR,estoque INTEGER,preco_custo NUMERIC,valor_em_estoque NUMERIC)
LANGUAGE sql AS $$
 SELECT "Id","Sku","Nome","Estoque","PrecoCusto",ROUND("Estoque"*"PrecoCusto",2) FROM produtos WHERE "Estoque"<p_limite ORDER BY "Estoque","Nome"
$$;
