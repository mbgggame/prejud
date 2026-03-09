// ==========================================
// MÁQUINA DE ESTADOS DO ACORDO - PREJUD
// ==========================================

import { 
  AgreementStatus, 
  StatePermissions, 
  FreelancerAction, 
  ClientAction,
  TimelineEventType 
} from "@/types/agreement";

// ==========================================
// DEFINIÇÃO DE TODOS OS ESTADOS E PERMISSÕES
// ==========================================

export const agreementStateMachine: Record<AgreementStatus, StatePermissions> = {
  
  // ==========================================
  // 1. RASCUNHO
  // ==========================================
  draft: {
    freelancer: ["edit_agreement", "send_invitation"],
    client: [],
    blocked: [
      "Cobrança só pode ser criada após confirmação do acordo",
      "Notificação só pode ser emitida com base formalizada",
      "Prorrogação só disponível após confirmação",
      "Aditivo só disponível após confirmação"
    ],
    statusLabel: "Rascunho",
    statusColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    description: "Acordo em edição. Envie o convite quando estiver pronto."
  },

  // ==========================================
  // 2. AGUARDANDO CONFIRMAÇÃO
  // ==========================================
  pending_confirmation: {
    freelancer: ["view_history"],
    client: ["confirm_agreement", "contest_agreement", "not_recognize"],
    blocked: [
      "Cobrança bloqueada até confirmação",
      "Notificação bloqueada até confirmação",
      "Prorrogação bloqueada até confirmação",
      "Aditivo bloqueado até confirmação",
      "Edição bloqueada - aguardando resposta do cliente"
    ],
    statusLabel: "Aguardando Confirmação",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Convite enviado ao cliente. Aguardando resposta."
  },

  // ==========================================
  // 3. CONFIRMADO (ESTADO BASE ATIVO)
  // ==========================================
  confirmed: {
    freelancer: [
      "request_deadline_extension",
      "create_amendment",
      "create_charge",
      "send_notice",
      "close_case",
      "view_history"
    ],
    client: ["view_history"],
    blocked: [
      "Nenhuma ação bloqueada - acordo ativo"
    ],
    statusLabel: "Confirmado",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Acordo ativo. Todas as ações disponíveis."
  },

  // ==========================================
  // 4. CONTESTADO
  // ==========================================
  contested: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "Cobrança bloqueada - acordo contestado",
      "Notificação bloqueada - resolver contestação primeiro",
      "Prorrogação bloqueada - resolver contestação primeiro",
      "Aditivo bloqueado - resolver contestação primeiro"
    ],
    statusLabel: "Contestado",
    statusColor: "bg-red-500/10 text-red-400 border-red-500/20",
    description: "Cliente contestou o acordo. Necessário ajuste."
  },

  // ==========================================
  // 5. EM AJUSTE
  // ==========================================
  in_adjustment: {
    freelancer: ["edit_agreement", "send_invitation"],
    client: ["view_history"],
    blocked: [
      "Cobrança bloqueada durante ajuste",
      "Notificação bloqueada durante ajuste"
    ],
    statusLabel: "Em Ajuste",
    statusColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Acordo sendo ajustado após contestação."
  },

  // ==========================================
  // 6. PRORROGAÇÃO PENDENTE
  // ==========================================
  deadline_extension_pending: {
    freelancer: ["view_history"],
    client: [
      "accept_deadline_extension",
      "counter_propose_deadline",
      "reject_deadline_extension"
    ],
    blocked: [
      "Nova prorrogação bloqueada - já existe uma pendente",
      "Novo aditivo bloqueado - resolver prorrogação primeiro",
      "Cobrança automática bloqueada - aguardando resposta",
      "Notificação automática bloqueada - aguardando resposta"
    ],
    statusLabel: "Prorrogação Pendente",
    statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Aguardando resposta do cliente sobre prorrogação."
  },

  // ==========================================
  // 7. ADITIVO PENDENTE
  // ==========================================
  amendment_pending: {
    freelancer: ["view_history"],
    client: [
      "accept_amendment",
      "request_amendment_adjustment",
      "reject_amendment"
    ],
    blocked: [
      "Nova prorrogação bloqueada - resolver aditivo primeiro",
      "Novo aditivo bloqueado - já existe um pendente",
      "Cobrança automática bloqueada - aguardando resposta",
      "Notificação automática bloqueada - aguardando resposta"
    ],
    statusLabel: "Aditivo Pendente",
    statusColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "Aguardando resposta do cliente sobre aditivo."
  },

  // ==========================================
  // 8. COBRANÇA ABERTA
  // ==========================================
  charge_open: {
    freelancer: ["send_notice", "view_history"],
    client: ["report_payment", "contest_charge"],
    blocked: [
      "Nova cobrança bloqueada - já existe cobrança aberta"
    ],
    statusLabel: "Cobrança em Aberto",
    statusColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Cobrança aguardando pagamento ou resposta."
  },

  // ==========================================
  // 9. COBRANÇA CONTESTADA
  // ==========================================
  charge_contested: {
    freelancer: ["send_notice", "view_history"],
    client: ["view_history"],
    blocked: [
      "Nova cobrança bloqueada - resolver contestação primeiro",
      "Prorrogação bloqueada - resolver contestação primeiro"
    ],
    statusLabel: "Cobrança Contestada",
    statusColor: "bg-red-500/10 text-red-400 border-red-500/20",
    description: "Cliente contestou a cobrança. Aguardando resolução."
  },

  // ==========================================
  // 10. NOTIFICAÇÃO ENVIADA
  // ==========================================
  notice_sent: {
    freelancer: ["view_history"],
    client: ["respond_notice"],
    blocked: [
      "Nova notificação bloqueada - aguardando resposta da notificação atual"
    ],
    statusLabel: "Notificação Enviada",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Notificação formal enviada. Aguardando resposta."
  },

  // ==========================================
  // 11. EM DISPUTA (NÃO RECONHECIDO)
  // ==========================================
  in_dispute: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS AÇÕES BLOQUEADAS - Caso em disputa",
      "Cobrança bloqueada",
      "Notificação bloqueada",
      "Prorrogação bloqueada",
      "Aditivo bloqueado"
    ],
    statusLabel: "Em Disputa",
    statusColor: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Cliente não reconhece o acordo. Caso em revisão."
  },

  // ==========================================
  // 12. ENCERRADO
  // ==========================================
  closed: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS AÇÕES BLOQUEADAS - Caso encerrado",
      "Cobrança bloqueada",
      "Notificação bloqueada",
      "Prorrogação bloqueada",
      "Aditivo bloqueado",
      "Edição bloqueada"
    ],
    statusLabel: "Encerrado",
    statusColor: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    description: "Caso encerrado. Apenas consulta disponível."
  }
};

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

