import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Building2, 
  TrendingUp,
  ArrowLeft,
  BarChart3
} from "lucide-react";

export default function Statistics() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = trpc.aprs.getStats.useQuery(
    undefined,
    { enabled: !!user && user.role !== "superadmin" }
  );

  const { data: userStats } = trpc.users.stats.useQuery(
    undefined,
    { enabled: !!user && (user.role === "company_admin" || user.role === "superadmin") }
  );

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("auth.not_logged_in")}</p>
      </div>
    );
  }

  if (user.role === "superadmin") {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Superadmins devem acessar o dashboard administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/admin/dashboard")}>
              Ir para Dashboard Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === "company_admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Estatísticas</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do desempenho e métricas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* APR Statistics */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Análises Preliminares de Risco</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando estatísticas...</p>
            </div>
          ) : stats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de APRs
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Todas as análises criadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pendentes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pending || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aguardando aprovação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aprovadas
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.approved || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análises aprovadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rejeitadas
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.rejected || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análises rejeitadas
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma estatística disponível
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Statistics (Admin only) */}
        {isAdmin && userStats && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Gestão de Usuários</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Usuários Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    De {userStats.userLimit || 0} disponíveis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Usuários
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Incluindo inativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Uso do Limite
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.percentageUsed || 0}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Capacidade utilizada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Vagas Disponíveis
                  </CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {(userStats.userLimit || 0) - (userStats.activeUsers || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usuários que podem ser adicionados
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {stats && stats.total > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Métricas de Desempenho</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Aprovação</CardTitle>
                  <CardDescription>
                    Percentual de APRs aprovadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">
                    {stats.total > 0 
                      ? Math.round(((stats.approved || 0) / stats.total) * 100) 
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.approved || 0} de {stats.total} APRs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Rejeição</CardTitle>
                  <CardDescription>
                    Percentual de APRs rejeitadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600">
                    {stats.total > 0 
                      ? Math.round(((stats.rejected || 0) / stats.total) * 100) 
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.rejected || 0} de {stats.total} APRs
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Navegue para outras áreas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/aprs/new")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Nova APR
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/aprs")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Ver APRs
              </Button>

              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation("/company/users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
