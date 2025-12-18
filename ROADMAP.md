# 🚀 APRFix - Roadmap de Melhorias e Pendências

Este documento contém sugestões de funcionalidades, melhorias e correções a serem implementadas no sistema APRFix.

---

## 🔴 CRÍTICO - Correções Urgentes

### 1. Corrigir Erros TypeScript no EditApr.tsx
**Prioridade:** ALTA | **Impacto:** Compilação | **Esforço:** 15min

**Problema:**
- Erros TypeScript relacionados ao procedure `enhanceDescription` não encontrado
- Linhas 51-57 do EditApr.tsx tentam usar procedure que não existe

**Solução:**
```typescript
// Remover ou comentar linhas 51-57 do EditApr.tsx
// OU implementar procedure enhanceDescription no backend
```

**Arquivos:**
- `client/src/pages/EditApr.tsx` (linhas 51-57)

---

### 2. Exibir Respostas do Questionário na Página de Detalhes
**Prioridade:** ALTA | **Impacto:** UX | **Esforço:** 2h

**Descrição:**
Atualmente o questionário é preenchido mas as respostas não aparecem na página de detalhes da APR.

**Implementação:**
1. Criar procedure `getAprResponses` no backend (já existe em aprDb.ts)
2. Adicionar query no AprDetail.tsx: `trpc.aprs.getResponses.useQuery({ aprId })`
3. Criar seção "Questionário de Segurança" no AprDetail.tsx
4. Agrupar respostas por etapa (Atividades Críticas, Trabalhos Especiais, etc.)
5. Exibir perguntas com respostas formatadas (Sim/Não + detalhes)

**Arquivos:**
- `server/routers.ts` (adicionar procedure getResponses)
- `client/src/pages/AprDetail.tsx` (adicionar seção de respostas)

---

### 3. Corrigir Erro de Análise de IA
**Prioridade:** MÉDIA | **Impacto:** Funcionalidade | **Esforço:** 1h

**Problema:**
```
[APR AI] Error analyzing APR: TypeError: Cannot read properties of undefined (reading '0')
```

**Causa Provável:**
- IA tentando acessar array de imagens vazio ou undefined
- Falta de validação antes de processar imagens

**Solução:**
```typescript
// Em server/aprAI.ts, adicionar validação:
if (!images || images.length === 0) {
  // Analisar apenas texto
}
```

**Arquivos:**
- `server/aprAI.ts`

---

## 🟡 IMPORTANTE - Funcionalidades Pendentes

### 4. Notificações Automáticas por Email
**Prioridade:** ALTA | **Impacto:** Comunicação | **Esforço:** 3h

**Funcionalidades:**
- ✉️ Notificar técnico de segurança quando APR é enviada para aprovação
- ✉️ Notificar solicitante quando APR é aprovada
- ✉️ Notificar solicitante quando APR é rejeitada (com motivo)

**Implementação:**
1. Usar sistema Manus `notifyOwner` para enviar emails
2. Adicionar chamadas nos procedures:
   - `submitForApproval` → notifica safety_tech
   - `reviewApr` → notifica requester
3. Template de email com link direto para APR
4. Incluir informações relevantes (número APR, título, status)

**Arquivos:**
- `server/routers.ts` (procedures submitForApproval e reviewApr)
- `server/_core/notification.ts` (já existe)

---

### 5. Botão "Aprimorar com IA" no NewApr.tsx
**Prioridade:** MÉDIA | **Impacto:** UX | **Esforço:** 1h

**Descrição:**
Botão "Aprimorar com IA" existe apenas no EditApr.tsx, mas seria útil também na criação.

**Implementação:**
1. Copiar lógica do EditApr.tsx para NewApr.tsx
2. Adicionar botão ao lado do campo "Descrição da Atividade"
3. Mutation chama `enhanceDescription` e atualiza campo
4. Usuário pode editar sugestão antes de salvar

**Arquivos:**
- `client/src/pages/NewApr.tsx`

---

### 6. Análise de Riscos com IA (Matriz P×S=NR)
**Prioridade:** ALTA | **Impacto:** Core Feature | **Esforço:** 4h

**Descrição:**
Criar botão separado "Analisar Riscos com IA" que gera análise estruturada de riscos.

