# AUDITORIA DE ADERÊNCIA AO PIM IV

> Atualização técnica de 15/09/2026: as lacunas de programação indicadas nesta auditoria foram tratadas na versão 1.6.0. Foram acrescentados o canal reservado de inclusão, a tabela e os endpoints correspondentes, uma procedure PostgreSQL usada pela API, cache operacional mobile sem relatos reservados, pipeline em `.github/workflows/validar.yml` e roteiro de validação real em `docs/VALIDACAO_INCLUSAO_USABILIDADE.md`. As planilhas do Rhuan e o texto original do Daniel continuam exigindo revisão editorial pela equipe.

## 1 ESCOPO DA CONFERÊNCIA

Foram confrontados o Manual do PIM IV, o relatório do PIM III, a aplicação TechPaper, as quatro planilhas de gerenciamento enviadas por Rhuan e o texto de responsabilidade social e diversidade enviado por Daniel.

O Manual do PIM IV determina que o trabalho seja uma continuação das aplicações definidas no PIM III. Também exige aplicações web e mobile integradas, arquitetura em camadas, banco completo, responsabilidade social e diversidade, plano de nuvem e DevOps e gerenciamento ágil. O relatório escrito final deve seguir as normas acadêmicas e conter desenvolvimento entre 20 e 30 páginas.

## 2 PARECER GERAL

| Material | Parecer | Uso recomendado |
|---|---|---|
| Aplicação TechPaper | Substancialmente aderente | Pode ser usada na demonstração após reunir evidências e registrar os limites indicados neste parecer. |
| Planilhas de Rhuan | Parcialmente aderentes e inconsistentes entre si | Não incorporar ao relatório final antes de corrigir identificadores, sprints, datas, estados e itens residuais do modelo. |
| Texto de Daniel | Atende aos temas do manual, mas contém afirmações sem implementação ou evidência | Reescrever para descrever apenas recursos existentes e transformar ideias futuras em propostas. |
| Relatório do PIM III | Compatível com a continuidade | Manter a caracterização e o histórico, explicando a evolução técnica de MySQL para PostgreSQL e a inclusão do aplicativo móvel. |

## 3 APLICAÇÃO EM RELAÇÃO AO MANUAL

| Etapa do manual | Evidência encontrada | Situação |
|---|---|---|
| 1 - Caracterização da organização | O PIM III descreve a TechPaper, seu segmento, estoque, fornecedores, orçamentos e problemas operacionais. | Atendida como base herdada; atualizar o texto para o semestre atual. |
| 2 - Planejamento da solução | Há proposta técnica e benefícios descritos, mas a análise de viabilidade, público-alvo e diferenciais precisa aparecer de forma consolidada no relatório. | Parcial. |
| 3 - Responsabilidade social e diversidade | Portal com VLibras, navegação acessível, avatares representativos, tema, mensagens educativas e minimização de dados sensíveis. O mobile possui rótulos de acessibilidade e escolha obrigatória de avatar. | Atendida em nível funcional, com necessidade de evidências humanas. |
| 4 - Solução web | Portal responsivo, API REST, autenticação, segurança, estrutura administrativa e integração entre módulos. | Atendida. |
| 5 - Solução mobile | Login, telas principais, abas, autenticação, sincronização, atualização por gesto, integração REST, gráficos, produtos, estoque e orçamentos. | Atendida. |
| 6 - Arquitetura de software | Models, Controllers, Contracts, Services, Security e Data, com responsabilidades separadas e orientação a objetos em C#/.NET. | Atendida. |
| 7 - Banco de dados | Oito tabelas, relacionamentos, índices, funções armazenadas, gatilhos, auditoria e script completo PostgreSQL. Há MER e descrição lógica/física. | Substancialmente atendida. Se o orientador exigir literalmente `CREATE PROCEDURE`, o script atual precisa receber uma procedure real, pois as rotinas atuais usam `CREATE FUNCTION`. |
| 8 - Nuvem e DevOps | Dockerfile, Compose, Render, Neon, TLS, variáveis secretas e endpoints de saúde. | Parcial: não existe o arquivo de pipeline citado pela documentação, nem evidência de alertas, teste de restauração ou escalabilidade. |
| 9 - Gerenciamento ágil | Foram entregues Product Backlog, histórias, lista de tarefas e Sprint Backlog. | Parcial: os quatro arquivos não formam ainda um planejamento coerente e não há quadro Kanban válido. |

## 4 CONTINUIDADE DO PIM III

O aplicativo móvel não representa um produto separado. Ele consome a mesma API REST, utiliza o mesmo banco de dados e trabalha com os mesmos produtos, usuários, movimentações e orçamentos do portal web. Isso atende diretamente à orientação do manual de desenvolver as aplicações definidas no PIM III em continuação.