/**
 * Verifica se uma ação é permitida para o freelancer no estado atual
 */
export function canFreelancerAction(
  status: AgreementStatus, 
  action: FreelancerAction
): boolean {
  const state = agreementStateMachine[status];
  return state.freelancer.includes(action);
}

/**
 * Verifica se uma ação é permitida para o cliente no estado atual
 */
export function canClientAction(
  status: AgreementStatus, 
  action: ClientAction
): boolean {
  const state = agreementStateMachine[status];
  return state.client.includes(action);
}

/**
 * Retorna a lista de bloqueios do estado atual
 */
export function getBlockedActions(status: AgreementStatus): string[] {
  return agreementStateMachine[status].blocked;
}

/**
 * Retorna o label amigável do status
 */
export function getStatusLabel(status: AgreementStatus): string {
  return agreementStateMachine[status].statusLabel;
}

/**
 * Retorna as classes de cor do status
 */
export function getStatusColorClasses(status: AgreementStatus): string {
  return agreementStateMachine[status].statusColor;
}

/**
 * Retorna a descrição do status
 */
export function getStatusDescription(status: AgreementStatus): string {
  return agreementStateMachine[status].description;
}

// ==========================================
// TRANSIÇÕES VÁLidas DE ESTADO
// ==========================================

export interface StateTransition {
  from: AgreementStatus;
  to: AgreementStatus;
  action: string;
  actor: "freelancer" | "client" | "system";
  eventType: TimelineEventType;
}

