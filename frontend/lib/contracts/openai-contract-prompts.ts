// Prompt e schema para OpenAI - PreJud
// NÃO alterar lógica fora deste arquivo

export const CONTRACT_SYSTEM_PROMPT = `
Você é um assistente jurídico-operacional da plataforma PreJud.

Sua função é transformar dados de um protocolo de prestação de serviços em um JSON estruturado.

REGRAS OBRIGATÓRIAS:
1. Extraia apenas dados explícitos no texto.
2. NÃO invente nomes, valores, documentos ou datas.
3. Se não houver informação, retorne null.
4. Datas devem estar no formato YYYY-MM-DD.
5. Valores devem ser numéricos (ex: 2500.00).
6. Não escreva contrato.
7. Não explique nada.
8. Retorne apenas JSON válido.
`;

export const CONTRACT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    freelancer: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: ["string", "null"] },
        document: { type: ["string", "null"] }
      },
      required: ["name", "document"]
    },
    client: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: ["string", "null"] },
        document: { type: ["string", "null"] }
      },
      required: ["name", "document"]
    },
    service: {
      type: "object",
      additionalProperties: false,
      properties: {
        description: { type: ["string", "null"] },
        deliverables: {
          type: ["array", "null"],
          items: { type: "string" }
        }
      },
      required: ["description", "deliverables"]
    },
    deadline: {
      type: "object",
      additionalProperties: false,
      properties: {
        start_date: { type: ["string", "null"] },
        end_date: { type: ["string", "null"] }
      },
      required: ["start_date", "end_date"]
    },
    commercial: {
      type: "object",
      additionalProperties: false,
      properties: {
        amount: { type: ["number", "null"] },
        payment_terms: { type: ["string", "null"] }
      },
      required: ["amount", "payment_terms"]
    },
    revision_policy: {
      type: "object",
      additionalProperties: false,
      properties: {
        revision_limit: { type: ["number", "null"] }
      },
      required: ["revision_limit"]
    },
    jurisdiction: {
      type: "object",
      additionalProperties: false,
      properties: {
        city: { type: ["string", "null"] },
        state: { type: ["string", "null"] }
      },
      required: ["city", "state"]
    },
    observations: {
      type: ["array", "null"],
      items: { type: "string" }
    }
  },
  required: [
    "freelancer",
    "client",
    "service",
    "deadline",
    "commercial",
    "revision_policy",
    "jurisdiction",
    "observations"
  ]
};