# Comece aqui

Esta versão foi preparada para funcionar sem Railway e sem serviço obrigatório pago:

- aplicativo: React Native com Expo e JavaScript;
- API e portal: ASP.NET Core na Render Free;
- banco: PostgreSQL na Neon Free;
- APK: perfil `preview` do Expo EAS.

## Ordem para colocar no ar

1. Envie o conteúdo desta pasta ao repositório do GitHub.
2. Crie um banco no plano Free da Neon e copie a conexão PostgreSQL.
3. Na Render, escolha `New > Blueprint`, conecte o repositório e use o `render.yaml` já incluído.
4. Preencha somente na Render os segredos `DATABASE_URL`, `Bootstrap__Login` e `Bootstrap__Password`.
5. Aguarde o deploy e confirme `/health/ready`.
6. Na pasta `mobile`, gere o APK com o perfil `preview` e informe a URL HTTPS da Render na tela de acesso.

O banco é criado automaticamente no primeiro deploy. Não coloque senhas, tokens ou a conexão da Neon no GitHub. O passo a passo completo, as capturas necessárias e os limites gratuitos estão em `docs/FINALIZACAO_ANDROID_E_NUVEM.md`.

