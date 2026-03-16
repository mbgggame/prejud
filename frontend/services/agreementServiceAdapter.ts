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
  getAgreementsByUser,
  getAgreementStats,
  processPublicAgreementConfirmation
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
 * CompatÃ­vel com: hooks/useAgreement.ts
 */
export async function fetchAgreement(id: string): Promise<Agreement | null> {
  return getAgreementById(id);
}

/**
 * Busca eventos da timeline
 * CompatÃ­vel com: hooks/useAgreement.ts
 */
export async function fetchAgreementEvents(agreementId: string): Promise<TimelineEvent[]> {
  return getAgreementEvents(agreementId);
}

/**
 * Cria acordo
 * CompatÃ­vel com fluxo de formalizaÃ§Ã£o
 */
export async function submitAgreement(
  data: Omit<Agreement, "id" | "createdAt" | "updatedAt" | "timeline" | "protocol">
): Promise<Agreement> {
  return createAgreement(data);
}

/**
 * Solicita prorrogaÃ§Ã£o de prazo
 * CompatÃ­vel com: hooks/useAgreement.ts
 */
export async function submitDeadlineExtension(
  data: Omit<DeadlineExtension, "id" | "createdAt" | "updatedAt" | "status">
): Promise<DeadlineExtension> {
  return requestDeadlineExtension(data);
}

/**
 * Cria termo aditivo
 * CompatÃ­vel com: hooks/useAgreement.ts
 */
export async function submitAmendment(
  data: Omit<Amendment, "id" | "createdAt" | "updatedAt" | "status">
): Promise<Amendment> {
  return createAmendment(data);
}

/**
 * Cria cobranÃ§a
 * CompatÃ­vel com: hooks/useAgreement.ts
 */
export async function submitCharge(
  data: Omit<Charge, "id" | "createdAt" | "updatedAt" | "status">
): Promise<Charge> {
  return createCharge(data);
}

/**
 * Envia notificaÃ§Ã£o
 * CompatÃ­vel com: hooks/useAgreement.ts
 */
export async function submitNotice(
  data: Omit<Notice, "id" | "createdAt" | "sentAt" | "status">
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
  getAgreementsByUser,
  getAgreementStats,
  processPublicAgreementConfirmation,
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
  getAgreementsByUser,
  getAgreementStats,
  processPublicAgreementConfirmation,
};

export default agreementService;

