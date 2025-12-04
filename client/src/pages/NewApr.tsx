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
import { Upload, X } from "lucide-react";

export default function NewApr() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocationField] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const createMutation = trpc.aprs.create.useMutation({
    onSuccess: async (data) => {
      toast.success(t("msg.apr_created"));
      setLocation(`/aprs/${data.aprId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
              <Label htmlFor="activityDescription">{t("apr.activity_description")} *</Label>
              <Textarea
                id="activityDescription"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Descreva detalhadamente a atividade que será realizada"
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("apr.images")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("apr.min_images")} - Envie fotos do local de trabalho
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Label htmlFor="images" className="cursor-pointer">
                <span className="text-primary hover:underline">
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
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
