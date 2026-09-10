# ATUALIZAÇÃO DE RESPONSIVIDADE, GRÁFICOS E INCLUSÃO

## 1 INTRODUÇÃO

Esta atualização amplia o TechPaper sem substituir a arquitetura desenvolvida no semestre anterior. O portal web, o aplicativo móvel e a API continuam compartilhando o mesmo cadastro de produtos, usuários e movimentações. A implementação atende às disciplinas de Programação para Dispositivos Móveis, Desenvolvimento de Software para Internet com JavaScript e Banco de Dados.

O banco efetivamente adotado pelo projeto é o PostgreSQL, hospedado no Neon no ambiente publicado. Por esse motivo, as rotinas foram escritas em PL/pgSQL. Utilizar comandos de SQL Server em um banco PostgreSQL impediria a implantação e produziria uma documentação incompatível com o sistema executado.

## 2 CAMADA DE BANCO DE DADOS

O arquivo `database/001_schema.sql` mantém as preferências `TemaEscuro` e `AvatarId` na tabela `usuarios` e acrescenta `AvatarSelecionado`. Esse último campo registra que o usuário fez uma escolha consciente no primeiro acesso, evitando confundir o valor técnico padrão com uma preferência pessoal.

O arquivo `database/002_routines.sql` contém a função `trg_atualiza_estoque_fn` e a trigger `TRG_ATUALIZA_ESTOQUE`. Depois de cada inserção em `movimentacoes`, a trigger soma a quantidade de uma entrada ou subtrai a quantidade de uma saída. A regra permanece no banco e, portanto, também é aplicada quando a inserção se origina de outro cliente autorizado.

A procedure `sp_registrar_movimentacao` bloqueia o produto durante a operação, valida o saldo disponível e insere a movimentação. A alteração do saldo é executada somente pela trigger. Essa divisão evita atualização duplicada e protege o estoque em acessos simultâneos. A chave de operação impede que uma tentativa repetida pelo celular registre a mesma movimentação duas vezes.

## 3 CAMADA DE SERVIÇOS E API

O modelo `Usuario` representa `TemaEscuro`, `AvatarId` e `AvatarSelecionado`. O endpoint autenticado `PATCH /api/usuarios/me/preferencias` recebe o tema e um avatar válido, atualiza somente o usuário da sessão e devolve a representação persistida. O controlador não aceita um identificador de usuário fornecido pelo cliente, o que impede a alteração das preferências de outra conta.

A API mantém as responsabilidades separadas: os controladores tratam a comunicação HTTP, os serviços concentram as regras da aplicação e o PostgreSQL garante a consistência transacional. Site e aplicativo consultam novamente a API após uma movimentação. Assim, os gráficos usam o saldo confirmado pelo servidor.

## 4 FRONT-END WEB

Em telas com largura máxima de 800 pixels, as media queries transformam a barra lateral em um painel recolhível. O botão hambúrguer informa seu estado por `aria-expanded`, controla o elemento indicado por `aria-controls` e oferece uma camada de fundo que fecha o menu. O conteúdo principal ocupa a largura disponível e bloqueia transbordamento horizontal.

Os gráficos “Estoque por categoria” e “Volume de movimentações” passam de duas colunas para uma coluna no celular. A rosca é gerada em SVG com descrição acessível, enquanto as barras são calculadas com base no histórico retornado pela API. Botões recebem nomes acessíveis e o VLibras permanece disponível no portal.

A escolha do avatar é obrigatória no primeiro acesso. As opções apresentam diferentes tons de pele e texturas de cabelo. O sistema armazena apenas o número da representação selecionada; raça e etnia não são coletadas. Um banner rotativo apresenta orientações de combate à discriminação, respeito e igualdade de oportunidades.

## 5 APLICATIVO MÓVEL

A tela Resumo agora calcula os mesmos agrupamentos usados pelo portal. O gráfico de rosca foi implementado com `react-native-svg`, e o gráfico de barras usa componentes nativos do React Native. Ambos possuem rótulos de acessibilidade para leitores de tela.

Na tela Estoque, o componente `RefreshControl` permite puxar a lista para baixo. O gesto solicita novamente produtos, movimentações e orçamentos à API. Depois de registrar uma movimentação, o aplicativo também sincroniza os dados automaticamente, fazendo o novo saldo aparecer nos indicadores e gráficos.

O primeiro acesso apresenta uma tela de escolha de avatar e só libera a navegação depois que a API confirma a gravação. A tela Conta permite trocar o avatar e alternar os temas claro e escuro. Os banners educativos são exibidos ao fim do conteúdo e alternam suas mensagens periodicamente.

## 6 TESTES E RESULTADOS

A atualização foi verificada em quatro níveis. O script completo criou um banco PostgreSQL descartável do zero. Os testes de integração validaram autenticação, permissões, preferências visuais, repetição segura, concorrência e atualização automática do saldo. Os testes da comunicação móvel foram aprovados, e a exportação do pacote Android confirmou a resolução dos componentes SVG. A versão 1.4.0 também foi compilada e assinada pelo EAS Build no formato APK para instalação direta.

No navegador, o portal foi testado com 390 pixels de largura. O menu lateral permaneceu fora da tela até o acionamento do botão, abriu sobre o conteúdo, fechou pela camada de fundo e não gerou erros no console. Os gráficos ocuparam uma coluna e a página não apresentou rolagem horizontal.

## 7 EVIDÊNCIAS SUGERIDAS PARA O PIM

Para a documentação final, recomenda-se capturar: a tela inicial do portal em um celular com o menu fechado; o menu hambúrguer aberto; os dois gráficos empilhados; a escolha obrigatória de avatar; o banner educativo; a tela Resumo do aplicativo; o gesto de atualização do estoque; e uma consulta ao produto antes e depois de uma movimentação. As imagens devem receber número, título, fonte e explicação no texto conforme o modelo de apresentação adotado pela equipe.
