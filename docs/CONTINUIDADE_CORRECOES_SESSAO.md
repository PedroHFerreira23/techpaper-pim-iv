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
