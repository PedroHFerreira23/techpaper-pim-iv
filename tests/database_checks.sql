-- Executar somente em banco descartável, depois da suíte de integração.
-- Dados auxiliares são revertidos; os testes não enfraquecem os gatilhos.
BEGIN;
DO $$
DECLARE
 usuario INTEGER;
 fornecedor INTEGER;
 produto INTEGER;
 movimento INTEGER;
 bloqueou BOOLEAN;
BEGIN
 SELECT "Id" INTO usuario FROM usuarios WHERE "Ativo" ORDER BY "Id" LIMIT 1;
 SELECT "Id" INTO fornecedor FROM fornecedores ORDER BY "Id" LIMIT 1;
 IF usuario IS NULL OR fornecedor IS NULL THEN RAISE EXCEPTION 'Pré-condições de teste ausentes'; END IF;
 INSERT INTO produtos("Sku","Nome","Categoria","Fornecedor","FornecedorId","PrecoCusto","PrecoVenda")
 VALUES('SQL-CHECK-' || md5(random()::text),'Produto teste SQL','Teste','Teste',fornecedor,2,3)
 RETURNING "Id" INTO produto;

 -- INSERT direto deve aplicar o saldo uma única vez e gerar auditoria.
 INSERT INTO movimentacoes("Tipo","ProdutoId","ProdutoNome","Quantidade","Motivo","Responsavel","UsuarioId","ResponsavelId","ChaveOperacao")
 VALUES('Entrada',produto,'Produto teste SQL',8,'Teste SQL','Teste','teste',usuario,gen_random_uuid()::text)
 RETURNING "Id" INTO movimento;
 IF (SELECT "Estoque" FROM produtos WHERE "Id"=produto)<>8 THEN RAISE EXCEPTION 'Trigger não atualizou saldo'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auditoria_estoque WHERE "ProdutoId"=produto AND "SaldoAnterior"=0 AND "SaldoAtual"=8)
 THEN RAISE EXCEPTION 'Auditoria não criada'; END IF;

 bloqueou:=FALSE;
 BEGIN UPDATE movimentacoes SET "Quantidade"=9 WHERE "Id"=movimento;
 EXCEPTION WHEN raise_exception THEN bloqueou:=TRUE; END;
 IF NOT bloqueou THEN RAISE EXCEPTION 'Histórico permitiu UPDATE'; END IF;

 bloqueou:=FALSE;
 BEGIN DELETE FROM movimentacoes WHERE "Id"=movimento;
 EXCEPTION WHEN raise_exception THEN bloqueou:=TRUE; END;
 IF NOT bloqueou THEN RAISE EXCEPTION 'Histórico permitiu DELETE'; END IF;

 bloqueou:=FALSE;
 BEGIN
  INSERT INTO movimentacoes("Tipo","ProdutoId","ProdutoNome","Quantidade","Motivo","Responsavel","UsuarioId","ResponsavelId","ChaveOperacao")
  VALUES('Saida',produto,'Produto teste SQL',9,'Saída inválida','Teste','teste',usuario,gen_random_uuid()::text);
 EXCEPTION WHEN raise_exception THEN bloqueou:=TRUE; END;
 IF NOT bloqueou THEN RAISE EXCEPTION 'Trigger permitiu saldo negativo'; END IF;
 IF (SELECT "Estoque" FROM produtos WHERE "Id"=produto)<>8 OR
    (SELECT COUNT(*) FROM movimentacoes WHERE "ProdutoId"=produto)<>1
 THEN RAISE EXCEPTION 'Rejeição da saída não foi atômica'; END IF;

 IF EXISTS(
  SELECT p."Id" FROM produtos p LEFT JOIN movimentacoes m ON m."ProdutoId"=p."Id"
  GROUP BY p."Id",p."Estoque"
  HAVING p."Estoque"<>COALESCE(SUM(CASE WHEN m."Tipo"='Entrada' THEN m."Quantidade" ELSE -m."Quantidade" END),0)
 ) THEN RAISE EXCEPTION 'Saldo diverge do histórico'; END IF;
 IF EXISTS(
  SELECT o."Id" FROM orcamentos o LEFT JOIN itens_orcamento i ON i."OrcamentoId"=o."Id"
  GROUP BY o."Id",o."Total" HAVING o."Total"<>COALESCE(SUM(i."Subtotal"),0)
 ) THEN RAISE EXCEPTION 'Total de orçamento diverge dos itens'; END IF;
 RAISE NOTICE 'Gatilhos, auditoria, imutabilidade e consistência aprovados';
END $$;
ROLLBACK;
