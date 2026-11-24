-- Lote acadêmico opcional: só cria registros novos; o bloco inteiro é transacional.
DO $seed$
DECLARE
  nomes text[] := ARRAY['Caderno universitário','Caderno de desenho','Agenda semanal','Bloco quadriculado','Caderno de caligrafia','Bloco de notas','Caneta azul','Caneta preta','Lápis grafite','Lapiseira','Marca-texto','Caneta gel','Aquarela','Tinta guache','Pincel redondo','Giz pastel','Lápis de cor','Papel para pintura','Pasta sanfonada','Pasta catálogo','Caixa arquivo','Divisórias','Prancheta','Envelope kraft','Régua','Tesoura escolar','Cola bastão','Apontador','Borracha branca','Esquadro','Papel sulfite','Clipes','Grampeador','Grampos','Fita adesiva','Etiquetas']; categorias text[] := ARRAY['Cadernos','Escrita','Artes','Organização','Material escolar','Papelaria'];
  casas text[] := ARRAY['Horizonte','Ipê','Aurora','Cedro','Ponte','Jardim'];
  produtos_lote int[] := ARRAY[]::int[]; grupos int[] := ARRAY[]::int[];
  ator int; f int; p int; o int; i int; g int; j int; n int; custo numeric; venda numeric; sku text; cliente text;
BEGIN
  PERFORM pg_advisory_xact_lock(84723105);
  IF EXISTS(SELECT 1 FROM usuarios WHERE "Login"='lote-banca-v1@example.invalid') THEN RETURN; END IF;
  IF NOT EXISTS(SELECT 1 FROM usuarios WHERE "Role"='Admin' AND "Ativo") THEN RAISE EXCEPTION 'A carga precisa de um administrador existente.'; END IF;
  IF EXISTS(SELECT 1 FROM produtos WHERE "Sku" LIKE 'PIM-DEMO-%') THEN RAISE EXCEPTION 'Prefixo PIM-DEMO já ocupado; carga não aplicada.'; END IF;
  -- Sem senha válida e nunca visível como usuário ativo fora desta transação.
  INSERT INTO usuarios("Name","Login","Password","Role") VALUES('Demonstração acadêmica','lote-banca-v1@example.invalid','!sem-login','Operador') RETURNING "Id" INTO ator;
  FOR g IN 1..6 LOOP
    INSERT INTO fornecedores("Cnpj","RazaoSocial","NomeFantasia","Segmento","Telefone","Email","PrazoEntregaDias")
    VALUES('00.000.000/990'||g||'-00','Demo '||casas[g]||' Fictícia','Demo '||casas[g],categorias[g],'(00) 0000-0000','banca'||g||'@example.invalid',g+1) RETURNING "Id" INTO f;
    grupos:=array_append(grupos,f);
  END LOOP;
  FOR i IN 1..36 LOOP
    g:=1+(i-1)/6; custo:=round(1.25+i*0.65,2); venda:=round(custo*1.65,2); sku:='PIM-DEMO-'||lpad(i::text,3,'0');
    INSERT INTO produtos("Sku","Nome","Categoria","Fornecedor","FornecedorId","PrecoCusto","PrecoVenda") VALUES(sku,nomes[i],categorias[g],'Demo '||casas[g],grupos[g],custo,venda) RETURNING "Id" INTO p;
    produtos_lote:=array_append(produtos_lote,p);
    PERFORM sp_registrar_movimentacao(p,'Entrada',8+i%28,'Demonstração PIM IV',ator,md5(sku||':entrada:banca')::uuid::text::varchar);
    PERFORM sp_registrar_movimentacao(p,'Saida',1+i%6,'Demonstração PIM IV',ator,md5(sku||':saida:banca')::uuid::text::varchar);
  END LOOP;
  FOR n IN 0..11 LOOP
    cliente:='PIM Demo '||lpad((n+1)::text,2,'0')||' / '||(ARRAY['Oficina de arte','Feira de ciências','Curso de desenho','Clube de leitura'])[1+n%4];
    INSERT INTO orcamentos("Cliente","Observacoes","Status","UsuarioId","Validade","Total") VALUES(cliente,'Pedido fictício de apresentação.',(ARRAY['Rascunho','Aprovado','Cancelado'])[1+n%3],ator,(now() AT TIME ZONE 'America/Sao_Paulo')::date+30,0) RETURNING "Id" INTO o;
    FOR j IN 1..3 LOOP
      INSERT INTO itens_orcamento("OrcamentoId","ProdutoId","ProdutoNome","Quantidade","PrecoUnitario","Subtotal") SELECT o,"Id","Nome",j,"PrecoVenda",round(j*"PrecoVenda",2) FROM produtos WHERE "Id"=produtos_lote[3*n+j];
    END LOOP;
    UPDATE orcamentos SET "Total"=(SELECT sum("Subtotal") FROM itens_orcamento WHERE "OrcamentoId"=o) WHERE "Id"=o;
  END LOOP;
  UPDATE usuarios SET "Ativo"=false WHERE "Id"=ator;
END $seed$;