**Funcionalidades:**
- 🎯 Identificar riscos com Probabilidade (P) e Severidade (S)
- 📊 Calcular Nível de Risco (NR = P × S)
- 🦺 Sugerir EPIs obrigatórios
- 📋 Identificar NRs aplicáveis (NR-10, NR-35, NR-33, etc.)
- 🛡️ Recomendar medidas de controle

**Implementação:**
1. Criar procedure `analyzeRisks` no backend
2. Modificar `aprAI.ts` para retornar análise estruturada
3. Adicionar seção "Análise de Riscos" no AprDetail.tsx
4. Exibir matriz de riscos visual (tabela P×S)
5. Destacar riscos críticos (NR > 400)

**Arquivos:**
- `server/routers.ts` (novo procedure analyzeRisks)
- `server/aprAI.ts` (função analyzeRisksWithAI)
- `client/src/pages/AprDetail.tsx` (seção de análise)

---

### 7. Filtros Avançados na Lista de APRs
**Prioridade:** MÉDIA | **Impacto:** UX | **Esforço:** 3h

**Filtros Faltantes:**
- 👤 Filtro por usuário criador
- 📅 Filtro por período (data início/fim)
- 📍 Filtro por localização
- 🔍 Busca por número da APR (ID)
- 🏷️ Filtro por tipo de risco identificado

**Implementação:**
1. Expandir procedure `aprs.list` com novos parâmetros
2. Adicionar campos de filtro no AprList.tsx
3. Usar query params para persistir filtros na URL
4. Botão "Limpar Filtros" para resetar

**Arquivos:**
- `server/routers.ts` (procedure aprs.list)
- `server/aprDb.ts` (função getAprsByCompany)
- `client/src/pages/AprList.tsx`

---

### 8. Estatísticas Avançadas no Dashboard
**Prioridade:** MÉDIA | **Impacto:** Analytics | **Esforço:** 4h

**Gráficos e Métricas:**
- 📊 Gráfico de APRs por mês (linha do tempo)
- 🎯 Top 5 riscos mais frequentes
- 📍 Top 5 setores com mais APRs
- 👥 Ranking de usuários mais ativos
- ⏱️ Tempo médio de aprovação
- 📈 Taxa de aprovação vs rejeição

**Implementação:**
1. Criar procedures de agregação no backend
2. Usar biblioteca de gráficos (Recharts ou Chart.js)
3. Adicionar página `/statistics` dedicada
4. Cards clicáveis que filtram lista de APRs

**Arquivos:**
- `server/routers.ts` (procedures de estatísticas)
- `server/aprDb.ts` (queries de agregação)
- `client/src/pages/Statistics.tsx` (já existe, expandir)

---

## 🟢 DESEJÁVEL - Melhorias de UX/UI

### 9. QR Code e Assinaturas Digitais no PDF
**Prioridade:** MÉDIA | **Impacto:** Compliance | **Esforço:** 3h

**Funcionalidades:**
- 🔲 QR Code no PDF para validação online
- ✍️ Assinaturas digitais do solicitante e aprovador
- 🔒 Hash SHA-256 para verificar integridade

**Implementação:**
1. Instalar package `qrcode`: `pnpm add qrcode @types/qrcode`
2. Gerar QR Code com URL: `https://aprfix.com/verify/{aprId}/{hash}`
3. Adicionar campo `signatures` na tabela `aprs`
4. Capturar assinatura digital ao aprovar (nome + timestamp)
5. Incluir no PDF gerado

**Arquivos:**
- `server/aprPdf.ts` (adicionar QR code e assinaturas)
- `drizzle/schema.ts` (adicionar campo signatures)

---

### 10. Histórico de Alterações (Audit Trail)
**Prioridade:** BAIXA | **Impacto:** Compliance | **Esforço:** 2h

**Descrição:**
Exibir timeline de alterações na página de detalhes da APR.

**Funcionalidades:**
- 📅 Linha do tempo visual
- 👤 Quem fez cada alteração
- 🕐 Quando foi feita
- 📝 Quais campos foram modificados
- 💬 Comentários de aprovação/rejeição

