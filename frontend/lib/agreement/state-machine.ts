// ==========================================
// MAQUINA DE ESTADOS DO ACORDO - PREJUD
// ==========================================

import { 
  AgreementStatus, 
  StatePermissions, 
  FreelancerAction, 
  ClientAction,
  TimelineEventType 
} from "@/types/agreement";

// ==========================================
// DEFINICAO DE TODOS OS ESTADOS E PERMISSOES
// ==========================================

export const agreementStateMachine: Record<AgreementStatus, StatePermissions> = {
  
  // ==========================================
  // 1. RASCUNHO
  // ==========================================
  draft: {
    freelancer: ["edit_agreement", "send_invitation"],
    client: [],
    blocked: [
      "Cobranca so pode ser criada apos confirmacao do acordo",
      "Notificacao so pode ser emitida com base formalizada",
      "Prorrogacao so disponivel apos confirmacao",
      "Aditivo so disponivel apos confirmacao"
    ],
    statusLabel: "Rascunho",
    statusColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    description: "Acordo em edicao. Envie o convite quando estiver pronto."
  },

  // ==========================================
  // 2. AGUARDANDO CONFIRMACAO
  // ==========================================
  pending_client_confirmation: {
    freelancer: ["view_history"],
    client: ["confirm_agreement", "contest_agreement", "not_recognize"],
    blocked: [
      "Cobranca bloqueada ate confirmacao",
      "Notificacao bloqueada ate confirmacao",
      "Prorrogacao bloqueada ate confirmacao",
      "Aditivo bloqueado ate confirmacao",
      "Edicao bloqueada - aguardando resposta do cliente"
    ],
    statusLabel: "Aguardando Confirmacao",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Convite enviado ao cliente. Aguardando resposta."
  },

  // ==========================================
  // 3. ATIVO (CONFIRMADO)
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
      "Nenhuma acao bloqueada - acordo ativo"
    ],
    statusLabel: "Confirmado",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Acordo ativo. Todas as acoes disponiveis."
  },

  // ==========================================
  // 4. EM DISPUTA
  // ==========================================
  in_dispute: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "Cobranca bloqueada - acordo em disputa",
      "Notificacao bloqueada - resolver disputa primeiro",
      "Prorrogacao bloqueada - resolver disputa primeiro",
      "Aditivo bloqueado - resolver disputa primeiro"
    ],
    statusLabel: "Em Disputa",
    statusColor: "bg-red-500/20 text-red-400 border-red-500/30",
    description: "Caso em disputa. Aguardando resolucao."
  },

  // ==========================================
  // 5. PRORROGACAO PENDENTE
  // ==========================================
  deadline_extension_pending: {
    freelancer: ["view_history"],
    client: [
      "accept_deadline_extension",
      "counter_propose_deadline",
      "reject_deadline_extension"
    ],
    blocked: [
      "Nova prorrogacao bloqueada - ja existe uma pendente",
      "Novo aditivo bloqueado - resolver prorrogacao primeiro",
      "Cobranca automatica bloqueada - aguardando resposta",
      "Notificacao automatica bloqueada - aguardando resposta"
    ],
    statusLabel: "Prorrogacao Pendente",
    statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Aguardando resposta do cliente sobre prorrogacao."
  },

  // ==========================================
  // 6. ADITIVO PENDENTE
  // ==========================================
  amendment_pending: {
    freelancer: ["view_history"],
    client: [
      "accept_amendment",
      "request_amendment_adjustment",
      "reject_amendment"
    ],
    blocked: [
      "Nova prorrogacao bloqueada - resolver aditivo primeiro",
      "Novo aditivo bloqueado - ja existe um pendente",
      "Cobranca automatica bloqueada - aguardando resposta",
      "Notificacao automatica bloqueada - aguardando resposta"
    ],
    statusLabel: "Aditivo Pendente",
    statusColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "Aguardando resposta do cliente sobre aditivo."
  },

  // ==========================================
  // 7. COBRANCA PENDENTE
  // ==========================================
  charge_open: {
    freelancer: ["send_notice", "view_history"],
    client: ["report_payment", "contest_charge"],
    blocked: [
      "Nova cobranca bloqueada - ja existe cobranca aberta"
    ],
    statusLabel: "Cobranca em Aberto",
    statusColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Cobranca aguardando pagamento ou resposta."
  },

  // ==========================================
  // 8. REJEITADO
  // ==========================================
  rejected: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS ACOES BLOQUEADAS - Acordo rejeitado",
      "Cobranca bloqueada",
      "Notificacao bloqueada",
      "Prorrogacao bloqueada",
      "Aditivo bloqueado",
      "Edicao bloqueada"
    ],
    statusLabel: "Rejeitado",
    statusColor: "bg-red-500/10 text-red-400 border-red-500/20",
    description: "Acordo rejeitado pelo cliente. Apenas consulta disponivel."
  },

  // ==========================================
  // 9. CONTESTADO
  // ==========================================
  contested: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS ACOES BLOQUEADAS - Acordo contestado",
      "Cobranca bloqueada",
      "Notificacao bloqueada",
      "Prorrogacao bloqueada",
      "Aditivo bloqueado",
      "Edicao bloqueada"
    ],
    statusLabel: "Contestado",
    statusColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Acordo contestado. Apenas consulta disponivel."
  },

  // ==========================================
  // 10. EM AJUSTE
  // ==========================================
  in_adjustment: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS ACOES BLOQUEADAS - Acordo em ajuste",
      "Cobranca bloqueada",
      "Notificacao bloqueada",
      "Prorrogacao bloqueada",
      "Aditivo bloqueado",
      "Edicao bloqueada"
    ],
    statusLabel: "Em Ajuste",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Acordo em ajuste. Apenas consulta disponivel."
  },

  // ==========================================
  // 11. COBRANCA CONTESTADA
  // ==========================================
  charge_contested: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS ACOES BLOQUEADAS - Cobranca contestada",
      "Nova cobranca bloqueada",
      "Notificacao bloqueada",
      "Prorrogacao bloqueada",
      "Aditivo bloqueado",
      "Edicao bloqueada"
    ],
    statusLabel: "Cobranca Contestada",
    statusColor: "bg-red-600/10 text-red-500 border-red-600/20",
    description: "Cobranca contestada. Apenas consulta disponivel."
  },

  // ==========================================
  // 12. NOTIFICACAO ENVIADA
  // ==========================================
  notice_sent: {
    freelancer: ["view_history"],
    client: ["view_history", "respond_notice"],
    blocked: [
      "Nova notificacao bloqueada - aguardando resposta",
      "Cobranca bloqueada",
      "Prorrogacao bloqueada",
      "Aditivo bloqueado",
      "Edicao bloqueada"
    ],
    statusLabel: "Notificacao Enviada",
    statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Notificacao enviada. Aguardando resposta do cliente."
  },

  // ==========================================
  // 13. ENCERRADO
  // ==========================================
  closed: {
    freelancer: ["view_history"],
    client: ["view_history"],
    blocked: [
      "TODAS AS ACOES BLOQUEADAS - Caso encerrado",
      "Cobranca bloqueada",
      "Notificacao bloqueada",
      "Prorrogacao bloqueada",
      "Aditivo bloqueado",
      "Edicao bloqueada"
    ],
    statusLabel: "Encerrado",
    statusColor: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    description: "Caso encerrado. Apenas consulta disponivel."
  }
};

