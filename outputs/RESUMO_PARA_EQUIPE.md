# TechPaper PIM IV — resumo para a equipe

## O que é o projeto

O TechPaper é um sistema de gestão para papelarias. Ele reúne cadastro de produtos, fornecedores e usuários, movimentação de estoque, orçamentos, indicadores e gráficos. O PIM IV continua o projeto do semestre anterior e acrescenta o aplicativo Android, a integração mobile com JavaScript e uma implementação mais completa do banco de dados.

O portal e o aplicativo usam a mesma API e o mesmo banco. Portanto, uma movimentação registrada no celular aparece no portal depois da atualização.

## Partes do sistema

### Portal web

- Tecnologia: HTML, CSS e JavaScript.
- Local do código: `api/wwwroot`.
- Endereço publicado: `https://techpaper-pim-iv.onrender.com`.
- Funções: login, visão geral, gráficos, produtos, fornecedores, estoque, orçamentos, usuários e relatórios.
- Acessibilidade: navegação por teclado, textos alternativos e recurso VLibras.
- Inclusão visual: tema claro/escuro e seis avatares sincronizados pela conta.

### API

- Tecnologia: ASP.NET Core com .NET 10.
- Local do código: pasta `api`.
- Responsabilidade: receber as solicitações do portal e do aplicativo, autenticar usuários, verificar permissões, validar dados, calcular orçamentos e executar as regras de estoque.
- Integração: Entity Framework Core e Npgsql fazem a comunicação com PostgreSQL.

### Aplicativo Android

- Tecnologia: JavaScript, React Native e Expo.
- Local do código: pasta `mobile`.
- Telas: Login, Resumo, Produtos, Estoque, Orçamentos e Conta.
- Segurança: o token da sessão fica no Expo SecureStore e a senha é apagada depois do login.
- Sincronização: ocorre no login, ao tocar em Atualizar, ao puxar a tela e ao retornar ao aplicativo.
- Proteção de estoque: cada movimentação recebe uma identificação única para impedir lançamentos duplicados quando a conexão falha.
- Preferências: tema e avatar escolhidos na tela Conta permanecem associados ao usuário.
- Versão atual do código: 1.3.0.
- Página do APK: `https://expo.dev/accounts/pdreoss-team/projects/techpaper-mobile/builds/8c3cae0a-d459-44ab-bf2a-ed1d5ff3bbe6`.

### Banco de dados

- Tecnologia: PostgreSQL hospedado no Neon.
- Local dos scripts: pasta `database`.
- Script principal: `database/000_banco_completo.sql`.
- Script de conferência: `database/004_verificacao.sql`.
- Tabelas: usuarios, fornecedores, produtos, movimentacoes, sessoes, orcamentos, itens_orcamento e auditoria_estoque.
- Funções principais: `sp_registrar_movimentacao` e `sp_resumo_estoque`.
- Gatilhos: atualizam o estoque, registram auditoria e impedem edição ou exclusão do histórico de movimentações.
- Concorrência: a função de movimentação bloqueia o produto durante a alteração para impedir estoque negativo em solicitações simultâneas.

## Serviços utilizados

### GitHub

Guarda o histórico e o código-fonte do projeto. O repositório de destino é `https://github.com/PedroHFerreira23/techpaper-pim-iv`.

### Render

Hospeda gratuitamente a API e o portal web. O Render lê o repositório, compila a aplicação e publica o endereço do TechPaper.

### Neon

Hospeda o banco PostgreSQL. A API usa a conexão configurada no Render para acessar esse banco. A conexão completa não deve aparecer no relatório, em capturas nem em mensagens.

### Expo

Organiza o projeto React Native e permite executar o aplicativo durante o desenvolvimento.

### EAS Build

Serviço do Expo que compilou o código mobile e gerou o APK Android assinado. A compilação 1.3.0 foi gerada com os recursos de tema, avatar e acessibilidade.

### Expo SecureStore

Armazena a sessão do usuário usando a área protegida do Android. A senha não é salva pelo aplicativo.

### VLibras

Recurso presente no portal para tradução de conteúdo para Libras. Ele é carregado pelo serviço oficial do VLibras.

## Novo logo

O símbolo representa uma folha, a letra T de TechPaper, um gráfico e uma seta de crescimento. A folha clara e o T dourado mantêm a marca visível sobre o fundo azul do sistema. Os arquivos ficam em `api/wwwroot/assets` e `mobile/assets`.

## Correção da data

O portal e o aplicativo agora reconhecem datas ISO, valores com fuso horário e formatos recebidos do servidor. A exibição usa português do Brasil e o horário de São Paulo. Se o servidor enviar um valor impossível, o sistema mostra “Data não informada” em vez de “Data inválida”.

## Testes realizados

- Compilação da API: concluída com 0 erros e 0 avisos.
- Testes do módulo JavaScript mobile: 6 aprovados.
- Testes de integração da versão atual: 10 aprovados, incluindo preferências, concorrência e trigger de estoque.
- APK: compilado com sucesso pelo EAS Build.
- Documento acadêmico: 21 páginas revisadas visualmente.
- A trigger também foi verificada por uma inserção SQL direta, com alteração exata do saldo e rollback do teste.

## Texto acadêmico

O arquivo `outputs/CAPITULOS_PIM_IV_MOBILE_JAVASCRIPT_BANCO_ABNT.docx` contém o material das três disciplinas:

1. desenvolvimento mobile;
2. desenvolvimento mobile com JavaScript;
3. projeto e programação de banco de dados.

O documento possui capa, folha de rosto, resumo, abstract, sumário, introdução, arquitetura, diagramas, desenvolvimento, testes, considerações finais, referências e apêndices. Ele está formatado em Times New Roman 12, espaçamento 1,5 e margens ABNT.

## O que cada integrante deve revisar

1. Confirmar os nomes da equipe e da orientadora no documento.
2. Ler os capítulos relacionados à sua disciplina.
3. Instalar o APK e testar login, produtos, estoque e orçamento.
4. Produzir as capturas indicadas em `outputs/LEIA_PRIMEIRO_FINAL.md`.
5. Conferir as regras: orçamento não baixa estoque; a saída ocorre quando a venda ou entrega é confirmada.
6. Saber explicar autenticação, autorização, sincronização, idempotência, função transacional e gatilhos.

## Arquivos principais

- `README.md`: apresentação técnica do repositório;
- `outputs/LEIA_PRIMEIRO_FINAL.md`: tutorial completo para terminar a entrega;
- `outputs/CAPITULOS_PIM_IV_MOBILE_JAVASCRIPT_BANCO_ABNT.docx`: texto editável em ABNT;
- `outputs/CAPITULOS_PIM_IV_MOBILE_JAVASCRIPT_BANCO_ABNT.pdf`: versão para leitura;
- `database/000_banco_completo.sql`: banco completo;
- `database/004_verificacao.sql`: evidências e conferências do banco;
- `api`: API e portal;
- `mobile`: aplicativo Android;
- `outputs/PREVIA_LOGO_V3.png`: apresentação do novo logo.

## Cuidados ao compartilhar

O pacote não contém senhas, tokens ou a conexão privada do banco. Nenhum integrante deve colocar esses dados em documentos, capturas, commits ou grupos de mensagem. Para entrar no sistema, cada integrante deve receber as credenciais por um canal privado definido pela equipe.
