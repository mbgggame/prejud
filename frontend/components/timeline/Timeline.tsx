/**
 * Componente Timeline - PreJud SaaS
 * Container de exibicao da timeline cronologica com verificacao de integridade
 */

'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    loadEvents(agreementId);
  }, [agreementId, loadEvents]);

  const handleVerify = async () => {
    await verifyIntegrity(agreementId);
  };

  const handleRefresh = async () => {
    await refresh(agreementId);
  };

  if (loading && events.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Carregando timeline...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <p>{error}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-slate-900">Timeline do Caso</h3>
          <p className="text-sm text-slate-500">
            {events.length} evento(s) registrado(s) - Trilha verificavel
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleVerify} 
            variant="outline" 
            size="sm"
            disabled={loading || events.length === 0}
          >
            <Shield className="h-4 w-4 mr-2" />
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

      {/* Status de integridade */}
      {integrityStatus && (
        <div className={`p-3 rounded-lg flex items-center gap-3 ${
          integrityStatus.isValid 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {integrityStatus.isValid ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p className="font-medium">
              {integrityStatus.isValid 
                ? 'Cadeia de integridade verificada' 
                : 'Problema de integridade detectado'}
            </p>
            <p className="opacity-90">
              {integrityStatus.isValid 
                ? `Todos os ${events.length} eventos estao integros e vinculados corretamente.` 
                : `Eventos comprometidos: ${integrityStatus.invalidEvents.join(', ')}`}
            </p>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
        {events.map((event, index) => (
          <TimelineEventItem 
            key={event.id} 
            event={event} 
            isLast={index === events.length - 1}
          />
        ))}
        {events.length === 0 && (
          <p className="text-sm text-slate-400 italic">Nenhum evento registrado ainda.</p>
        )}
      </div>
    </div>
  );
}