**Implementação:**
1. Query na tabela `audit_logs` filtrando por `entityId = aprId`
2. Criar componente `AuditTimeline.tsx`
3. Adicionar seção "Histórico" no AprDetail.tsx
4. Ícones diferentes para cada tipo de ação

**Arquivos:**
- `server/routers.ts` (procedure getAuditLogs)
- `client/src/components/AuditTimeline.tsx` (novo)
- `client/src/pages/AprDetail.tsx`

---

### 11. Modo Offline (PWA)
**Prioridade:** BAIXA | **Impacto:** Mobile UX | **Esforço:** 6h

**Funcionalidades:**
- 📱 Instalar como app no celular
- 🔌 Criar APRs offline
- 📷 Tirar fotos diretamente do celular
- 🔄 Sincronizar quando voltar online

**Implementação:**
1. Adicionar service worker com Vite PWA plugin
2. Configurar cache de assets estáticos
3. Usar IndexedDB para armazenar APRs offline
4. Sincronização automática ao reconectar

**Arquivos:**
- `vite.config.ts` (adicionar plugin PWA)
- `client/src/sw.ts` (service worker)
- `client/public/manifest.json`

---

### 12. Convite de Usuários por Email
**Prioridade:** BAIXA | **Impacto:** Onboarding | **Esforço:** 4h

**Descrição:**
Admin pode convidar usuários por email em vez de cadastrar manualmente.

**Funcionalidades:**
- ✉️ Enviar convite por email
- 🔗 Link de ativação com token único
- ⏱️ Convite expira em 7 dias
- 🎭 Definir perfil (requester, safety_tech) no convite

**Implementação:**
1. Criar tabela `user_invitations`
2. Procedure `sendInvitation` gera token e envia email
3. Página `/accept-invite/{token}` para aceitar convite
4. Usuário define senha ao aceitar

**Arquivos:**
- `drizzle/schema.ts` (tabela user_invitations)
- `server/routers.ts` (procedures de convite)
- `client/src/pages/AcceptInvite.tsx` (novo)

---

### 13. Customização por Empresa
**Prioridade:** BAIXA | **Impacto:** Branding | **Esforço:** 3h

**Funcionalidades:**
- 🎨 Logo personalizado da empresa
- 🌈 Cores do tema (primary, secondary)
- 📄 Cabeçalho/rodapé customizado no PDF
- 🏢 Nome da empresa no topo do sistema

**Implementação:**
1. Adicionar campos na tabela `companies`:
   - `logoUrl`, `primaryColor`, `secondaryColor`
2. Carregar configurações ao fazer login
3. Aplicar tema dinamicamente com CSS variables
4. Usar logo no PDF e header

**Arquivos:**
- `drizzle/schema.ts` (campos em companies)
- `server/routers.ts` (procedure getCompanySettings)
- `client/src/App.tsx` (aplicar tema)

---

### 14. Exportar APRs para Excel
**Prioridade:** BAIXA | **Impacto:** Relatórios | **Esforço:** 2h

**Funcionalidades:**
- 📊 Exportar lista de APRs filtrada para Excel
- 📋 Incluir todas as colunas (ID, título, status, criador, data)
- 📈 Planilha formatada com cabeçalhos

**Implementação:**
1. Instalar `xlsx`: `pnpm add xlsx`
2. Botão "Exportar para Excel" no AprList.tsx
3. Gerar arquivo .xlsx no frontend
4. Download automático

**Arquivos:**
- `client/src/pages/AprList.tsx`

---

### 15. Comentários e Discussões na APR
**Prioridade:** BAIXA | **Impacto:** Colaboração | **Esforço:** 4h

**Funcionalidades:**
- 💬 Adicionar comentários na APR
- 🔔 Notificar participantes de novos comentários
- 📎 Anexar arquivos aos comentários
- 👥 Mencionar usuários (@usuario)

**Implementação:**
1. Criar tabela `apr_comments`
2. Procedures para criar/listar comentários
3. Componente de comentários no AprDetail.tsx
4. WebSocket para notificações em tempo real (opcional)

**Arquivos:**
- `drizzle/schema.ts` (tabela apr_comments)
- `server/routers.ts` (procedures de comentários)
- `client/src/components/AprComments.tsx` (novo)

---

