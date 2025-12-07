import { invokeLLM } from "./_core/llm";
import type { AprImage, AprResponse } from "../drizzle/schema";

export interface RiskAnalysisItem {
  task: string; // Tarefa (passo a passo)
  hazard: string; // Perigo existente
  probability: 1 | 2 | 3 | 4; // P
  severity: 1 | 2 | 3 | 4; // S
  riskLevel: number; // NR = P * S
  riskCategory: string; // Aceitável, Tolerável, Inaceitável, Inadmissível
  controlMeasures: string; // Medidas de controle específicas
  applicableNRs: string[]; // NRs aplicáveis
}

export interface AprAIAnalysis {
  risks: RiskAnalysisItem[];
  specialWorkPermits: {
    nr10_electrical: boolean; // Energia Elétrica
    nr35_height: boolean; // Trabalho em Altura
    nr33_confined: boolean; // Espaço Confinado
    nr12_pressure: boolean; // Vasos de Pressão
    nr18_excavation: boolean; // Escavação
    nr18_hot_work: boolean; // Trabalho a Quente
    nr18_lifting: boolean; // Içamentos
    others: string;
  };
  requiredPPE: string[];
  communicationNeeds: {
    management: boolean;
    supervision: boolean;
    safety: boolean;
    environment: boolean;
    emergency_brigade: boolean;
    security: boolean;
    purchasing: boolean;
    hr: boolean;
  };
  summary: string;
}

function getRiskCategory(riskLevel: number, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";
  if (riskLevel <= 2) return isPt ? "Aceitável - controles suficientes" : "Acceptable - sufficient controls";
  if (riskLevel <= 4) return isPt ? "Tolerável - atenção aos controles" : "Tolerable - attention to controls";
  if (riskLevel <= 9) return isPt ? "Inaceitável - requer controles adicionais" : "Unacceptable - requires additional controls";
  return isPt ? "Inadmissível - não executar" : "Inadmissible - do not execute";
}

