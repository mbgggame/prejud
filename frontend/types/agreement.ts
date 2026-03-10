/**
 * TYPES/AGREEMENT.TS
 * 
 * Fonte unica de verdade do dominio Agreement no PreJud.
 */

// ============================================================================
// STATUS DO ACORDO
// ============================================================================

export type AgreementStatus =
  | "draft"
  | "pending_confirmation"
  | "confirmed"
  | "contested"
  | "in_adjustment"
  | "deadline_extension_pending"
  | "amendment_pending"
  | "charge_open"
  | "charge_contested"
  | "notice_sent"
  | "in_dispute"
  | "closed";

// ============================================================================
// TIPOS DE EVENTOS DA TIMELINE
// ============================================================================

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

// ============================================================================
// TIPOS DE ATOR
// ============================================================================

export type ActorType = "freelancer" | "client" | "system";

// ============================================================================
// INTERFACE DE EVENTO DA TIMELINE
// ============================================================================

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

// ============================================================================
// INTERFACE DO ACORDO
// ============================================================================

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

// ============================================================================
// ACOES POSSIVEIS
// ============================================================================

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

// ============================================================================
// PERMISSOES POR ESTADO
// ============================================================================

export interface StatePermissions {
  freelancer: FreelancerAction[];
  client: ClientAction[];
  blocked: string[];
  statusLabel: string;
  statusColor: string;
  description: string;
}

// ============================================================================
// PRORROGACAO DE PRAZO
// ============================================================================

export type DeadlineExtensionStatus = "pending" | "accepted" | "rejected" | "counter_proposed";

export interface DeadlineExtension {
  id: string;
  agreementId: string;
  requestedBy: "freelancer" | "client";
  requesterId: string;
  oldDeadline: string;
  proposedDeadline: string;
  reason: string;
  status: DeadlineExtensionStatus;
  requestedAt: string;
  respondedAt?: string;
  responseNote?: string;
  counterProposalDeadline?: string;
}

export interface CreateDeadlineExtensionDTO {
  agreementId: string;
  proposedDeadline: string;
  reason: string;
}

// ============================================================================
// ADITIVO
// ============================================================================

export type AmendmentStatus = "pending" | "accepted" | "rejected" | "adjustment_requested";

export interface Amendment {
  id: string;
  agreementId: string;
  description: string;
  changes: {
    value?: string;
    deadline?: string;
    terms?: string;
    serviceType?: string;
  };
  createdAt: string;
  createdBy: "freelancer" | "client";
  creatorId: string;
  status: AmendmentStatus;
  acceptedAt?: string;
  adjustmentNote?: string;
}

export interface CreateAmendmentDTO {
  agreementId: string;
  description: string;
  changes: {
    value?: string;
    deadline?: string;
    terms?: string;
    serviceType?: string;
  };
}

// ============================================================================
// COBRANCA
// ============================================================================

export type ChargeStatus = "pending" | "paid" | "contested" | "cancelled";
export type PaymentMethod = "boleto" | "pix" | "credit_card" | "bank_transfer";

export interface Charge {
  id: string;
  agreementId: string;
  amount: number;
  description: string;
  dueDate: string;
  status: ChargeStatus;
  createdAt: string;
  createdBy: string;
  paidAt?: string;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentProof?: string;
  contestReason?: string;
  externalTransactionId?: string;
}

export interface CreateChargeDTO {
  agreementId: string;
  amount: number;
  description: string;
  dueDate: string;
}

// ============================================================================
// NOTIFICACAO
// ============================================================================

export type NoticeType = "payment_demand" | "breach_warning" | "contract_termination" | "general";

export interface Notice {
  id: string;
  agreementId: string;
  type: NoticeType;
  title: string;
  content: string;
  sentBy: "freelancer" | "client";
  senderId: string;
  sentAt: string;
  readAt?: string;
  response?: string;
  respondedAt?: string;
}

export interface CreateNoticeDTO {
  agreementId: string;
  type: NoticeType;
  title: string;
  content: string;
}

// ============================================================================
// PROPS DE COMPONENTES
// ============================================================================

export interface AgreementStatusBadgeProps {
  status: AgreementStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface BlockedActionsListProps {
  status: AgreementStatus;
  showTitle?: boolean;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export interface TimelineEventItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

export interface AgreementActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  agreementId: string;
}

export interface ProrrogacaoModalProps extends AgreementActionModalProps {
  currentDeadline?: string;
}

export interface AditivoModalProps extends AgreementActionModalProps {
  currentValue?: string;
  currentDeadline?: string;
}

export interface CobrancaModalProps extends AgreementActionModalProps {
  defaultAmount?: number;
}

export interface NotificacaoModalProps extends AgreementActionModalProps {
  defaultType?: NoticeType;
}

// ============================================================================
// TIPOS PARA HOOKS
// ============================================================================

export interface UseAgreementPermissionsProps {
  status: AgreementStatus;
  userType: "freelancer" | "client";
}

// ============================================================================
// FILTROS E STATS
// ============================================================================

export interface AgreementFilters {
  status?: AgreementStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  freelancerId?: string;
}

export interface AgreementStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  inDispute: number;
  totalValue: number;
}
