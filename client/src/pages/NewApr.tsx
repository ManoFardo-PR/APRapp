import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, Sparkles, AlertCircle } from "lucide-react";
import AprQuestionnaire, { QuestionnaireResponse } from "@/components/AprQuestionnaire";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewApr() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocationField] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [createdAprId, setCreatedAprId] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createMutation = trpc.aprs.create.useMutation({
    onSuccess: async (data) => {
      setCreatedAprId(data.aprId);

      // Upload images if any
      if (images.length > 0) {
        // Upload images sequentially to preserve order
        for (let i = 0; i < images.length; i++) {
          await addImageMutation.mutateAsync({
            aprId: data.aprId,
            imageData: images[i],
            order: i,
          });
        }
      }

      setShowQuestionnaire(true);
      toast.success("APR criada! Agora responda o questionário de segurança.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addImageMutation = trpc.aprs.addImage.useMutation();

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

  const analyzeMutation = trpc.aprs.analyzeWithAI.useMutation({
    onSuccess: () => {
      setIsAnalyzing(false);
      toast.success("Análise de riscos concluída!");
      if (createdAprId) {
        setLocation(`/aprs/${createdAprId}`);
      }
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error(error.message || "Erro ao realizar análise de riscos");
      // Even if analysis fails, redirect to details
      if (createdAprId) {
        setLocation(`/aprs/${createdAprId}`);
      }
    },
  });

  const saveResponsesMutation = trpc.aprs.saveResponses.useMutation({
    onSuccess: () => {
      toast.success("Questionário salvo com sucesso!");
      // Trigger AI Analysis
      if (createdAprId) {
        setIsAnalyzing(true);
        analyzeMutation.mutate({ id: createdAprId });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleQuestionnaireComplete = (responses: QuestionnaireResponse[]) => {
    if (!createdAprId) return;

    const formattedResponses = responses.map((r) => ({
      questionKey: r.questionId,
      questionText: r.questionText,
      answer: typeof r.answer === "boolean"
        ? (r.answer ? "Sim" : "Não") + (r.details ? ` - ${r.details}` : "")
        : r.answer as string,
      answerType: (typeof r.answer === "boolean" ? "boolean" : "text") as "boolean" | "text" | "multiple_choice",
    }));

    saveResponsesMutation.mutate({
      aprId: createdAprId,
      responses: formattedResponses,
    });
  };

  const handleQuestionnaireCancel = () => {
    if (createdAprId) {
      setLocation(`/aprs/${createdAprId}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length < 3) {
      toast.error(t("apr.min_images"));
      return;
    }

    createMutation.mutate({
      title,
      description,
      location,
      activityDescription,
    });
  };

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("auth.not_logged_in")}</p>
      </div>
    );
  }

  // Show questionnaire after APR is created
  if (showQuestionnaire) {
    if (isAnalyzing) {
      return (
        <div className="container py-8 max-w-4xl flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analisando Riscos...</h2>
            <p className="text-muted-foreground text-center max-w-lg">
              A IA está analisando suas respostas, a descrição da atividade e as imagens para identificar riscos e medidas de controle.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Questionário de Segurança</h1>
          <p className="text-muted-foreground mt-2">
            Responda as perguntas para identificar riscos e medidas de controle
          </p>
        </div>
        <AprQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onCancel={handleQuestionnaireCancel}
        />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("apr.new")}</h1>
        <p className="text-muted-foreground mt-2">
          Preencha as informações básicas da APR
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagens do Local</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("apr.min_images")} - Envie fotos do local para auxiliar a IA na análise
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Label htmlFor="images" className="cursor-pointer">
                <span className="text-primary hover:underline font-medium">
                  Clique para selecionar imagens
                </span>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                {images.length} / 3 imagens enviadas (mínimo)
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TODO: Add Team Members list */}
        {/* TODO: Add Tool Checklist */}
        {/* TODO: Add Emergency Contacts */}

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
              <Label htmlFor="description">Descrição Resumida *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva brevemente a atividade"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">{t("apr.location")}</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocationField(e.target.value)}
                placeholder="Ex: Setor de produção, linha 3"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="activityDescription">{t("apr.activity_description")} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!activityDescription.trim()) {
                      toast.error("Digite uma descrição base antes de aprimorar");
                      return;
                    }
                    setIsEnhancing(true);
                    enhanceDescriptionMutation.mutate({
                      activityDescription,
                      images: images.map(img => ({ imageUrl: img })),
                    });
                  }}
                  disabled={isEnhancing || !activityDescription.trim()}
                  className="text-primary border-primary/20 hover:bg-primary/5"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isEnhancing ? "Aprimorando..." : "Aprimorar com IA"}
                </Button>
              </div>

              {images.length === 0 && (
                <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Dica</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Adicione imagens primeiro para obter um aprimoramento muito mais detalhado da descrição.
                  </AlertDescription>
                </Alert>
              )}

              <Textarea
                id="activityDescription"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Descreva a atividade..."
                rows={8}
                required
                className="resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Utilize o botão "Aprimorar com IA" para expandir a descrição com base nas imagens e no texto inicial.
              </p>
            </div>
          </CardContent>
        </Card>


        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/aprs")}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || images.length < 3}
          >
            {createMutation.isPending ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
