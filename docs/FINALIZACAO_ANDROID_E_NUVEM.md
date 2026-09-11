# Tutorial completo: publicar o TechPaper gratuitamente e gerar o APK

Este roteiro começa com o arquivo ZIP e termina com o sistema funcionando no navegador e em um celular Android. Siga as etapas na ordem apresentada. Não pule uma verificação: cada uma confirma que a etapa anterior terminou corretamente.

## Resultado esperado

Ao terminar, você terá:

1. o código do PIM IV em um repositório do GitHub;
2. um banco PostgreSQL gratuito na Neon;
3. a API e o portal publicados gratuitamente na Render;
4. um endereço parecido com `https://techpaper-pim-iv.onrender.com`;
5. um APK do aplicativo TechPaper instalado no Android;
6. portal e aplicativo usando os mesmos produtos, estoques e orçamentos.

## Serviços utilizados

| Parte | Serviço | Plano usado |
|---|---|---|
| Código | GitHub | repositório público gratuito |
| Banco | Neon | Free |
| API e portal | Render | Free |
| APK Android | Expo EAS | Free |

Não cadastre cartão. Se algum site selecionar um plano pago, volte e escolha `Free`, `US$ 0` ou `Free instance`.

## Antes de começar

Você precisa de acesso ao seu e-mail, uma conta do GitHub, um celular Android, o arquivo `TechPaper-PIM-IV-Render-Neon.zip` e Node.js LTS para a etapa do APK.

Crie um arquivo de texto particular chamado `acessos-techpaper.txt`, fora da pasta do projeto, para anotar:

```text
GitHub: seu usuário
Neon: e-mail usado
Render: e-mail usado
Expo: usuário usado
Conexão Neon:
URL pública da Render:
Login do administrador:
Senha do administrador:
```

Não envie esse arquivo ao GitHub e não o coloque no relatório.

---

## Parte 1 — Descompactar o projeto

1. Localize `TechPaper-PIM-IV-Render-Neon.zip`.
2. Clique nele com o botão direito e escolha `Extrair Tudo...`.
3. Escolha uma pasta fácil, por exemplo `Documentos\TechPaper-PIM-IV`.
4. Clique em `Extrair`.
5. Abra a pasta extraída `TechPaper-PIM-IV-Render-Neon`.

### Verificação 1

Dentro dela devem aparecer as pastas `api`, `database`, `mobile` e `docs`, além de `render.yaml` e `GERAR_APK_WINDOWS.cmd`. Se aparecer outra pasta com o mesmo nome antes desses arquivos, entre nela. O `render.yaml` precisa estar no mesmo nível das pastas.

---

## Parte 2 — Criar a conta e o repositório no GitHub

### 2.1 Criar ou acessar a conta

1. Abra `https://github.com`.
2. Se já tiver conta, clique em `Sign in` e entre.
3. Se ainda não tiver, clique em `Sign up`, informe e-mail, senha e nome de usuário e faça a verificação enviada ao e-mail.
4. Confirme que sua foto ou a letra do perfil aparece no canto superior direito.

### 2.2 Criar um repositório vazio

1. No canto superior direito, clique no botão `+`.
2. Clique em `New repository`.
3. Em `Repository name`, escreva `techpaper-pim-iv`.
4. Em `Description`, escreva `Continuação do projeto TechPaper para o PIM IV de ADS`.
5. Marque `Public`.
6. Deixe desmarcado `Add a README file`.
7. Em `.gitignore`, deixe `None`.
8. Em `License`, deixe `None`.
9. Clique em `Create repository`.

### 2.3 Enviar os arquivos pelo navegador

1. Na página do repositório vazio, clique em `uploading an existing file`.
2. No Explorador de Arquivos, abra a pasta extraída `TechPaper-PIM-IV-Render-Neon`.
3. Pressione `Ctrl+A` para selecionar tudo dentro dela.
4. Arraste os itens para a área da página do GitHub onde aparece `Drag files here`.
5. Aguarde a lista terminar de carregar.
6. Em `Commit message`, escreva `Adicionar implementação do PIM IV com mobile e PostgreSQL`.
7. Se aparecer a escolha de destino, selecione `Commit directly to the main branch`.
8. Clique em `Commit changes`.

### Verificação 2

Na raiz do repositório devem aparecer diretamente `api`, `database`, `mobile`, `docs`, `render.yaml` e `README.md`. Abra `render.yaml` e confirme que a primeira linha é `services:`. Se todos os arquivos estiverem dentro de uma única pasta, o envio foi feito um nível acima do correto e precisa ser refeito.

---

## Parte 3 — Criar o banco gratuito na Neon

### 3.1 Criar ou acessar a conta

