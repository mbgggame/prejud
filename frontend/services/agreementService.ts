/**
 * Service agreementService.ts - PreJud SaaS
 * Orquestracao de operacoes do Agreement
 */

import { Agreement, CreateAgreementDTO, AgreementStatus } from '@/types/agreement';
import { generateHashSync } from '@/lib/crypto/hash';

// Mock de dados em memoria (substituir por Firestore)
const agreements: Map<string, Agreement> = new Map();

export const agreementService = {
  /**
   * Cria novo acordo com hash genesis
   */
  create: async (data: CreateAgreementDTO): Promise<Agreement> => {
    const id = `agr_${Date.now()}`;
    const protocol = `PJD-${Date.now().toString(36).toUpperCase()}`;

    const agreement: Agreement = {
      id,
      ...data,
      status: 'draft',
      protocol,
      hash: generateHashSync({ ...data, protocol, createdAt: new Date() }),
      timeline: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    agreements.set(id, agreement);
    return agreement;
  },

  /**
   * Busca acordo por ID
   */
  getById: async (id: string): Promise<Agreement> => {
    const agreement = agreements.get(id);
    if (!agreement) throw new Error('Acordo nao encontrado');
    return agreement;
  },

  /**
   * Envia convite ao cliente (transicao para pending_client_confirmation)
   */
  sendInvitation: async (id: string, clientEmail: string): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = 'pending_client_confirmation';
    agreement.updatedAt = new Date();
    // Aqui viria envio real de email
  },

  /**
   * Confirma acordo pelo cliente
   */
  confirm: async (id: string, clientId: string): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.clientId = clientId;
    agreement.status = 'confirmed';
    agreement.updatedAt = new Date();
  },

  /**
   * Contesta acordo
   */
  contest: async (id: string, reason: string): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = 'in_dispute';
    agreement.updatedAt = new Date();
  },

  /**
   * Solicita prorrogacao de prazo
   */
  requestExtension: async (id: string, newDate: Date): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = 'deadline_extension_pending';
    agreement.updatedAt = new Date();
  },

  /**
   * Cria aditivo ao acordo
   */
  createAmendment: async (id: string, data: { description: string; valueChange: number }): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = 'amendment_pending';
    agreement.updatedAt = new Date();
  },

  /**
   * Gera cobranca
   */
  createCharge: async (id: string, amount: number): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = 'charge_open';
    agreement.updatedAt = new Date();
  },

  /**
   * Atualiza status do acordo (integracao com timeline)
   */
  updateStatus: async (id: string, newStatus: AgreementStatus, reason?: string): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = newStatus;
    agreement.updatedAt = new Date();
    // Recalcula hash apos mudanca
    agreement.hash = generateHashSync({ 
      id: agreement.id, 
      status: newStatus, 
      updatedAt: agreement.updatedAt 
    });
  },

  /**
   * Encerra caso
   */
  close: async (id: string): Promise<void> => {
    const agreement = await agreementService.getById(id);
    agreement.status = 'closed';
    agreement.updatedAt = new Date();
  }
};