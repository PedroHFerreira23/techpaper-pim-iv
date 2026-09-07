# Matriz de atendimento ao Manual do PIM IV

Esta matriz transforma as exigências do manual fornecido em entregas verificáveis. O manual não especifica React Native, Expo, Ionic ou outra tecnologia mobile. A escolha por React Native com Expo em JavaScript atende à disciplina do aluno e aos cinco resultados exigidos na Etapa 5.

| Etapa do manual | Implementação no pacote | Evidência a produzir para o relatório | Situação |
|---|---|---|---|
| 1 Caracterização da organização | TechPaper, papelaria e processos herdados do PIM III | Atualizar segmento, serviços, estrutura, processos, problemas e oportunidades | Texto da equipe pendente |
| 2 Planejamento da solução | Web e mobile integrados para estoque e orçamentos | Proposta de valor, público, benefícios, diferenciais, custos e premissas | Estrutura técnica pronta; análise de negócio pendente |
| 3 Responsabilidade social e diversidade | Área Inclusão e ajuda; acessibilidade de teclado, foco, rótulos e texto; minimização de dados sensíveis | Avaliação com leitor de tela, contraste, teclado, tamanho de fonte e ações de combate à discriminação | Implementação inicial pronta; avaliação humana pendente |
| 4 Solução web | Portal em `api/wwwroot`, API REST, sessão e três perfis | Capturas de login, painel, produtos, estoque, orçamentos, relatórios e testes de acesso | Pronto para demonstração local |
| 5 Solução mobile | `mobile/App.js`, comunicação em `mobile/src/api.mjs` e perfis APK/AAB em `mobile/eas.json` | Capturas das telas em aparelho, mapa de navegação, login, atualização após mudança na web e tratamento de falha | Código e build remoto preparados; execução em aparelho depende da conta Expo e do celular |
| 6 Arquitetura de software | Controllers, Contracts, Services, Security, Models e Data | Diagrama de componentes e explicação de orientação a objetos, camadas e modularização | Código e diagrama prontos |
| 7 Banco de dados | PostgreSQL em `001_schema.sql`, `002_routines.sql`, `003_demo.sql`, `004_verificacao.sql` | MER, modelo lógico, modelo físico, execução das funções/triggers, consultas e plano de índices | Reestruturado para a camada gratuita da Neon; validação local automatizada |
| 8 Nuvem e DevOps | Dockerfile, Compose, health checks, pipeline e `render.yaml` | Diagrama de nuvem, implantação, custo observado, monitoramento, escala, backup e segurança | Render Free e Neon Free escolhidos; publicação depende das contas do grupo |
| 9 Gerenciamento ágil | Backlog no plano de continuidade e entregas versionáveis | Product Backlog, Sprint Backlog, cronograma, Kanban, responsáveis e evidências reais | Estrutura inicial pronta; datas/responsáveis pendentes |

## Checklist específico de mobile

| Exigência | Onde está atendida | Teste sugerido |
|---|---|---|
| Telas principais | Login, Resumo, Produtos, Estoque, Orçamentos e Conta | Capturar todas em aparelho Android |
| Fluxo de navegação | Abas inferiores, detalhe de orçamento e retorno pelo botão físico | Percorrer login → produto → estoque → orçamento → detalhe |
| Autenticação | Token da API guardado pelo SecureStore e revogado ao sair | Entrar, reiniciar o app, sair e confirmar que o token antigo falha |
| Sincronização | Atualização manual, gesto de puxar e atualização ao voltar ao app | Alterar produto na web e atualizar no mobile |
| Integração com APIs | Uma API REST compartilhada; timeouts e mensagens de falha | Desligar a rede durante consulta e durante movimentação; reconectar e repetir |

## Limites de evidência

Não declarar implantação em nuvem, uso real por funcionários, conformidade integral com WCAG, desempenho, escalabilidade ou redução de erros até que a equipe execute e registre essas avaliações. O código demonstra mecanismos; resultados acadêmicos precisam de evidências produzidas no ambiente da equipe.
