# Banco de dados do TechPaper

O arquivo principal é `000_banco_completo.sql`. Ele cria no PostgreSQL/Neon as oito tabelas, chaves, restrições, índices, funções, gatilhos e dados fictícios de demonstração. Pode ser executado novamente sem recriar registros que já existem.

## Ordem para a entrega

1. Abra o projeto do TechPaper no Neon.
2. Entre em **SQL Editor** e clique em **New query**.
3. Abra `000_banco_completo.sql`, copie tudo, cole no editor e clique em **Run**.
4. Abra `004_verificacao.sql`, copie tudo, cole em uma nova consulta e clique em **Run**.
5. Tire capturas das listas de tabelas, rotinas e gatilhos e guarde-as para os anexos do PIM.

A API executa `001_schema.sql` e `002_routines.sql` ao iniciar. O arquivo consolidado existe para atender ao requisito acadêmico de apresentar o script completo do banco.

## Estrutura entregue

- `usuarios`: autenticação, perfil e estado ativo;
- `fornecedores`: dados cadastrais e prazo;
- `produtos`: catálogo, preços e saldo;
- `movimentacoes`: histórico imutável de entradas e saídas;
- `sessoes`: tokens de sessão armazenados por hash;
- `orcamentos` e `itens_orcamento`: cabeçalho e composição dos orçamentos;
- `auditoria_estoque`: saldo anterior e saldo posterior;
- `sp_registrar_movimentacao`: transação com bloqueio de linha, validações e idempotência;
- `sp_resumo_estoque`: consulta dos produtos que precisam de reposição;
- gatilhos de auditoria e de imutabilidade do histórico.
