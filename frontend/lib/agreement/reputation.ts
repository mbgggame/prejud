// Regras de Negócio - Sistema de Reputação
// Conforme Manual Técnico v1.0 - Seção 10

import { AgreementStatus } from '@/types/agreement';
import { ReputationEvent } from '@/types/reputation';

// Fatores Positivos (conforme manual seção 10)
export const POSITIVE_FACTORS = {
  AGREEMENT_COMPLETED: {
    factor: 'agreement_completed',
    points: 5,
    description: 'Acordo concluído com sucesso'
  },
  PAYMENT_ON_TIME: {
    factor: 'payment_on_time',
    points: 3,
    description: 'Pagamento confirmado no prazo'
  },
  DEADLINE_MET: {
    factor: 'deadline_met',
    points: 2,
    description: 'Prazo cumprido conforme acordado'
  },
  POSITIVE_RATING: {
    factor: 'positive_rating',
    points: 4,
    description: 'Avaliação positiva da contraparte'
  },
  QUICK_RESPONSE: {
    factor: 'quick_response',
    points: 1,
    description: 'Resposta rápida às comunicações'
  }
} as const;

// Fatores Negativos (conforme manual seção 10)
export const NEGATIVE_FACTORS = {
  DISPUTE_STARTED: {
    factor: 'dispute_started',
    points: -10,
    description: 'Disputa iniciada'
  },
  LATE_PAYMENT: {
    factor: 'late_payment',
    points: -5,
    description: 'Atraso no pagamento'
  },
  NO_PAYMENT: {
    factor: 'no_payment',
    points: -15,
    description: 'Não pagamento'
  },
  ABUSIVE_CONTEST: {
    factor: 'abusive_contest',
    points: -8,
    description: 'Contestação abusiva'
  },
  NO_RESPONSE: {
    factor: 'no_response',
    points: -3,
    description: 'Não resposta recorrente'
  },
  DEADLINE_VIOLATION: {
    factor: 'deadline_violation',
    points: -4,
    description: 'Violação de prazo'
  }
} as const;

// Calcula impacto na reputação baseado em transição de status
export const calculateReputationImpact = (
  fromStatus: AgreementStatus,
  toStatus: AgreementStatus,
  actorRole: 'freelancer' | 'client'
): ReputationEvent | null => {
  // Concluído com sucesso
  if (toStatus === 'closed') {
    return {
      type: 'positive',
      factor: POSITIVE_FACTORS.AGREEMENT_COMPLETED.factor,
      points: POSITIVE_FACTORS.AGREEMENT_COMPLETED.points,
      timestamp: new Date()
    };
  }

  // Disputa iniciada
  if (toStatus === 'in_dispute') {
    return {
      type: 'negative',
      factor: NEGATIVE_FACTORS.DISPUTE_STARTED.factor,
      points: NEGATIVE_FACTORS.DISPUTE_STARTED.points,
      timestamp: new Date()
    };
  }

  return null;
};

// Verifica se usuário pode avaliar outro
export const canRateUser = (
  userId: string,
  targetUserId: string,
  agreementStatus: AgreementStatus
): boolean => {
  // Só pode avaliar se acordo está concluído ou fechado
  if (agreementStatus !== 'closed') {
    return false;
  }
  
  // Não pode auto-avaliar
  if (userId === targetUserId) {
    return false;
  }
  
  return true;
};

// Escala de Score (conforme manual seção 10 - Diagrama 5)
export const SCORE_SCALE = [
  { min: 0, max: 39, label: 'Alto Risco', color: '#C62828', class: 'high-risk' },
  { min: 40, max: 59, label: 'Risco Moderado', color: '#EF6C00', class: 'moderate-risk' },
  { min: 60, max: 74, label: 'Regular', color: '#FFA726', class: 'regular' },
  { min: 75, max: 89, label: 'Confiável', color: '#4CAF50', class: 'trustworthy' },
  { min: 90, max: 100, label: 'Excelente', color: '#1B5E20', class: 'excellent' }
] as const;
