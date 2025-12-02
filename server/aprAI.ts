import { invokeLLM } from "./_core/llm";
import type { AprImage, AprResponse } from "../drizzle/schema";

export interface AprAIAnalysis {
  risks: Array<{
    type: string;
    description: string;
    consequences: string;
    probability: string;
    severity: string;
  }>;
  controlMeasures: {
    existing: string[];
    recommended: string[];
  };
  requiredPPE: string[];
  specialPermissions: string[];
  summary: string;
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

  // Build image context
  const imageContext = images.length > 0
    ? `${images.length} ${isPortuguese ? 'imagens foram fornecidas' : 'images were provided'} ${isPortuguese ? 'do local de trabalho' : 'of the workplace'}.`
    : isPortuguese ? 'Nenhuma imagem foi fornecida.' : 'No images were provided.';

  const systemPrompt = isPortuguese
    ? `Você é um especialista em Segurança do Trabalho e Análise Preliminar de Riscos (APR). 
Sua função é analisar as informações fornecidas sobre uma atividade de trabalho e gerar uma análise completa de riscos.

Para cada risco identificado, você deve:
1. Classificar o tipo de risco (mecânico, elétrico, químico, ergonômico, biológico, etc.)
2. Descrever o risco de forma clara e objetiva
3. Identificar as possíveis consequências
4. Avaliar a probabilidade (Baixa, Média, Alta)
5. Avaliar a severidade (Baixa, Média, Alta, Crítica)

Você também deve:
- Identificar medidas de controle existentes
- Recomendar medidas de controle adicionais
- Listar EPIs necessários
- Identificar permissões especiais necessárias (trabalho a quente, trabalho em altura, etc.)
- Gerar um resumo executivo da análise

Seja preciso, técnico e siga as normas regulamentadoras brasileiras (NRs).`
    : `You are an expert in Occupational Safety and Preliminary Risk Analysis (PRA).
Your role is to analyze the provided information about a work activity and generate a complete risk analysis.

For each identified risk, you must:
1. Classify the risk type (mechanical, electrical, chemical, ergonomic, biological, etc.)
2. Describe the risk clearly and objectively
3. Identify possible consequences
4. Assess probability (Low, Medium, High)
5. Assess severity (Low, Medium, High, Critical)

You must also:
- Identify existing control measures
- Recommend additional control measures
- List required PPE
- Identify special permits needed (hot work, work at height, etc.)
- Generate an executive summary of the analysis

Be precise, technical, and follow occupational safety standards.`;

  const userPrompt = isPortuguese
    ? `Analise a seguinte atividade de trabalho e gere uma Análise Preliminar de Riscos completa:

DESCRIÇÃO DA ATIVIDADE:
${activityDescription}

RESPOSTAS DO QUESTIONÁRIO:
${responsesContext}

INFORMAÇÕES SOBRE IMAGENS:
${imageContext}

Por favor, forneça uma análise estruturada em formato JSON.`
    : `Analyze the following work activity and generate a complete Preliminary Risk Analysis:

ACTIVITY DESCRIPTION:
${activityDescription}

QUESTIONNAIRE RESPONSES:
${responsesContext}

IMAGE INFORMATION:
${imageContext}

Please provide a structured analysis in JSON format.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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
                    type: { type: "string", description: isPortuguese ? "Tipo do risco" : "Risk type" },
                    description: { type: "string", description: isPortuguese ? "Descrição do risco" : "Risk description" },
                    consequences: { type: "string", description: isPortuguese ? "Consequências possíveis" : "Possible consequences" },
                    probability: { 
                      type: "string", 
                      enum: isPortuguese ? ["Baixa", "Média", "Alta"] : ["Low", "Medium", "High"],
                      description: isPortuguese ? "Probabilidade de ocorrência" : "Probability of occurrence"
                    },
                    severity: { 
                      type: "string", 
                      enum: isPortuguese ? ["Baixa", "Média", "Alta", "Crítica"] : ["Low", "Medium", "High", "Critical"],
                      description: isPortuguese ? "Severidade das consequências" : "Severity of consequences"
                    },
                  },
                  required: ["type", "description", "consequences", "probability", "severity"],
                  additionalProperties: false,
                },
              },
              controlMeasures: {
                type: "object",
                properties: {
                  existing: {
                    type: "array",
                    items: { type: "string" },
                    description: isPortuguese ? "Medidas de controle existentes" : "Existing control measures",
                  },
                  recommended: {
                    type: "array",
                    items: { type: "string" },
                    description: isPortuguese ? "Medidas de controle recomendadas" : "Recommended control measures",
                  },
                },
                required: ["existing", "recommended"],
                additionalProperties: false,
              },
              requiredPPE: {
                type: "array",
                items: { type: "string" },
                description: isPortuguese ? "EPIs obrigatórios" : "Required PPE",
              },
              specialPermissions: {
                type: "array",
                items: { type: "string" },
                description: isPortuguese ? "Permissões especiais necessárias" : "Special permissions required",
              },
              summary: {
                type: "string",
                description: isPortuguese ? "Resumo executivo da análise" : "Executive summary of the analysis",
              },
            },
            required: ["risks", "controlMeasures", "requiredPPE", "specialPermissions", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    const analysis: AprAIAnalysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error("[APR AI] Error analyzing APR:", error);
    throw new Error(isPortuguese 
      ? "Erro ao analisar APR com IA" 
      : "Error analyzing APR with AI");
  }
}

export async function generateAprSummary(
  analysis: AprAIAnalysis,
  language: "pt-BR" | "en-US" = "pt-BR"
): Promise<string> {
  const isPortuguese = language === "pt-BR";
  
  const riskCount = analysis.risks.length;
  const highRisks = analysis.risks.filter(r => 
    r.severity === (isPortuguese ? "Alta" : "High") || 
    r.severity === (isPortuguese ? "Crítica" : "Critical")
  ).length;
  
  const summary = isPortuguese
    ? `Análise identificou ${riskCount} risco(s), sendo ${highRisks} de alta severidade. ${analysis.summary}`
    : `Analysis identified ${riskCount} risk(s), with ${highRisks} of high severity. ${analysis.summary}`;
  
  return summary;
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
    ? `Você é um especialista em Segurança do Trabalho. Analise as imagens fornecidas e identifique:
- Riscos visíveis no ambiente de trabalho
- EPIs presentes ou ausentes
- Condições inseguras
- Equipamentos e máquinas
- Boas práticas ou violações de segurança

Seja específico e técnico em sua análise.`
    : `You are an Occupational Safety expert. Analyze the provided images and identify:
- Visible risks in the workplace
- PPE present or absent
- Unsafe conditions
- Equipment and machinery
- Good practices or safety violations

Be specific and technical in your analysis.`;

  const userPrompt = isPortuguese
    ? `Analise estas imagens do local de trabalho e liste os principais pontos de atenção relacionados à segurança:`
    : `Analyze these workplace images and list the main safety concerns:`;

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
