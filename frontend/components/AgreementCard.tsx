/**
 * Componente AgreementCard - PreJud SaaS
 * Visualizacao resumida/detalhada do acordo
 */

import { Agreement } from '@/types/agreement';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AgreementStatusBadge } from './AgreementStatusBadge';
import { FileText, User, Calendar, DollarSign } from 'lucide-react';

interface AgreementCardProps {
  agreement: Agreement;
  detailed?: boolean;
}

export function AgreementCard({ agreement, detailed = false }: AgreementCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{agreement.title}</h2>
          <p className="text-sm text-slate-500 mt-1">Protocolo: {agreement.protocol}</p>
        </div>
        <AgreementStatusBadge status={agreement.status} />
      </div>

      <p className="text-slate-600 mb-4">{agreement.description}</p>

      <div className={`grid gap-4 ${detailed ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Valor</p>
            <p className="font-medium">{formatCurrency(agreement.value)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Prazo</p>
            <p className="font-medium">{formatDate(agreement.deadline)}</p>
          </div>
        </div>

        {detailed && (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Freelancer</p>
                <p className="font-medium text-sm truncate">{agreement.freelancerId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Tipo</p>
                <p className="font-medium capitalize">{agreement.serviceType}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {detailed && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-mono truncate">
            Hash: {agreement.hash}
          </p>
        </div>
      )}
    </div>
  );
}