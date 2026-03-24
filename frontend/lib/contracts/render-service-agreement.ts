// Renderização do contrato - PreJud
// Substitui placeholders do template com dados estruturados

import { SERVICE_AGREEMENT_TEMPLATE } from './service-agreement-template';
import { GeneratedContractData } from '@/types/contract';

// Formata data YYYY-MM-DD → DD/MM/AAAA
function formatDateBR(date: string | null): string {
  if (!date) return '';

  const parts = date.split('-');
  if (parts.length !== 3) return date;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Formata valor numérico → moeda BR
function formatCurrencyBR(value: number | null): string {
  if (value === null || value === undefined) return '';

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Data atual BR
function getTodayBR(): string {
  const today = new Date();
  return today.toLocaleDateString('pt-BR');
}

export function renderServiceAgreement(data: GeneratedContractData): string {
  let contract = SERVICE_AGREEMENT_TEMPLATE;

  contract = contract.replace(/{{client_name}}/g, data.client.name || '');
  contract = contract.replace(/{{client_document}}/g, data.client.document || '');

  contract = contract.replace(/{{freelancer_name}}/g, data.freelancer.name || '');
  contract = contract.replace(/{{freelancer_document}}/g, data.freelancer.document || '');

  contract = contract.replace(/{{service_description}}/g, data.service.description || '');

  contract = contract.replace(/{{start_date}}/g, formatDateBR(data.deadline.start_date));
  contract = contract.replace(/{{end_date}}/g, formatDateBR(data.deadline.end_date));

  contract = contract.replace(/{{amount}}/g, formatCurrencyBR(data.commercial.amount));
  contract = contract.replace(/{{payment_terms}}/g, data.commercial.payment_terms || '');

  contract = contract.replace(/{{revision_limit}}/g, String(data.revision_policy.revision_limit ?? ''));

  contract = contract.replace(/{{city}}/g, data.jurisdiction.city || '');
  contract = contract.replace(/{{state}}/g, data.jurisdiction.state || '');

  contract = contract.replace(/{{date}}/g, getTodayBR());

  return contract;
}