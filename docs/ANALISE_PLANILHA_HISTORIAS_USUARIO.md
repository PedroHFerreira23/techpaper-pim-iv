# ANÁLISE DA PLANILHA DE HISTÓRIAS DE USUÁRIO

## 1 RESULTADO DA ANÁLISE

A planilha `Agile-user-story-template-PT-3.xlsx` está parcialmente alinhada ao TechPaper. Ela contém quinze histórias e reconhece a existência do portal, da API, do banco de dados e do novo aplicativo móvel. Entretanto, mistura entregas herdadas do PIM III com entregas do PIM IV, sem registrar essa origem, e não representa todas as funções que já foram implementadas no sistema.

Para demonstrar corretamente que o aplicativo móvel é uma continuação do projeto anterior, as histórias IBL01 a IBL07 devem ser identificadas como **baseline herdada do PIM III**. As histórias IBL08 a IBL15 devem ser identificadas como **evolução do PIM IV**. Essa separação evita a interpretação de que portal, API, fornecedores e banco foram criados novamente no semestre atual.

## 2 CONFERÊNCIA DAS HISTÓRIAS EXISTENTES

| História | Avaliação | Ajuste recomendado |
|---|---|---|
| IBL01 – Protótipo | Compatível com o histórico do projeto | Marcar como atividade concluída no PIM III e atualizada no PIM IV. |
| IBL02 – Acessibilidade | Compatível | Citar leitores de tela, rótulos acessíveis, contraste, navegação por teclado e VLibras. Não afirmar conformidade integral com WCAG sem avaliação formal. |
| IBL03 – Banco de Dados | Compatível | Substituir o ator “sistema” por “equipe de desenvolvimento” e identificar PostgreSQL/Neon como tecnologia real. |
| IBL04 – API | Compatível | Substituir o ator “sistema” por “equipe de desenvolvimento” e citar ASP.NET Core/.NET. |
| IBL05 – Front-end | Compatível com a base herdada | Identificar o portal web como parte do PIM III que recebeu melhorias de responsividade no PIM IV. |
| IBL06 – Integração | Compatível | Corrigir a redação e registrar que web e mobile consomem a mesma API REST. |
| IBL07 – Fornecedores | Compatível com o portal | Marcar como função web herdada; o aplicativo atual consulta os dados necessários, mas não administra fornecedores. |
| IBL08 – Aplicativo Mobile | Compatível | Corrigir “aplicativo mobile integrada” para “aplicativo móvel integrado” e incluir Estoque, Orçamentos e Conta. |
| IBL09 – Autenticação Mobile | Compatível | Acrescentar sessão protegida pelo SecureStore e permissões por perfil. |
| IBL10 – Integração Mobile/API | Compatível | Acrescentar envio de movimentações e orçamentos, além das consultas. |
| IBL11 – Sincronização de dados | Compatível | Explicar atualização após operações, retorno ao aplicativo e gesto de puxar para atualizar. |
| IBL12 – Triggers | Compatível | Citar `TRG_ATUALIZA_ESTOQUE`, auditoria e proteção da imutabilidade das movimentações. |
| IBL13 – Containers | Compatível com o repositório | Relacionar ao Dockerfile e ao ambiente local padronizado. |
| IBL14 – CI/CD | Compatível | Relacionar ao pipeline de validação e à implantação automática a partir do GitHub. |
| IBL15 – Monitoramento | Parcialmente compatível | Citar os endpoints `/health` e `/health/ready` e os registros do Render; evitar afirmar a existência de uma plataforma de observabilidade que não foi implantada. |

## 3 HISTÓRIAS QUE ESTÃO FALTANDO

As histórias abaixo devem ser acrescentadas ao backlog para que a planilha corresponda ao produto entregue:

| Identificador sugerido | Como | Eu gostaria de | Para que |
|---|---|---|---|
| IBL16 – Movimentação de Estoque | colaborador autorizado | registrar entradas e saídas pelo aplicativo, informando produto, quantidade e motivo | o saldo seja atualizado com segurança e a operação fique registrada no histórico compartilhado |
| IBL17 – Orçamentos Mobile | colaborador | montar e consultar orçamentos com produtos cadastrados | eu possa atender o cliente também pelo dispositivo móvel |
| IBL18 – Dashboard Mobile | colaborador | visualizar indicadores e gráficos de estoque e movimentações | eu possa acompanhar rapidamente a situação operacional da papelaria |
| IBL19 – Atualização por Gesto | colaborador | puxar a tela de estoque para atualizar os dados | eu possa visualizar alterações feitas por outros integrantes da equipe |
| IBL20 – Preferências da Conta | usuário autenticado | selecionar um avatar representativo e alternar o tema claro ou escuro | minha experiência seja inclusiva e adequada às minhas preferências visuais |
| IBL21 – Educação para a Diversidade | integrante da equipe | visualizar mensagens educativas rotativas sobre respeito e combate à discriminação | eu possa reconhecer e aplicar práticas inclusivas no ambiente de trabalho |
| IBL22 – Responsividade do Portal | usuário de celular | abrir o menu recolhível e visualizar os gráficos empilhados | eu possa usar o portal pelo navegador móvel sem perda de conteúdo |
| IBL23 – Configuração Transparente da API | colaborador | acessar o login somente com e-mail e senha | eu possa usar o aplicativo sem conhecer ou digitar endereços técnicos da infraestrutura |

## 4 PROBLEMAS DE ESTRUTURA E REDAÇÃO

A planilha utiliza somente quatro colunas e não apresenta prioridade, situação, responsável, critérios de aceitação ou vínculo com o semestre. Para uso como backlog acadêmico, recomenda-se acrescentar as colunas `Origem`, `Prioridade`, `Situação` e `Critérios de aceitação`. As histórias herdadas podem receber origem `PIM III` e situação `Concluída`; as novas devem receber origem `PIM IV` e uma situação correspondente à evidência disponível.

Há erros como “Eu gostaria deutilizar”, “eu queroos”, “eu querofacilitar” e “aplicativo mobile integrada”. A expressão final também deve ser padronizada como “para que”, forma mais direta do padrão: **Como [perfil], eu gostaria de [ação], para que [benefício]**.

## 5 RELAÇÃO COM A IMPLEMENTAÇÃO

O TechPaper móvel não constitui um sistema separado. Ele reutiliza a autenticação, as regras de permissão, os produtos, as movimentações, os orçamentos e o banco PostgreSQL do projeto anterior por meio da API REST. O portal continua disponível e recebeu melhorias. O aplicativo acrescenta uma nova interface e novos fluxos de uso sobre a mesma base de negócio.

A API permanece necessária para o funcionamento integrado. O endereço da hospedagem não precisa ser exibido ao usuário: ele fica definido internamente na configuração do aplicativo. Se a API estiver indisponível ou o aparelho estiver sem internet, não será possível autenticar, consultar informações atuais ou confirmar alterações no banco compartilhado. O aplicativo preserva somente a sessão protegida e uma movimentação ainda não confirmada, não uma cópia completa do banco para trabalho offline.
