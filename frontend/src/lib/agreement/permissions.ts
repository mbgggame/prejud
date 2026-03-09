// ==========================================
// HOOK DE PERMISSÕES DO ACORDO
// ==========================================

import { useMemo } from "react";
import { 
  AgreementStatus, 
  FreelancerAction, 
  ClientAction 
} from "@/types/agreement";
import { 
  canFreelancerAction, 
  canClientAction, 
  getBlockedActions,
  getStatusLabel,
  getStatusColorClasses,
  getStatusDescription,
  getPossibleTransitions
} from "./state-machine";

// ==========================================
// HOOK PARA FREELANCER
// ==========================================

export function useFreelancerPermissions(status: AgreementStatus) {
  return useMemo(() => ({
    canEdit: canFreelancerAction(status, "edit_agreement"),
    canSendInvitation: canFreelancerAction(status, "send_invitation"),
    canRequestExtension: canFreelancerAction(status, "request_deadline_extension"),
    canCreateAmendment: canFreelancerAction(status, "create_amendment"),
    canCreateCharge: canFreelancerAction(status, "create_charge"),
    canSendNotice: canFreelancerAction(status, "send_notice"),
    canCloseCase: canFreelancerAction(status, "close_case"),
    canViewHistory: canFreelancerAction(status, "view_history"),
    blockedActions: getBlockedActions(status),
    statusLabel: getStatusLabel(status),
    statusColor: getStatusColorClasses(status),
    description: getStatusDescription(status),
    possibleTransitions: getPossibleTransitions(status, "freelancer")
  }), [status]);
}

// ==========================================
// HOOK PARA CLIENTE
// ==========================================

export function useClientPermissions(status: AgreementStatus) {
  return useMemo(() => ({
    canConfirm: canClientAction(status, "confirm_agreement"),
    canContest: canClientAction(status, "contest_agreement"),
    canAcceptExtension: canClientAction(status, "accept_deadline_extension"),
    canCounterPropose: canClientAction(status, "counter_propose_deadline"),
    canRejectExtension: canClientAction(status, "reject_deadline_extension"),
    canAcceptAmendment: canClientAction(status, "accept_amendment"),
    canRequestAdjustment: canClientAction(status, "request_amendment_adjustment"),
    canRejectAmendment: canClientAction(status, "reject_amendment"),
    canReportPayment: canClientAction(status, "report_payment"),
    canContestCharge: canClientAction(status, "contest_charge"),
    canRespondNotice: canClientAction(status, "respond_notice"),
    canNotRecognize: canClientAction(status, "not_recognize"),
    canViewHistory: canClientAction(status, "view_history"),
    blockedActions: getBlockedActions(status),
    statusLabel: getStatusLabel(status),
    statusColor: getStatusColorClasses(status),
    description: getStatusDescription(status),
    possibleTransitions: getPossibleTransitions(status, "client")
  }), [status]);
}

// ==========================================
// HOOK UNIFICADO (detecta perfil automaticamente)
// ==========================================

interface UseAgreementPermissionsProps {
  status: AgreementStatus;
  userType: "freelancer" | "client";
}

export function useAgreementPermissions({ 
  status, 
  userType 
}: UseAgreementPermissionsProps) {
  const freelancerPerms = useFreelancerPermissions(status);
  const clientPerms = useClientPermissions(status);

  return useMemo(() => ({
    isFreelancer: userType === "freelancer",
    isClient: userType === "client",
    permissions: userType === "freelancer" ? freelancerPerms : clientPerms,
    statusLabel: getStatusLabel(status),
    statusColor: getStatusColorClasses(status),
    description: getStatusDescription(status),
    blockedActions: getBlockedActions(status)
  }), [status, userType, freelancerPerms, clientPerms]);
}