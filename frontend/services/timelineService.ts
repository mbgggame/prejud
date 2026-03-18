/**
 * Service de operacoes da Timeline - PreJud SaaS
 * Orquestra criacao de eventos com registro imutavel (SHA-256)
 */

import { TimelineEvent, CreateTimelineEventDTO, EventType } from '@/types/timeline';
import { generateBlockHash } from '@/lib/crypto/hash';

// Simulacao de persistencia (substituir por Firestore em producao)
const timelineEvents: Map<string, TimelineEvent[]> = new Map();

/**
 * Obtem todos os eventos de um agreement ordenados cronologicamente
 */
export async function getEventsByAgreementId(agreementId: string): Promise<TimelineEvent[]> {
  const events = timelineEvents.get(agreementId) || [];
  return events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Obtem o ultimo evento da cadeia (para vinculacao de previousHash)
 */
async function getLastEvent(agreementId: string): Promise<TimelineEvent | null> {
  const events = await getEventsByAgreementId(agreementId);
  return events.length > 0 ? events[events.length - 1] : null;
}

/**
 * Cria novo evento na timeline com hash SHA-256 e vinculacao a cadeia anterior
 */
export async function createEvent(
  agreementId: string,
  dto: CreateTimelineEventDTO
): Promise<TimelineEvent> {
  const lastEvent = await getLastEvent(agreementId);
  const previousHash = lastEvent?.hash ?? null;
  const timestamp = new Date();
  
  // Converte DTO para Record<string, unknown> para o hash
  const eventDataForHash: Record<string, unknown> = {
    type: dto.type,
    actorId: dto.actorId,
    actorRole: dto.actorRole,
    data: dto.data,
    protocol: dto.protocol
  };
  
  // Gera hash do bloco incluindo referencia ao anterior (imutabilidade)
  const hash = generateBlockHash(eventDataForHash, previousHash, timestamp);
  
  const event: TimelineEvent = {
    id: generateEventId(),
    type: dto.type,
    timestamp,
    actorId: dto.actorId,
    actorRole: dto.actorRole,
    actorType: dto.actorType || dto.actorRole || 'system',
    actorName: dto.actorName || 'Sistema',
    title: dto.title || 'Evento',
    description: dto.description || '',
    data: dto.data,
    metadata: dto.metadata,
    protocol: dto.protocol,
    hash,
    previousHash,
    createdAt: timestamp
  };
  
  // Persistencia (substituir por transacao Firestore atomica)
  const existing = timelineEvents.get(agreementId) || [];
  timelineEvents.set(agreementId, [...existing, event]);
  
  return event;
}

/**
 * Verifica integridade da cadeia completa de eventos
 */
export async function verifyChainIntegrity(agreementId: string): Promise<{
  isValid: boolean;
  eventsChecked: number;
  invalidEvents: string[];
}> {
  const events = await getEventsByAgreementId(agreementId);
  const invalidEvents: string[] = [];
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const expectedPreviousHash = i > 0 ? events[i - 1].hash : null;
    
    // Verifica se previousHash esta correto
    if (event.previousHash !== expectedPreviousHash) {
      invalidEvents.push(event.id);
      continue;
    }
    
    // Re-calcula hash para verificar integridade do dado
    const eventDataForHash: Record<string, unknown> = {
      type: event.type,
      actorId: event.actorId,
      actorRole: event.actorRole,
      data: event.data,
      protocol: event.protocol
    };
    
    const recalculatedHash = generateBlockHash(
      eventDataForHash,
      (event.previousHash ?? null),
      (event.timestamp ?? new Date())
    );
    
    if (recalculatedHash !== event.hash) {
      invalidEvents.push(event.id);
    }
  }
  
  return {
    isValid: invalidEvents.length === 0,
    eventsChecked: events.length,
    invalidEvents
  };
}

/**
 * Gera ID unico para evento
 */
function generateEventId(): string {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Cria evento inicial de agreement (genesis)
 */
export async function createGenesisEvent(
  agreementId: string,
  freelancerId: string,
  protocol: string
): Promise<TimelineEvent> {
  return createEvent(agreementId, {
    type: 'agreement_created',
    actorId: freelancerId,
    actorRole: 'system',
    actorType: 'system',
    actorName: 'Sistema',
    title: 'Acordo Criado',
    description: 'Acordo formalizado com protocolo ' + protocol,
    data: { agreementId: agreementId, action: 'creation' },
    protocol: protocol
  });
}