export async function analyzeAprWithAI(
  activityDescription: string,
  responses: AprResponse[],
  images: AprImage[],
  language: "pt-BR" | "en-US" = "pt-BR"
): Promise<AprAIAnalysis> {
  const isPortuguese = language === "pt-BR";

  // Build context from responses
  const responsesContext = responses
    .map(r => `${r.questionText}: ${r.answer}`)
    .join("\n");

  // Build message content with images
  const hasImages = images.length > 0;
  const imageContext = hasImages
    ? `${images.length} ${isPortuguese ? 'imagens foram fornecidas do local de trabalho para análise visual' : 'images were provided from the workplace for visual analysis'}.`
    : isPortuguese ? 'Nenhuma imagem foi fornecida.' : 'No images were provided.';

  const systemPrompt = isPortuguese
    ? `Você é um especialista em Segurança do Trabalho com profundo conhecimento das Normas Regulamentadoras (NRs) brasileiras.

Sua função é analisar atividades de trabalho e gerar uma Análise Preliminar de Riscos (APR) completa seguindo o padrão brasileiro.

Para cada tarefa/etapa da atividade, você deve:
1. Identificar os perigos existentes
2. Avaliar PROBABILIDADE (P) de 1 a 4:
   1 = Existem controles e são efetivos
   2 = Existem controles e são pouco efetivos
   3 = Os controles existentes não são efetivos
   4 = Não existem controles

3. Avaliar SEVERIDADE (S) de 1 a 4:
   1 = Lesão leve sem perda de tempo laboral
   2 = Incapacidade temporária
   3 = Incapacidade permanente
   4 = Lesão grave ou morte

4. Calcular NÍVEL DE RISCO (NR = P × S)
5. Definir medidas de controle específicas
6. Citar as NRs aplicáveis (NR-6, NR-10, NR-12, NR-17, NR-18, NR-33, NR-35, etc.)

Identifique também:
- Trabalhos especiais que requerem Permissões de Trabalho (PT)
- EPIs obrigatórios conforme NR-6
- Setores que devem ser comunicados sobre o trabalho

Seja técnico, preciso e sempre referencie as NRs aplicáveis.`
    : `You are an Occupational Safety expert with deep knowledge of Brazilian Regulatory Standards (NRs).

Your role is to analyze work activities and generate a complete Preliminary Risk Analysis (PRA) following Brazilian standards.

For each task/step of the activity, you must:
1. Identify existing hazards
2. Assess PROBABILITY (P) from 1 to 4:
   1 = Controls exist and are effective
   2 = Controls exist but are minimally effective
   3 = Existing controls are not effective
   4 = No controls exist

3. Assess SEVERITY (S) from 1 to 4:
   1 = Minor injury without lost time
   2 = Temporary disability
   3 = Permanent disability
   4 = Serious injury or death

4. Calculate RISK LEVEL (NR = P × S)
5. Define specific control measures
6. Cite applicable NRs (NR-6, NR-10, NR-12, NR-17, NR-18, NR-33, NR-35, etc.)

Also identify:
- Special work requiring Work Permits (PT)
- Mandatory PPE per NR-6
- Departments that must be notified about the work

Be technical, precise, and always reference applicable NRs.`;

  const userPromptText = isPortuguese
    ? `Analise a seguinte atividade de trabalho e gere uma APR completa conforme padrão brasileiro:

DESCRIÇÃO DA ATIVIDADE:
${activityDescription}

RESPOSTAS DO QUESTIONÁRIO:
${responsesContext}

INFORMAÇÕES SOBRE IMAGENS:
${imageContext}

${hasImages ? 'IMPORTANTE: Analise visualmente as imagens fornecidas para identificar:\n- Condições do ambiente de trabalho\n- EPIs sendo utilizados ou faltantes\n- Equipamentos e ferramentas presentes\n- Condições inseguras visíveis\n- Riscos não mencionados na descrição\n- Conformidade com NRs aplicáveis\n\nComplemente a descrição da atividade com detalhes observados nas imagens.' : ''}

Gere uma análise estruturada identificando todas as tarefas, perigos, riscos (P, S, NR), medidas de controle e NRs aplicáveis.`
    : `Analyze the following work activity and generate a complete PRA according to Brazilian standards:

ACTIVITY DESCRIPTION:
${activityDescription}

QUESTIONNAIRE RESPONSES:
${responsesContext}

IMAGE INFORMATION:
${imageContext}

${hasImages ? 'IMPORTANT: Visually analyze the provided images to identify:\n- Work environment conditions\n- PPE being used or missing\n- Equipment and tools present\n- Visible unsafe conditions\n- Risks not mentioned in description\n- Compliance with applicable NRs\n\nComplement the activity description with details observed in the images.' : ''}

Generate a structured analysis identifying all tasks, hazards, risks (P, S, NR), control measures, and applicable NRs.`;

  try {
    // Build messages with images if available
    const userMessage: any = hasImages
      ? {
          role: "user",
          content: [
            { type: "text", text: userPromptText },
            ...images.map(img => ({
              type: "image_url",
              image_url: {
                url: img.imageUrl,
                detail: "high" as const,
              },
            })),
          ],
        }
      : { role: "user", content: userPromptText };

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        userMessage,
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "apr_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    task: { type: "string", description: isPortuguese ? "Tarefa/etapa da atividade" : "Task/step of activity" },
                    hazard: { type: "string", description: isPortuguese ? "Perigo existente" : "Existing hazard" },
                    probability: { type: "integer", enum: [1, 2, 3, 4], description: "P" },
                    severity: { type: "integer", enum: [1, 2, 3, 4], description: "S" },
                    controlMeasures: { type: "string", description: isPortuguese ? "Medidas de controle específicas" : "Specific control measures" },
                    applicableNRs: {
                      type: "array",
                      items: { type: "string" },
                      description: isPortuguese ? "NRs aplicáveis (ex: NR-10, NR-35)" : "Applicable NRs (e.g., NR-10, NR-35)",
                    },
                  },
                  required: ["task", "hazard", "probability", "severity", "controlMeasures", "applicableNRs"],
                  additionalProperties: false,
                },
              },
              specialWorkPermits: {
                type: "object",
                properties: {
                  nr10_electrical: { type: "boolean", description: "Energia Elétrica NR-10" },
                  nr35_height: { type: "boolean", description: "Trabalho em Altura NR-35" },
                  nr33_confined: { type: "boolean", description: "Espaço Confinado NR-33" },
                  nr12_pressure: { type: "boolean", description: "Vasos de Pressão NR-12" },
                  nr18_excavation: { type: "boolean", description: "Escavação NR-18" },
                  nr18_hot_work: { type: "boolean", description: "Trabalho a Quente NR-18" },
                  nr18_lifting: { type: "boolean", description: "Içamentos NR-18" },
                  others: { type: "string", description: isPortuguese ? "Outros trabalhos especiais" : "Other special work" },
                },
                required: ["nr10_electrical", "nr35_height", "nr33_confined", "nr12_pressure", "nr18_excavation", "nr18_hot_work", "nr18_lifting", "others"],
                additionalProperties: false,
              },
              requiredPPE: {
                type: "array",
                items: { type: "string" },
                description: isPortuguese ? "EPIs obrigatórios conforme NR-6" : "Required PPE per NR-6",
              },
              communicationNeeds: {
                type: "object",
                properties: {
                  management: { type: "boolean", description: isPortuguese ? "Gerência" : "Management" },
                  supervision: { type: "boolean", description: isPortuguese ? "Supervisão" : "Supervision" },
                  safety: { type: "boolean", description: isPortuguese ? "Segurança do Trabalho" : "Safety" },
                  environment: { type: "boolean", description: isPortuguese ? "Meio Ambiente" : "Environment" },
                  emergency_brigade: { type: "boolean", description: isPortuguese ? "Brigada de Emergência" : "Emergency Brigade" },
                  security: { type: "boolean", description: isPortuguese ? "Segurança Patrimonial" : "Security" },
                  purchasing: { type: "boolean", description: isPortuguese ? "Compras" : "Purchasing" },
                  hr: { type: "boolean", description: "RH/HR" },
                },
                required: ["management", "supervision", "safety", "environment", "emergency_brigade", "security", "purchasing", "hr"],
                additionalProperties: false,
              },
              summary: {
                type: "string",
                description: isPortuguese ? "Resumo executivo da análise" : "Executive summary",
              },
            },
            required: ["risks", "specialWorkPermits", "requiredPPE", "communicationNeeds", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    const analysisData = JSON.parse(content);
    
    // Calculate risk levels and categories
    const risks: RiskAnalysisItem[] = analysisData.risks.map((risk: any) => {
      const riskLevel = risk.probability * risk.severity;
      return {
        ...risk,
        riskLevel,
        riskCategory: getRiskCategory(riskLevel, language),
      };
    });

    const analysis: AprAIAnalysis = {
      ...analysisData,
      risks,
    };

    return analysis;
  } catch (error) {
    console.error("[APR AI] Error analyzing APR:", error);
    throw new Error(isPortuguese 
      ? "Erro ao analisar APR com IA" 
      : "Error analyzing APR with AI");
  }
}