1. Abra `https://console.neon.tech`.
2. Clique em `Sign up` se ainda não tiver conta.
3. Escolha `Continue with GitHub` e autorize o acesso.
4. Se aparecer uma tela para criar organização ou workspace, use o nome `TechPaper`.
5. Escolha o plano `Free` ou `US$ 0` e não informe cartão.

### 3.2 Criar o projeto do banco

Se a criação não abrir automaticamente:

1. Clique em `New Project`.
2. Em `Project name`, escreva `TechPaper-PIM-IV`.
3. Em `Postgres version`, mantenha a versão mais recente oferecida.
4. Em `Cloud provider`, escolha `AWS`.
5. Em `Region`, escolha uma região `US East` próxima da Virgínia. Se os nomes forem diferentes, escolha a opção do leste dos Estados Unidos.
6. Mantenha os outros valores padrão.
7. Confirme que o plano continua sendo `Free`.
8. Clique em `Create Project`.

### 3.3 Copiar a conexão

1. No painel do projeto, clique em `Connect`.
2. Em `Branch`, mantenha `main` ou a branch padrão.
3. Em `Database`, mantenha `neondb`.
4. Em `Role`, mantenha o usuário criado automaticamente, normalmente parecido com `neondb_owner`.
5. Em `Connection type`, mantenha a opção sugerida.
6. Localize `Connection string` e clique no ícone de copiar.

A conexão deve parecer com:

```text
postgresql://USUARIO:SENHA@ENDERECO.neon.tech/neondb?sslmode=require
```

Não existe um campo chamado `acessos-techpaper.txt` nos sites. Essa era apenas uma sugestão de anotação particular no seu computador. Você pode manter a conexão copiada somente até a Parte 4. Na Render, ela será colada em `Environment > DATABASE_URL`. Ela contém senha: não a coloque no GitHub, relatório, captura de tela ou conversa pública.

### Verificação 3

Confirme que a conexão começa com `postgresql://`, contém `neon.tech`, contém o nome do banco depois da última `/` e não possui espaços. Mantenha a Neon aberta. A Render criará as tabelas automaticamente.

---

## Parte 4 — Publicar a API e o portal na Render

### 4.1 Criar ou acessar a conta

1. Abra `https://dashboard.render.com`.
2. Clique em `Get Started` ou `Sign Up`.
3. Escolha `GitHub` e autorize a Render.
4. Quando o GitHub perguntar quais repositórios podem ser acessados, escolha `Only select repositories`.
5. Selecione `techpaper-pim-iv` e confirme em `Install` ou `Save`.

Se já tinha conta e o repositório não aparece, abra `Account Settings > GitHub`, clique em `Configure` e libere `techpaper-pim-iv`.

### 4.2 Criar o Blueprint

1. No painel da Render, clique em `New +`.
2. Clique em `Blueprint`.
3. Localize `techpaper-pim-iv` e clique em `Connect`.
4. Em `Blueprint Name`, escreva `techpaper-pim-iv`.
5. Em `Branch`, selecione `main`.
6. Em `Blueprint Path`, deixe `render.yaml`.
7. Clique em `Apply`, `Review Blueprint` ou no botão equivalente.

A Render deve mostrar um Web Service chamado `techpaper-pim-iv`, com runtime `Docker` e plano `Free`.

### 4.3 Preencher os três valores secretos

| Campo da Render | Valor |
|---|---|
| `DATABASE_URL` | conexão completa copiada da Neon |
| `Bootstrap__Login` | login administrador, por exemplo `admin@techpaper.local` |
| `Bootstrap__Password` | senha particular com pelo menos 10 caracteres |

Anote login e senha no arquivo particular. Não use literalmente `SUA_SENHA` e não mostre a senha nas capturas.

As demais variáveis já vêm configuradas: `DatabaseInit__Enabled=true` cria o banco, `DatabaseInit__DemoData=true` cria dados fictícios e `Bootstrap__Enabled=true` cria o primeiro administrador.

### 4.4 Iniciar a publicação

1. Confirme que o serviço mostra `Free`.
2. Clique em `Deploy Blueprint`.
3. Acompanhe os eventos e aguarde o estado `Live` em verde.

O primeiro processo baixa o .NET, compila a API, conecta na Neon, cria tabelas, funções e gatilhos e inicia o portal. Pode levar vários minutos.

### 4.5 Se a Render não pedir os segredos

1. Abra o serviço `techpaper-pim-iv`.
2. Clique em `Environment` no menu lateral.
3. Clique em `Add Environment Variable`.
4. Adicione `DATABASE_URL`, `Bootstrap__Login` e `Bootstrap__Password` com os valores descritos acima.
5. Clique em `Save, rebuild, and deploy`.
6. Aguarde novamente o estado `Live`.

### Verificação 4 — Copiar a URL pública

