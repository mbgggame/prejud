// ==========================================
// COMPONENTE DE AÇÕES BLOQUEADAS
// ==========================================

import { AgreementStatus } from "@/types/agreement";
import { getBlockedActions } from "@/lib/agreement/state-machine";
import { Lock, AlertTriangle } from "lucide-react";

interface BlockedActionsProps {
  status: AgreementStatus;
  showTitle?: boolean;
}

export function BlockedActionsList({ 
  status, 
  showTitle = true 
}: BlockedActionsProps) {
  const blocked = getBlockedActions(status);
  
  if (blocked.length === 0 || blocked[0].includes("Nenhuma")) {
    return null;
  }

  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-medium text-yellow-400">Ações bloqueadas neste estado</h4>
        </div>
      )}
      <ul className="space-y-2">
        {blocked.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
            <Lock className="w-3.5 h-3.5 mt-0.5 text-gray-500 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}