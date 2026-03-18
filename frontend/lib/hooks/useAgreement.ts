/**
 * Hook useAgreement - PreJud SaaS
 * Hook principal de gerenciamento de estado do acordo
 */

import { useState, useCallback, useEffect } from 'react';
import { Agreement, AgreementStatus } from '@/types/agreement';
import { agreementService } from '@/services/agreementService';

interface UseAgreementReturn {
  agreement: Agreement | null;
  loading: boolean;
  error: string | null;
  actions: {
    canExtend: boolean;
    canCharge: boolean;
    canContest: boolean;
    canConfirm: boolean;
  };
  transitionState: (newStatus: AgreementStatus, reason?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useAgreement(agreementId: string): UseAgreementReturn {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgreement = useCallback(async () => {
    if (!agreementId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await agreementService.getById(agreementId);
      setAgreement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar acordo');
    } finally {
      setLoading(false);
    }
  }, [agreementId]);

  useEffect(() => {
    loadAgreement();
  }, [loadAgreement]);

  const actions = {
    canExtend: agreement?.status === 'confirmed',
    canCharge: agreement?.status === 'confirmed' || agreement?.status === 'charge_open',
    canContest: agreement?.status === 'pending_client_confirmation' || agreement?.status === 'charge_open',
    canConfirm: agreement?.status === 'pending_client_confirmation'
  };

  const transitionState = useCallback(async (newStatus: AgreementStatus, reason?: string): Promise<boolean> => {
    if (!agreement) return false;
    
    setLoading(true);
    try {
      // Mapeia status para metodo correspondente do service
      switch (newStatus) {
        case 'confirmed':
          await agreementService.confirm(agreement.id, 'current-user-id');
          break;
        case 'in_dispute':
          await agreementService.contest(agreement.id, reason || 'Contestado pelo cliente');
          break;
        case 'deadline_extension_pending':
          await agreementService.requestExtension(agreement.id, new Date());
          break;
        case 'closed':
          await agreementService.close(agreement.id);
          break;
        default:
          // Para outros status, atualiza diretamente (mock)
          agreement.status = newStatus;
          agreement.updatedAt = new Date();
      }
      
      await loadAgreement();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na transicao');
      return false;
    } finally {
      setLoading(false);
    }
  }, [agreement, loadAgreement]);

  return {
    agreement,
    loading,
    error,
    actions,
    transitionState,
    refresh: loadAgreement
  };
}