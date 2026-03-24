/**
 * HOOK: useFreelancerDashboard (TESTE COM getFreelancerAgreements)
 */

import { useState, useEffect, useCallback } from 'react';

import {
  getFreelancerDashboardDataV2,
  getFreelancerAgreements,
  subscribeFreelancerAgreements,
  type FreelancerDashboardData
} from '@/services/dashboardService';
import type { Agreement } from '@/types/agreement';

interface UseFreelancerDashboardReturn {
  data: Omit<FreelancerDashboardData, 'loading' | 'error'>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const initialData: Omit<FreelancerDashboardData, 'loading' | 'error'> = {
  agreements: [],
  recentCharges: [],
  recentNotices: [],
  stats: {
    totalAgreements: 0,
    activeAgreements: 0,
    pendingConfirmation: 0,
    inDispute: 0,
    completed: 0,
    totalValue: 0,
    pendingValue: 0,
    paidValue: 0
  }
};

export function useFreelancerDashboard(
  freelancerId: string | undefined,
  options?: { realtime?: boolean }
): UseFreelancerDashboardReturn {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log('[DEBUG] freelancerId:', freelancerId);
    
    if (!freelancerId) {
      console.log('[DEBUG] Sem freelancerId, retornando...');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[DEBUG] Usando getFreelancerAgreements diretamente...');
      const agreements = await getFreelancerAgreements(freelancerId);
      console.log('[DEBUG] Acordos recebidos:', agreements.length);
      console.log('[DEBUG] Primeiro acordo:', agreements[0]);
      
      setData({
        ...initialData,
        agreements,
        stats: {
          ...initialData.stats,
          totalAgreements: agreements.length,
          activeAgreements: agreements.filter((a: Agreement) => ['confirmed', 'charge_open'].includes(a.status as string)).length
        }
      });
    } catch (err) {
      console.error('[useFreelancerDashboard] Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [freelancerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!freelancerId || !options?.realtime) return;

    const unsubscribe = subscribeFreelancerAgreements(
      freelancerId,
      (agreements: Agreement[]) => {
        console.log('[DEBUG] Realtime - acordos atualizados:', agreements.length);
        setData((prev: typeof initialData) => ({ ...prev, agreements }));
      },
      (err: Error) => {
        console.error('[useFreelancerDashboard] Subscribe error:', err);
      }
    );

    return () => unsubscribe();
  }, [freelancerId, options?.realtime]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}
