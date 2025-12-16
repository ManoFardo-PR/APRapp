# Relatório de Consistência do Projeto

Este documento detalha as inconsistências encontradas entre o arquivo `todo.md` e a implementação atual do código, após varredura realizada em 16/12/2025.

## 1. Divergências de Status (Marcado incorretamente no Todo.md)

### ✅ Questionário Interativo
*   **Status no Todo.md:** Marcado como **Pendente/Crítico** ("❌ Questionário Interativo (CRÍTICO)", "não há UI de questionário").
*   **Status Real:** **Implementado.**
    *   O componente `AprQuestionnaire.tsx` existe e é funcional.
    *   A página `NewApr.tsx` utiliza este componente no fluxo de criação.
    *   As respostas são salvas no banco via `saveResponses`.
*   **Ação:** Atualizar Todo.md para concluído.

### ❌ Botão "Aprimorar com IA" na Criação
*   **Status no Todo.md:** Marcado como feito em alguns pontos, mas pendente em "Resumo".
*   **Status Real:** **Pendente.**
    *   A funcionalidade existe no `EditApr.tsx` mas **não** no `NewApr.tsx`.
    *   O usuário cria a APR sem auxílio da IA na descrição inicial.

## 2. Inconsistências de Implementação (Marcado como Pendente - e realmente está Pendente)

Os seguintes itens estão corretamente marcados como pendentes, mas detalho o nível de ausência:

### ⚠️ Relatórios e PDF
*   **QR Code:** O campo existe no banco, mas o PDF gerado (`aprReport.ts`) não inclui o código QR visualmente.
*   **Assinaturas Digitais:** O sistema apenas exibe os nomes em texto. Não há mecanismo de assinatura digital (hash/cripto) implementado no relatório.
*   **Campos do Modelo Excel:** O PDF atual não reflete todos os campos exigidos pelo modelo Excel mencionado (faltam: Metodologia de Execução, Permissões de Trabalho Vinculadas, Comunicação).

### ⚠️ Filtros e Busca
*   O backend suporta apenas filtros básicos (`status`, `userId`).
*   Não é possível filtrar por: Data, Localização, Tipo de Risco ou Palavra-chave.

### ⚠️ Estatísticas (Analytics)
*   O sistema calcula apenas totais básicos (Aprovadas/Rejeitadas).
*   Não há implementação de: Ranking de usuários, Riscos mais frequentes, Setores críticos.

### ⚠️ Gestão de Usuários
*   **Convites:** Não há sistema de convite por email. O cadastro é manual e direto.

## 3. Recomendações Prioritárias

1.  **Atualizar a UI de Criação (`NewApr`):** Adicionar o botão "Aprimorar com IA" para manter consistência com a edição.
2.  **Compliance do Relatório:** Se o modelo Excel for mandatório, é crítico implementar os campos faltantes (`communicatedDepartments`, `linkedWorkPermits`, `executionMethodology`) no banco e no PDF.
3.  **Segurança do PDF:** Implementar a geração real do QR Code para validação da autenticidade da APR impressa.

## 4. Sugestão de Atualização do Todo.md

Sugiro marcarmos o "Questionário Interativo" como `[x]` e criarmos tarefas específicas para os campos faltantes do Excel, que parecem ser o maior "gap" de funcionalidade versus requisitos de negócio.
