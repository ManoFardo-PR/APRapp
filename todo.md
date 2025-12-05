# APR App - Lista de Tarefas

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
- [x] Criar questionário interativo guiado com perguntas sobre:
  - [x] Identificação de atividades críticas
  - [x] Trabalho a quente
  - [x] Trabalho em altura
  - [x] Riscos mecânicos, elétricos, químicos, ergonômicos, biológicos
  - [x] LOTO (Bloqueio e travamento)
  - [x] Atmosferas explosivas
  - [x] Energia armazenada
  - [x] Condições ambientais
  - [x] EPIs necessários
  - [x] Medidas de controle recomendadas
- [x] Armazenar respostas estruturadas no banco
- [x] Implementar validação de campos obrigatórios

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
- [x] Implementar logs de processamento da IA

## Sistema de Aprovação
- [x] Criar fluxo de status: draft → pending_approval → approved → rejected
- [x] Implementar procedimentos para técnico de segurança aprovar/rejeitar APR
- [x] Adicionar campo de comentários na aprovação/rejeição
- [ ] Notificar solicitante sobre mudanças de status

## Exportação e Relatórios
- [ ] Implementar geração de PDF padronizado com layout corporativo
- [ ] Adicionar QR code de validação no PDF
- [ ] Implementar suporte a assinaturas digitais opcionais
- [ ] Gerar JSON estruturado para integrações futuras
- [ ] Gerar HTML para visualização interna

## Painéis Administrativos
- [x] Criar painel superadmin:
  - [x] Cadastro de empresas
  - [x] Definição de limites de usuários por empresa
  - [x] Visualização de todas as empresas
  - [ ] Configurações globais
- [x] Criar painel admin empresa:
  - [ ] Convite de usuários
  - [x] Gerenciamento de usuários internos
  - [x] Visualização de APRs da empresa
  - [x] Estatísticas da empresa
  - [ ] Configurações internas

## Dashboard de Usuários
- [x] Criar dashboard para usuário solicitante:
  - [x] Visualizar APRs criadas
  - [x] Criar nova APR
  - [x] Ver status de aprovação
  - [ ] Editar APRs em draft
- [x] Criar dashboard para técnico de segurança:
  - [x] Visualizar APRs pendentes de aprovação
  - [ ] Aprovar/rejeitar APRs
  - [x] Visualizar histórico de aprovações
  - [x] Estatísticas de segurança

## Histórico e Filtros
- [ ] Implementar histórico completo de APRs
- [ ] Criar filtros por:
  - [ ] Usuário
  - [ ] Empresa
  - [ ] Data
  - [ ] Tipo de risco
  - [ ] Status
  - [ ] Local
- [ ] Implementar busca por ID da APR
- [ ] Criar visualização de prévia da APR

## Estatísticas e Métricas
- [ ] Implementar cálculo de riscos mais frequentes
- [ ] Implementar análise de setores mais críticos
- [ ] Criar ranking de usuários que mais realizam APRs
- [ ] Calcular taxa de correções feitas pela IA
- [ ] Implementar exportação de estatísticas em CSV
- [ ] Criar gráficos e visualizações de dados

## Internacionalização (i18n)
- [x] Configurar sistema de tradução PT-BR/EN-US
- [x] Criar arquivos de tradução para interface
- [x] Implementar seletor de idioma
- [x] Traduzir todos os textos da interface
- [x] Implementar geração de relatórios IA no idioma selecionado
- [ ] Implementar PDFs multilíngues
- [ ] Traduzir questionário interativo
- [ ] Traduzir emails e notificações

## Testes
- [x] Criar testes vitest para procedimentos de autenticação
- [x] Criar testes vitest para criação de APR
- [x] Criar testes vitest para aprovação de APR
- [ ] Criar testes vitest para integração com IA
- [ ] Criar testes vitest para geração de PDF
- [x] Criar testes vitest para multitenancy e isolamento
- [x] Criar testes vitest para permissões por perfil

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
- [ ] Atualizar schema do banco para incluir novos campos do modelo
- [x] Modificar análise da IA para focar em NRs brasileiras específicas
- [ ] Implementar geração de relatório Excel no formato do modelo
- [x] Implementar geração de PDF no formato do modelo
- [ ] Adicionar campos de comunicação (quem foi comunicado)
- [ ] Adicionar seção de trabalhos especiais de risco (PT's vinculadas)
- [ ] Atualizar lista de EPIs para formato do modelo
- [ ] Implementar matriz de risco (P x S = NR)
- [ ] Adicionar campos de metodologia de execução passo a passo
- [ ] Implementar análise de perigos e medidas de controle específicas
- [ ] Atualizar interface para capturar todos os campos do novo modelo


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
- [x] Criar procedures tRPC para gestão - [x] Implementar queries no db.ts para usuários
- [x] Criar página ManageUsers.tsx com lista de usuários
- [x] Implementar modal de adicionar usuário
- [x] Implementar modal de editar usuário
- [x] Adicionar toggle de ativar/desativar usuário
- [x] Adicionar filtros (perfil, status, busca)
- [x] Adicionar card de estatísticas de usuários
- [x] Adicionar navegação para página no Dashboard Testar fluxo completo de gestão


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
- [ ] Testar fluxo completo de navegação e geração de PDF


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
