// Tipos do Sistema de Reputação - PreJud SaaS
// Conforme Manual Técnico v1.0 - Seção 10

export type ReputationScore = 
  | 'high_risk'      // 0-39
  | 'moderate_risk'  // 40-59
  | 'regular'        // 60-74
  | 'trustworthy'    // 75-89
  | 'excellent';     // 90-100

export interface ReputationMetrics {
  score: number;                    // 0-100
  ratingAverage: number;            // Média de estrelas 1-5
  ratingsCount: number;             // Total de avaliações
  completedAgreements: number;      // Acordos concluídos
  disputedAgreements: number;       // Acordos em disputa
  latePayments: number;             // Pagamentos atrasados
  deadlineViolations: number;       // Violações de prazo
  responseScore: number;            // Pontualidade de resposta
}

export interface Reputation extends ReputationMetrics {
  id: string;
  userId: string;
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
}

export interface ReputationRating {
  id: string;
  fromUserId: string;
  toUserId: string;
  agreementId: string;
  rating: number;      // 1-5 estrelas
  comment?: string;
  createdAt: string;   // ISO string
}

export interface ReputationEvent {
  type: 'positive' | 'negative';
  factor: string;
  points: number;
  agreementId?: string;
  timestamp: Date;     // Usado em runtime, convertido para ISO ao salvar
}
