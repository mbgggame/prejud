// Hook useReputation - PreJud SaaS
// Conforme Manual Técnico v1.0 - Seção 9
// INTEGRADO COM FIREBASE

import { useState, useEffect, useCallback } from 'react';
import { Reputation, ReputationMetrics } from '@/types/reputation';
import { reputationService } from '@/services/reputationService';

interface UseReputationReturn {
  reputation: Reputation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateMetrics: (updates: Partial<ReputationMetrics>) => Promise<void>;
  scoreCategory: 'high_risk' | 'moderate_risk' | 'regular' | 'trustworthy' | 'excellent' | null;
  scoreColor: string;
  scoreLabel: string;
}

export const useReputation = (userId: string | undefined): UseReputationReturn => {
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReputation = useCallback(async () => {
    if (!userId) {
      setReputation(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar reputação existente ou criar nova
      let existingReputation = await reputationService.getByUserId(userId);
      
      if (!existingReputation) {
        // Criar reputação inicial se não existir
        existingReputation = await reputationService.create(userId);
      }
      
      setReputation(existingReputation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reputação');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateMetrics = useCallback(async (updates: Partial<ReputationMetrics>) => {
    if (!reputation) return;

    try {
      setLoading(true);
      const updated = await reputationService.updateMetrics(reputation, updates);
      setReputation(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar reputação');
    } finally {
      setLoading(false);
    }
  }, [reputation]);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  const scoreCategory = reputation 
    ? reputationService.getScoreCategory(reputation.score) 
    : null;
  
  const scoreColor = reputation 
    ? reputationService.getColorByScore(reputation.score) 
    : '#9E9E9E';
  
  const scoreLabel = reputation 
    ? reputationService.getLabelByScore(reputation.score) 
    : 'Sem reputação';

  return {
    reputation,
    loading,
    error,
    refresh: fetchReputation,
    updateMetrics,
    scoreCategory,
    scoreColor,
    scoreLabel
  };
};
