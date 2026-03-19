/**
 * Componente Timeline - PreJud SaaS
 * Container de exibicao da timeline cronologica com verificacao de integridade
 */

'use client';

import { useEffect } from 'react';
import type { TimelineEvent as AgreementTimelineEvent } from '@/types/agreement';
import { useTimeline } from '@/lib/hooks/useTimeline';
import { TimelineEventItem } from './TimelineEventItem';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimelineProps {
  agreementId: string;
}

export function Timeline({ agreementId }: TimelineProps) {
  const {
    events,
    loading,
    error,
    integrityStatus,
    loadEvents,
    verifyIntegrity,
    refresh
  } = useTimeline();

  const timelineEvents = events as AgreementTimelineEvent[];

  useEffect(() => {
    loadEvents(agreementId);
  }, [agreementId, loadEvents]);

  const handleVerify = async () => {
    await verifyIntegrity(agreementId);
  };

  const handleRefresh = async () => {
    await refresh(agreementId);
  };

  if (loading && timelineEvents.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
        <p>{error}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
        <div>
          <h3 className="font-semibold text-slate-900">Timeline do Caso</h3>
          <p className="text-sm text-slate-500">
            {timelineEvents.length} evento(s) registrado(s) - Trilha verificavel
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            variant="outline"
            size="sm"
            disabled={loading || timelineEvents.length === 0}
          >
            <Shield className="mr-2 h-4 w-4" />
            Verificar Integridade
          </Button>

          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {integrityStatus && (
        <div
          className={`flex items-center gap-3 rounded-lg p-3 ${
            integrityStatus.isValid
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {integrityStatus.isValid ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}

          <div className="text-sm">
            <p className="font-medium">
              {integrityStatus.isValid
                ? 'Cadeia de integridade verificada'
                : 'Problema de integridade detectado'}
            </p>
            <p className="opacity-90">
              {integrityStatus.isValid
                ? `Todos os ${timelineEvents.length} eventos estao integros e vinculados corretamente.`
                : `Eventos comprometidos: ${integrityStatus.invalidEvents.join(', ')}`}
            </p>
          </div>
        </div>
      )}

      <div className="relative space-y-6 border-l-2 border-slate-200 pl-4">
        {timelineEvents.map((event, index) => (
          <TimelineEventItem
            key={event.id}
            event={event}
            isLast={index === timelineEvents.length - 1}
          />
        ))}

        {timelineEvents.length === 0 && (
          <p className="text-sm italic text-slate-400">
            Nenhum evento registrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}