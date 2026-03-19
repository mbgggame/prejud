// Serviço de Reputação - PreJud SaaS
// Conforme Manual Técnico v1.0 - Seção 10
// INTEGRADO COM FIREBASE

import { Reputation, ReputationMetrics, ReputationRating, ReputationScore } from '@/types/reputation';
import { updateReputation, getReputation } from './firebaseAgreementService';

const REPUTATION_WEIGHTS = {
  completedAgreement: 5,
  paymentOnTime: 3,
  deadlineMet: 2,
  positiveRating: 4,
  quickResponse: 1,
  disputeStarted: -10,
  latePayment: -5,
  noPayment: -15,
  abusiveContest: -8,
  noResponse: -3,
  deadlineViolation: -4
};

export const reputationService = {
  calculateScore: (metrics: ReputationMetrics): number => {
    let score = 50; // Base inicial

    score += metrics.completedAgreements * REPUTATION_WEIGHTS.completedAgreement;
    score -= metrics.disputedAgreements * Math.abs(REPUTATION_WEIGHTS.disputeStarted);
    score -= metrics.latePayments * Math.abs(REPUTATION_WEIGHTS.latePayment);
    score -= metrics.deadlineViolations * Math.abs(REPUTATION_WEIGHTS.deadlineViolation);

    // Ajuste por rating médio (1-5 estrelas)
    if (metrics.ratingsCount > 0) {
      const ratingBonus = (metrics.ratingAverage - 3) * 5;
      score += ratingBonus;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  getScoreCategory: (score: number): ReputationScore => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'trustworthy';
    if (score >= 60) return 'regular';
    if (score >= 40) return 'moderate_risk';
    return 'high_risk';
  },

  getColorByScore: (score: number): string => {
    if (score >= 90) return '#1B5E20';
    if (score >= 75) return '#4CAF50';
    if (score >= 60) return '#FFA726';
    if (score >= 40) return '#EF6C00';
    return '#C62828';
  },

  getLabelByScore: (score: number): string => {
    if (score >= 90) return 'Excelente';
    if (score >= 75) return 'Confiável';
    if (score >= 60) return 'Regular';
    if (score >= 40) return 'Risco Moderado';
    return 'Alto Risco';
  },

  // Buscar reputação do Firebase
  getByUserId: async (userId: string): Promise<Reputation | null> => {
    return getReputation(userId);
  },

  // Criar nova reputação no Firebase
  create: async (userId: string): Promise<Reputation> => {
    const reputationData = {
      userId,
      score: 50,
      ratingAverage: 0,
      ratingsCount: 0,
      completedAgreements: 0,
      disputedAgreements: 0,
      latePayments: 0,
      deadlineViolations: 0,
      responseScore: 50
    };

    return updateReputation(reputationData);
  },

  // Atualizar métricas e recalcular score no Firebase
  updateMetrics: async (
    reputation: Reputation,
    updates: Partial<ReputationMetrics>
  ): Promise<Reputation> => {
    const updatedData = {
      ...reputation,
      ...updates,
      userId: reputation.userId // garantir que userId não seja perdido
    };

    // Recalcular score
    updatedData.score = reputationService.calculateScore(updatedData);

    // Salvar no Firebase
    return updateReputation(updatedData);
  },

  recordAgreementCompleted: async (userId: string): Promise<void> => {
    let reputation = await getReputation(userId);

    if (!reputation) {
      reputation = await reputationService.create(userId);
    }

    await reputationService.updateMetrics(reputation, {
      completedAgreements: reputation.completedAgreements + 1
    });
  },

  recordDisputeStarted: async (userId: string): Promise<void> => {
    let reputation = await getReputation(userId);

    if (!reputation) {
      reputation = await reputationService.create(userId);
    }

    await reputationService.updateMetrics(reputation, {
      disputedAgreements: reputation.disputedAgreements + 1
    });
  },

  recordLatePayment: async (userId: string): Promise<void> => {
    let reputation = await getReputation(userId);

    if (!reputation) {
      reputation = await reputationService.create(userId);
    }

    await reputationService.updateMetrics(reputation, {
      latePayments: reputation.latePayments + 1
    });
  },

  recordDeadlineViolation: async (userId: string): Promise<void> => {
    let reputation = await getReputation(userId);

    if (!reputation) {
      reputation = await reputationService.create(userId);
    }

    await reputationService.updateMetrics(reputation, {
      deadlineViolations: reputation.deadlineViolations + 1
    });
  },

  recordRating: async (userId: string, rating: number): Promise<void> => {
    let reputation = await getReputation(userId);

    if (!reputation) {
      reputation = await reputationService.create(userId);
    }

    const newCount = reputation.ratingsCount + 1;
    const newAverage = ((reputation.ratingAverage * reputation.ratingsCount) + rating) / newCount;

    await reputationService.updateMetrics(reputation, {
      ratingsCount: newCount,
      ratingAverage: Math.round(newAverage * 10) / 10
    });
  }
};
