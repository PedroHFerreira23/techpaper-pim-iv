# Texto base para as disciplinas de mobile JavaScript e banco de dados

Este texto foi redigido para ser incorporado ao desenvolvimento do PIM IV após a equipe ajustar a numeração dos capítulos e inserir as evidências produzidas no ambiente final. Os marcadores de figura não devem permanecer na versão entregue.

## Desenvolvimento da solução mobile

Como continuidade do sistema TechPaper apresentado no PIM III, foi desenvolvida uma aplicação móvel destinada aos funcionários da papelaria. O aplicativo utiliza a mesma API REST consumida pelo portal web, permitindo que produtos, movimentações de estoque e orçamentos sejam consultados a partir de fontes de dados comuns. Essa integração evita a manutenção de cadastros independentes e reduz o risco de divergência entre as aplicações.

A solução foi implementada em JavaScript com React Native e Expo. O manual do PIM IV não determina uma tecnologia específica para a aplicação móvel, mas exige a apresentação das telas principais, fluxo de navegação, autenticação, sincronização e integração com APIs. A escolha adotada permitiu atender a esses itens e aplicar os conhecimentos da disciplina de desenvolvimento mobile com JavaScript. O React Native fornece componentes que são convertidos em interfaces nativas, enquanto o Expo organiza o ambiente de desenvolvimento e os módulos utilizados pelo aplicativo.

As telas principais são Login, Resumo, Produtos, Estoque, Orçamentos e Conta. Após a autenticação, o usuário acessa um resumo dos produtos cadastrados, itens com estoque baixo e orçamentos em rascunho. A tela Produtos permite pesquisar pelo nome ou pelo código SKU. Em Estoque, o funcionário seleciona um produto, informa se a movimentação é uma entrada ou saída, registra a quantidade e descreve o motivo. O módulo Orçamentos permite selecionar produtos e quantidades, salvar a proposta e acompanhar seu estado. A tela Conta identifica o usuário e seu perfil, apresenta orientações de inclusão e encerra a sessão.

**Figura a inserir:** conjunto das seis telas principais executadas em aparelho Android. Fonte: autoria própria.

O fluxo de navegação utiliza abas inferiores para acesso direto às funções principais. O botão de retorno do sistema fecha o detalhe do orçamento ou retorna ao Resumo antes de sair do aplicativo. Botões, campos e itens selecionáveis possuem papéis e estados de acessibilidade, e os campos de formulário incluem rótulos textuais. Essas decisões facilitam o uso com o TalkBack e preservam a operação com tamanhos de fonte definidos no aparelho. A documentação do React Native descreve propriedades que permitem integrar os componentes às tecnologias assistivas do Android e do iOS (REACT NATIVE, 2026).

## Desenvolvimento mobile com JavaScript

A camada de comunicação foi centralizada no módulo `src/api.mjs`. Esse módulo recebe o endereço do servidor, acrescenta os cabeçalhos exigidos pela API, serializa os dados em JSON e limita o tempo de espera das requisições. Respostas de erro são convertidas em mensagens compreensíveis e mantêm o código HTTP, permitindo que a interface reconheça, por exemplo, uma sessão expirada. Em uma implantação, o aplicativo aceita apenas endereços HTTPS. Endereços HTTP são permitidos somente no modo de desenvolvimento para testes na rede local.

Após o login, o token da sessão é armazenado pelo Expo SecureStore. Esse módulo utiliza mecanismos de armazenamento protegido oferecidos pelo sistema operacional, evitando o uso de armazenamento comum para a credencial da sessão (EXPO, 2026). A senha permanece apenas no estado da tela durante o login e é removida após a autenticação. Ao sair, o aplicativo solicita a revogação da sessão na API e apaga o token local.

A sincronização é realizada no login, pelo gesto de puxar a tela, pelo botão Atualizar e quando o aplicativo retorna ao primeiro plano. Produtos, movimentações e orçamentos são consultados em paralelo. A interface só substitui os dados apresentados quando todas as consultas são confirmadas. Se a sessão expirar, o token é apagado e o usuário retorna à tela de acesso.

As movimentações de estoque exigem cuidado adicional porque a perda da resposta não informa se o servidor concluiu a operação. Antes de enviar a requisição, o aplicativo gera uma identificação única e armazena a tentativa. Caso não receba confirmação, a próxima tentativa reutiliza essa identificação. A função do banco reconhece a repetição e devolve a movimentação já criada sem alterar novamente o estoque. Dessa forma, uma instabilidade de rede não transforma uma entrada ou saída em duas operações.

**Figura a inserir:** fluxo de sincronização web e mobile, mostrando a alteração no portal e o mesmo dado após atualização do aplicativo. Fonte: autoria própria.

O cálculo financeiro definitivo não ocorre no JavaScript. Ao criar um orçamento, o aplicativo envia apenas o cliente, a validade, o produto e a quantidade. A API consulta o preço cadastrado, calcula subtotais e total e devolve o orçamento confirmado. Isso evita que uma alteração local no aplicativo determine o valor gravado. O orçamento, por decisão inicial do projeto, não reserva nem reduz estoque; uma saída é registrada quando a venda ou entrega é confirmada. A equipe deve validar essa regra antes da apresentação.

## Projeto e programação do banco de dados

O banco do PIM IV foi ampliado para representar usuários, fornecedores, produtos, movimentações, sessões, orçamentos, itens de orçamento e auditoria de estoque. O PostgreSQL foi escolhido porque oferece transações, integridade referencial, índices, funções armazenadas e gatilhos e pode ser utilizado na camada gratuita da Neon sem prazo de 30 dias. O script completo está dividido em arquivos numerados e a API pode aplicá-lo automaticamente em um banco vazio.

