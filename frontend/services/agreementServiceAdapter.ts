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
  getAgreementStats
} from "./firebaseAgreementService";

import type {
  Agreement,
  AgreementEvent,
  DeadlineExtensionRequest,
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
export async function fetchAgreementEvents(agreementId: string): Promise<AgreementEvent[]> {
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
 * Solicita prorrogacao de prazo
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitDeadlineExtension(
  data: Omit<DeadlineExtensionRequest, "id" | "createdAt" | "updatedAt" | "status">
): Promise<DeadlineExtensionRequest> {
  return requestDeadlineExtension(data);
}

/**
 * Cria termo aditivo
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitAmendment(
  data: Omit<Amendment, "id" | "createdAt" | "updatedAt" | "status">
): Promise<Amendment> {
  return createAmendment(data);
}

/**
 * Cria cobranca
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitCharge(
  data: Omit<Charge, "id" | "createdAt" | "updatedAt" | "status">
): Promise<Charge> {
  return createCharge(data);
}

/**
 * Envia notificacao
 * Compatível com: hooks/useAgreement.ts
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
  getAgreementStats
};

export type {
  Agreement,
  AgreementEvent,
  DeadlineExtensionRequest,
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
  getAgreementStats
};

export default agreementService;