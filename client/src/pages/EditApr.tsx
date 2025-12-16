import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Download, Home, Sparkles, Plus, Trash2, Users, Wrench, Phone } from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
  role: string;
}

export default function EditApr() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/aprs/:id/edit");
  const aprId = params?.id ? parseInt(params.id) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocationField] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([""]);
  const [tools, setTools] = useState<string[]>([""]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([{ name: "", phone: "", role: "" }]);

  const { data: apr, isLoading } = trpc.aprs.getById.useQuery(
    { id: aprId! },
    { enabled: !!aprId && !!user }
  );

  useEffect(() => {
    if (apr) {
      setTitle(apr.apr.title);
      setDescription(apr.apr.description);
      setLocationField(apr.apr.location || "");
      setActivityDescription(apr.apr.activityDescription);
      const tm = apr.apr.teamMembers as string[] | null;
      setTeamMembers(tm && tm.length > 0 ? tm : [""]);
      const tl = apr.apr.tools as string[] | null;
      setTools(tl && tl.length > 0 ? tl : [""]);
      const ec = apr.apr.emergencyContacts as EmergencyContact[] | null;
      setEmergencyContacts(ec && ec.length > 0 ? ec : [{ name: "", phone: "", role: "" }]);
    }
  }, [apr]);

  const updateMutation = trpc.aprs.update.useMutation({
    onSuccess: () => {
      toast.success("APR atualizada com sucesso");
      setLocation(`/aprs/${aprId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar APR");
    },
  });

  const enhanceDescriptionMutation = trpc.aprs.enhanceDescription.useMutation({
    onSuccess: (result) => {
      setActivityDescription(result.enhancedDescription);
      setIsEnhancing(false);
      toast.success("Descrição aprimorada com IA");
    },
    onError: (error) => {
      setIsEnhancing(false);
      toast.error(error.message || "Erro ao aprimorar descrição");
    },
  });

  const generatePDFMutation = trpc.aprs.generatePdfReport.useMutation({
    onSuccess: (result) => {
      const byteCharacters = atob(result.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `APR-${aprId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar PDF");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!aprId) {
      toast.error("ID da APR inválido");
      return;
    }

    updateMutation.mutate({
      id: aprId,
      title,
      description,
      location,
      activityDescription,
      teamMembers: teamMembers.filter(m => m.trim() !== ""),
      tools: tools.filter(t => t.trim() !== ""),
      emergencyContacts: emergencyContacts.filter(c => c.name.trim() !== ""),
    });
  };

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

  if (!apr) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>APR não encontrada</CardTitle>
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

  // Check if user is the creator and APR is in draft status
  if (apr.apr.createdBy !== user.id) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Apenas o criador pode editar esta APR.
            </p>
            <Button onClick={() => setLocation(`/aprs/${aprId}`)}>
              Voltar para Detalhes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apr.apr.status !== "draft" && apr.apr.status !== "rejected") {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edição Não Permitida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Apenas APRs em rascunho ou rejeitadas podem ser editadas.
            </p>
            <Button onClick={() => setLocation(`/aprs/${aprId}`)}>
              Voltar para Detalhes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar APR</h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações da Análise Preliminar de Risco
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generatePDFMutation.mutate({ id: aprId! })}
            disabled={generatePDFMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {generatePDFMutation.isPending ? "Gerando..." : "Gerar PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => setLocation(`/aprs/${aprId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Manutenção em linha de produção"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo e contexto da APR"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocationField(e.target.value)}
                placeholder="Ex: Setor de Produção, Linha 3"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="activityDescription">Descrição da Atividade *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!activityDescription.trim()) {
                      toast.error("Digite uma descrição antes de aprimorar");
                      return;
                    }
                    setIsEnhancing(true);
                    enhanceDescriptionMutation.mutate({
                      activityDescription,
                      images: apr?.images?.map(img => ({ imageUrl: img.imageUrl })) || [],
                    });
                  }}
                  disabled={isEnhancing || !activityDescription.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isEnhancing ? "Aprimorando..." : "Aprimorar com IA"}
                </Button>
              </div>
              <Textarea
                id="activityDescription"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Descreva detalhadamente a atividade a ser realizada"
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dica: Clique em "Aprimorar com IA" para complementar a descrição com análise das imagens
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={member}
                  onChange={(e) => {
                    const updated = [...teamMembers];
                    updated[index] = e.target.value;
                    setTeamMembers(updated);
                  }}
                  placeholder="Nome do colaborador"
                />
                {teamMembers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setTeamMembers([...teamMembers, ""])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </CardContent>
        </Card>

        {/* Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ferramentas e Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tools.map((tool, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={tool}
                  onChange={(e) => {
                    const updated = [...tools];
                    updated[index] = e.target.value;
                    setTools(updated);
                  }}
                  placeholder="Nome da ferramenta ou equipamento"
                />
                {tools.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setTools(tools.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setTools([...tools, ""])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ferramenta
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contatos de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      updated[index] = { ...contact, name: e.target.value };
                      setEmergencyContacts(updated);
                    }}
                    placeholder="Nome"
                  />
                  <Input
                    value={contact.phone}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      updated[index] = { ...contact, phone: e.target.value };
                      setEmergencyContacts(updated);
                    }}
                    placeholder="Telefone"
                  />
                  <Input
                    value={contact.role}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      updated[index] = { ...contact, role: e.target.value };
                      setEmergencyContacts(updated);
                    }}
                    placeholder="Cargo (opcional)"
                  />
                </div>
                {emergencyContacts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmergencyContacts([...emergencyContacts, { name: "", phone: "", role: "" }])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setLocation(`/aprs/${aprId}`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