export const validTransitions: StateTransition[] = [
  // Criação e envio
  { from: "draft", to: "pending_confirmation", action: "send_invitation", actor: "freelancer", eventType: "invitation_sent" },
  
  // Respostas do cliente (confirmação inicial)
  { from: "pending_confirmation", to: "confirmed", action: "confirm_agreement", actor: "client", eventType: "client_confirmed" },
  { from: "pending_confirmation", to: "contested", action: "contest_agreement", actor: "client", eventType: "client_contested" },
  { from: "pending_confirmation", to: "in_dispute", action: "not_recognize", actor: "client", eventType: "dispute_opened" },
  
  // Ajuste após contestação
  { from: "contested", to: "in_adjustment", action: "start_adjustment", actor: "freelancer", eventType: "agreement_updated" },
  { from: "in_adjustment", to: "pending_confirmation", action: "send_invitation", actor: "freelancer", eventType: "invitation_sent" },
  
  // Prorrogação de prazo
  { from: "confirmed", to: "deadline_extension_pending", action: "request_deadline_extension", actor: "freelancer", eventType: "deadline_extension_requested" },
  { from: "deadline_extension_pending", to: "confirmed", action: "accept_deadline_extension", actor: "client", eventType: "deadline_extension_accepted" },
  { from: "deadline_extension_pending", to: "deadline_extension_pending", action: "counter_propose_deadline", actor: "client", eventType: "deadline_extension_counter_proposed" },
  { from: "deadline_extension_pending", to: "in_adjustment", action: "reject_deadline_extension", actor: "client", eventType: "deadline_extension_rejected" },
  
  // Aditivo
  { from: "confirmed", to: "amendment_pending", action: "create_amendment", actor: "freelancer", eventType: "amendment_created" },
  { from: "amendment_pending", to: "confirmed", action: "accept_amendment", actor: "client", eventType: "amendment_accepted" },
  { from: "amendment_pending", to: "in_adjustment", action: "request_amendment_adjustment", actor: "client", eventType: "amendment_adjustment_requested" },
  { from: "amendment_pending", to: "in_adjustment", action: "reject_amendment", actor: "client", eventType: "amendment_rejected" },
  
  // Cobrança
  { from: "confirmed", to: "charge_open", action: "create_charge", actor: "freelancer", eventType: "charge_created" },
  { from: "charge_open", to: "confirmed", action: "report_payment", actor: "client", eventType: "charge_paid" },
  { from: "charge_open", to: "charge_contested", action: "contest_charge", actor: "client", eventType: "charge_contested" },
  
  // Notificação
  { from: "confirmed", to: "notice_sent", action: "send_notice", actor: "freelancer", eventType: "notice_sent" },
  { from: "charge_open", to: "notice_sent", action: "send_notice", actor: "freelancer", eventType: "notice_sent" },
  { from: "charge_contested", to: "notice_sent", action: "send_notice", actor: "freelancer", eventType: "notice_sent" },
  { from: "notice_sent", to: "confirmed", action: "respond_notice", actor: "client", eventType: "notice_responded" },
  
  // Encerramento
  { from: "confirmed", to: "closed", action: "close_case", actor: "freelancer", eventType: "case_closed" }
];

/**
 * Verifica se uma transição de estado é válida
 */
export function isValidTransition(
  from: AgreementStatus,
  to: AgreementStatus,
  actor: "freelancer" | "client"
): boolean {
  return validTransitions.some(
    t => t.from === from && t.to === to && t.actor === actor
  );
}

/**
 * Retorna as transições possíveis a partir de um estado
 */
export function getPossibleTransitions(
  status: AgreementStatus,
  actor: "freelancer" | "client"
): StateTransition[] {
  return validTransitions.filter(
    t => t.from === status && t.actor === actor
  );
}