As tabelas utilizam chaves primárias numéricas e chaves estrangeiras para representar os vínculos. Cada produto referencia um fornecedor; cada movimentação referencia o produto e o usuário responsável; cada orçamento pertence ao usuário que o criou; e os itens relacionam o orçamento aos produtos. Restrições impedem preços, quantidades e saldos negativos. Índices foram criados para SKU, nome e categoria do produto, produtos com estoque baixo, histórico por produto e data, sessões expiradas e orçamentos por estado e data.

**Figura a inserir:** modelo entidade relacionamento renderizado a partir de `docs/ARQUITETURA_E_BANCO.md`. Fonte: autoria própria.

A função PL/pgSQL `sp_registrar_movimentacao` concentra a alteração do estoque. Ela valida tipo e quantidade, bloqueia o produto selecionado com `FOR UPDATE`, verifica o saldo e atualiza o produto antes de inserir o histórico. Em uma saída, a operação é rejeitada se a quantidade solicitada ultrapassar o saldo. Como a função participa da mesma transação iniciada pela chamada da API, duas saídas simultâneas não podem utilizar o mesmo saldo disponível. O PostgreSQL permite implementar funções e gatilhos com estruturas de controle e comandos SQL no servidor (POSTGRESQL GLOBAL DEVELOPMENT GROUP, 2026).

Foram criados três triggers. O primeiro registra o saldo anterior e o saldo atual em `auditoria_estoque` após cada mudança de estoque. Os outros dois impedem a edição e a exclusão das movimentações. Quando um lançamento precisa ser corrigido, o usuário deve registrar uma movimentação compensatória. Essa regra mantém a rastreabilidade das operações e permite comparar o saldo atual com o histórico.

A função `sp_resumo_estoque` recebe um limite e apresenta os produtos abaixo desse valor, com custo unitário e valor armazenado. O arquivo de verificação também compara o saldo de cada produto à soma das entradas e saídas, compara o total do orçamento à soma dos itens e utiliza `EXPLAIN` para demonstrar o índice da consulta de histórico.

## Integração e segurança

A API foi organizada em modelos, contratos, controladores, serviços, segurança e persistência. Os contratos limitam tamanho, formato e faixa dos dados recebidos. Os controladores definem as rotas e permissões. Os serviços executam as regras de estoque e orçamento. O Entity Framework Core com Npgsql relaciona os objetos às tabelas PostgreSQL. Essa separação reduz a quantidade de regras nas interfaces e permite que web e mobile compartilhem o mesmo comportamento.

A autenticação determina a identidade do usuário e a autorização define as operações permitidas por seu perfil, conceitos distintos no ASP.NET Core (MICROSOFT, 2026). O operador consulta dados, movimenta estoque e cria orçamentos. O supervisor também mantém produtos e fornecedores e altera o estado de orçamentos. O administrador também gerencia usuários. A API aplica essas regras mesmo quando uma requisição é realizada fora da interface.

As senhas são transformadas por um algoritmo de hash antes do armazenamento e nunca aparecem nas respostas. O token recebido pelo aplicativo também não é gravado diretamente no banco: armazena-se apenas seu hash. Sessões podem ser revogadas no logout, na alteração administrativa do usuário ou quando chegam ao prazo de expiração. O portal utiliza cookie restrito ao servidor e o aplicativo envia o token no cabeçalho de autorização.

## Testes e resultados

A API foi compilada com o SDK .NET 10.0.400 sem erros ou avisos. Em um banco descartável foram executados nove testes de integração. Eles verificaram bloqueio de acesso sem sessão, restrição administrativa, ausência de senhas nas respostas, identidade da movimentação, repetição segura, duas retiradas simultâneas, saldo insuficiente, validação de quantidades, cálculo do orçamento, restrição de aprovação, conflito de versões, rejeição de origem externa e revogação da sessão.

No cenário de concorrência, o produto possuía dez unidades e duas requisições tentaram retirar sete unidades ao mesmo tempo. Uma foi confirmada e a outra recebeu conflito, preservando saldo final igual a três. No cenário de repetição, duas chamadas com a mesma identificação devolveram o mesmo registro e alteraram o estoque uma única vez. Também foram executados seis testes do módulo de comunicação JavaScript, cobrindo endereço seguro, quantidades, agrupamento de itens, envio do token, expiração da sessão e falha de rede.

O portal foi verificado no navegador com a criação de um orçamento contendo duas unidades de um produto de R$ 24,90. A API gravou o total de R$ 49,80 e o orçamento apareceu na listagem em estado de rascunho. A equipe ainda deve executar o aplicativo em aparelho Android, capturar as telas e repetir o teste de sincronização na rede que será utilizada durante a apresentação.

## Referências para esta seção

EXPO. SecureStore. Documentação do Expo. Disponível em: https://docs.expo.dev/versions/latest/sdk/securestore/. Acesso em: 6 set. 2026.

MICROSOFT. Overview of ASP.NET Core authentication. Microsoft Learn. Disponível em: https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-10.0. Acesso em: 6 set. 2026.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. PL/pgSQL — SQL Procedural Language. PostgreSQL 18 Documentation. 2026. Disponível em: https://www.postgresql.org/docs/current/plpgsql-overview.html. Acesso em: 6 set. 2026.

NEON. Neon pricing. 2026. Disponível em: https://neon.com/pricing. Acesso em: 6 set. 2026.

REACT NATIVE. Accessibility. Documentação do React Native. Disponível em: https://reactnative.dev/docs/accessibility.html. Acesso em: 6 set. 2026.
