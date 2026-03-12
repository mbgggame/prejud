/**
 * ADAPTER: agreementService.ts -> firebaseAgreementService.ts
 * 
 * Mantém compatibilidade 100% com hooks/useAgreement.ts
 * NÃO ALTERAR hooks/useAgreement.ts
 */

import {
  getAgreementById,
  getAgreementEvents,
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
} from './firebaseAgreementService';

import type {
  Agreement,
  AgreementEvent,
  DeadlineExtensionRequest,
  Amendment,
  Charge,
  Notice
} from '@/types/agreement';

// ==================== INTERFACE COMPATÍVEL COM MOCK ORIGINAL ====================

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
 * Solicita prorrogação de prazo
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitDeadlineExtension(
  data: Omit<DeadlineExtensionRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<DeadlineExtensionRequest> {
  return requestDeadlineExtension(data);
}

/**
 * Cria termo aditivo
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitAmendment(
  data: Omit<Amendment, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Amendment> {
  return createAmendment(data);
}

/**
 * Cria cobrança
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitCharge(
  data: Omit<Charge, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Charge> {
  return createCharge(data);
}

/**
 * Envia notificação
 * Compatível com: hooks/useAgreement.ts
 */
export async function submitNotice(
  data: Omit<Notice, 'id' | 'createdAt' | 'sentAt' | 'status'>
): Promise<Notice> {
  return sendNotice(data);
}

// ==================== FUNÇÕES ADICIONAIS (Firestore) ====================

export {
  // Funções principais
  getAgreementById,
  getAgreementEvents,
  requestDeadlineExtension,
  createAmendment,
  createCharge,
  sendNotice,
  reviewDeadlineExtension,
  
  // Funções auxiliares
  getDeadlineExtensions,
  getAmendments,
  getCharges,
  getNotices,
  approveAmendment,
  payCharge,
  getAgreementsByUser,
  getAgreementStats
};

// Re-exportar tipos
export type {
  Agreement,
  AgreementEvent,
  DeadlineExtensionRequest,
  Amendment,
  Charge,
  Notice
};
