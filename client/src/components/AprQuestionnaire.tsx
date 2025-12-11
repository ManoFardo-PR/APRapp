import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface QuestionnaireResponse {
  questionId: string;
  questionText: string;
  answer: boolean | string;
  details?: string;
}

interface AprQuestionnaireProps {
  onComplete: (responses: QuestionnaireResponse[]) => void;
  onCancel: () => void;
}

interface Question {
  id: string;
  text: string;
  type: "boolean" | "text";
  required: boolean;
  showDetailsIf?: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

const QUESTIONNAIRE_STEPS: Step[] = [
  {
    id: 1,
    title: "Atividades Críticas",
    description: "Identifique se a atividade envolve trabalhos críticos regulamentados",
    questions: [
      {
        id: "trabalho_altura",
        text: "Trabalho em altura (>= 2 metros)?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
      {
        id: "trabalho_quente",
        text: "Trabalho a quente (solda, corte, esmerilhamento)?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
      {
        id: "espaco_confinado",
        text: "Trabalho em espaço confinado?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
      {
        id: "trabalho_eletricidade",
        text: "Trabalho com eletricidade (NR-10)?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
    ],
  },
  {
    id: 2,
    title: "Trabalhos Especiais",
    description: "Identifique condições especiais de risco",
    questions: [
      {
        id: "loto_necessario",
        text: "LOTO necessário (bloqueio e travamento de energia)?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
      {
        id: "atmosfera_explosiva",
        text: "Atmosfera explosiva presente ou possível?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
      {
        id: "energia_armazenada",
        text: "Energia armazenada (pressão, molas, capacitores)?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
      {
        id: "queda_objetos",
        text: "Risco de queda de objetos ou ferramentas?",
        type: "boolean",
        required: true,
        showDetailsIf: true,
      },
    ],
  },
  {
    id: 3,
    title: "Riscos Identificados",
    description: "Marque todos os tipos de riscos presentes na atividade",
    questions: [
      {
        id: "riscos_mecanicos",
        text: "Riscos mecânicos (corte, prensamento, esmagamento, perfuração)?",
        type: "boolean",
        required: false,
        showDetailsIf: true,
      },
      {
        id: "riscos_eletricos",
        text: "Riscos elétricos (choque elétrico, arco elétrico)?",
        type: "boolean",
        required: false,
        showDetailsIf: true,
      },
      {
        id: "riscos_quimicos",
        text: "Riscos químicos (gases, vapores, poeiras, produtos químicos)?",
        type: "boolean",
        required: false,
        showDetailsIf: true,
      },
      {
        id: "riscos_ergonomicos",
        text: "Riscos ergonômicos (postura inadequada, repetição, levantamento de carga)?",
        type: "boolean",
        required: false,
        showDetailsIf: true,
      },
      {
        id: "riscos_biologicos",
        text: "Riscos biológicos (bactérias, fungos, vírus, animais peçonhentos)?",
        type: "boolean",
        required: false,
        showDetailsIf: true,
      },
      {
        id: "riscos_ambientais",
        text: "Riscos ambientais (calor excessivo, frio, ruído, vibração)?",
        type: "boolean",
        required: false,
        showDetailsIf: true,
      },
    ],
  },
  {
    id: 4,
    title: "EPIs e Medidas de Controle",
    description: "Defina equipamentos de proteção e medidas de segurança necessárias",
    questions: [
      {
        id: "epis_obrigatorios",
        text: "Quais EPIs são obrigatórios? (capacete, luvas, óculos, protetor auricular, máscara, cinto de segurança, etc.)",
        type: "text",
        required: true,
      },
      {
        id: "medidas_coletivas",
        text: "Medidas de controle coletivas necessárias (ventilação, guarda-corpos, sinalização, isolamento de área, etc.)",
        type: "text",
        required: false,
      },
      {
        id: "medidas_administrativas",
        text: "Medidas administrativas (treinamento, permissões de trabalho, procedimentos, supervisão, etc.)",
        type: "text",
        required: false,
      },
      {
        id: "equipamentos_seguranca",
        text: "Equipamentos de segurança disponíveis (extintores, chuveiros de emergência, lava-olhos, kit primeiros socorros, etc.)",
        type: "text",
        required: false,
      },
    ],
  },
];

export default function AprQuestionnaire({ onComplete, onCancel }: AprQuestionnaireProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionnaireResponse>>({});

  const step = QUESTIONNAIRE_STEPS[currentStep];
  const isLastStep = currentStep === QUESTIONNAIRE_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleBooleanAnswer = (questionId: string, questionText: string, value: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        questionText,
        answer: value,
        details: prev[questionId]?.details || "",
      },
    }));
  };

  const handleTextAnswer = (questionId: string, questionText: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        questionText,
        answer: value,
      },
    }));
  };

  const handleDetailsChange = (questionId: string, details: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        details,
      },
    }));
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Convert responses to array and complete
      const responsesArray = Object.values(responses);
      onComplete(responsesArray);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Etapa {currentStep + 1} de {QUESTIONNAIRE_STEPS.length}
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-secondary h-2 rounded-full mt-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / QUESTIONNAIRE_STEPS.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step.questions.map((question) => {
          const response = responses[question.id];
          const showDetails =
            question.showDetailsIf !== undefined &&
            response?.answer === question.showDetailsIf;

          return (
            <div key={question.id} className="space-y-3 pb-4 border-b last:border-0">
              {question.type === "boolean" ? (
                <>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={question.id}
                      checked={response?.answer === true}
                      onCheckedChange={(checked) =>
                        handleBooleanAnswer(question.id, question.text, checked === true)
                      }
                    />
                    <Label
                      htmlFor={question.id}
                      className="text-sm font-medium leading-relaxed cursor-pointer"
                    >
                      {question.text}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  </div>
                  {showDetails && (
                    <div className="ml-7 space-y-2">
                      <Label htmlFor={`${question.id}_details`} className="text-sm text-muted-foreground">
                        Descreva os detalhes ou medidas de controle:
                      </Label>
                      <Textarea
                        id={`${question.id}_details`}
                        placeholder="Ex: Altura de 3 metros, uso de cinto de segurança tipo paraquedista, linha de vida instalada..."
                        value={response?.details || ""}
                        onChange={(e) => handleDetailsChange(question.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={question.id} className="text-sm font-medium">
                    {question.text}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Textarea
                    id={question.id}
                    placeholder="Descreva detalhadamente..."
                    value={(response?.answer as string) || ""}
                    onChange={(e) => handleTextAnswer(question.id, question.text, e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={isFirstStep ? onCancel : handlePrevious}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {isFirstStep ? "Cancelar" : "Anterior"}
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? (
              <>
                <Check className="h-4 w-4" />
                Concluir Questionário
              </>
            ) : (
              <>
                Próxima
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