No alto da página do serviço, copie a URL terminada em `.onrender.com` e anote-a sem barra final. Exemplo: `https://techpaper-pim-iv.onrender.com`. Se houver letras ou números adicionais, use a URL real mostrada pela Render.

---

## Parte 5 — Conferir a API, o portal e o banco

### 5.1 Conferir a saúde da API

Acrescente `/health` à URL real e abra no navegador. Exemplo:

```text
https://techpaper-pim-iv.onrender.com/health
```

O resultado deve ser `ok`. Depois, abra a mesma URL com `/health/ready`; o resultado deve ser `ready`. No plano gratuito, a primeira abertura após um período sem uso pode demorar cerca de um minuto.

### 5.2 Entrar no portal

1. Abra somente a URL principal, sem `/health`.
2. Digite `Bootstrap__Login` e `Bootstrap__Password`.
3. Clique em `Entrar` e confirme o painel.
4. Abra `Produtos` e confirme os produtos fictícios.
5. Abra `Estoque`, registre uma entrada pequena e confirme a mudança no saldo.

### 5.3 Confirmar as tabelas na Neon

1. Volte à Neon e abra `TechPaper-PIM-IV`.
2. Clique em `SQL Editor`.
3. Apague o conteúdo existente e cole:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

4. Clique em `Run`.

Devem aparecer oito tabelas: `auditoria_estoque`, `fornecedores`, `itens_orcamento`, `movimentacoes`, `orcamentos`, `produtos`, `sessoes` e `usuarios`.

---

## Parte 6 — Criar a conta Expo

1. Abra `https://expo.dev/signup`.
2. Crie uma conta com usuário, e-mail e senha que possam ser usados também no terminal.
3. Faça a verificação por e-mail.
4. Entre em `https://expo.dev/login` e confirme que o painel abre.
5. Anote o usuário Expo.

O plano Free permite solicitar builds. Não é necessário pagar a Google Play para instalar o APK diretamente no aparelho.

---

## Parte 7 — Instalar o Node.js no Windows

1. Abra `https://nodejs.org` e baixe a versão `LTS` para Windows.
2. Abra o instalador, aceite a licença e mantenha local e componentes padrão.
3. Clique em `Install` e depois em `Finish`.
4. Abra o PowerShell pelo menu Iniciar e execute `node --version`.

Se aparecer algo parecido com `v22.x.x`, a instalação terminou. Feche o PowerShell.

---

## Parte 8 — Gerar o APK automaticamente

### 8.1 Iniciar o gerador

1. Abra a pasta extraída `TechPaper-PIM-IV-Render-Neon`.
2. Dê dois cliques em `GERAR_APK_WINDOWS.cmd`.
3. Se o Windows mostrar proteção, clique em `Mais informações` e `Executar assim mesmo`.
4. A janela instalará `pnpm`, se necessário, e as dependências.
5. Quando pedir login, digite usuário ou e-mail Expo e pressione `Enter`.
6. Digite a senha Expo e pressione `Enter`. A senha pode não aparecer enquanto é digitada; isso é normal.

### 8.2 Responder às perguntas do primeiro build

| Pergunta aproximada | Resposta |
|---|---|
| `Would you like to create a project for ...?` | `Y` |
| `Create a new EAS project?` | `Y` |
| `Generate a new Android Keystore?` | `Y` |
| `Would you like EAS to handle credentials?` | opção recomendada/automática |
| conta pessoal ou organização | sua conta pessoal Expo |

O identificador Android já é `com.techpaper.mobile`, e o perfil `preview` já está configurado para APK.

Quando o pedido for enviado, aparecerá um link de acompanhamento em `expo.dev`. Copie-o. O computador pode ser desligado depois do envio, pois a compilação acontece na Expo.

### 8.3 Comandos manuais, se necessários

Abra a pasta `mobile`, digite `powershell` na barra de endereço do Explorador e execute uma linha de cada vez:

```powershell
npm install --global pnpm
pnpm install --frozen-lockfile
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest whoami
pnpm dlx eas-cli@latest build --platform android --profile preview
```

Não execute `eas build:configure`, pois `eas.json` já está pronto.

### Verificação 5

No painel da Expo, o build deve terminar como `Finished`. O artefato precisa terminar em `.apk`. Se aparecer `.aab`, repita usando `--profile preview`.

---

## Parte 9 — Baixar e instalar no Android

1. No build da Expo, clique em `Install` ou `Download`.
2. Abra o link no celular por e-mail ou pelo QR Code exibido.
3. Baixe o `.apk`.
4. Se o Android bloquear, abra `Configurações` na mensagem.
5. Ative `Permitir desta fonte` para o navegador usado.
6. Volte, toque em `Instalar` e depois em `Abrir`.

Na tela do TechPaper, preencha:

| Campo | Valor |
|---|---|
| `Login` | `Bootstrap__Login` |
| `Senha` | `Bootstrap__Password` |

