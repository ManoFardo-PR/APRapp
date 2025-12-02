import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Shield, FileText, Brain, Users, BarChart3, Globe } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (user) {
    return <Link href="/dashboard"><a /></Link>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">APR System</span>
        </div>
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">🇧🇷 Português</SelectItem>
              <SelectItem value="en-US">🇺🇸 English</SelectItem>
            </SelectContent>
          </Select>
          <a href={getLoginUrl()}>
            <Button>{t("auth.login")}</Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          {language === "pt-BR" 
            ? "Análise Preliminar de Riscos com Inteligência Artificial"
            : "Preliminary Risk Analysis with Artificial Intelligence"}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          {language === "pt-BR"
            ? "Plataforma completa para gestão de APRs com análise automatizada por IA, gestão multiempresa e conformidade com normas regulamentadoras."
            : "Complete platform for PRA management with AI-powered automated analysis, multi-company management, and regulatory compliance."}
        </p>
        <div className="flex gap-4 justify-center">
          <a href={getLoginUrl()}>
            <Button size="lg">
              {language === "pt-BR" ? "Começar Agora" : "Get Started"}
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {language === "pt-BR" ? "Recursos Principais" : "Key Features"}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "pt-BR" ? "Criação Guiada de APR" : "Guided PRA Creation"}
            </h3>
            <p className="text-muted-foreground">
              {language === "pt-BR"
                ? "Questionário interativo completo cobrindo todos os tipos de riscos: mecânicos, elétricos, químicos, ergonômicos e biológicos."
                : "Complete interactive questionnaire covering all risk types: mechanical, electrical, chemical, ergonomic, and biological."}
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <Brain className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "pt-BR" ? "Análise com IA" : "AI Analysis"}
            </h3>
            <p className="text-muted-foreground">
              {language === "pt-BR"
                ? "Inteligência artificial analisa fotos, descrições e respostas para gerar relatórios completos de APR automaticamente."
                : "Artificial intelligence analyzes photos, descriptions, and responses to automatically generate complete PRA reports."}
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "pt-BR" ? "Gestão Multiempresa" : "Multi-Company Management"}
            </h3>
            <p className="text-muted-foreground">
              {language === "pt-BR"
                ? "Isolamento total de dados entre empresas com 4 perfis de usuário: superadmin, admin, solicitante e técnico de segurança."
                : "Complete data isolation between companies with 4 user profiles: superadmin, admin, requester, and safety technician."}
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "pt-BR" ? "Estatísticas e Relatórios" : "Statistics and Reports"}
            </h3>
            <p className="text-muted-foreground">
              {language === "pt-BR"
                ? "Dashboards completos com estatísticas de riscos, histórico de APRs e exportação em PDF padronizado."
                : "Complete dashboards with risk statistics, PRA history, and standardized PDF export."}
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "pt-BR" ? "Fluxo de Aprovação" : "Approval Workflow"}
            </h3>
            <p className="text-muted-foreground">
              {language === "pt-BR"
                ? "Sistema completo de aprovação com técnico de segurança, comentários e rastreabilidade de todas as ações."
                : "Complete approval system with safety technician, comments, and full action traceability."}
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <Globe className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "pt-BR" ? "Multilíngue" : "Multilingual"}
            </h3>
            <p className="text-muted-foreground">
              {language === "pt-BR"
                ? "Interface, relatórios e análise de IA disponíveis em Português (BR) e Inglês (US)."
                : "Interface, reports, and AI analysis available in Portuguese (BR) and English (US)."}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <div className="max-w-2xl mx-auto p-12 bg-primary/5 rounded-2xl border-2 border-primary/20">
          <h2 className="text-3xl font-bold mb-4">
            {language === "pt-BR" 
              ? "Pronto para começar?"
              : "Ready to get started?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === "pt-BR"
              ? "Faça login agora e comece a criar APRs com análise inteligente."
              : "Log in now and start creating PRAs with intelligent analysis."}
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg">
              {t("auth.login")}
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t">
        <p className="text-center text-muted-foreground">
          © 2024 APR System. {language === "pt-BR" ? "Todos os direitos reservados." : "All rights reserved."}
        </p>
      </footer>
    </div>
  );
}
