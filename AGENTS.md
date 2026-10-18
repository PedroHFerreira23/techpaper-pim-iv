# AGENTS.md — TechPaper

Escopo: raiz do repositório e seus descendentes, salvo regra local mais específica. Este arquivo orienta trabalhos futuros; não autoriza alterações fora do pedido do usuário.

## Fonte de verdade e início de tarefa
1. Leia o código relevante antes de propor ou realizar mudanças. Não use histórico de conversa como especificação do estado atual.
2. Distinga implementação, documentação, teste executado e hipótese. README/docs podem estar desatualizados.
3. Consulte o estado do checkout e preserve alterações do usuário. Não execute limpeza destrutiva ou substitua arquivos inteiros sem entender seu conteúdo.
4. Mantenha o escopo solicitado; tarefas de análise não autorizam correções de código.

## Organização atual
- api/: ASP.NET Core .NET 10, controllers, contratos, serviços, autenticação e modelos EF Core/Npgsql.
- api/wwwroot/: portal JavaScript puro e CSS, servido pela API.
- mobile/: Expo/React Native em JavaScript, pnpm e pnpm-lock.yaml.
- database/: schema, funções/procedure, triggers, demonstração e verificações PostgreSQL.
- tests/integration_test.py: integração mutável, somente ambiente descartável.
- .github/workflows/validar.yml: compilação API, integração real com PostgreSQL descartável, verificações SQL e validação/exportação mobile.
- docs/ e outputs/: documentação e entregas; não representam automaticamente o estado implantado.

## Contratos e segurança
- Preserve /api e seus contratos, ou atualize explicitamente ambos os clientes e os testes quando uma mudança de contrato for autorizada.
- Autorização deve existir no servidor; esconder botões não substitui [Authorize]. Preserve os perfis Admin, Supervisor e Operador e os limites definidos nos controllers.
- Preserve PasswordHasher, JsonIgnore de Password, sessão revogável e expiração. Não trocar sessões por autenticação simulada ou confiar em identidade enviada no corpo.
- Token de sessão em cookie HttpOnly no portal e SecureStore/Bearer no mobile; nunca registrar tokens ou senhas. A identidade da movimentação vem do usuário autenticado.
- Preserve a restrição de consulta de relatos: Admin vê todos, os demais apenas os próprios. Não incluir relatos no cache persistente do aplicativo nem tornar o canal público.
- Login é normalizado para minúsculas na API. Alterar essa regra requer decisão explícita e avaliação dos dados existentes.
- Não remover controles de origem ou rate limiting para contornar erros. Investigue proxy, cabeçalhos e fluxo de autenticação.

## Invariantes de estoque
- Cadastro de produto com saldo zero; mudanças de saldo pelo fluxo de movimentações.
- sp_registrar_movimentacao valida operação e bloqueia produto; TRG_ATUALIZA_ESTOQUE aplica saldo. Não repetir a atualização na API/mobile/web.
- Mantenha UUID de operação nas novas tentativas após resposta desconhecida. Mesma chave com conteúdo diferente deve conflitar.
- Não permitir saldo negativo, edição ou exclusão do histórico. Correção por movimento compensatório.
- Preserve auditoria e relacionamentos; não apagar histórico para liberar exclusões de cadastros.

## Invariantes de orçamento
- Preços e totais no servidor a partir do catálogo; nunca aceitar total do cliente como fonte confiável.
- Orçamento não reserva nem reduz estoque. Uma mudança dessa regra exige solicitação explícita, análise transacional e atualização dos dois clientes.
- Preserve Versao como token de concorrência, propriedade do rascunho do Operador e transições permitidas.
- Edição de rascunho recalcula os preços atuais. Estados finais não são editáveis no fluxo atual.

## Banco e implantação
- PostgreSQL é o banco atual. Não reintroduzir MySQL/SQL Server ou scripts incompatíveis.
- Mantenha coerência entre modelos, contratos, 001_schema.sql, 002_routines.sql, o consolidado 000_banco_completo.sql e verificações aplicáveis. Os scripts numerados são recursos embutidos no csproj.
- Idempotência de CREATE IF NOT EXISTS não equivale a migração completa. Evoluções de banco existente devem ter alteração versionada, ensaio e plano de recuperação adequado.
- Dados de 003_demo.sql apenas em ambiente demonstrativo autorizado. Não inserir contas/senhas reais em seeds.
- Conexão por ConnectionStrings__DefaultConnection ou DATABASE_URL; bootstrap/inicialização são opcionais por configuração. Não publicar segredos.
- Preserve Dockerfile, contexto de build, Compose, Render e EAS coerentes com mudanças autorizadas. Configuração existente não comprova deploy bem-sucedido.
- Não executar testes de integração contra a URL pública padrão do aplicativo. Não fazer deploy, push ou mutações externas sem autorização pertinente.

## Interfaces e acessibilidade
- Preserve português, identidade visual atual, responsividade, temas, avatares, foco e rótulos acessíveis.
- Mantenha tratamento de sessão expirada, falha de rede e confirmação real da gravação. Erros devem permanecer visíveis inclusive no onboarding.
- Cache offline é consulta de dados anteriores, não confirmação de gravação offline. Limpe ou isole estado por conta e servidor, sem vazamento entre sessões.
- Datas de eventos: UTC no armazenamento e apresentação em America/Sao_Paulo. Validade DATE deve ser tratada separadamente. Não mudar fusos silenciosamente.
- Exportação atual: CSV e impressão/PDF do navegador. Não apresentar como XLSX/PDF gerado no backend.

## Verificação e entrega
Execute os checks pertinentes, sem inventar sucesso:
- `node --check api/wwwroot/app.js`
- `dotnet restore api/TechPaperAPI.csproj` e `dotnet build api/TechPaperAPI.csproj --configuration Release --no-restore`, quando SDK e dependências estiverem disponíveis.
- Em mobile/: `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm exec expo install --check`; para mudanças no aplicativo, exportação Android e validação em dispositivo quando disponíveis.
- Integração: banco/API descartáveis; configure TP_TEST_URL, TP_TEST_LOGIN e TP_TEST_PASSWORD e só então TP_TEST_ALLOW_MUTATIONS=1. Rodar `python3 -m unittest discover -s tests -p '*test.py' -v`. Testes ignorados não são testes aprovados.
- Mudanças de estoque/concorrência exigem integração real; mudanças visuais relevantes exigem inspeção visual nas telas afetadas.
- Não ampliar testes sem necessidade; registre limitações de ambiente e o que permanece sem validação.

Entregue em português: comportamento alterado, arquivos, razão, verificações e limitações. Quando solicitado, forneça arquivos completos. Atualize a documentação afetada e o registro de continuidade; nunca declare que texto acadêmico ou aprovação em teste unitário comprova produção, segurança integral ou acessibilidade integral.
