/**
 * Componente AgreementStatusBadge - PreJud SaaS
 * Exibicao visual do status atual do acordo
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
    color: 'bg-slate-100 text-slate-700 border-slate-200' 
  },
  pending_client_confirmation: { 
    label: 'Aguardando Cliente', 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200' 
  },
  confirmed: { 
    label: 'Confirmado', 
    color: 'bg-green-50 text-green-700 border-green-200' 
  },
  rejected: { 
    label: 'Rejeitado', 
    color: 'bg-gray-100 text-gray-700 border-gray-200' 
  },
  contested: { 
    label: 'Contestado', 
    color: 'bg-orange-100 text-orange-700 border-orange-200' 
  },
  in_adjustment: { 
    label: 'Em Ajuste', 
    color: 'bg-blue-100 text-blue-700 border-blue-200' 
  },
  deadline_extension_pending: { 
    label: 'Prorrogacao Pendente', 
    color: 'bg-orange-50 text-orange-700 border-orange-200' 
  },
  amendment_pending: { 
    label: 'Aditivo Pendente', 
    color: 'bg-purple-50 text-purple-700 border-purple-200' 
  },
  charge_open: { 
    label: 'Cobranca Pendente', 
    color: 'bg-blue-50 text-blue-700 border-blue-200' 
  },
  charge_contested: { 
    label: 'Cobranca Contestada', 
    color: 'bg-red-100 text-red-700 border-red-200' 
  },
  notice_sent: { 
    label: 'Notificacao Enviada', 
    color: 'bg-purple-100 text-purple-700 border-purple-200' 
  },
  in_dispute: { 
    label: 'Em Disputa', 
    color: 'bg-red-50 text-red-700 border-red-200' 
  },
  closed: { 
    label: 'Encerrado', 
    color: 'bg-slate-50 text-slate-700 border-slate-200' 
  }
};

export function AgreementStatusBadge({ status, className }: AgreementStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}