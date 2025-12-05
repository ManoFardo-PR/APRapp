import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "pt-BR" | "en-US";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  "pt-BR": {
    // Navigation
    "nav.home": "Início",
    "nav.dashboard": "Dashboard",
    "nav.aprs": "APRs",
    "nav.new_apr": "Nova APR",
    "nav.pending": "Pendentes",
    "nav.approved": "Aprovadas",
    "nav.users": "Usuários",
    "nav.companies": "Empresas",
    "nav.statistics": "Estatísticas",
    "nav.profile": "Perfil",
    "nav.logout": "Sair",

    // Common
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.view": "Visualizar",
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "common.confirm": "Confirmar",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.export": "Exportar",
    "common.submit": "Enviar",
    "common.back": "Voltar",
    "common.next": "Próximo",
    "common.previous": "Anterior",
    "common.finish": "Finalizar",

    // Auth
    "auth.login": "Entrar",
    "auth.logout": "Sair",
    "auth.welcome": "Bem-vindo",
    "auth.company_code": "Código da Empresa",
    "auth.not_logged_in": "Você não está autenticado",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Bem-vindo ao Sistema APR",
    "dashboard.my_aprs": "Minhas APRs",
    "dashboard.pending_approval": "Pendentes de Aprovação",
    "dashboard.recent_aprs": "APRs Recentes",
    "dashboard.statistics": "Estatísticas",

    // APR
    "apr.title": "Análise Preliminar de Risco",
    "apr.new": "Nova APR",
    "apr.edit": "Editar APR",
    "apr.view": "Visualizar APR",
    "apr.delete": "Excluir APR",
    "apr.status": "Status",
    "apr.created_by": "Criado por",
    "apr.created_at": "Criado em",
    "apr.approved_by": "Aprovado por",
    "apr.approved_at": "Aprovado em",
    "apr.activity_description": "Descrição da Atividade",
    "apr.location": "Local",
    "apr.images": "Imagens",
    "apr.upload_images": "Upload de Imagens",
    "apr.min_images": "Mínimo 3 imagens",
    "apr.questionnaire": "Questionário",
    "apr.ai_analysis": "Análise da IA",
    "apr.analyze": "Analisar com IA",
    "apr.submit_approval": "Enviar para Aprovação",
    "apr.approve": "Aprovar",
    "apr.reject": "Rejeitar",
    "apr.comments": "Comentários",

    // Status
    "status.draft": "Rascunho",
    "status.pending_approval": "Pendente de Aprovação",
    "status.approved": "Aprovada",
    "status.rejected": "Rejeitada",

    // Roles
    "role.superadmin": "Superadministrador",
    "role.company_admin": "Administrador da Empresa",
    "role.requester": "Solicitante",
    "role.safety_tech": "Técnico de Segurança",

    // Companies
    "company.title": "Empresas",
    "company.new": "Nova Empresa",
    "company.name": "Nome",
    "company.code": "Código",
    "company.max_users": "Máximo de Usuários",
    "company.active": "Ativa",
    "company.created_at": "Criada em",

    // Users
    "user.title": "Usuários",
    "user.name": "Nome",
    "user.email": "Email",
    "user.role": "Perfil",
    "user.language": "Idioma",
    "user.active": "Ativo",
    "user.last_signed_in": "Último acesso",

    // Statistics
    "stats.total_aprs": "Total de APRs",
    "stats.drafts": "Rascunhos",
    "stats.draft": "Rascunhos",
    "stats.pending": "Pendentes",
    "stats.approved": "Aprovadas",
    "stats.rejected": "Rejeitadas",
    "stats.top_risks": "Principais Riscos",
    "stats.risk_distribution": "Distribuição de Riscos",

    // Messages
    "msg.apr_created": "APR criada com sucesso",
    "msg.apr_updated": "APR atualizada com sucesso",
    "msg.apr_deleted": "APR excluída com sucesso",
    "msg.apr_submitted": "APR enviada para aprovação",
    "msg.apr_approved": "APR aprovada com sucesso",
    "msg.apr_rejected": "APR rejeitada",
    "msg.company_created": "Empresa criada com sucesso",
    "msg.user_updated": "Usuário atualizado com sucesso",
    "msg.analysis_complete": "Análise da IA concluída",
  },
  "en-US": {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.aprs": "PRAs",
    "nav.new_apr": "New PRA",
    "nav.pending": "Pending",
    "nav.approved": "Approved",
    "nav.users": "Users",
    "nav.companies": "Companies",
    "nav.statistics": "Statistics",
    "nav.profile": "Profile",
    "nav.logout": "Logout",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.confirm": "Confirm",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.submit": "Submit",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.finish": "Finish",

    // Auth
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.welcome": "Welcome",
    "auth.company_code": "Company Code",
    "auth.not_logged_in": "You are not authenticated",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to PRA System",
    "dashboard.my_aprs": "My PRAs",
    "dashboard.pending_approval": "Pending Approval",
    "dashboard.recent_aprs": "Recent PRAs",
    "dashboard.statistics": "Statistics",

    // APR
    "apr.title": "Preliminary Risk Analysis",
    "apr.new": "New PRA",
    "apr.edit": "Edit PRA",
    "apr.view": "View PRA",
    "apr.delete": "Delete PRA",
    "apr.status": "Status",
    "apr.created_by": "Created by",
    "apr.created_at": "Created at",
    "apr.approved_by": "Approved by",
    "apr.approved_at": "Approved at",
    "apr.activity_description": "Activity Description",
    "apr.location": "Location",
    "apr.images": "Images",
    "apr.upload_images": "Upload Images",
    "apr.min_images": "Minimum 3 images",
    "apr.questionnaire": "Questionnaire",
    "apr.ai_analysis": "AI Analysis",
    "apr.analyze": "Analyze with AI",
    "apr.submit_approval": "Submit for Approval",
    "apr.approve": "Approve",
    "apr.reject": "Reject",
    "apr.comments": "Comments",

    // Status
    "status.draft": "Draft",
    "status.pending_approval": "Pending Approval",
    "status.approved": "Approved",
    "status.rejected": "Rejected",

    // Roles
    "role.superadmin": "Super Administrator",
    "role.company_admin": "Company Administrator",
    "role.requester": "Requester",
    "role.safety_tech": "Safety Technician",

    // Companies
    "company.title": "Companies",
    "company.new": "New Company",
    "company.name": "Name",
    "company.code": "Code",
    "company.max_users": "Max Users",
    "company.active": "Active",
    "company.created_at": "Created at",

    // Users
    "user.title": "Users",
    "user.name": "Name",
    "user.email": "Email",
    "user.role": "Role",
    "user.language": "Language",
    "user.active": "Active",
    "user.last_signed_in": "Last signed in",

    // Statistics
    "stats.total_aprs": "Total PRAs",
    "stats.drafts": "Drafts",
    "stats.draft": "Drafts",
    "stats.pending": "Pending",
    "stats.approved": "Approved",
    "stats.rejected": "Rejected",
    "stats.top_risks": "Top Risks",
    "stats.risk_distribution": "Risk Distribution",

    // Messages
    "msg.apr_created": "PRA created successfully",
    "msg.apr_updated": "PRA updated successfully",
    "msg.apr_deleted": "PRA deleted successfully",
    "msg.apr_submitted": "PRA submitted for approval",
    "msg.apr_approved": "PRA approved successfully",
    "msg.apr_rejected": "PRA rejected",
    "msg.company_created": "Company created successfully",
    "msg.user_updated": "User updated successfully",
    "msg.analysis_complete": "AI analysis completed",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "pt-BR" || saved === "en-US")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