O relatório anterior registra MySQL, enquanto a versão implantada utiliza PostgreSQL no Neon. A mudança é aceitável, mas deve ser apresentada como evolução arquitetural. O trabalho final não pode manter afirmações contraditórias dizendo que a versão atual usa simultaneamente MySQL e PostgreSQL.

## 5 ANÁLISE DAS PLANILHAS DE RHUAN

### 5.1 Product Backlog

O Product Backlog possui oito itens e os associa a três sprints. As estimativas somam 160 horas: 48 horas na Sprint 1, 96 horas na Sprint 2 e 16 horas na Sprint 3. A estrutura da planilha funciona e as fórmulas de soma estão corretas.

Problemas encontrados:

- o backlog representa apenas a evolução técnica do PIM IV, mas não informa isso;
- faltam funções centrais do produto, como fornecedores, produtos, movimentações, orçamentos, relatórios, gráficos, acessibilidade e inclusão;
- todos os itens estão marcados como completos, inclusive CI/CD e monitoramento, embora a implementação não comprove um pipeline de CI e uma plataforma de monitoramento;
- faltam critérios de aceitação e evidências de conclusão;
- os nomes dos itens devem ser idênticos nas quatro planilhas.

### 5.2 Histórias de usuário

As oito histórias correspondem, em linhas gerais, aos oito itens do Product Backlog. Entretanto, são histórias predominantemente técnicas e não representam todo o comportamento entregue aos usuários.

Devem ser corrigidos ou acrescentados:

- identificação como evolução do PIM IV;
- critérios de aceitação verificáveis;
- histórias de estoque, orçamentos, dashboard, atualização por gesto, avatar, tema, banners educativos, responsividade e acessibilidade;
- descrição precisa do monitoramento básico por endpoints de saúde e registros do Render;
- descrição de gatilhos compatível com as operações realmente implementadas.

### 5.3 Lista de tarefas

A lista identifica tarefas, responsáveis, vencimentos e comentários, mas ainda contém dados residuais do modelo e informações incompatíveis com o cronograma.

Correções obrigatórias:

- remover `Tarefa 1` e `Tarefa 2`, datadas de 2017;
- remover ou limpar a aba `Comments`, que contém nomes e datas do modelo original;
- corrigir `Dainiel` para `Daniel`;
- corrigir a data de monitoramento em 22/04/2026, anterior ao restante das atividades;
- não marcar como concluídas tarefas com vencimento futuro sem registrar uma data real de conclusão;
- corrigir as quantidades dos grupos de prioridade: os títulos informam 2, 2 e 1, mas listam 5, 3 e 3 tarefas;
- padronizar `Concluída` com acentuação;
- acrescentar dependências ou ordem de execução quando uma tarefa depender de outra.

### 5.4 Sprint Backlog

O Sprint Backlog é o arquivo com maior necessidade de correção.

Problemas encontrados:

- apenas a planilha `Sprint 1` está preenchida;
- a aba `Sprnt 2` está vazia e com o nome escrito incorretamente;
- não existe uma aba ou seção para a Sprint 3, embora o Product Backlog declare três sprints;
- os grupos chamados `User Stories 1` a `User Stories 5` não utilizam os identificadores IBL01 a IBL08;
- `User Stories 1 - API do Sistema` contém tarefas de aplicativo móvel;
- `User Stories 2 - Aplicativo Mobile` contém tarefas de banco de dados;
- tarefas de procedures e triggers aparecem duplicadas em dois grupos;
- a coluna `Pontos de História` usa valores em horas, como `3h` e `5h`, misturando duas unidades diferentes;
- os valores diários aumentam em vários pontos e não terminam em zero, portanto não representam corretamente um burndown;
- a linha Total soma valores de tarefas e alguns cabeçalhos de história de forma inconsistente;
- faltam período, objetivo, revisão e resultado de cada sprint.

### 5.5 Itens exigidos pelo manual que continuam faltando

O manual solicita Product Backlog, Sprint Backlog, cronograma das sprints, quadro Kanban e definição das entregas. As planilhas apresentam versões iniciais do Product Backlog, Sprint Backlog e cronograma, mas não entregam um quadro Kanban funcional. A lista de tarefas não substitui o Kanban enquanto não possuir colunas ou estados organizados em `Não iniciado`, `Em andamento`, `Em revisão` e `Concluído`.

## 6 ANÁLISE DO TEXTO DE DANIEL

### 6.1 Conteúdo compatível com o manual e a aplicação

