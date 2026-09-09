# TechPaper PIM IV — o que você precisa fazer

O sistema, o aplicativo, o banco e o texto das três matérias já foram preparados. Siga esta ordem. Não crie outro banco, outro serviço no Render nem outro projeto no Expo.

## 1. Instalar o aplicativo no Android

1. Abra no celular este endereço: `https://expo.dev/accounts/pdreoss-team/projects/techpaper-mobile/builds/0def36cb-00cd-4cf4-9a72-2679123dca63`.
2. Na área **Build artifact — APK**, toque em **Install**. A página informa que a versão 1.2.0 foi concluída com sucesso.
3. Se o Android mostrar “Por segurança, seu smartphone não tem permissão para instalar apps desconhecidos”, toque em **Configurações**.
4. Ative **Permitir desta fonte** para o navegador usado no download.
5. Volte uma tela e toque em **Instalar**.
6. Quando terminar, toque em **Abrir**.
7. O campo **Endereço do servidor** já deve mostrar `https://techpaper-pim-iv.onrender.com`.
8. Digite o mesmo e-mail e a mesma senha usados no portal web e toque em **Entrar**.

## 2. Fazer as capturas do aplicativo

Faça uma captura em cada situação abaixo, nesta ordem:

1. tela de Login, antes de digitar a senha;
2. tela Resumo depois da sincronização;
3. tela Produtos com uma pesquisa preenchida;
4. tela Estoque antes do envio;
5. confirmação de uma entrada de 1 unidade com o motivo `Demonstração PIM IV`;
6. histórico mostrando essa movimentação com data e hora;
7. tela Orçamentos com dois itens;
8. detalhe do orçamento salvo;
9. tela Conta, mostrando nome e perfil.

Não deixe senha, token ou endereço completo do banco aparecer em nenhuma imagem.

## 3. Produzir as evidências do banco no Neon

O banco em produção já existe e já é usado pelo sistema. Esta etapa serve para tirar as capturas do trabalho.

1. No computador, abra `https://console.neon.tech` e entre na sua conta.
2. Clique no projeto usado pelo TechPaper.
3. No menu esquerdo, clique em **SQL Editor**.
4. Clique em **New query**.
5. No computador, abra o arquivo `database/004_verificacao.sql` deste projeto.
6. Selecione todo o conteúdo e copie.
7. Volte ao Neon, clique na área vazia do editor e cole.
8. Clique em **Run**.
9. Tire uma captura do resultado que lista as oito tabelas.
10. Role o resultado e tire uma captura das funções `sp_registrar_movimentacao` e `sp_resumo_estoque`.
11. Tire outra captura dos gatilhos de auditoria e proteção do histórico.
12. Guarde essas imagens em uma pasta chamada `Evidencias PIM IV`.

O arquivo `database/000_banco_completo.sql` é o script completo exigido pelo manual. Ele deve ser entregue junto com o projeto. Você não precisa executá-lo novamente no banco que já funciona.

## 4. Conferir a sincronização entre aplicativo e portal

1. No aplicativo, registre uma entrada de 1 unidade.
2. No computador, abra `https://techpaper-pim-iv.onrender.com`.
3. Entre com a mesma conta.
4. Abra **Movimentações**.
5. Clique em **Atualizar**, se necessário.
6. Confirme que aparece a movimentação criada no celular.
7. Tire uma captura do portal e outra do aplicativo mostrando o mesmo registro.

## 5. Incorporar o texto ao PIM original

1. Abra `CAPITULOS_PIM_IV_MOBILE_JAVASCRIPT_BANCO_ABNT.docx` no Microsoft Word.
2. Abra uma cópia do PIM III. Nunca edite a única cópia original.
3. Mantenha no documento principal a capa, o resumo, o abstract, o sumário, a introdução e a descrição da empresa que já estiverem revisados.
4. Copie do arquivo novo os capítulos sobre mobile, JavaScript, banco, integração, testes e considerações finais.
5. Cole esses capítulos depois da descrição do sistema web.
6. Localize no documento as afirmações de que a versão final usa MySQL. Substitua essa parte pelo capítulo que explica a evolução para PostgreSQL/Neon.
7. Insira as capturas do Android, do portal e do Neon nos pontos correspondentes.
8. Embaixo de cada imagem, escreva `Figura X – nome da evidência`.
9. Na linha seguinte, escreva `Fonte: autoria própria (2026).`.
10. Selecione cada título principal e aplique o estilo **Título 1**. Nos subtítulos, use **Título 2** ou **Título 3**.
11. Clique dentro do sumário, depois em **Atualizar Sumário** e em **Atualizar o índice inteiro**.
12. Confira fonte Times New Roman 12, texto justificado, espaçamento 1,5 e recuo de primeira linha de 1,25 cm.
13. Confira margens de 3 cm na parte superior e esquerda e 2 cm na parte inferior e direita.
14. Confirme os cinco nomes dos integrantes, a orientadora, São Paulo e o ano 2026.
15. Salve o arquivo em DOCX.
16. No Word, clique em **Arquivo > Salvar como**, escolha **PDF** e salve a versão final.

## 6. Arquivos que devem acompanhar a entrega

- relatório final do PIM em PDF;
- código do portal e da API;
- pasta `mobile` com o aplicativo;
- `database/000_banco_completo.sql`;
- `database/004_verificacao.sql`;
- APK Android para a apresentação;
- imagens de evidência usadas no relatório.

## 7. Ordem da apresentação

1. Abra a Visão Geral do portal e mostre os gráficos.
2. Abra o aplicativo e faça o login.
3. Pesquise um produto.
4. Registre uma movimentação no celular.
5. Atualize o portal e mostre a sincronização.
6. Crie um orçamento no aplicativo.
7. Mostre no Neon as tabelas, as funções e os gatilhos.
8. Explique que a API concentra permissões e cálculos e que o banco protege saldo, concorrência e auditoria.
