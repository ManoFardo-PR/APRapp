# APR App - Lista de Tarefas (Auditado)

## Infraestrutura e Banco de Dados
- [x] Modelar esquema multitenancy com tabelas: companies, users, aprs, apr_images, apr_responses, audit_logs, statistics
- [x] Configurar isolamento de dados por empresa (tenant_id)
- [x] Implementar sistema de auditoria completa (quem fez o quê e quando)
- [x] Configurar armazenamento S3 para imagens das APRs

## Sistema de Autenticação e Gestão de Usuários
- [x] Estender tabela users com campos: companyId, role (superadmin/company_admin/requester/safety_tech), companyCode
- [x] Criar tabela companies com código único, nome, limites de usuários
- [x] Implementar login com código da empresa + credenciais OAuth
- [x] Criar procedimentos tRPC para gestão de empresas (superadmin)
- [x] Criar procedimentos tRPC para gestão de usuários internos (company_admin)
- [x] Implementar controle de permissões por perfil
- [x] Criar middleware de verificação de tenant isolation

## Módulo de Criação de APR
- [x] Criar interface de upload de fotos (mínimo 3, máximo configurável)
- [x] Implementar campo de descrição da atividade
- [ ] Criar questionário interativo guiado com perguntas sobre:
  - [ ] Identificação de atividades críticas
  - [ ] Trabalho a quente
  - [ ] Trabalho em altura
  - [ ] Riscos mecânicos, elétricos, químicos, ergonômicos, biológicos
  - [ ] LOTO (Bloqueio e travamento)
  - [ ] Atmosferas explosivas
  - [ ] Energia armazenada
  - [ ] Condições ambientais
  - [ ] EPIs necessários
  - [ ] Medidas de controle recomendadas
- [ ] Armazenar respostas estruturadas no banco
- [x] Implementar validação de campos obrigatórios

### Como implementar o questionário interativo:
1. **Criar componente Questionnaire.tsx** com wizard multi-etapas
2. **Definir perguntas estruturadas** em arquivo JSON ou constante TypeScript
3. **Implementar lógica condicional** (ex: se "trabalho em altura" = sim, mostrar perguntas específicas)
4. **Adicionar procedure tRPC** `aprs.saveResponses` para salvar respostas na tabela apr_responses
5. **Integrar no fluxo de criação** de APR (após informações básicas, antes de finalizar)
6. **Validar respostas obrigatórias** antes de permitir avanço
7. **Exibir resumo** das respostas antes de criar APR

## Integração com IA
- [x] Criar procedimento tRPC para análise de APR com LLM
- [x] Implementar análise de imagens pela IA
- [x] Implementar interpretação de descrição e respostas
- [x] Mapear riscos e controles em formato normativo
- [x] Gerar estrutura APR com:
  - [x] Atividade identificada
  - [x] Riscos identificados
  - [x] Consequências
  - [x] Probabilidade e severidade
  - [x] Medidas de controle existentes
  - [x] Medidas de controle recomendadas
  - [x] EPI obrigatório
  - [x] Permissões especiais necessárias
- [x] Armazenar resultado da IA em formato JSON
- [ ] Implementar logs de processamento da IA (apenas console.log existe, não há tabela de logs)

### Como implementar logs de processamento da IA:
1. **Criar tabela ai_logs** no schema.ts com campos: id, aprId, timestamp, promptTokens, completionTokens, model, status, error
2. **Adicionar função logAIProcessing** no aprAI.ts
3. **Registrar cada chamada** de IA (sucesso ou erro) na tabela
4. **Criar dashboard** de monitoramento de uso de IA (opcional)

## Sistema de Aprovação
- [x] Criar fluxo de status: draft → pending_approval → approved → rejected
- [x] Implementar procedimentos para técnico de segurança aprovar/rejeitar APR
- [x] Adicionar campo de comentários na aprovação/rejeição
- [ ] Notificar solicitante sobre mudanças de status

### Como implementar notificações:
1. **Usar sistema Manus notifyOwner** para notificar owner do projeto
2. **Criar procedure sendNotification** que envia email/notificação para usuário específico
3. **Chamar após aprovação/rejeição** no procedure reviewApr
4. **Incluir link** para visualizar APR na notificação

## Exportação e Relatórios
- [x] Implementar geração de PDF padronizado com layout corporativo (usando Puppeteer)
- [ ] Adicionar QR code de validação no PDF
- [ ] Implementar suporte a assinaturas digitais opcionais
- [ ] Gerar JSON estruturado para integrações futuras
- [ ] Gerar HTML para visualização interna

