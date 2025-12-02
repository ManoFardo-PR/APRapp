import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Clock,
  FileText,
  Eye,
  AlertCircle
} from "lucide-react";

export default function PendingApprovals() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: aprs, isLoading } = trpc.aprs.list.useQuery(
    { status: "pending_approval" },
    { enabled: !!user }
  );

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("auth.not_logged_in")}</p>
      </div>
    );
  }

  // Check if user has permission to approve
  const canApprove = 
    user.role === "safety_tech" || 
    user.role === "company_admin" || 
    user.role === "superadmin";

  if (!canApprove) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para visualizar APRs pendentes de aprovação.
              Apenas técnicos de segurança e administradores podem acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/dashboard")}>
              Voltar para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">APRs Pendentes de Aprovação</h1>
              <p className="text-sm text-muted-foreground">
                Revise e aprove as análises pendentes
              </p>
            </div>
          </div>
          {aprs && (
            <Badge className="bg-yellow-500">
              {aprs.length} {aprs.length === 1 ? "pendente" : "pendentes"}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando APRs pendentes...</p>
          </div>
        ) : !aprs || aprs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma APR Pendente
              </h3>
              <p className="text-muted-foreground mb-6">
                Não há análises aguardando aprovação no momento.
              </p>
              <Button onClick={() => setLocation("/dashboard")}>
                Voltar para Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {aprs.map((apr) => (
              <Card key={apr.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {apr.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {apr.description.length > 150
                          ? `${apr.description.substring(0, 150)}...`
                          : apr.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-500 ml-4">
                      Pendente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Criado por:</span> ID {apr.createdBy}
                      </p>
                      <p>
                        <span className="font-medium">Data:</span>{" "}
                        {new Date(apr.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      {apr.location && (
                        <p>
                          <span className="font-medium">Local:</span> {apr.location}
                        </p>
                      )}
                    </div>
                    <Link href={`/aprs/${apr.id}`}>
                      <Button>
                        <Eye className="mr-2 h-4 w-4" />
                        Revisar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