## 🔧 TÉCNICO - Melhorias de Código

### 16. Testes Automatizados
**Prioridade:** MÉDIA | **Impacto:** Qualidade | **Esforço:** 8h

**Cobertura:**
- ✅ Testes unitários para procedures tRPC
- ✅ Testes de integração para fluxo completo de APR
- ✅ Testes E2E com Playwright

**Implementação:**
1. Configurar Vitest para backend
2. Criar testes para cada procedure
3. Mock de banco de dados com SQLite in-memory
4. Testes E2E para fluxos críticos

**Arquivos:**
- `server/**/*.test.ts` (testes unitários)
- `tests/e2e/**/*.spec.ts` (testes E2E)

---

### 17. Documentação da API
**Prioridade:** BAIXA | **Impacto:** Developer Experience | **Esforço:** 4h

**Conteúdo:**
- 📖 Documentar todos os procedures tRPC
- 📝 Exemplos de uso
- 🔐 Documentar permissões necessárias
- 📊 Schemas de entrada/saída

**Implementação:**
1. Gerar documentação automática com tRPC OpenAPI
2. Criar página `/docs` com Swagger UI
3. Adicionar JSDoc em todos os procedures

**Arquivos:**
- `server/routers.ts` (adicionar JSDoc)
- `docs/api.md` (documentação manual)

---

### 18. Otimização de Performance
**Prioridade:** BAIXA | **Impacto:** Performance | **Esforço:** 6h

**Melhorias:**
- 🚀 Lazy loading de componentes pesados
- 💾 Cache de queries com React Query
- 🖼️ Otimização de imagens (WebP, lazy load)
- 📦 Code splitting por rota

**Implementação:**
1. Usar `React.lazy()` para rotas
2. Configurar `staleTime` e `cacheTime` no tRPC
3. Converter imagens para WebP no upload
4. Adicionar `loading="lazy"` em imagens

**Arquivos:**
- `client/src/App.tsx` (lazy loading)
- `client/src/lib/trpc.ts` (cache config)

---

## 📊 Resumo de Prioridades

| Prioridade | Quantidade | Esforço Total |
|-----------|-----------|---------------|
| 🔴 CRÍTICO | 3 tarefas | ~3h |
| 🟡 IMPORTANTE | 5 tarefas | ~17h |
| 🟢 DESEJÁVEL | 7 tarefas | ~28h |
| 🔧 TÉCNICO | 3 tarefas | ~18h |
| **TOTAL** | **18 tarefas** | **~66h** |

---

## 🎯 Roadmap Sugerido

### Sprint 1 (1 semana) - Correções Críticas
1. ✅ Corrigir erros TypeScript no EditApr.tsx
2. ✅ Exibir respostas do questionário na página de detalhes
3. ✅ Corrigir erro de análise de IA

### Sprint 2 (2 semanas) - Funcionalidades Core
4. ✅ Notificações automáticas por email
5. ✅ Análise de riscos com IA (Matriz P×S=NR)
6. ✅ Botão "Aprimorar com IA" no NewApr.tsx

### Sprint 3 (2 semanas) - UX e Filtros
7. ✅ Filtros avançados na lista de APRs
8. ✅ Estatísticas avançadas no dashboard
9. ✅ QR Code e assinaturas digitais no PDF

### Sprint 4 (1 semana) - Melhorias Secundárias
10. ✅ Histórico de alterações (Audit Trail)
11. ✅ Exportar APRs para Excel

### Backlog - Futuro
- Modo offline (PWA)
- Convite de usuários por email
- Customização por empresa
- Comentários e discussões
- Testes automatizados
- Documentação da API
- Otimização de performance

---

## 📝 Notas Finais

Este roadmap é uma sugestão baseada nas funcionalidades já implementadas e nas necessidades típicas de um sistema de APR. Priorize as tarefas de acordo com:

1. **Feedback dos usuários** - O que eles mais pedem?
2. **Compliance regulatório** - O que é obrigatório por lei?
3. **ROI** - Qual funcionalidade traz mais valor com menos esforço?

**Próximos Passos Imediatos:**
1. Corrigir erros TypeScript (15min)
2. Exibir respostas do questionário (2h)
3. Implementar notificações por email (3h)
