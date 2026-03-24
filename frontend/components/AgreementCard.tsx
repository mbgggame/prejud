/**
 * Componente AgreementCard - PreJud SaaS
 * Visualizacao resumida/detalhada do acordo
 */

import { Agreement } from '@/types/agreement';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AgreementStatusBadge } from './AgreementStatusBadge';
import { Calendar, DollarSign, Shield } from 'lucide-react';

interface AgreementCardProps {
  agreement: Agreement;
  detailed?: boolean;
}

export function AgreementCard({ agreement, detailed = false }: AgreementCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {agreement.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Protocolo: {agreement.protocol}
          </p>
        </div>

        <AgreementStatusBadge status={agreement.status} />
      </div>

      {/* DESCRIÇÃO */}
      <p className="text-slate-600 mb-4">
        {agreement.description}
      </p>

      {/* GRID PRINCIPAL */}
      <div className={`grid gap-4 ${detailed ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
        
        {/* VALOR */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Valor</p>
            <p className="font-medium">
              {formatCurrency(agreement.value)}
            </p>
          </div>
        </div>

        {/* PRAZO */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Prazo</p>
            <p className="font-medium">
              {agreement.deadline ? formatDate(agreement.deadline) : 'Sem prazo'}
            </p>
          </div>
        </div>

      </div>

      {/* HASH (SÓ SE detailed = true) */}
      {detailed && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500">
                Hash de Integridade (SHA-256)
              </p>
              <p
                className="text-xs text-slate-400 font-mono truncate"
                title={agreement.hash || 'N/A'}
              >
                {agreement.hash
                  ? `${agreement.hash.substring(0, 16)}...`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}