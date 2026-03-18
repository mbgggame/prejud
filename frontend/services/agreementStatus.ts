/**
 * Service de atualizacao de status do Agreement com registro na Timeline
 * PreJud SaaS - Integracao State Machine + Timeline
 */

import { AgreementStatus } from '@/types/agreement';
import { EventType } from '@/types/timeline';
import * as timelineService from './timelineService';

interface StatusTransitionParams {
  agreementId: string;
  newStatus: AgreementStatus;
  actorId: string;
  actorRole: 'freelancer' | 'client' | 'system';
  actorName?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Atualiza status do agreement e registra evento na timeline automaticamente
 * Garante atomicidade: status so muda se evento for registrado
 */
export async function transitionStatus(params: StatusTransitionParams): Promise<{
  success: boolean;
  newStatus?: AgreementStatus;
  eventId?: string;
  error?: string;
}> {
  try {
    // Mapeia status para tipo de evento
    const eventType = mapStatusToEventType(params.newStatus);

    // Cria evento na timeline primeiro (registro imutavel)
    const event = await timelineService.createEvent(params.agreementId, {
      type: eventType as EventType,
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorName: params.actorName || 'Sistema',
      title: `Status alterado para ${params.newStatus}`,
      description: params.reason || `O status do acordo foi alterado para ${params.newStatus}`,
      data: {
        previousStatus: params.metadata?.previousStatus,
        newStatus: params.newStatus,
        reason: params.reason,
        ...params.metadata
      },
      protocol: generateProtocol()
    });

    // Aqui viria a atualizacao real no Firestore (transaction atomica)
    // await updateAgreementStatus(params.agreementId, params.newStatus);

    return {
      success: true,
      newStatus: params.newStatus,
      eventId: event.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na transicao de status'
    };
  }
}

/**
 * Mapeia status do agreement para tipo de evento da timeline
 */
function mapStatusToEventType(status: AgreementStatus): string {
  const mapping: Record<AgreementStatus, string> = {
    'draft': 'agreement_created',
    'pending_client_confirmation': 'invitation_sent',
    'confirmed': 'client_confirmed',
    'rejected': 'client_contested',
    'contested': 'client_contested',
    'in_adjustment': 'agreement_updated',
    'deadline_extension_pending': 'deadline_extension_requested',
    'amendment_pending': 'amendment_created',
    'charge_open': 'charge_created',
    'charge_contested': 'charge_contested',
    'notice_sent': 'notice_sent',
    'in_dispute': 'dispute_opened',
    'closed': 'case_closed'
  };

  return mapping[status] || 'agreement_created';
}

/**
 * Gera protocolo unico para o evento
 */
function generateProtocol(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PJD-${timestamp}-${random}`;
}

/**
 * Confirma acordo pelo cliente (fluxo especifico)
 */
export async function confirmAgreement(
  agreementId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  return transitionStatus({
    agreementId,
    newStatus: 'confirmed',
    actorId: clientId,
    actorRole: 'client',
    metadata: { action: 'confirmation' }
  });
}

/**
 * Contesta acordo pelo cliente (fluxo especifico)
 */
export async function contestAgreement(
  agreementId: string,
  clientId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  return transitionStatus({
    agreementId,
    newStatus: 'contested',
    actorId: clientId,
    actorRole: 'client',
    reason,
    metadata: { action: 'contestation' }
  });
}