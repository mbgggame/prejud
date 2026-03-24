/**
 * Componente AgreementStatusBadge - PreJud SaaS
 * Exibição visual do status atual do acordo
 */

import { AgreementStatus } from '@/types/agreement';
import { cn } from '@/lib/utils';

interface AgreementStatusBadgeProps {
  status: AgreementStatus;
  className?: string;
}

const statusConfig: Record<AgreementStatus, { label: string; color: string }> = {
  draft: {
    label: 'Rascunho',
    color: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  pending_client_confirmation: {
    label: 'Aguardando cliente',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  confirmed: {
    label: 'Confirmado',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  rejected: {
    label: 'Recusado',
    color: 'bg-gray-100 text-gray-700 border-gray-300'
  },
  contested: {
    label: 'Contestado',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  in_adjustment: {
    label: 'Em revisão',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  deadline_extension_pending: {
    label: 'Prorrogação pendente',
    color: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  amendment_pending: {
    label: 'Aditivo pendente',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  charge_open: {
    label: 'Cobrança pendente',
    color: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  charge_contested: {
    label: 'Cobrança contestada',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  notice_sent: {
    label: 'Notificação enviada',
    color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'
  },
  in_dispute: {
    label: 'Em disputa',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  closed: {
    label: 'Encerrado',
    color: 'bg-slate-200 text-slate-800 border-slate-400'
  }
};

export function AgreementStatusBadge({ status, className }: AgreementStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}