// ==========================================
// FUNCOES AUXILIARES
// ==========================================

export function canFreelancerAction(status: AgreementStatus, action: FreelancerAction): boolean {
  return agreementStateMachine[status].freelancer.includes(action);
}

export function canClientAction(status: AgreementStatus, action: ClientAction): boolean {
  return agreementStateMachine[status].client.includes(action);
}

export function getBlockedActions(status: AgreementStatus): string[] {
  return agreementStateMachine[status].blocked;
}

export function getStatusLabel(status: AgreementStatus): string {
  return agreementStateMachine[status].statusLabel;
}

export function getStatusColorClasses(status: AgreementStatus): string {
  return agreementStateMachine[status].statusColor;
}

export function getStatusDescription(status: AgreementStatus): string {
  return agreementStateMachine[status].description;
}

// ==========================================
// TRANSICOES VALIDAS DE ESTADO
// ==========================================

export interface StateTransition {
  from: AgreementStatus;
  to: AgreementStatus;
  action: string;
  actor: "freelancer" | "client" | "system";
  eventType: TimelineEventType;
}

export const validTransitions: StateTransition[] = [
  { from: "draft", to: "pending_client_confirmation", action: "send_invitation", actor: "freelancer", eventType: "invitation_sent" },
  { from: "pending_client_confirmation", to: "confirmed", action: "confirm_agreement", actor: "client", eventType: "client_confirmed" },
  { from: "pending_client_confirmation", to: "in_dispute", action: "contest_agreement", actor: "client", eventType: "client_contested" },
  { from: "pending_client_confirmation", to: "in_dispute", action: "not_recognize", actor: "client", eventType: "dispute_opened" },
  { from: "in_dispute", to: "confirmed", action: "start_adjustment", actor: "freelancer", eventType: "agreement_updated" },
  { from: "confirmed", to: "deadline_extension_pending", action: "request_deadline_extension", actor: "freelancer", eventType: "deadline_extension_requested" },
  { from: "deadline_extension_pending", to: "confirmed", action: "accept_deadline_extension", actor: "client", eventType: "deadline_extension_accepted" },
  { from: "deadline_extension_pending", to: "deadline_extension_pending", action: "counter_propose_deadline", actor: "client", eventType: "deadline_extension_counter_proposed" },
  { from: "deadline_extension_pending", to: "in_dispute", action: "reject_deadline_extension", actor: "client", eventType: "deadline_extension_rejected" },
  { from: "confirmed", to: "amendment_pending", action: "create_amendment", actor: "freelancer", eventType: "amendment_created" },
  { from: "amendment_pending", to: "confirmed", action: "accept_amendment", actor: "client", eventType: "amendment_accepted" },
  { from: "amendment_pending", to: "in_dispute", action: "request_amendment_adjustment", actor: "client", eventType: "amendment_adjustment_requested" },
  { from: "amendment_pending", to: "in_dispute", action: "reject_amendment", actor: "client", eventType: "amendment_rejected" },
  { from: "confirmed", to: "charge_open", action: "create_charge", actor: "freelancer", eventType: "charge_created" },
  { from: "charge_open", to: "closed", action: "report_payment", actor: "client", eventType: "charge_paid" },
  { from: "charge_open", to: "in_dispute", action: "contest_charge", actor: "client", eventType: "charge_contested" },
  { from: "confirmed", to: "confirmed", action: "send_notice", actor: "freelancer", eventType: "notice_sent" },
  { from: "charge_open", to: "confirmed", action: "send_notice", actor: "freelancer", eventType: "notice_sent" },
  { from: "in_dispute", to: "confirmed", action: "send_notice", actor: "freelancer", eventType: "notice_sent" },
  { from: "confirmed", to: "confirmed", action: "respond_notice", actor: "client", eventType: "notice_responded" },
  { from: "confirmed", to: "closed", action: "close_case", actor: "freelancer", eventType: "case_closed" }
];

export function isValidTransition(from: AgreementStatus, to: AgreementStatus, actor: "freelancer" | "client"): boolean {
  return validTransitions.some(t => t.from === from && t.to === to && t.actor === actor);
}

export function getPossibleTransitions(status: AgreementStatus, actor: "freelancer" | "client"): StateTransition[] {
  return validTransitions.filter(t => t.from === status && t.actor === actor);
}