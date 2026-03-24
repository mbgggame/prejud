/**
 * HOOK: useFreelancerDashboard (VERSÃO ESTÁVEL - Usando cliente Firestore)
 */

import { useState, useEffect, useCallback } from 'react';

import {
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
    if (!freelancerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // VERSÃO ESTÁVEL: Usando cliente Firestore diretamente (funciona!)
      const agreements = await getFreelancerAgreements(freelancerId);
      
      setData({
        ...initialData,
        agreements,
        stats: {
          ...initialData.stats,
          totalAgreements: agreements.length,
          activeAgreements: agreements.filter((a: Agreement) => 
            ['confirmed', 'charge_open'].includes(a.status as string)
          ).length,
          pendingConfirmation: agreements.filter((a: Agreement) => 
            a.status === 'pending_client_confirmation'
          ).length
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
