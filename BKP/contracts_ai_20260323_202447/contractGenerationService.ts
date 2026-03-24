// Serviço de geração de contrato - PreJud
// Responsável por chamar OpenAI + renderizar contrato

import OpenAI from 'openai';
import { CONTRACT_SYSTEM_PROMPT, CONTRACT_JSON_SCHEMA } from '@/lib/contracts/openai-contract-prompts';
import { renderServiceAgreement } from '@/lib/contracts/render-service-agreement';
import { ContractProtocolInput, GeneratedContractData } from '@/types/contract';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateContractFromProtocol(input: ContractProtocolInput) {
  const protocolText = `
Freelancer:
Nome: ${input.freelancer_name ?? ''}
CPF/CNPJ: ${input.freelancer_document ?? ''}

Cliente:
Nome: ${input.client_name ?? ''}
CPF/CNPJ: ${input.client_document ?? ''}

Serviço:
${input.service_description ?? ''}

Prazo:
Início: ${input.start_date ?? ''}
Fim: ${input.end_date ?? ''}

Valor:
${input.amount ?? ''}

Forma de pagamento:
${input.payment_terms ?? ''}

Revisões:
${input.revision_limit ?? ''}

Cidade/Estado:
${input.city ?? ''} / ${input.state ?? ''}

Observações adicionais:
${input.notes ?? ''}
`;

  const response = await client.responses.create({
    model: 'gpt-5.4',
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: CONTRACT_SYSTEM_PROMPT }],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: protocolText }],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'contract_schema',
        schema: CONTRACT_JSON_SCHEMA,
      },
    },
  });

  const jsonText = response.output_text;

  if (!jsonText) {
    throw new Error('Resposta vazia da IA');
  }

  let parsed: GeneratedContractData;

  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error('Erro ao parsear JSON da IA:', jsonText);
    throw new Error('Erro ao interpretar resposta da IA');
  }

  const contractText = renderServiceAgreement(parsed);

  return {
    raw: parsed,
    contract: contractText,
  };
}