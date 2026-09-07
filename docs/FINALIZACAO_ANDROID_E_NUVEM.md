# Finalização gratuita: Android, Render e Neon

Este roteiro conclui as evidências que dependem de contas externas e de um aparelho. A arquitetura utiliza React Native com Expo e JavaScript no celular, ASP.NET Core na Render Free e PostgreSQL na Neon Free. O Manual do PIM IV exige telas, navegação, autenticação, sincronização, API, banco e nuvem, sem fixar um SGBD ou exigir um provedor pago.

## Serviços escolhidos

| Componente | Serviço | Custo adotado | Limitação relevante |
|---|---|---:|---|
| API e portal | Render Web Service Free | US$ 0 | Suspende após 15 minutos sem tráfego e pode levar cerca de um minuto para retornar |
| Banco PostgreSQL | Neon Free | US$ 0 | 0,5 GB por projeto, 100 horas de computação mensais e suspensão automática quando ocioso |
| APK Android | Expo EAS Free | US$ 0 para a demonstração dentro da cota vigente | Requer conta Expo e aguarda a fila do serviço |

Não cadastre cartão. Sem forma de pagamento, a Render informa que suspende o serviço quando uma cota gratuita é ultrapassada, em vez de cobrar. Consulte os limites atuais antes da apresentação.

## O que já está automatizado

O arquivo `render.yaml` descreve um serviço Docker gratuito e seu caminho de saúde. A API aceita a variável `DATABASE_URL` fornecida pela Neon. Na primeira inicialização, `DatabaseInit__Enabled=true` cria tabelas, índices, funções e gatilhos. `DatabaseInit__DemoData=true` inclui somente os dois produtos fictícios. O processo é idempotente e usa um bloqueio do PostgreSQL para impedir duas inicializações simultâneas.

## Criar o banco gratuito na Neon

1. Acesse `https://console.neon.tech`, crie a conta e escolha o plano Free.
2. Crie o projeto `TechPaper-PIM-IV` em uma região próxima da região selecionada na Render.
3. Abra `Connect`, selecione a conexão direta e copie a string `postgresql://...` com `sslmode=require`.
4. Guarde a string temporariamente. Ela contém senha e será colada somente no campo secreto `DATABASE_URL` da Render.

Não é necessário executar os scripts manualmente: a API aplica os arquivos `database/001_schema.sql`, `002_routines.sql` e, quando autorizado, `003_demo.sql`.

## Publicar gratuitamente na Render

1. Envie esta versão do projeto ao GitHub.
2. Acesse `https://dashboard.render.com`, crie a conta sem cadastrar forma de pagamento e escolha `New > Blueprint`.
3. Conecte o repositório. A Render detectará `render.yaml` e mostrará o serviço `techpaper-pim-iv` no plano Free.
4. Preencha os três segredos solicitados:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | string de conexão copiada da Neon |
| `Bootstrap__Login` | login do administrador da demonstração |
| `Bootstrap__Password` | senha forte com pelo menos 10 caracteres |

5. Confirme o Blueprint e acompanhe o primeiro deploy. A inicialização do banco ocorre antes de a API começar a atender.
6. Abra `https://SEU-SERVICO.onrender.com/health` e `/health/ready`. As respostas esperadas são `ok` e `ready`.
7. Abra o endereço principal, entre no portal e faça uma movimentação de teste.

Para a apresentação, abra `/health/ready` cerca de dois minutos antes. Isso desperta o serviço gratuito e evita que o público espere o início a frio.

## Gerar o APK Android

O arquivo `mobile/eas.json` contém `preview`, que gera APK instalável, e `production`, que gera AAB para publicação futura. Na pasta `mobile`:

```powershell
pnpm install --frozen-lockfile
pnpm dlx eas-cli login
pnpm dlx eas-cli build --platform android --profile preview
```

No primeiro build, permita que o EAS crie o projeto e a chave de assinatura. Ao final, abra no celular o endereço fornecido e instale o APK. Informe na tela de login a URL HTTPS da Render sem barra final. Também é possível copiar `mobile/.env.example` para `.env.local`, substituir a URL e gerar outro APK.

## Capturas para o relatório

Use somente dados fictícios e capture:

1. Login com URL HTTPS.
2. Resumo autenticado.
3. Lista e busca de produtos.
4. Registro de entrada ou saída.
5. Histórico com a nova movimentação.
6. Criação de orçamento com dois itens.
7. Detalhe e total calculado.
8. Alteração no portal aparecendo após atualização no celular.
9. Mensagem com a rede desligada e recuperação após religá-la.
10. Perfil e encerramento da sessão.
11. Blueprint e deploy concluído na Render.
12. Banco, tabelas e gráficos de uso na Neon.
13. Resposta de `/health/ready`.

Registre aparelho, Android, data, versão do aplicativo, perfil usado e resultado observado. Não apresente protótipos como capturas de execução.

## Backup sem serviço pago

A camada gratuita não fornece a mesma política de backup de um plano de produção. Para o PIM, faça uma exportação lógica antes da entrega pelo console/CLI da Neon e guarde o arquivo fora do repositório público. Depois, restaure em uma branch descartável e registre o resultado. A Neon informa uma janela limitada de restauração no plano Free; confirme a cota exibida na conta.

## Critério de conclusão

A etapa estará concluída quando houver URL HTTPS pública, `/health/ready` respondendo, login no APK, sincronização web/mobile, treze capturas, exportação do banco e registro das limitações do plano gratuito. Credenciais, strings de conexão, tokens, `.env.local` e chaves de assinatura nunca entram no relatório ou no repositório.

## Fontes consultadas em 6 de setembro de 2026

- Render, Deploy for Free: https://render.com/docs/free
- Render, Blueprint YAML Reference: https://render.com/docs/blueprint-spec
- Render, Docker: https://render.com/docs/docker
- Neon, Pricing: https://neon.com/pricing
- Neon, Connect with psql: https://neon.com/docs/connect/query-with-psql-editor
- Expo, Build APKs for Android: https://docs.expo.dev/build-reference/apk/