export async function analyzeImagesWithAI(
  images: AprImage[],
  language: "pt-BR" | "en-US" = "pt-BR"
): Promise<string[]> {
  if (images.length === 0) {
    return [];
  }

  const isPortuguese = language === "pt-BR";

  const systemPrompt = isPortuguese
    ? `Você é um especialista em Segurança do Trabalho com conhecimento das NRs brasileiras. 
Analise as imagens e identifique:
- Riscos visíveis conforme NRs aplicáveis
- EPIs presentes ou ausentes (NR-6)
- Condições inseguras
- Equipamentos e máquinas (NR-12)
- Trabalhos em altura (NR-35)
- Trabalhos elétricos (NR-10)
- Boas práticas ou violações

Seja específico e cite as NRs aplicáveis.`
    : `You are an Occupational Safety expert with knowledge of Brazilian NRs.
Analyze the images and identify:
- Visible risks per applicable NRs
- PPE present or absent (NR-6)
- Unsafe conditions
- Equipment and machinery (NR-12)
- Work at height (NR-35)
- Electrical work (NR-10)
- Good practices or violations

Be specific and cite applicable NRs.`;

  const userPrompt = isPortuguese
    ? `Analise estas imagens do local de trabalho e liste os principais pontos de atenção relacionados à segurança, citando as NRs aplicáveis:`
    : `Analyze these workplace images and list the main safety concerns, citing applicable NRs:`;

  try {
    const imageContents = images.map(img => ({
      type: "image_url" as const,
      image_url: {
        url: img.imageUrl,
        detail: "high" as const,
      },
    }));

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            { type: "text", text: userPrompt },
            ...imageContents,
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return [];
    }

    // Parse the response into an array of observations
    const observations = content
      .split("\n")
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^[-*•]\s*/, "").trim())
      .filter((line: string) => line.length > 0);

    return observations;
  } catch (error) {
    console.error("[APR AI] Error analyzing images:", error);
    return [];
  }
}

export function generateAprSummary(
  analysis: AprAIAnalysis,
  language: "pt-BR" | "en-US" = "pt-BR"
): string {
  const isPortuguese = language === "pt-BR";
  
  const riskCount = analysis.risks.length;
  const highRisks = analysis.risks.filter(r => r.riskLevel >= 6).length;
  const inadmissibleRisks = analysis.risks.filter(r => r.riskLevel >= 12).length;
  
  if (inadmissibleRisks > 0) {
    return isPortuguese
      ? `⚠️ ATENÇÃO: ${inadmissibleRisks} risco(s) INADMISSÍVEL(IS) identificado(s). NÃO EXECUTAR até implementar controles adicionais. Total de ${riskCount} riscos analisados.`
      : `⚠️ WARNING: ${inadmissibleRisks} INADMISSIBLE risk(s) identified. DO NOT EXECUTE until additional controls are implemented. Total of ${riskCount} risks analyzed.`;
  }
  
  const summary = isPortuguese
    ? `Análise identificou ${riskCount} risco(s), sendo ${highRisks} de alta severidade (inaceitável ou inadmissível). ${analysis.summary}`
    : `Analysis identified ${riskCount} risk(s), with ${highRisks} of high severity (unacceptable or inadmissible). ${analysis.summary}`;
  
  return summary;
}
