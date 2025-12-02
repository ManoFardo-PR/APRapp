import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Shield, Building2, Users, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";

export default function LandingCompany() {
  const [, params] = useRoute("/empresa/:code");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const companyCode = params?.code?.toUpperCase() || "";

  // Query company by code
  const { data: company, isLoading, error } = trpc.companies.getByCode.useQuery(
    { code: companyCode },
    { enabled: !!companyCode }
  );

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      setLocation("/dashboard");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md text-center p-8">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <Building2 className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Empresa Não Encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            O código <strong>{companyCode}</strong> não corresponde a nenhuma empresa cadastrada no sistema.
          </p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar à Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  if (!company.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md text-center p-8">
          <div className="inline-block p-4 bg-gray-200 rounded-full mb-6">
            <Building2 className="h-12 w-12 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Empresa Inativa
          </h1>
          <p className="text-gray-600 mb-6">
            A empresa <strong>{company.name}</strong> está temporariamente inativa. 
            Entre em contato com o administrador do sistema.
          </p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar à Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container py-6 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">APRFix</h1>
            <p className="text-sm text-gray-600">{company.name}</p>
          </div>
        </div>
        
        <Button onClick={() => setLocation("/")} variant="ghost" size="sm">
          Voltar
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
            <Building2 className="h-16 w-16 text-primary" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Sistema APR
          </h2>
          
          <p className="text-xl text-gray-600 mb-2">
            {company.name}
          </p>
          
          <p className="text-sm text-gray-500 mb-12">
            Código: <span className="font-mono font-semibold">{company.code}</span>
          </p>

          {/* Login CTA */}
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Acesse sua Conta
            </h3>
            
            <p className="text-gray-600 mb-8">
              Faça login para acessar o sistema de Análise Preliminar de Riscos
            </p>

            <a href={getLoginUrl()}>
              <Button className="w-full h-14 text-lg" size="lg">
                Fazer Login
              </Button>
            </a>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Perfis disponíveis:
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-900">Admin</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-900">Técnico</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-900">Usuário</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Company */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            O que você pode fazer no sistema
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Criar APRs</h4>
                  <p className="text-sm text-gray-600">
                    Crie Análises Preliminares de Risco com análise automática por IA
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Aprovar APRs</h4>
                  <p className="text-sm text-gray-600">
                    Técnicos de segurança podem revisar e aprovar análises
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gerenciar Equipe</h4>
                  <p className="text-sm text-gray-600">
                    Administradores podem convidar e gerenciar usuários
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gerar Relatórios</h4>
                  <p className="text-sm text-gray-600">
                    Exporte APRs em PDF e Excel conforme padrões brasileiros
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t border-gray-200 mt-12">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sistema APRFix - {company.name}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © 2024 APRFix. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
