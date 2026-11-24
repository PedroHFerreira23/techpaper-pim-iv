# Ensaiar o TechPaper no computador

**Precisa de Docker Desktop (Compose v2) em execução e Python 3.** Extraia o ZIP e abra um terminal na pasta que contém este arquivo. Na primeira execução, a montagem da imagem exige internet; faça isso antes do dia da apresentação.

1. No Windows: `py -3 tools/iniciar_apresentacao.py`. No macOS/Linux: `python3 tools/iniciar_apresentacao.py`.
2. Aguarde “Carga concluída” e abra http://127.0.0.1:18080. Use o login indicado na tela do terminal; a senha é o valor após `BOOTSTRAP_PASSWORD=` no arquivo local `.env.apresentacao`, gerado no primeiro uso.
3. No primeiro acesso, selecione um avatar. Em **Produtos**, pesquise `PIM-DEMO-001`. O lote de ensaio contém seis fornecedores, 36 produtos, 72 movimentações e 12 orçamentos (quatro em cada estado). Os dois produtos do exemplo original podem aparecer junto com o lote.
4. Confirme o saldo inicial de sete unidades. Em **Estoque → Registrar movimentação**, escolha o produto pelo SKU PIM-DEMO-001 e adicione cinco unidades. Volte a Produtos, filtre pelo SKU e confira o novo saldo de 12. Nas próximas apresentações, parta do saldo atual. A carga não apaga nem desfaz as operações já realizadas.
5. Mostre um orçamento e o CSV de estoque. Aprovar um orçamento não dá baixa: a saída de estoque é uma operação separada.

A base e a porta são exclusivas desta demonstração. O endereço só funciona no próprio computador; um telefone não acessa o computador por “localhost”. Para um aparelho, use um ambiente de demonstração acessível a ele e a URL correspondente antes de montar o app; veja o README. A carga é feita pela API e pode ser repetida sem duplicar o lote. Os orçamentos novos têm validade de 30 dias a partir da criação.

Para parar, use a opção **Stop** no projeto `techpaper-apresentacao` do Docker Desktop. Na próxima vez, repita o passo 1. Não exclua o volume se quiser preservar os dados. Não publique o arquivo de senha.

## Reproduzir a revisão técnica
- JavaScript: `node --test tests/web_session.test.mjs mobile/tests/*.test.mjs`.
- Compilação API, PostgreSQL e verificações SQL: veja o fluxo `.github/workflows/validar.yml`. A suíte de integração cria e modifica dados; use outra base descartável, separada do ensaio.
- Navegador: `tools/qa_portal.cjs` requer o módulo Playwright no caminho de módulos do Node e o Chromium instalado pelo Playwright (ou TP_CHROME). Defina TP_TEST_URL (origem local), TP_TEST_LOGIN, TP_TEST_PASSWORD e TP_TEST_ALLOW_MUTATIONS=1 para uma conta exclusiva na base de ensaio já populada. Execute `node tools/qa_portal.cjs`. O teste também exercita tema, avatar e relatórios.
- Android: em `mobile/`, rode `pnpm install --frozen-lockfile`, `pnpm test` e `pnpm exec expo export --platform android`. Essa exportação não instala nem gera um APK.