O endereço HTTPS da API é incorporado à configuração do aplicativo e não aparece na tela. Ele nunca deve ser substituído pela conexão da Neon. Toque em `Entrar`, abra produtos e estoque e confira a movimentação feita no portal.

---

## Parte 10 — Teste final obrigatório

- [ ] `/health` respondeu `ok`.
- [ ] `/health/ready` respondeu `ready`.
- [ ] o administrador entrou no portal.
- [ ] os produtos fictícios apareceram.
- [ ] uma entrada alterou o saldo.
- [ ] a Neon mostrou oito tabelas.
- [ ] o build Expo terminou como `Finished`.
- [ ] o arquivo terminou em `.apk`.
- [ ] o APK foi instalado.
- [ ] o aplicativo entrou usando a URL da Render.
- [ ] o saldo no aplicativo foi igual ao portal.
- [ ] um orçamento com dois itens calculou o total.
- [ ] sair da conta encerrou a sessão.

Considere o sistema pronto somente quando todos os itens estiverem marcados.

---

## Parte 11 — Capturas para o relatório

Capture o repositório no GitHub, deploy `Live`, `/health/ready`, oito tabelas na Neon, login mobile escondendo a senha, painel, produtos, estoque, histórico, orçamento, total, sincronização portal/celular, encerramento da sessão, build `Finished` e aplicativo instalado.

Use dados fictícios. Nunca mostre `DATABASE_URL`, senhas, tokens ou a conexão Neon. Registre aparelho, Android, data e resultado observado.

---

## Parte 12 — Problemas comuns

### Repositório não aparece na Render

Abra `Account Settings > GitHub > Configure`, selecione `Only select repositories`, marque `techpaper-pim-iv`, salve e atualize a Render.

### Render não encontrou `render.yaml`

Confira se `render.yaml` está na raiz do GitHub. Se estiver em `TechPaper-PIM-IV-Render-Neon/render.yaml`, o conteúdo foi enviado um nível abaixo. Refaça o envio para a raiz.

### Deploy falha com erro de banco

Na Neon, clique em `Connect` e copie a conexão novamente. Na Render, abra `Environment`, edite `DATABASE_URL`, cole a conexão inteira sem aspas e escolha `Save, rebuild, and deploy`.

### Portal abre, mas o login é recusado

Confirme os valores exatos de `Bootstrap__Login` e `Bootstrap__Password`. Alterar essas variáveis depois que o primeiro usuário foi criado não redefine a senha existente. Peça a correção técnica do usuário no banco antes de apagar qualquer dado.

### Portal mostra “Origem da requisição não permitida”

Confirme na Render, em `Deploys`, se a versão `10b2920` ou uma versão mais nova está marcada como `Live`. Depois, volte ao portal, atualize a página com `Ctrl + R`, digite novamente o e-mail e a senha e clique em `Entrar`.

### Render demora para abrir

Abra `/health/ready`, aguarde cerca de um minuto e atualize. Antes da apresentação, abra o endereço dois minutos antes.

### `node` não foi encontrado

Instale o Node.js LTS, feche a janela e execute `GERAR_APK_WINDOWS.cmd` novamente.

### Login Expo falha

Entre primeiro em `https://expo.dev/login`, redefina a senha se necessário e use no gerador o usuário ou e-mail Expo. A senha não aparece enquanto é digitada.

### Build gera AAB

Execute `pnpm dlx eas-cli@latest build --platform android --profile preview`. O perfil `production` gera AAB; `preview` gera APK.

### Aplicativo exige HTTPS ou não entra

Use a URL completa da Render começando em `https://`, sem barra final, caminho, parâmetros ou credenciais. Abra `/health/ready` no celular, espere `ready`, volte ao aplicativo e tente novamente.

---

## Parte 13 — Uso gratuito e backup

A Render Free pode suspender o serviço ocioso e possui cotas mensais. A Neon Free possui limites de armazenamento e computação. A Expo Free utiliza uma fila. Consulte os painéis antes da apresentação porque os limites podem mudar.

Faça uma exportação do banco pela Neon antes da entrega e guarde-a fora do repositório público. Nunca apague o projeto ou banco antes de confirmar o backup.

## Fontes oficiais consultadas em 6 de setembro de 2026

- GitHub, Creating a new repository: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- GitHub, Adding a file: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Neon, Manage projects: https://neon.com/docs/manage/projects
- Neon, Connect with psql: https://neon.com/docs/connect/query-with-psql-editor
- Render, Blueprints: https://render.com/docs/infrastructure-as-code
- Render, Environment variables: https://render.com/docs/configure-environment-variables
- Render, Deploy for Free: https://render.com/docs/free
- Expo, Create your first build: https://docs.expo.dev/build/setup/
- Expo, Build APKs: https://docs.expo.dev/build-reference/apk/
