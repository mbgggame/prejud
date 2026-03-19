/**
 * Service agreementService.ts - PreJud SaaS
 * Orquestracao de operacoes do Agreement
 */

import { Agreement, CreateAgreementDTO, AgreementStatus } from '@/types/agreement';
import { generateHashSync } from '@/lib/crypto/hash';
import {
  createAgreement,
  getAgreementById,
  requestDeadlineExtension,
  createAmendment,
  createCharge,
  sendNotice,
  sendAgreementInvitationEmail
} from './firebaseAgreementService';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const COLLECTIONS = {
  AGREEMENTS: 'agreements'
};

export const agreementService = {
  /**
   * Cria novo acordo com hash genesis
   */
  create: createAgreement,

  /**
   * Busca acordo por ID
   */
  getById: async (id: string): Promise<Agreement> => {
    const agreement = await getAgreementById(id);
    if (!agreement) throw new Error('Acordo nao encontrado');
    return agreement;
  },

  /**
   * Envia convite ao cliente (transicao para pending_client_confirmation)
   */
  sendInvitation: async (id: string, clientEmail: string): Promise<void> => {
    const agreement = await getAgreementById(id);
    if (!agreement) throw new Error('Acordo nao encontrado');
    
    await sendAgreementInvitationEmail(
      clientEmail,
      agreement.clientName,
      agreement.freelancerName || 'Freelancer',
      agreement.title,
      agreement.protocol,
      `/p/${agreement.id}?t=${agreement.clientAccessToken}`
    );
    
    const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, id);
    await updateDoc(agreementRef, {
      status: 'pending_client_confirmation',
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Confirma acordo pelo cliente (transicao para active)
   */
  confirm: async (id: string, clientId: string): Promise<void> => {
    const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, id);
    await updateDoc(agreementRef, {
      status: 'active',
      clientId: clientId,
      formalizedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Contesta acordo (transicao para in_dispute)
   */
  contest: async (id: string, reason: string): Promise<void> => {
    const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, id);
    await updateDoc(agreementRef, {
      status: 'in_dispute',
      disputeReason: reason,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Solicita prorrogacao de prazo
   */
  requestExtension: async (id: string, newDate: Date): Promise<void> => {
    const agreement = await getAgreementById(id);
    if (!agreement) throw new Error('Acordo nao encontrado');
    
    await requestDeadlineExtension({
      agreementId: id,
      requestedBy: 'freelancer',
      requesterId: agreement.freelancerId,
      olddeadline: agreement.deadline,
      proposeddeadline: newDate,
      reason: 'Solicitacao de prorrogacao'
    });
  },

  /**
   * Cria termo aditivo
   */
  createAmendment: createAmendment,

  /**
   * Gera cobranca
   */
  createCharge: createCharge,

  /**
   * Envia notificacao formal
   */
  sendNotice: sendNotice,

  /**
   * Fecha acordo
   */
  close: async (id: string): Promise<void> => {
    const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, id);
    await updateDoc(agreementRef, {
      status: 'closed',
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Atualiza status do acordo
   */
  transitionStatus: async (id: string, newStatus: AgreementStatus): Promise<void> => {
    const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, id);
    await updateDoc(agreementRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }
};