O texto aborda os cinco temas exigidos pelo manual: combate à discriminação, valorização da diversidade, recursos tecnológicos inclusivos, acessibilidade e tecnologia para promoção da cidadania.

As seguintes afirmações podem ser mantidas após ajuste de redação:

- uso de avatares representativos;
- mensagens educativas contra discriminação e valorização da diversidade;
- VLibras no portal;
- linguagem simples;
- cuidados de acessibilidade no portal e no aplicativo;
- preocupação com o tratamento respeitoso e a inclusão;
- minimização da coleta de dados sensíveis.

### 6.2 Afirmações que não correspondem à implementação ou não possuem evidência

As afirmações abaixo devem ser removidas, transformadas em propostas futuras ou comprovadas antes da entrega:

- bancos de imagens e ilustrações com pessoas negras, indígenas e outras minorias;
- personas formalizadas com raça, classe social, gênero, idade e deficiência;
- testes de usabilidade já realizados com pessoas negras, pessoas com deficiência, idosos e moradores de áreas periféricas;
- canal de denúncia seguro disponível em todas as telas;
- notificações educativas, pois existem banners rotativos, mas não notificações;
- materiais históricos e culturais sobre contribuições negras e indígenas dentro do sistema;
- prevenção de preconceitos em recomendações, pois o TechPaper não possui mecanismo de recomendação;
- preferência automática por fornecedores ou parceiros segundo raça, gênero ou local de moradia;
- funcionamento comprovado em celulares antigos, navegadores simples e conexões de baixa velocidade.

O texto possui 596 palavras, mas não está formatado como seção acadêmica: utiliza somente o estilo Normal, não possui título estruturado, recuo de primeira linha, espaçamento 1,5 ou referências em padrão ABNT. As fontes aparecem apenas como endereços eletrônicos e precisam de autor institucional, título, endereço e data de acesso. Também devem ser corrigidas expressões como `testes usabilidade` e `canal de denuncia seguro de em todas as telas`.

A Lei nº 10.639/2003 pode ser usada como referência para educação e valorização da história e cultura afro-brasileira, mas não deve ser apresentada como se estabelecesse requisitos técnicos para o sistema TechPaper.

## 7 LIMITES QUE DEVEM SER DECLARADOS

- Não afirmar conformidade integral com WCAG sem avaliação formal.
- Não afirmar que testes com grupos diversos foram realizados sem participantes, método e resultados registrados.
- Não afirmar que há CI/CD completo enquanto não existir pipeline de integração contínua no repositório.
- Não afirmar monitoramento avançado: a implementação atual possui endpoints de saúde e registros do provedor.
- Não afirmar escalabilidade automática, alertas ou restauração de backup sem evidências.
- Não chamar funções PostgreSQL de procedures sem explicar a diferença ou acrescentar uma procedure real.
- Não marcar tarefas futuras como concluídas antes da execução e da coleta de evidências.

## 8 CORREÇÃO VISUAL DA APLICAÇÃO

O logotipo foi preparado com transparência real para eliminar o retângulo branco. A versão completa é usada no login móvel sobre fundo claro. O portal utiliza uma variante transparente com `Tech` e o slogan em branco sobre o painel escuro, preservando contraste. O símbolo transparente é usado no cabeçalho, favicon, ícone e tela de abertura. A alteração foi isolada na versão 1.5.1, sem mudança das regras de negócio.

## 9 ORDEM RECOMENDADA DE CORREÇÃO

1. Corrigir e reconciliar as quatro planilhas de gerenciamento.
2. Reescrever o texto de Daniel conforme os recursos efetivamente implementados.
3. Decidir se será criado um pipeline real ou se CI/CD ficará descrito apenas como plano.
4. Decidir se o banco receberá procedures PostgreSQL reais além das funções armazenadas.
5. Produzir capturas e resultados de testes para comprovar mobile, sincronização, acessibilidade, banco, nuvem e diversidade.
6. Integrar o material revisado ao relatório final em formato ABNT.

## REFERÊNCIAS ANALISADAS

- UNIVERSIDADE PAULISTA. Manual do PIM IV - ADS - versão 2, especialmente páginas 21 a 28.
- TECHPAPER. PIM III: Sistema Web de Orçamento e Gerenciamento de Papelarias, 2026.
- Agile-product-backlog-template-PT-2.xlsx, planilhas Sheet1 e Sheet2.
- Agile-user-story-template-PT-3.xlsx, planilha Sheet1.
- Smartsheet Task List (pt_br)-3.xlsx, planilhas de tarefas e comentários.
- Sprint-backlog-template-PT-3.xlsx, planilhas Sprint 1 e Sprnt 2.
- Responsabilidade social e diversidade.docx, 2026.
