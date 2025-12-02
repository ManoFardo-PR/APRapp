import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, useRoute } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  MapPin,
  User,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AprDetail() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/aprs/:id");
  const aprId = params?.id ? parseInt(params.id) : null;

  const [reviewComments, setReviewComments] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const { data, isLoading, refetch } = trpc.aprs.getById.useQuery(
    { id: aprId! },
    { enabled: !!aprId && !!user }
  );

  const reviewMutation = trpc.aprs.reviewApr.useMutation({
    onSuccess: () => {
      toast.success("APR revisada com sucesso");
      setIsReviewing(false);
      setReviewComments("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao revisar APR");
    },
  });

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("auth.not_logged_in")}</p>
      </div>
    );
  }

  if (!aprId) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>APR Inválida</CardTitle>
            <CardDescription>ID da APR não fornecido</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/aprs")}>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Carregando APR...</p>
      </div>
    );
  }

  if (!data || !data.apr) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>APR Não Encontrada</CardTitle>
            <CardDescription>A APR solicitada não existe ou você não tem permissão para visualizá-la</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/aprs")}>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { apr, images, responses, signatures } = data;

  const canReview = 
    apr.status === "pending_approval" && 
    (user.role === "safety_tech" || user.role === "company_admin" || user.role === "superadmin");

  const handleReview = (approved: boolean) => {
    reviewMutation.mutate({
      id: aprId,
      approved,
      comments: reviewComments || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "pending_approval":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/aprs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{apr.title}</h1>
              <p className="text-sm text-muted-foreground">
                Detalhes da Análise Preliminar de Risco
              </p>
            </div>
          </div>
          <div>
            {getStatusBadge(apr.status)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Criado por</p>
                  <p className="text-sm text-muted-foreground">ID: {apr.createdBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Data de Criação</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(apr.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {apr.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Localização</p>
                    <p className="text-sm text-muted-foreground">{apr.location}</p>
                  </div>
                </div>
              )}

              {apr.approvedBy && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Aprovado por</p>
                    <p className="text-sm text-muted-foreground">ID: {apr.approvedBy}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Descrição</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {apr.description}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Descrição da Atividade</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {apr.activityDescription}
              </p>
            </div>

            {apr.approvalComments && (
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm font-medium mb-2">Comentários da Revisão</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {apr.approvalComments}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        {images && images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Imagens ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {images.map((img) => (
                  <div key={img.id} className="space-y-2">
                    <img
                      src={img.imageUrl}
                      alt={img.caption || "Imagem da APR"}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    {img.caption && (
                      <p className="text-sm text-muted-foreground">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questionnaire Responses */}
        {responses && responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Respostas do Questionário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border-b pb-4 last:border-0">
                    <p className="text-sm font-medium mb-2">{response.questionText}</p>
                    <p className="text-sm text-muted-foreground">{response.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Section (for authorized users) */}
        {canReview && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Revisar APR
              </CardTitle>
              <CardDescription>
                Esta APR está aguardando aprovação. Revise as informações e tome uma decisão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Comentários (opcional)
                </label>
                <Textarea
                  placeholder="Adicione comentários sobre sua decisão..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleReview(true)}
                  disabled={reviewMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReview(false)}
                  disabled={reviewMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeitar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
