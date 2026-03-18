/**
 * Pagina de detalhes do acordo com timeline integrada - PreJud SaaS
 */

'use client';

import { useParams } from 'next/navigation';
import { useAgreement } from '@/lib/hooks/useAgreement';
import { Timeline } from '@/components/timeline/Timeline';
import { AgreementCard } from '@/components/AgreementCard';
import { AgreementStatusBadge } from '@/components/AgreementStatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AgreementDetailsPage() {
  const params = useParams();
  const agreementId = params.id as string;
  
  const { agreement, loading, error } = useAgreement(agreementId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Acordo nao encontrado'}</p>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{agreement.title}</h1>
        </div>
        <AgreementStatusBadge status={agreement.status} />
      </div>

      <AgreementCard agreement={agreement} detailed />

      <div className="bg-slate-50 rounded-xl p-6">
        <Timeline agreementId={agreementId} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-2">Informacoes de Auditoria</h3>
        <div className="space-y-2 text-sm font-mono text-slate-600">
          <p><span className="font-medium">Protocolo:</span> {agreement.protocol}</p>
          <p className="truncate"><span className="font-medium">Hash:</span> {agreement.hash}</p>
        </div>
      </div>
    </div>
  );
}