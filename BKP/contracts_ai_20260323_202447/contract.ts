// Tipos de contrato - PreJud
// NÃO alterar estruturas existentes do sistema

export interface ContractParty {
  name: string | null;
  document: string | null;
}

export interface ContractService {
  description: string | null;
  deliverables: string[] | null;
}

export interface ContractDeadline {
  start_date: string | null; // DD/MM/AAAA (exibição no contrato)
  end_date: string | null;   // DD/MM/AAAA (exibição no contrato)
}

export interface ContractCommercial {
  amount: number | null;
  payment_terms: string | null;
}

export interface ContractRevisionPolicy {
  revision_limit: number | null;
}

export interface ContractJurisdiction {
  city: string | null;
  state: string | null;
}

export interface GeneratedContractData {
  freelancer: ContractParty;
  client: ContractParty;
  service: ContractService;
  deadline: ContractDeadline;
  commercial: ContractCommercial;
  revision_policy: ContractRevisionPolicy;
  jurisdiction: ContractJurisdiction;
  observations: string[] | null;
}

// Dados de entrada (protocolo)
export interface ContractProtocolInput {
  freelancer_name?: string;
  freelancer_document?: string;
  client_name?: string;
  client_document?: string;
  service_description?: string;
  start_date?: string;
  end_date?: string;
  amount?: string | number;
  payment_terms?: string;
  revision_limit?: number;
  city?: string;
  state?: string;
  notes?: string;
}