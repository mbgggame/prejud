// Mapeia Agreement → ContractProtocolInput
// NÃO altera nada do agreement, apenas traduz os dados

import { ContractProtocolInput } from '@/types/contract';
import { Agreement } from '@/types/agreement';

export function mapAgreementToContractInput(agreement: Agreement): ContractProtocolInput {
  return {
    freelancer_name: agreement.freelancerName || '',
    freelancer_document: '',

    client_name: agreement.clientName || '',
    client_document: '',

    service_description: agreement.description || '',

    start_date: agreement.startDate || '',
    end_date: agreement.endDate || '',

    amount: agreement.value || '',

    payment_terms: agreement.paymentTerms || '',

    revision_limit: 1,

    city: agreement.city || '',
    state: agreement.state || '',

    notes: '',
  };
}