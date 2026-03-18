/**
 * Tipos do dominio Timeline - PreJud SaaS
 * Registro cronologico imutavel de eventos do agreement
 */

export type EventType =
  | 'agreement_created'
  | 'invitation_sent'
  | 'client_confirmed'
  | 'client_contested'
  | 'deadline_extension_requested'
  | 'deadline_extension_accepted'
  | 'amendment_created'
  | 'charge_created'
  | 'notice_sent'
  | 'dispute_opened'
  | 'case_closed';

/**
 * Evento individual na timeline com garantia de integridade (SHA-256)
 * Versao Firestore - compativel com o codigo existente
 */
export interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp?: Date;
  actorId: string;
  actorRole?: 'freelancer' | 'client' | 'system';
  actorType: 'freelancer' | 'client' | 'system';  // Alias para compatibilidade
  actorName: string;  // Nome do ator para exibicao
  title: string;  // Titulo do evento
  description: string;  // Descricao detalhada
  data?: Record<string, unknown>;  // Dados adicionais do evento
  metadata?: Record<string, unknown>;  // Metadados especificos (alias para data)
  protocol?: string;
  // Campos de integridade (Modulo 4 - Hash SHA-256)
  hash?: string;           // Hash SHA-256 deste evento
  previousHash?: string | null;  // Referencia ao hash do evento anterior (cadeia)
  createdAt: Date;
}

/**
 * DTO para criacao de evento (sem campos gerados automaticamente)
 */
export interface CreateTimelineEventDTO {
  type: EventType;
  actorId: string;
  actorRole?: 'freelancer' | 'client' | 'system';
  actorType?: 'freelancer' | 'client' | 'system';
  actorName: string;
  title: string;
  description: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  protocol?: string;
}

/**
 * Resposta da verificacao de integridade
 */
export interface IntegrityVerificationResult {
  isValid: boolean;
  eventId: string;
  storedHash: string;
  calculatedHash: string;
  chainValid: boolean;    // Verifica se previousHash corresponde ao evento anterior
  timestamp: Date;
}
