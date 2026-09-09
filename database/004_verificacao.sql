-- Consultas de conferência para PostgreSQL/Neon.
SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
SELECT routine_name,routine_type FROM information_schema.routines WHERE routine_schema='public' ORDER BY routine_name;
SELECT trigger_name,event_object_table,event_manipulation FROM information_schema.triggers WHERE trigger_schema='public' ORDER BY trigger_name;
SELECT column_name,data_type,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name IN ('TemaEscuro','AvatarId') ORDER BY column_name;
SELECT p."Id",p."Nome",p."Estoque",COALESCE(SUM(CASE WHEN m."Tipo"='Entrada' THEN m."Quantidade" ELSE -m."Quantidade" END),0) AS saldo_historico
FROM produtos p LEFT JOIN movimentacoes m ON m."ProdutoId"=p."Id" GROUP BY p."Id",p."Nome",p."Estoque"
HAVING p."Estoque"<>COALESCE(SUM(CASE WHEN m."Tipo"='Entrada' THEN m."Quantidade" ELSE -m."Quantidade" END),0);
SELECT o."Id",o."Total",SUM(i."Subtotal") AS soma_itens FROM orcamentos o JOIN itens_orcamento i ON i."OrcamentoId"=o."Id"
GROUP BY o."Id",o."Total" HAVING o."Total"<>SUM(i."Subtotal");
SELECT * FROM sp_resumo_estoque(20);
EXPLAIN SELECT * FROM movimentacoes WHERE "ProdutoId"=1 AND "DataHora">='2026-01-01' ORDER BY "DataHora";
