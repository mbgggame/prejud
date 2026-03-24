/**
 * AGREEMENT SERVICE ADAPTER
 * Keeps compatibility with hooks/useAgreement.ts
 * Do not modify hooks/useAgreement.ts here.
 */

import {
  getAgreementById,
  getAgreementEvents,
  createAgreement,
  requestDeadlineExtension,
  createAmendment,
  createCharge,
  sendNotice,
  reviewDeadlineExtension,
  getDeadlineExtensions,
  getAmendments,
  getCharges,
  getNotices,
  approveAmendment,
  payCharge,
  getAgreementsByFreelancer,
  getAgreementStats,
} from "./firebaseAgreementService";

import type {
  Agreement,
  TimelineEvent,
  DeadlineExtension,
  Amendment,
  Charge,
  Notice
} from "@/types/agreement";

/**
 * Busca acordo por ID
 * Compatível com: hooks/useAgreement.ts
 */
export async function fetchAgreement(id: string): Promise<Agreement | null> {
  return getAgreementById(id);
}

/**
 * Busca eventos da timeline
 * Compatível com: hooks/useAgreement.ts
 */
export async function fetchAgreementEvents(agreementId: string): Promise<TimelineEvent[]> {
  return getAgreementEvents(agreementId);
}

/**
 * Cria acordo
 * Compatível com fluxo de formalização
 */
export async function submitAgreement(
  data: Omit<Agreement, "id" | "createdAt" | "updatedAt" | "timeline" | "protocol">
): Promise<Agreement> {
  return createAgreement(data);
}

/**
 * Solicita prorrogação de prazo
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitDeadlineExtension(
  data: Omit<DeadlineExtension, "id" | "createdAt" | "updatedAt" | "status">
): Promise<DeadlineExtension> {
  return requestDeadlineExtension(data);
}

/**
 * Cria termo aditivo
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitAmendment(
  data: Omit<Amendment, "id" | "createdAt" | "acceptedAt" | "status">
): Promise<Amendment> {
  return createAmendment(data);
}

/**
 * Cria cobrança
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitCharge(
  data: Omit<Charge, "id" | "createdAt" | "paidAt" | "status">
): Promise<Charge> {
  return createCharge(data);
}

/**
 * Envia notificação
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitNotice(
  data: Omit<Notice, "id" | "respondedAt" | "sentAt" | "readAt" | "response">
): Promise<Notice> {
  return sendNotice(data);
}

// Additional Firestore functions

export {
  getAgreementById,
  getAgreementEvents,
  createAgreement,
  requestDeadlineExtension,
  createAmendment,
  createCharge,
  sendNotice,
  reviewDeadlineExtension,
  getDeadlineExtensions,
  getAmendments,
  getCharges,
  getNotices,
  approveAmendment,
  payCharge,
  getAgreementsByFreelancer,
  getAgreementStats,
};

export type {
  Agreement,
  TimelineEvent,
  DeadlineExtension,
  Amendment,
  Charge,
  Notice
};

const agreementService = {
  fetchAgreement,
  fetchAgreementEvents,
  submitAgreement,
  submitDeadlineExtension,
  submitAmendment,
  submitCharge,
  submitNotice,
  getAgreementById,
  getAgreementEvents,
  createAgreement,
  requestDeadlineExtension,
  createAmendment,
  createCharge,
  sendNotice,
  reviewDeadlineExtension,
  getDeadlineExtensions,
  getAmendments,
  getCharges,
  getNotices,
  approveAmendment,
  payCharge,
  getAgreementsByFreelancer,
  getAgreementStats,
};

export default agreementService;