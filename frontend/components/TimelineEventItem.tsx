"use client";

import { TimelineEventItemProps } from "@/types/agreement";
import { formatDistanceToNow } from "@/lib/utils";
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  MessageSquare,
  Shield,
  Archive,
  RefreshCw,
  Edit3
} from "lucide-react";

const eventConfig: Record<string, { icon: any; color: string; bg: string }> = {
  agreement_created: { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
  agreement_updated: { icon: RefreshCw, color: "text-gray-500", bg: "bg-gray-500/10" },
  invitation_sent: { icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
  client_confirmed: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  client_contested: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  deadline_extension_requested: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  deadline_extension_accepted: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  deadline_extension_counter_proposed: { icon: Edit3, color: "text-orange-500", bg: "bg-orange-500/10" },
  deadline_extension_rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  amendment_created: { icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
  amendment_accepted: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  amendment_adjustment_requested: { icon: Edit3, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  amendment_rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  charge_created: { icon: DollarSign, color: "text-red-500", bg: "bg-red-500/10" },
  charge_paid: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  charge_contested: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  notice_sent: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  notice_responded: { icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
  dispute_opened: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  case_closed: { icon: Archive, color: "text-gray-500", bg: "bg-gray-500/10" }
};

export function TimelineEventItem({ event, isLast }: TimelineEventItemProps) {
  const config = eventConfig[event.type] || { icon: Shield, color: "text-gray-500", bg: "bg-gray-500/10" };
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-white/10 my-2" />
        )}
      </div>

      <div className={`flex-1 pb-6 ${isLast ? "" : "mb-2"}`}>
        <div className="bg-[#1A1A1D] rounded-lg border border-white/10 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-white font-medium">{event.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{event.description}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
              {formatDistanceToNow(event.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
              {event.actorType === "freelancer" ? "Freelancer" : 
               event.actorType === "client" ? "Cliente" : "Sistema"}
            </span>
            <span className="text-xs text-gray-500">
              por {event.actorName}
            </span>
          </div>

          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <details className="text-sm">
                <summary className="text-gray-500 cursor-pointer hover:text-gray-400">
                  Ver detalhes
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
