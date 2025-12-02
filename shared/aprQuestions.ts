export interface AprQuestion {
  key: string;
  text: string;
  type: "boolean" | "text" | "multiple_choice";
  options?: string[];
  category: string;
}

export const APR_QUESTIONS: AprQuestion[] = [
  // Identificação de atividades críticas
  {
    key: "critical_activity",
    text: "Esta atividade é considerada crítica?",
    type: "boolean",
    category: "general",
  },
  {
    key: "critical_activity_description",
    text: "Descreva por que esta atividade é crítica:",
    type: "text",
    category: "general",
  },

  // Trabalho a quente
  {
    key: "hot_work",
    text: "A atividade envolve trabalho a quente (soldagem, corte, esmerilhamento)?",
    type: "boolean",
    category: "hot_work",
  },
  {
    key: "hot_work_permit",
    text: "Foi emitida permissão de trabalho a quente?",
    type: "boolean",
    category: "hot_work",
  },

  // Trabalho em altura
  {
    key: "work_at_height",
    text: "A atividade envolve trabalho em altura (acima de 2 metros)?",
    type: "boolean",
    category: "height",
  },
  {
    key: "fall_protection",
    text: "Quais sistemas de proteção contra quedas serão utilizados?",
    type: "multiple_choice",
    options: [
      "Cinto de segurança tipo paraquedista",
      "Linha de vida",
      "Trava-quedas",
      "Guarda-corpo",
      "Rede de proteção",
      "Outro",
    ],
    category: "height",
  },

  // Riscos mecânicos
  {
    key: "mechanical_risks",
    text: "Existem riscos mecânicos (máquinas, equipamentos móveis, partes rotativas)?",
    type: "boolean",
    category: "mechanical",
  },
  {
    key: "mechanical_risks_description",
    text: "Descreva os riscos mecânicos identificados:",
    type: "text",
    category: "mechanical",
  },

  // Riscos elétricos
  {
    key: "electrical_risks",
    text: "Existem riscos elétricos na atividade?",
    type: "boolean",
    category: "electrical",
  },
  {
    key: "electrical_voltage",
    text: "Qual a tensão elétrica envolvida?",
    type: "multiple_choice",
    options: [
      "Baixa tensão (até 1000V)",
      "Média tensão (1000V a 69kV)",
      "Alta tensão (acima de 69kV)",
      "Não se aplica",
    ],
    category: "electrical",
  },

  // Riscos químicos
  {
    key: "chemical_risks",
    text: "A atividade envolve produtos químicos?",
    type: "boolean",
    category: "chemical",
  },
  {
    key: "chemical_products",
    text: "Liste os produtos químicos que serão utilizados:",
    type: "text",
    category: "chemical",
  },
  {
    key: "chemical_hazards",
    text: "Quais os principais perigos dos produtos químicos?",
    type: "multiple_choice",
    options: [
      "Inflamável",
      "Corrosivo",
      "Tóxico",
      "Irritante",
      "Cancerígeno",
      "Explosivo",
      "Outro",
    ],
    category: "chemical",
  },

  // Riscos ergonômicos
  {
    key: "ergonomic_risks",
    text: "Existem riscos ergonômicos (levantamento de peso, postura inadequada)?",
    type: "boolean",
    category: "ergonomic",
  },
  {
    key: "weight_lifting",
    text: "A atividade envolve levantamento manual de cargas?",
    type: "boolean",
    category: "ergonomic",
  },
  {
    key: "max_weight",
    text: "Qual o peso máximo a ser levantado (kg)?",
    type: "text",
    category: "ergonomic",
  },

  // Riscos biológicos
  {
    key: "biological_risks",
    text: "Existem riscos biológicos (bactérias, vírus, fungos)?",
    type: "boolean",
    category: "biological",
  },
  {
    key: "biological_description",
    text: "Descreva os agentes biológicos presentes:",
    type: "text",
    category: "biological",
  },

  // LOTO (Bloqueio e Travamento)
  {
    key: "loto_required",
    text: "É necessário bloqueio e travamento de energia (LOTO)?",
    type: "boolean",
    category: "loto",
  },
  {
    key: "energy_sources",
    text: "Quais fontes de energia precisam ser bloqueadas?",
    type: "multiple_choice",
    options: [
      "Elétrica",
      "Pneumática",
      "Hidráulica",
      "Térmica",
      "Mecânica",
      "Química",
      "Outro",
    ],
    category: "loto",
  },

  // Atmosferas explosivas
  {
    key: "explosive_atmosphere",
    text: "Existe risco de atmosfera explosiva?",
    type: "boolean",
    category: "explosive",
  },
  {
    key: "explosive_materials",
    text: "Quais materiais podem formar atmosfera explosiva?",
    type: "text",
    category: "explosive",
  },

  // Energia armazenada
  {
    key: "stored_energy",
    text: "Existe energia armazenada no sistema (pressão, molas, capacitores)?",
    type: "boolean",
    category: "energy",
  },
  {
    key: "stored_energy_type",
    text: "Que tipo de energia está armazenada?",
    type: "multiple_choice",
    options: [
      "Pressão (ar comprimido)",
      "Pressão (hidráulica)",
      "Mecânica (molas)",
      "Elétrica (capacitores)",
      "Térmica",
      "Outro",
    ],
    category: "energy",
  },

  // Condições ambientais
  {
    key: "weather_conditions",
    text: "As condições climáticas são adequadas para a atividade?",
    type: "boolean",
    category: "environmental",
  },
  {
    key: "environmental_factors",
    text: "Quais fatores ambientais podem afetar a segurança?",
    type: "multiple_choice",
    options: [
      "Chuva",
      "Vento forte",
      "Temperatura extrema",
      "Baixa visibilidade",
      "Ruído excessivo",
      "Nenhum",
    ],
    category: "environmental",
  },

  // EPIs necessários
  {
    key: "required_ppe",
    text: "Quais EPIs são necessários para esta atividade?",
    type: "multiple_choice",
    options: [
      "Capacete",
      "Óculos de segurança",
      "Protetor auricular",
      "Máscara/Respirador",
      "Luvas",
      "Calçado de segurança",
      "Cinto de segurança",
      "Vestimenta especial",
      "Protetor facial",
      "Outro",
    ],
    category: "ppe",
  },

  // Medidas de controle
  {
    key: "existing_controls",
    text: "Quais medidas de controle já existem no local?",
    type: "text",
    category: "controls",
  },
  {
    key: "additional_controls",
    text: "Quais medidas de controle adicionais são recomendadas?",
    type: "text",
    category: "controls",
  },

  // Informações complementares
  {
    key: "people_involved",
    text: "Quantas pessoas estarão envolvidas na atividade?",
    type: "text",
    category: "general",
  },
  {
    key: "estimated_duration",
    text: "Qual a duração estimada da atividade?",
    type: "text",
    category: "general",
  },
  {
    key: "equipment_used",
    text: "Quais equipamentos e ferramentas serão utilizados?",
    type: "text",
    category: "general",
  },
];

export function getQuestionsByCategory(category: string): AprQuestion[] {
  return APR_QUESTIONS.filter(q => q.category === category);
}

export function getQuestionByKey(key: string): AprQuestion | undefined {
  return APR_QUESTIONS.find(q => q.key === key);
}

export const QUESTION_CATEGORIES = [
  { key: "general", label: "Informações Gerais" },
  { key: "hot_work", label: "Trabalho a Quente" },
  { key: "height", label: "Trabalho em Altura" },
  { key: "mechanical", label: "Riscos Mecânicos" },
  { key: "electrical", label: "Riscos Elétricos" },
  { key: "chemical", label: "Riscos Químicos" },
  { key: "ergonomic", label: "Riscos Ergonômicos" },
  { key: "biological", label: "Riscos Biológicos" },
  { key: "loto", label: "LOTO (Bloqueio e Travamento)" },
  { key: "explosive", label: "Atmosferas Explosivas" },
  { key: "energy", label: "Energia Armazenada" },
  { key: "environmental", label: "Condições Ambientais" },
  { key: "ppe", label: "EPIs Necessários" },
  { key: "controls", label: "Medidas de Controle" },
];
