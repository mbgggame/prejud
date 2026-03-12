/**
 * AGREEMENT SERVICE - REDIRECIONAMENTO PARA FIREBASE
 * 
 * Arquivo original: agreementService.mock.backup.ts
 * 
 * Este arquivo agora exporta as funções do Firebase
 * mantendo 100% de compatibilidade com hooks/useAgreement.ts
 */

export {
  // Funções compatíveis com useAgreement
  fetchAgreement,
  fetchAgreementEvents,
  submitDeadlineExtension,
  submitAmendment,
  submitCharge,
  submitNotice,
  
  // Funções adicionais do Firestore
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
} from './agreementServiceAdapter';

export type {
  Agreement,
  AgreementEvent,
  DeadlineExtensionRequest,
  Amendment,
  Charge,
  Notice
} from '@/types/agreement';
