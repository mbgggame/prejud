// ==========================================
// TIPOS DE ESTADO DO ACORDO - PREJUD
// ==========================================

export type AgreementStatus = 
  | "draft"                    // Rascunho - freelancer editando
  | "pending_confirmation"     // Aguardando confirmação do cliente
  | "confirmed"                // Acordo confirmado - ativo
  | "contested"                // Cliente contestou o acordo
  | "in_adjustment"            // Em ajuste após contestação
  | "deadline_extension_pending" // Prorrogação pendente de resposta
  | "amendment_pending"        // Aditivo pendente de resposta
  | "charge_open"              // Cobrança aberta
  | "charge_contested"         // Cobrança contestada
  | "notice_sent"              // Notificação enviada
  | "in_dispute"               // Em disputa (não reconhecido)
  | "closed";                  // Caso encerrado

// ==========================================
// TIPOS DE EVENTOS DA TIMELINE
// ==========================================

export type TimelineEventType =
  | "agreement_created"
  | "agreement_updated"
  | "invitation_sent"
  | "client_confirmed"
  | "client_contested"
  | "deadline_extension_requested"
  | "deadline_extension_accepted"
  | "deadline_extension_counter_proposed"
  | "deadline_extension_rejected"
  | "amendment_created"
  | "amendment_accepted"
  | "amendment_adjustment_requested"
  | "amendment_rejected"
  | "charge_created"
  | "charge_paid"
  | "charge_contested"
  | "notice_sent"
  | "notice_responded"
  | "dispute_opened"
  | "case_closed";

// ==========================================
// TIPOS DE ATOR
// ==========================================

export type ActorType = "freelancer" | "client" | "system";

// ==========================================
// INTERFACE DE EVENTO DA TIMELINE
// ==========================================

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  actorType: ActorType;
  actorName: string;
  actorId?: string;
  createdAt: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

// ==========================================
// INTERFACE DO ACORDO
// ==========================================

export interface Agreement {
  id: string;
  title: string;
  freelancerId: string;
  freelancerName: string;
  clientName: string;
  clientEmail: string;
  clientDocument?: string;
  serviceType: string;
  description: string;
  value: string;
  deadline: string;
  terms: string;
  status: AgreementStatus;
  protocol: string;
  hash?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

// ==========================================
// AÇÕES POSSÍVEIS
// ==========================================

export type FreelancerAction =
  | "edit_agreement"
  | "send_invitation"
  | "request_deadline_extension"
  | "create_amendment"
  | "create_charge"
  | "send_notice"
  | "close_case"
  | "view_history";

export type ClientAction =
  | "confirm_agreement"
  | "contest_agreement"
  | "accept_deadline_extension"
  | "counter_propose_deadline"
  | "reject_deadline_extension"
  | "accept_amendment"
  | "request_amendment_adjustment"
  | "reject_amendment"
  | "report_payment"
  | "contest_charge"
  | "respond_notice"
  | "not_recognize"
  | "view_history";

// ==========================================
// PERMISSÕES POR ESTADO
// ==========================================

export interface StatePermissions {
  freelancer: FreelancerAction[];
  client: ClientAction[];
  blocked: string[]; // Descrição do que está bloqueado
  statusLabel: string;
  statusColor: string;
  description: string;
}