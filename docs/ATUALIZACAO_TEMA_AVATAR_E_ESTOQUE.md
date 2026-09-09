# Atualização de inclusão, acessibilidade e controle de estoque

## Texto técnico para o relatório do PIM IV

O TechPaper passou a armazenar duas preferências visuais por usuário: o tema da interface e o avatar. A tabela `usuarios` recebeu os atributos booleano `TemaEscuro` e inteiro `AvatarId`. O primeiro indica a paleta escolhida e o segundo referencia uma das seis representações oferecidas pelas interfaces. O avatar constitui apenas uma preferência visual. O sistema não associa a seleção a raça, etnia ou outro dado pessoal sensível.

A API disponibiliza a operação `PATCH /api/usuarios/me/preferencias`. O endpoint identifica o usuário pela sessão autenticada e permite alterar somente `TemaEscuro` e `AvatarId`. A faixa de avatares é validada entre 1 e 6 tanto no contrato da API quanto por uma restrição do banco. Essa separação reduz o acoplamento entre a personalização e as rotinas administrativas de nome, perfil, senha e situação da conta, em conformidade com o princípio da responsabilidade única.

O portal web e o aplicativo móvel consomem a mesma representação de usuário. Depois da autenticação, a preferência recebida da API define a paleta clara ou escura. Toda atualização é confirmada pelo servidor antes de alterar definitivamente a interface. Dessa forma, a escolha acompanha o usuário em dispositivos diferentes e não depende apenas do armazenamento local. A galeria apresenta opções com diferentes tons de pele e uma opção neutra, com rótulos próprios para leitores de tela.

No aplicativo React Native, os campos possuem rótulo de acessibilidade e os elementos acionáveis informam sua função e seu estado. A lista rolável usa `RefreshControl`: quando o usuário puxa a tela para baixo, produtos, movimentações, orçamentos e preferências são consultados novamente. O indicador permanece controlado pela variável `refreshing`, impedindo sinais falsos de conclusão durante uma requisição em andamento.

O controle de estoque foi centralizado no PostgreSQL por meio da trigger `TRG_ATUALIZA_ESTOQUE`. Ela é executada após cada inserção em `movimentacoes`, soma entradas e subtrai saídas. Uma saída somente é aplicada quando o saldo é suficiente; caso contrário, a transação é rejeitada. A função `sp_registrar_movimentacao` conserva as verificações de usuário, produto, concorrência e idempotência, mas deixou de atualizar diretamente o produto. Essa decisão impede a duplicação do saldo e garante que qualquer inserção válida siga a mesma regra, independentemente de sua origem.

Embora o roteiro complementar cite SQL Server e o tipo `BIT`, o sistema implantado utiliza PostgreSQL no Neon. Por isso, a implementação emprega `BOOLEAN`, PL/pgSQL e a sintaxe de triggers do PostgreSQL. A adaptação preserva a arquitetura operacional já publicada no Render e mantém consistência entre o código, o banco e as evidências do trabalho.

## Evidências de validação

- compilação da API .NET sem erros ou avisos;
- testes automatizados do endpoint de preferências, incluindo rejeição de avatar fora da faixa;
- testes de concorrência, idempotência e saldo insuficiente;
- inserção SQL direta em `movimentacoes`, com confirmação de que a trigger altera o saldo uma única vez;
- verificação visual do tema escuro, da galeria de avatares, dos rótulos ARIA e do VLibras;
- análise sintática do código JSX e testes da camada de comunicação mobile.

