# Correções de sessão e feedback

Base: commit 053f175e91a4915e38c154de16549fbc31d8c6d0. Revisão em 18 de outubro de 2026 (UTC).

## Problema e comportamento corrigido

Portal e mobile podiam manter coleções e rascunhos de uma conta após logout/401. Uma sincronização atrasada também podia restaurar a sessão encerrada. Agora os dados e formulários são limpos nas transições e as respostas são vinculadas à revisão da sessão. No mobile, gravações e remoções locais são serializadas para que uma gravação em voo não recrie o token depois da limpeza. O cache da conta restaurada é removido no 401, sem depender de estado React capturado antes da restauração.

Movimentações pendentes continuam associadas ao usuário para confirmação idempotente posterior. Relatos não entram no cache. O onboarding de avatar mostra erros e oferece saída. No portal, o feedback de erro dos formulários aparece no diálogo aberto, e uma movimentação não reabre diálogo após expiração. O texto de filtros agora indica datas de Brasília.

## Verificação local

- 14 testes mobile aprovados: seis da camada HTTP/helpers, quatro do controle de revisão/fila e quatro que exercitam as funções do componente App.js com hooks, armazenamento e HTTP simulados.
- Quatro testes web aprovados: limpeza de dados, sincronização atrasada, 401 e feedback no diálogo.
- `node --check api/wwwroot/app.js` aprovado.
- `expo export --platform android --no-bytecode --max-workers 1 --output-dir dist-check` concluído com 721 módulos. Exportação de bundle não é APK assinado nem teste em dispositivo.
- `expo install --check` online não concluiu por timeout do proxy; modo offline informou dependências atualizadas, com a ressalva de confiabilidade emitida pelo próprio Expo.

## Limites e próximas verificações

Nenhuma mudança em API, schema ou regra de estoque/orçamento. Os 11 testes Python de integração precisam ser executados em API e PostgreSQL descartáveis; não foram executados localmente nesta tarefa. O workflow passa a executar regressões web e amplia os testes mobile, mas ainda não provisiona banco de integração.

Testar em aparelho/navegador reais: troca entre duas contas, sessão expirada, logout durante atualização, erro no onboarding e leitura do alerta no diálogo. Conferir proxy HTTPS/cookie no ambiente de hospedagem. Não foi gerado APK/AAB nem feito deploy nesta branch. Recursos como paginação, idempotência de orçamentos e migrações versionadas permanecem melhorias futuras, sem alteração silenciosa de escopo.

README/LEIA_PRIMEIRO foram alinhados à URL interna do app, às nove tabelas e à execução dos novos testes. AGENTS.md passa a registrar as regras permanentes de desenvolvimento.

## Atualização após a primeira execução do CI

A compilação .NET Release e os testes web/mobile passaram no GitHub Actions. O check online do Expo identificou um patch esperado de ~57.0.30, acima do 57.0.28 do snapshot. A dependência Expo foi atualizada para ~57.0.30, com seu lockfile, sem mudança de SDK principal. O pipeline deve ser conferido novamente no commit que contém esse ajuste.

## Integração real concluída

A execução https://github.com/PedroHFerreira23/techpaper-pim-iv/actions/runs/39092182239 validou o commit 2397283c1d74acf4f63fee1e46495d37b27c5dca em 18/10/2026.

- API .NET 10 compilada em Release e iniciada com banco PostgreSQL 17 descartável.
- Onze testes de integração executados e aprovados, sem casos ignorados: autenticação/perfis, sigilo de senha, identidade/idempotência, concorrência, saldo insuficiente, orçamento/versão, origem, logout, preferências e inclusão.
- `tests/database_checks.sql` aprovado: INSERT direto aplica saldo uma vez, auditoria registra mudança, UPDATE/DELETE de histórico são bloqueados, saída inválida reverte atomicamente e saldos/totais permanecem consistentes. Dados auxiliares revertidos com ROLLBACK.
- Quatorze testes mobile e quatro web, check online Expo e exportação Android aprovados na mesma execução.

O workflow mantém essa integração nas próximas alterações. Nenhum dado de produção foi usado. Não surgiu falha de regra de negócio nesta suíte que exigisse alterar controllers, services ou schema.

Publicação e dispositivo continuam separados da aprovação automatizada. O PR #3 permanece aberto: a revisão automática de aprovação bloqueou o merge por ausência de autorização explícita para integrar à main. O endpoint público /health/ready respondeu ready na consulta de leitura, mas isso não comprova publicação da branch. EAS CLI e navegador não tinham sessão Expo autenticada; nenhum aparelho físico/adb foi disponibilizado. Não declarar APK atualizado ou teste físico realizado sem essas etapas.

## Revisão para apresentação — 23/11/2026

Correções no foco e menu móvel, validação/concorrência do orçamento, validade em Brasília e ícones locais. Compilação Release, 11 testes de integração com PostgreSQL 17, checagens SQL, 20 testes JavaScript, exportação Android e 40 combinações tela/largura no Chromium. Ensaio com cliente JS móvel, portal e banco confirmou 7 + 5 = 12 sem repetir a entrada. A base fictícia é reproduzível; consulte [APRESENTACAO.md](../APRESENTACAO.md). Sem certificação de acessibilidade, teste físico ou publicação desta revisão.

## Apresentação integrada — versão móvel 1.7.0
O celular passou a consultar fornecedores e histórico completo, administrar cadastros conforme o perfil, editar rascunhos, atualizar relatos como Admin e emitir CSV/impressão pelo Android. Atualizar no portal ou no app consulta a mesma API. O menu do celular permite rolar horizontalmente. A API pode criar o lote fictício quando Presentation__SeedOnStart=true: a conta de autoria do lote é desativada dentro da mesma transação; não permite login. A carga não remove cadastros nem redefine o saldo de um ensaio anterior. Em colisão, a operação reverte sem mesclar registros alheios. A versão oficial com assinatura anterior é gerada pelo perfil Expo preview do projeto já existente.

## Tela de acesso do portal — 25/11/2026

A tela de acesso mantém o formulário visível em janelas mais baixas e usa um cabeçalho compacto no celular. O menu lateral do desktop passa a rolar em janelas baixas, e a legenda pode quebrar para a linha seguinte no gráfico. Uma tentativa de login rejeitada mantém os campos e apresenta a mensagem no formulário. O portal distingue credencial rejeitada, limite de tentativas e falha ao carregar os dados após a criação da sessão.

Validação em Chromium com o portal local em oito tamanhos, incluindo 320 × 568 e 740 × 360, e simulação de respostas 401 e 429, nova tentativa, menu móvel e logout. O serviço Render que estava no ar aceitou a sessão administrativa e retornou HTTP 200 nas consultas usadas pelo painel. A validação de produção foi feita pela API. A alteração não depende de migração nem de redefinição de senha.
