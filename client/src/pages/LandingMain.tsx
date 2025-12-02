import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle, FileText, Brain, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";

export default function LandingMain() {
  const [, setLocation] = useLocation();
  const [companyCode, setCompanyCode] = useState("");
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);

  const handleCompanyAccess = () => {
    if (companyCode.trim()) {
      setLocation(`/empresa/${companyCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header with discrete superadmin login */}
      <header className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-800">APRFix</h1>
            <p className="text-xs text-green-600">Análise Preliminar de Riscos</p>
          </div>
        </div>
        
        {/* Discrete superadmin login */}
        <Dialog open={showSuperAdminLogin} onOpenChange={setShowSuperAdminLogin}>
          <DialogTrigger asChild>
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Admin
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Acesso Superadministrador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Faça login com sua conta de superadministrador para gerenciar empresas e configurações globais.
              </p>
              <a href={getLoginUrl()}>
                <Button className="w-full">
                  Fazer Login
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-6">
            <Shield className="h-16 w-16 text-green-600" />
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Segurança do Trabalho
            <span className="block text-green-600 mt-2">Inteligente e Automatizada</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Plataforma completa de Análise Preliminar de Riscos com Inteligência Artificial, 
            focada nas Normas Regulamentadoras brasileiras
          </p>

          {/* Main CTA - Company Access */}
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Acesse o Sistema da sua Empresa
            </h3>
            <p className="text-gray-600 mb-6">
              Digite o código fornecido pela sua empresa
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Código da Empresa"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleCompanyAccess()}
                className="text-center text-lg font-semibold uppercase h-14"
                maxLength={20}
              />
              <Button
                onClick={handleCompanyAccess}
                disabled={!companyCode.trim()}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Acessar Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Não possui código? Entre em contato com o administrador da sua empresa
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 bg-white/50 backdrop-blur-sm rounded-3xl my-12">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Por que escolher o APRFix?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Brain className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-gray-900">IA Especializada em NRs</h4>
            <p className="text-gray-600">
              Análise automática focada nas Normas Regulamentadoras brasileiras (NR-6, NR-10, NR-35, etc.)
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <FileText className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-gray-900">Relatórios Padronizados</h4>
            <p className="text-gray-600">
              Geração automática de APRs em PDF e Excel conforme padrões brasileiros
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Users className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-gray-900">Gestão Multiempresa</h4>
            <p className="text-gray-600">
              Isolamento total de dados com perfis específicos para cada função
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Benefícios para sua Empresa
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Matriz de Risco Automática</h4>
                <p className="text-gray-600 text-sm">
                  Cálculo automático de P × S = NR com categorização por cores
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Identificação de Trabalhos Especiais</h4>
                <p className="text-gray-600 text-sm">
                  Detecta automaticamente necessidade de PTs (NR-10, NR-35, NR-33, etc.)
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Fluxo de Aprovação</h4>
                <p className="text-gray-600 text-sm">
                  Sistema completo de aprovação por técnico de segurança
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Rastreabilidade Total</h4>
                <p className="text-gray-600 text-sm">
                  Auditoria completa de todas as ações e alterações
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
              <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estatísticas e Dashboards</h4>
                <p className="text-gray-600 text-sm">
                  Visualize riscos mais frequentes e setores críticos
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Multilíngue</h4>
                <p className="text-gray-600 text-sm">
                  Interface e relatórios em Português e Inglês
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-12 border-t border-green-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-green-800">APRFix</span>
          </div>
          <p className="text-gray-600 mb-2">
            Segurança do Trabalho com Inteligência Artificial
          </p>
          <p className="text-sm text-gray-500">
            © 2024 APRFix. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
