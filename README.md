# TechPaper PIM IV

Continuação programável do TechPaper apresentado no PIM III. O pacote reúne portal web, API compartilhada, aplicativo móvel em JavaScript e banco PostgreSQL. Web e mobile usam os mesmos produtos, movimentações e orçamentos.

## O que está implementado

- Autenticação com senha armazenada em hash e sessão revogável.
- Perfis `Admin`, `Supervisor` e `Operador`, validados pela API.
- Produtos e fornecedores.
- Estoque com entradas, saídas, histórico imutável, auditoria e proteção contra saldo negativo.
- Repetição segura de movimentações quando web ou mobile não recebem a confirmação da primeira tentativa.
- Orçamentos com itens, preços e totais calculados no servidor, estados e controle de alterações simultâneas.
- Portal web responsivo com menu hambúrguer em telas pequenas, gráficos de estoque e movimentações, painel de indicadores, VLibras, relatórios CSV e impressão/PDF.
- Aplicativo Expo/React Native em JavaScript com os mesmos gráficos do portal, login, produtos, estoque, orçamentos, sincronização e sessão no armazenamento seguro do aparelho.
- Tema claro/escuro, escolha obrigatória de avatar representativo e banners educativos rotativos sincronizados entre portal e aplicativo.
- Atualização por gesto no mobile, rótulos de acessibilidade, navegação por teclado e integração com VLibras.
- Script completo do banco, cinco funções armazenadas, quatro triggers, índices e consultas de verificação.
- Containerização e pipeline de validação.
- Perfis EAS para APK de demonstração e AAB de publicação futura.
- Implantação gratuita preparada para Render e Neon, além do roteiro de capturas Android.

## Pastas

| Pasta | Conteúdo |
|---|---|
| `api` | ASP.NET Core, portal web e API REST |
| `mobile` | Aplicativo React Native com Expo |
| `database` | Estrutura, funções, triggers, dados fictícios e verificações |
| `tests` | Testes de integração da API e do banco |
| `docs` | Arquitetura, modelo de dados e matriz do manual |

## Preparação com containers

1. Copie `.env.example` para `.env`.
2. Substitua todos os valores de senha do novo `.env`. Esse arquivo não deve ser enviado ao repositório.
3. Na pasta deste projeto, execute `docker compose up --build`.
4. Abra `http://localhost:8080` no computador.
5. No Expo em desenvolvimento, informe `http://IP-DO-COMPUTADOR:8080` na tela de acesso. O celular e o computador precisam estar na mesma rede. Em implantação, use sempre HTTPS.

A API executa os scripts idempotentes quando `DatabaseInit__Enabled=true`. Alterações destrutivas futuras devem usar uma migração versionada e backup; não modifique um banco com dados reais sem ensaio de restauração.

## Preparação sem containers

Use .NET 10, PostgreSQL 17 e Node.js. Crie um banco vazio e execute, nessa ordem:

1. `database/001_schema.sql`
2. `database/002_routines.sql`
3. `database/003_demo.sql` somente em desenvolvimento

Configure `ConnectionStrings__DefaultConnection`, `Bootstrap__Enabled=true`, `Bootstrap__Login` e `Bootstrap__Password`. Se definir `DatabaseInit__Enabled=true`, a API cria tabelas, funções e gatilhos automaticamente; `DatabaseInit__DemoData=true` inclui os dados fictícios. Para o aplicativo, instale as dependências na pasta `mobile`, defina `EXPO_PUBLIC_API_URL` quando quiser fixar o endereço e inicie o Expo.

Para finalizar em ambiente real, siga `docs/FINALIZACAO_ANDROID_E_NUVEM.md`. O roteiro usa Render Free para a API, Neon Free para PostgreSQL e EAS Build para gerar um APK instalável. A criação dos recursos requer autenticação nas contas Render, Neon e Expo; nenhum segredo deve ser salvo no projeto.

O bootstrap cria o primeiro administrador apenas quando `usuarios` está vazia. Nenhuma senha real está versionada. Os usuários seguintes devem ser cadastrados por um administrador.

## Regras adotadas

- Um orçamento não reserva nem reduz o estoque. A saída é registrada quando a operação de venda ou entrega for confirmada. Essa decisão está visível nas interfaces e deve ser validada com a equipe.
- O preço do orçamento é copiado do cadastro no momento em que o orçamento é salvo. Ao editar um rascunho, os itens recebem os preços atuais.
- Operadores consultam dados, movimentam estoque e criam orçamentos. Podem editar seus próprios rascunhos.
- Supervisores também mantêm produtos e fornecedores e aprovam ou cancelam orçamentos.
- Administradores também administram usuários e podem excluir cadastros sem histórico vinculado.
- Movimentações são imutáveis. Uma correção exige uma nova movimentação compensatória.

## Verificação realizada

- API compilada com .NET SDK 10.0.400: zero erros e zero avisos.
- Dez testes de integração aprovados em banco descartável, incluindo preferências visuais, autorização, sigilo de senha, saldo insuficiente, concorrência, repetição segura, cálculo de orçamento, controle de versão e revogação da sessão.
- Seis testes da comunicação mobile aprovados.
- Dependências verificadas pelo Expo: atualizadas para o SDK 57.
- PostgreSQL descartável criado e conferido com oito tabelas, cinco funções, quatro triggers e índices.
- Portal verificado no navegador: login, painel, gráficos, VLibras e movimentação com data e hora de Brasília.
- Responsividade conferida em largura de 390 px: menu recolhível, conteúdo sem rolagem horizontal e gráficos empilhados.
- Aplicativo exportado pelo Expo para Android com gráficos em SVG, atualização por gesto, ícone e tela de abertura.

A versão móvel 1.5.0 usa o endereço da API como configuração interna: a tela de acesso solicita somente e-mail e senha. A [compilação Android 1.5.0](https://expo.dev/accounts/pdreoss-team/projects/techpaper-mobile/builds/cdabffd5-d22b-4b95-8278-da9303c9c9c4) utiliza a identidade visual oficial escolhida pela equipe.

## Uso acadêmico

O código é a implementação. O relatório deve descrever decisões, resultados realmente observados, telas capturadas pela equipe, testes executados no ambiente final e fontes consultadas. A matriz em `docs/MATRIZ_MANUAL_PIM_IV.md` indica as evidências ainda necessárias para cada item do manual.
