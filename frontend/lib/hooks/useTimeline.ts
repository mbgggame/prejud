/**
 * Hook useTimeline - PreJud SaaS
 * Gerenciamento de estado e integracao UI/dominio para Timeline
 */

import { useState, useCallback, useEffect } from 'react';
import { TimelineEvent, CreateTimelineEventDTO, IntegrityVerificationResult } from '@/types/timeline';
import * as timelineService from '@/services/timelineService';

interface UseTimelineReturn {
  events: TimelineEvent[];
  loading: boolean;
  error: string | null;
  integrityStatus: {
    checked: boolean;
    isValid: boolean | null;
    invalidEvents: string[];
  } | null;
  // Acoes
  loadEvents: (agreementId: string) => Promise<void>;
  addEvent: (agreementId: string, dto: CreateTimelineEventDTO) => Promise<TimelineEvent | null>;
  verifyIntegrity: (agreementId: string) => Promise<void>;
  refresh: (agreementId: string) => Promise<void>;
}

export function useTimeline(): UseTimelineReturn {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<UseTimelineReturn['integrityStatus']>(null);

  const loadEvents = useCallback(async (agreementId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await timelineService.getEventsByAgreementId(agreementId);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar timeline');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvent = useCallback(async (
    agreementId: string, 
    dto: CreateTimelineEventDTO
  ): Promise<TimelineEvent | null> => {
    setLoading(true);
    setError(null);
    try {
      const newEvent = await timelineService.createEvent(agreementId, dto);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyIntegrity = useCallback(async (agreementId: string) => {
    setLoading(true);
    try {
      const result = await timelineService.verifyChainIntegrity(agreementId);
      setIntegrityStatus({
        checked: true,
        isValid: result.isValid,
        invalidEvents: result.invalidEvents
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na verificacao');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (agreementId: string) => {
    await loadEvents(agreementId);
    setIntegrityStatus(null);
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    integrityStatus,
    loadEvents,
    addEvent,
    verifyIntegrity,
    refresh
  };
}