### Como implementar QR code e assinaturas:
1. **Instalar qrcode** package: `pnpm add qrcode @types/qrcode`
2. **Gerar QR code** com URL de validação da APR (ex: https://aprfix.com/validate/{aprId})
3. **Adicionar ao PDF** no rodapé do relatório
4. **Para assinaturas digitais**: adicionar campo signatures na tabela aprs
5. **Criar procedure** aprs.addSignature que registra assinatura com timestamp
6. **Exibir assinaturas** no PDF com nome, data e hash de validação

## Painéis Administrativos
- [x] Criar painel superadmin:
  - [x] Cadastro de empresas
  - [x] Definição de limites de usuários por empresa
  - [x] Visualização de todas as empresas
  - [ ] Configurações globais (ex: limites de upload, features habilitadas)
- [x] Criar painel admin empresa:
  - [ ] Convite de usuários por email
  - [x] Gerenciamento de usuários internos
  - [x] Visualização de APRs da empresa
  - [x] Estatísticas da empresa
  - [ ] Configurações internas (ex: logo da empresa, cores personalizadas)

### Como implementar convite de usuários:
1. **Criar tabela user_invitations** com: id, companyId, email, role, token, expiresAt, status
2. **Criar procedure** users.inviteUser que gera token único e envia email
3. **Criar página** /accept-invitation/:token para usuário aceitar convite
4. **Validar token** e criar usuário automaticamente ao aceitar

### Como implementar configurações internas:
1. **Adicionar campos** na tabela companies: logoUrl, primaryColor, secondaryColor, maxAprImages
2. **Criar página** CompanySettings.tsx para company_admin
3. **Permitir upload** de logo usando S3
4. **Aplicar cores** personalizadas no tema da empresa

## Dashboard de Usuários
- [x] Criar dashboard para usuário solicitante:
  - [x] Visualizar APRs criadas
  - [x] Criar nova APR
  - [x] Ver status de aprovação
  - [x] Editar APRs em draft (EditApr.tsx existe)
- [x] Criar dashboard para técnico de segurança:
  - [x] Visualizar APRs pendentes de aprovação
  - [x] Aprovar/rejeitar APRs (botões existem em AprDetail.tsx)
  - [x] Visualizar histórico de aprovações
  - [x] Estatísticas de segurança

## Histórico e Filtros
- [ ] Implementar histórico completo de APRs (existe AprList.tsx mas sem todos os filtros)
- [ ] Criar filtros por:
  - [ ] Usuário
  - [ ] Empresa
  - [ ] Data
  - [ ] Tipo de risco
  - [x] Status (já implementado via query params)
  - [ ] Local
- [ ] Implementar busca por ID da APR
- [ ] Criar visualização de prévia da APR

### Como implementar filtros completos:
1. **Atualizar procedure** aprs.list para aceitar filtros: userId, companyId, startDate, endDate, riskType, location, searchTerm
2. **Criar componente** FilterBar.tsx com inputs para cada filtro
3. **Adicionar na página** AprList.tsx
4. **Implementar busca** por ID e título usando query LIKE
5. **Adicionar paginação** (limit, offset)

## Estatísticas e Métricas
- [ ] Implementar cálculo de riscos mais frequentes
- [ ] Implementar análise de setores mais críticos
- [ ] Criar ranking de usuários que mais realizam APRs
- [ ] Calcular taxa de correções feitas pela IA
- [ ] Implementar exportação de estatísticas em CSV
- [ ] Criar gráficos e visualizações de dados

### Como implementar estatísticas avançadas:
1. **Criar procedures** no aprDb.ts:
   - `getMostFrequentRisks(companyId)` - agrupa por risco da análise IA
   - `getCriticalSectors(companyId)` - agrupa por location
   - `getUserRanking(companyId)` - conta APRs por usuário
2. **Criar página** Analytics.tsx com gráficos usando recharts ou chart.js
3. **Adicionar botão** "Exportar CSV" que gera arquivo com estatísticas
4. **Usar procedure** aprs.getStats existente como base

## Internacionalização (i18n)
- [x] Configurar sistema de tradução PT-BR/EN-US
- [x] Criar arquivos de tradução para interface
- [x] Implementar seletor de idioma
- [x] Traduzir todos os textos da interface
- [x] Implementar geração de relatórios IA no idioma selecionado
- [ ] Implementar PDFs multilíngues
- [ ] Traduzir questionário interativo (quando implementado)
- [ ] Traduzir emails e notificações

### Como implementar PDFs multilíngues:
1. **Passar language** para função generatePdfReport
2. **Usar t()** do sistema de tradução no template HTML do PDF
3. **Traduzir labels** fixos (ex: "APR", "Status", "Criado por")

## Testes
- [x] Criar testes vitest para procedimentos de autenticação
- [x] Criar testes vitest para criação de APR
- [x] Criar testes vitest para aprovação de APR
- [ ] Criar testes vitest para integração com IA
- [ ] Criar testes vitest para geração de PDF
- [x] Criar testes vitest para multitenancy e isolamento
- [x] Criar testes vitest para permissões por perfil

### Como criar testes faltantes:
1. **Teste de IA**: criar `server/aprAI.test.ts` mockando invokeLLM
2. **Teste de PDF**: criar `server/aprReport.test.ts` mockando puppeteer
3. **Rodar testes**: `pnpm test`

## Interface e UX
- [x] Definir paleta de cores profissional para ambiente corporativo
- [x] Criar layout responsivo para desktop e mobile
- [x] Implementar navegação adequada por perfil de usuário
- [x] Criar componentes reutilizáveis
- [x] Implementar estados de loading e erro
- [x] Adicionar feedback visual para ações do usuário
- [x] Implementar validação de formulários em tempo real

## Ajustes para Modelo de APR Fornecido
- [x] Analisar estrutura do modelo Excel fornecido
- [ ] Atualizar schema do banco para incluir novos campos do modelo (faltam campos específicos do Excel)
- [x] Modificar análise da IA para focar em NRs brasileiras específicas
- [ ] Implementar geração de relatório Excel no formato do modelo
- [x] Implementar geração de PDF no formato do modelo
- [ ] Adicionar campos de comunicação (quem foi comunicado)
- [ ] Adicionar seção de trabalhos especiais de risco (PT's vinculadas)
- [ ] Atualizar lista de EPIs para formato do modelo
- [ ] Implementar matriz de risco (P x S = NR) - **PARCIALMENTE IMPLEMENTADO** (IA calcula mas não há UI dedicada)
- [ ] Adicionar campos de metodologia de execução passo a passo
- [ ] Implementar análise de perigos e medidas de controle específicas
- [ ] Atualizar interface para capturar todos os campos do novo modelo

### Como implementar campos faltantes do modelo Excel:
1. **Adicionar na tabela aprs**:
   - communicatedDepartments (JSON array)
   - linkedWorkPermits (JSON array de PT IDs)
   - executionMethodology (TEXT)
2. **Criar seção** "Comunicação" no formulário de criação
3. **Criar seção** "Trabalhos Especiais" com checkboxes para PT's
4. **Criar seção** "Metodologia de Execução" com editor de passos
5. **Atualizar PDF** para incluir todas as seções

## Landing Pages
- [x] Criar landing page principal APRFix (verde segurança, chamativa)
- [x] Adicionar login discreto para superadmin no canto superior
- [x] Adicionar botão central para acessar sistema da empresa
- [x] Criar landing page personalizada por empresa (com código)
- [x] Implementar sistema de roteamento por código de empresa
- [x] Adicionar login para admin, técnico e usuários da empresa
- [x] Personalizar branding por empresa na landing page

## Correções de Autenticação
- [x] Investigar problema de redirecionamento após login
- [x] Corrigir erro 403 do Google OAuth
- [x] Verificar fluxo de callback OAuth
- [x] Testar login de superadmin

## Dashboard Superadmin
- [x] Criar dashboard específico para superadmin sem dependência de companyId
- [x] Implementar página de gestão de empresas
- [x] Adicionar formulário de criação de empresa
- [x] Listar todas as empresas cadastradas
- [x] Permitir edição de empresas (nome, limites, status)

## Correção de Erros de Render
- [x] Corrigir erro de setLocation no render do Dashboard
- [x] Usar useEffect para navegação condicional

## Correção de Hooks
- [x] Corrigir erro "Rendered fewer hooks than expected" no Dashboard
- [x] Mover todos os hooks para antes do early return

## Correções de Navegação
- [x] Corrigir botão "Ver Landing" no dashboard superadmin
- [x] Corrigir redirecionamento após logout para landing page principal

## Correção de Autenticação Landing Page
- [x] Configurar sistema de login para aceitar apenas Google
- [x] Modificar getLoginUrl para forçar provedor Google
- [x] Atualizar todas as páginas que usam login

## Gestão de Usuários para Company Admin
- [x] Remover restrição de provedor Google (permitir todos os logins)
- [x] Criar procedures tRPC para gestão
- [x] Implementar queries no db.ts para usuários
- [x] Criar página ManageUsers.tsx com lista de usuários
- [x] Implementar modal de adicionar usuário
- [x] Implementar modal de editar usuário
- [x] Adicionar toggle de ativar/desativar usuário
- [x] Adicionar filtros (perfil, status, busca)
- [x] Adicionar card de estatísticas de usuários
- [x] Adicionar navegação para página no Dashboard
- [x] Testar fluxo completo de gestão

## Configuração de Emails de Admin por Empresa
- [x] Criar tabela company_admin_emails no banco de dados
- [x] Adicionar procedures tRPC para adicionar/remover emails de admin
- [x] Atualizar SuperAdminDashboard para mostrar e gerenciar emails de admin
- [x] Implementar lógica de auto-associação no callback OAuth
- [x] Testar fluxo completo de primeiro login com email pré-configurado

## Correção de Procedure getAdminEmails
- [x] Verificar se getAdminEmails está registrado no router companies
- [x] Adicionar procedures faltantes (getAdminEmails, addAdminEmail, removeAdminEmail)
- [x] Mover procedures do router users para router companies
- [x] Testar funcionalidade completa de gestão de emails de admin

## Gestão Global de Usuários e Hierarquia de Permissões
- [x] Criar página de gestão global de usuários para superadmin
- [x] Adicionar botão no dashboard superadmin para acessar gestão global
- [x] Implementar procedure tRPC updateGlobal para edição global de usuários
- [x] Implementar hierarquia de permissões cumulativas:
  - [x] Company_admin pode criar APR, aprovar APR e gerenciar usuários
  - [x] Safety_tech pode criar APR e aprovar APR
  - [x] Requester pode apenas criar APR
- [x] Atualizar middleware de permissões para suportar hierarquia (safetyTechProcedure)
- [x] Atualizar dashboards para mostrar funcionalidades conforme hierarquia
- [x] Testar fluxo completo de permissões (26 testes passando)

## Correção de Rota /statistics
- [x] Verificar se rota /statistics está registrada no App.tsx
- [x] Criar página Statistics.tsx com visualização de estatísticas
- [x] Implementar gráficos e métricas para o dashboard de estatísticas
- [x] Testar acesso à rota /statistics

## Correção de Rotas de Visualização de APRs
- [x] Criar página AprDetail.tsx para visualização de APR individual (/aprs/:id)
- [x] Criar página PendingApprovals.tsx para lista de APRs pendentes (/aprs/pending)
- [x] Registrar rotas no App.tsx
- [x] Investigar mensagens de erro de permissão (são avisos do sistema Manus, não afetam funcionalidade)
- [x] Testar navegação completa de APRs

## Correção de ID Inválido ao Criar APR
- [x] Investigar erro que retorna NaN como ID da APR criada
- [x] Verificar procedure aprs.create no backend
- [x] Corrigir retorno do insertId no routers.ts (Drizzle retorna array)
- [x] Testar criação de APR e redirecionamento correto

## Funcionalidades de Edição, Exclusão e Envio de APR
- [x] Implementar procedure aprs.update no backend (já existia)
- [x] Implementar procedure aprs.delete no backend
- [x] Implementar procedure aprs.submitForApproval no backend (já existia)
- [x] Adicionar botão "Editar" na página AprDetail.tsx
- [x] Adicionar botão "Excluir" com confirmação na página AprDetail.tsx
- [x] Adicionar botão "Enviar para Aprovação" na página AprDetail.tsx
- [x] Criar página EditApr.tsx para edição de APR
- [x] Garantir que apenas o criador pode editar/excluir APR em status draft
- [x] Visualização de imagens (já implementada)
- [x] Testar fluxo completo de edição, exclusão e envio

## Geração de PDF e Melhorias de Navegação
- [x] Criar procedure backend para gerar PDF da APR (já existe generatePdfReport)
- [x] Adicionar botão "Gerar PDF" na página AprDetail.tsx
- [x] Adicionar botão "Gerar PDF" na página EditApr.tsx
- [ ] Adicionar botão "Gerar PDF" na página PendingApprovals.tsx (opcional)
- [x] Implementar geração de PDF com todas as informações da APR (aprReport.ts)
- [x] Incluir análise da IA no PDF (se existir)
- [x] Incluir imagens no PDF
- [x] Adicionar link "Voltar ao Dashboard" na página AprDetail.tsx
- [x] Adicionar link "Voltar ao Dashboard" em páginas principais (AprDetail, EditApr)
- [x] Configurar redirecionamento automático para /dashboard ao invés de / para company_admin logado
- [ ] Testar fluxo completo de navegação e geração de PDF (parcialmente testado)

## Correções de PDF, Números de APR e Cards Clicáveis
- [x] Investigar erro ao gerar PDF ("Falha ao carregar documento PDF")
- [x] Corrigir geração de PDF no backend (usar weasyprint para converter HTML para PDF)
- [x] Adicionar "APR #ID" em evidência no dashboard
- [x] Adicionar "APR #ID" em evidência nas listagens de APRs (Dashboard)
- [x] Adicionar "APR #ID" em evidência na página de detalhes
- [x] Tornar cards de estatísticas do dashboard clicáveis
- [x] Implementar navegação com filtro ao clicar nos cards (Total, Pendentes, Aprovadas, Rejeitadas)
- [x] Testar fluxo completo de geração de PDF e navegação por filtros (30 testes passando)

## Correção de Erro Weasyprint
- [x] Substituir weasyprint por puppeteer para geração de PDF
- [x] Instalar puppeteer no projeto
- [x] Modificar aprReport.ts para usar puppeteer ao invés de weasyprint
- [x] Testar geração de PDF (30 testes passando, servidor reiniciado com sucesso)

## Correção de Erro na Rota /empresa/:code
- [x] Verificar se rota /empresa/:code existe no App.tsx (existe, aponta para LandingCompany)
- [x] Corrigir imports faltantes no LandingMain.tsx (useState, useEffect)
- [x] Testar fluxo completo de acesso por código (servidor funcionando sem erros)

## Correção de Erro do Puppeteer (Chrome não encontrado)
- [x] Instalar Chrome para Puppeteer (chrome@143.0.7499.40)
- [x] Testar geração de PDF novamente

## Card de Rascunhos no Dashboard
- [x] Adicionar card de "Rascunhos" no dashboard
- [x] Atualizar grid do dashboard para 5 colunas (Total, Rascunhos, Pendentes, Aprovadas, Rejeitadas)
- [x] Adicionar ícone FileEdit azul para o card de Rascunhos
- [x] Adicionar tradução "stats.drafts" em pt-BR e en-US
- [x] Card clicável que navega para /aprs?status=draft
- [x] Corrigir imports duplicados no LandingMain.tsx

## Aprimoramento de Descrição por IA (ANTES de criar APR)
- [x] Remover chamada automática de IA do procedure aprs.create
- [x] Criar procedure enhanceDescription que recebe descrição + imagens e retorna descrição aprimorada
- [x] Criar função enhanceDescriptionWithAI no aprAI.ts
- [x] Adicionar botão "Aprimorar com IA" na tela de edição (EditApr.tsx)
- [ ] Adicionar botão "Aprimorar com IA" na tela de criação (NewApr.tsx)
- [x] IA complementa descrição com detalhes observados nas imagens (detail="high")
- [x] Usuário pode aceitar ou editar sugestão da IA antes de salvar
- [x] APR é criada com descrição já aprimorada pelo usuário
- [ ] Análise de riscos (P×S=NR) será feita separadamente após criação - **IMPLEMENTAR BOTÃO SEPARADO**

### Como adicionar botão "Aprimorar com IA" no NewApr.tsx:
1. **Copiar lógica** do EditApr.tsx (mutation enhanceDescription)
2. **Adicionar botão** ao lado do label "Descrição da Atividade"
3. **Validar** que há descrição antes de chamar IA
4. **Atualizar state** activityDescription com resultado

### Como implementar botão "Analisar Riscos com IA":
1. **Criar procedure** aprs.analyzeRisks que chama analyzeAprWithAI
2. **Adicionar botão** na página AprDetail.tsx
3. **Exibir resultados** em seção dedicada "Análise de Riscos"
4. **Mostrar matriz** P×S=NR em tabela
5. **Listar EPIs** e NRs aplicáveis

---

## RESUMO DE ITENS NÃO IMPLEMENTADOS (MARCADOS INCORRETAMENTE)

### ❌ Questionário Interativo (CRÍTICO)
**Status**: Tabela apr_responses existe no banco, mas não há UI de questionário
**Impacto**: Alto - funcionalidade core do sistema
**Implementar**: Criar wizard multi-etapas com perguntas estruturadas

### ❌ Notificações de Status
**Status**: Não implementado
**Impacto**: Médio - usuários não são alertados sobre mudanças
**Implementar**: Usar sistema Manus notifyOwner ou email

### ❌ QR Code e Assinaturas Digitais no PDF
**Status**: Não implementado
**Impacto**: Baixo - nice to have
**Implementar**: Adicionar qrcode package e campo signatures

### ❌ Filtros Avançados e Busca
**Status**: Apenas filtro por status implementado
**Impacto**: Médio - dificulta encontrar APRs específicas
**Implementar**: Expandir procedure aprs.list com mais filtros

### ❌ Estatísticas Avançadas
**Status**: Apenas contadores básicos implementados
**Impacto**: Baixo - analytics não estão completos
**Implementar**: Criar procedures de agregação e gráficos

### ❌ Convite de Usuários por Email
**Status**: Não implementado
**Impacto**: Médio - admin precisa cadastrar manualmente
**Implementar**: Criar tabela user_invitations e fluxo de convite

### ❌ Configurações Personalizadas por Empresa
**Status**: Não implementado
**Impacto**: Baixo - todas empresas usam mesmo tema
**Implementar**: Adicionar campos de customização na tabela companies

### ❌ Botão "Aprimorar com IA" no NewApr.tsx
**Status**: Existe apenas no EditApr.tsx
**Impacto**: Médio - usuário não pode aprimorar na criação
**Implementar**: Copiar lógica do EditApr.tsx

### ❌ Botão "Analisar Riscos com IA" Separado
**Status**: IA analisa mas não há botão dedicado
**Impacto**: Alto - análise de riscos é core do sistema
**Implementar**: Criar procedure analyzeRisks e UI dedicada

### ❌ Campos do Modelo Excel (Comunicação, PT's, Metodologia)
**Status**: Parcialmente implementado
**Impacto**: Alto - modelo completo não está capturado
**Implementar**: Adicionar campos faltantes no schema e formulário


## Botão de Logout no Dashboard
- [x] Adicionar botão de logout no DashboardLayout.tsx (já existia no dropdown menu)
- [x] Implementar redirecionamento para página inicial após logout
- [x] Adicionar ícone LogOut do lucide-react (já existia)
- [x] Testar fluxo completo de logout


## Navegação em Páginas Administrativas
- [x] Adicionar botão "Voltar ao Dashboard" na página ManageUsers.tsx
- [x] Adicionar botão "Voltar ao Dashboard" na página AprList.tsx
- [x] Verificar navegação em páginas administrativas (GlobalUserManagement, Statistics, PendingApprovals já têm)
- [x] Garantir que todas as páginas tenham escape route clara


## Revisão de APRs Rejeitadas
- [x] Permitir edição de APRs rejeitadas pelo solicitante original
- [x] Adicionar botão "Editar e Reenviar" em APRs rejeitadas na página de detalhes
- [x] Exibir alerta visual destacado de "Rejeitada" com motivo da rejeição
- [x] Permitir reenvio para aprovação após edição (botão "Reenviar para Aprovação")
- [x] Histórico de rejeições mantido no audit_logs (sistema já registra)
- [x] Fluxo completo implementado: rejeitar → editar → reenviar → aprovar


## Filtros Automáticos nos Cards do Dashboard
- [x] Modificar cards do Dashboard para navegar com query params (?status=) (já estava implementado)
- [x] AprList agora lê filtro da URL e aplica automaticamente no useState inicial
- [x] Cards clicáveis: Total (sem filtro), Rascunhos (draft), Pendentes (pending_approval), Aprovadas (approved), Rejeitadas (rejected)
- [x] useEffect sincroniza filtro quando URL muda


## Correção: Permitir Edição de APRs Rejeitadas no EditApr.tsx
- [x] Modificar validação no EditApr.tsx para aceitar status "rejected" além de "draft"
- [x] Mensagem de erro atualizada: "Apenas APRs em rascunho ou rejeitadas podem ser editadas"
- [x] Formulário agora permite edição de APRs rejeitadas
- [x] Salvamento funciona para APRs rejeitadas
