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
  Image as ImageIcon,
  Edit,
  Trash2,
  Send,
  Sparkles,
  AlertTriangle,
  Shield
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  const submitForApprovalMutation = trpc.aprs.submitForApproval.useMutation({
    onSuccess: () => {
      toast.success("APR enviada para aprova\u00e7\u00e3o");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar APR");
    },
  });

  const deleteMutation = trpc.aprs.delete.useMutation({
    onSuccess: () => {
      toast.success("APR exclu\u00edda com sucesso");
      setLocation("/aprs");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir APR");
    },
  });

  const analyzeWithAIMutation = trpc.aprs.analyzeWithAI.useMutation({
    onSuccess: () => {
      toast.success("An\u00e1lise por IA conclu\u00edda com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao analisar APR com IA");
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
          <div className="flex items-center gap-2">
            {getStatusBadge(apr.status)}
            
            {/* AI Analysis button - available for all users */}
            {!apr.aiAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => analyzeWithAIMutation.mutate({ id: aprId })}
                disabled={analyzeWithAIMutation.isPending}
                className="border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {analyzeWithAIMutation.isPending ? "Analisando..." : "Analisar com IA"}
              </Button>
            )}
            
            {/* Action buttons for creator */}
            {apr.createdBy === user.id && apr.status === "draft" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/aprs/${aprId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => submitForApprovalMutation.mutate({ id: aprId })}
                  disabled={submitForApprovalMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitForApprovalMutation.isPending ? "Enviando..." : "Enviar para Aprova\u00e7\u00e3o"}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclus\u00e3o</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta APR? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate({ id: aprId })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
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

        {/* AI Analysis Results */}
        {apr.aiAnalysis && (
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Análise por Inteligência Artificial
              </CardTitle>
              <CardDescription>
                Análise automática de riscos baseada nas informações e imagens fornecidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              {apr.aiAnalysis.summary && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resumo Executivo
                  </h3>
                  <p className="text-sm text-muted-foreground">{apr.aiAnalysis.summary}</p>
                </div>
              )}

              {/* Risks */}
              {apr.aiAnalysis.risks && apr.aiAnalysis.risks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Riscos Identificados ({apr.aiAnalysis.risks.length})
                  </h3>
                  <div className="space-y-3">
                    {apr.aiAnalysis.risks.map((risk: any, index: number) => (
                      <Card key={index} className="bg-white">
                        <CardContent className="p-4">
                          <div className="grid gap-3">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Tarefa</span>
                              <p className="text-sm font-medium">{risk.task}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Perigo</span>
                              <p className="text-sm">{risk.hazard}</p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">P</span>
                                <p className="text-lg font-bold">{risk.probability}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">S</span>
                                <p className="text-lg font-bold">{risk.severity}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">NR</span>
                                <p className="text-lg font-bold">{risk.riskLevel}</p>
                              </div>
                              <div>
                                <Badge 
                                  variant={risk.riskLevel <= 2 ? "default" : risk.riskLevel <= 4 ? "secondary" : risk.riskLevel <= 9 ? "destructive" : "destructive"}
                                  className="mt-1"
                                >
                                  {risk.riskCategory}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Medidas de Controle</span>
                              <p className="text-sm">{risk.controlMeasures}</p>
                            </div>
                            {risk.applicableNRs && risk.applicableNRs.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {risk.applicableNRs.map((nr: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {nr}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Work Permits */}
              {apr.aiAnalysis.specialWorkPermits && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Trabalhos Especiais
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {apr.aiAnalysis.specialWorkPermits.nr10_electrical && (
                      <Badge className="bg-yellow-500">NR-10 Energia Elétrica</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.nr35_height && (
                      <Badge className="bg-orange-500">NR-35 Trabalho em Altura</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.nr33_confined && (
                      <Badge className="bg-red-500">NR-33 Espaço Confinado</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.nr12_pressure && (
                      <Badge className="bg-purple-500">NR-12 Vasos de Pressão</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.nr18_excavation && (
                      <Badge className="bg-brown-500">NR-18 Escavação</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.nr18_hot_work && (
                      <Badge className="bg-red-600">NR-18 Trabalho a Quente</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.nr18_lifting && (
                      <Badge className="bg-blue-500">NR-18 Içamentos</Badge>
                    )}
                    {apr.aiAnalysis.specialWorkPermits.others && (
                      <Badge variant="outline">{apr.aiAnalysis.specialWorkPermits.others}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Required PPE */}
              {apr.aiAnalysis.requiredPPE && apr.aiAnalysis.requiredPPE.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">EPIs Obrigatórios (NR-6)</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {apr.aiAnalysis.requiredPPE.map((ppe: string, index: number) => (
                      <li key={index} className="text-sm">{ppe}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Communication Needs */}
              {apr.aiAnalysis.communicationNeeds && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">Setores a Comunicar</h3>
                  <div className="flex gap-2 flex-wrap">
                    {apr.aiAnalysis.communicationNeeds.management && <Badge variant="secondary">Gerência</Badge>}
                    {apr.aiAnalysis.communicationNeeds.supervision && <Badge variant="secondary">Supervisão</Badge>}
                    {apr.aiAnalysis.communicationNeeds.safety && <Badge variant="secondary">Segurança do Trabalho</Badge>}
                    {apr.aiAnalysis.communicationNeeds.environment && <Badge variant="secondary">Meio Ambiente</Badge>}
                    {apr.aiAnalysis.communicationNeeds.emergency_brigade && <Badge variant="secondary">Brigada de Emergência</Badge>}
                    {apr.aiAnalysis.communicationNeeds.security && <Badge variant="secondary">Segurança Patrimonial</Badge>}
                    {apr.aiAnalysis.communicationNeeds.purchasing && <Badge variant="secondary">Compras</Badge>}
                    {apr.aiAnalysis.communicationNeeds.hr && <Badge variant="secondary">RH</Badge>}
                  </div>
                </div>
              )}
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
