"use client";

import { TimelineEvent } from "@/types/agreement";
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock4,
  Edit3,
  DollarSign,
  Clock,
  AlertTriangle,
  MessageSquare,
  Ban,
} from "lucide-react";

interface TimelineEventItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

export function TimelineEventItem({ event, isLast }: TimelineEventItemProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "agreement_created":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "invitation_sent":
        return <Send className="w-4 h-4 text-purple-400" />;
      case "client_confirmed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "client_contested":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "deadline_extension_requested":
        return <Clock4 className="w-4 h-4 text-orange-400" />;
      case "deadline_extension_accepted":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "deadline_extension_rejected":
        return <Ban className="w-4 h-4 text-red-400" />;
      case "amendment_created":
        return <Edit3 className="w-4 h-4 text-cyan-400" />;
      case "amendment_accepted":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "charge_created":
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      case "charge_paid":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "charge_contested":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "notice_sent":
        return <Send className="w-4 h-4 text-blue-400" />;
      case "notice_responded":
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case "dispute_opened":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "case_closed":
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-white/10" />
      )}

      <div className="relative z-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
        {getEventIcon(event.type)}
      </div>

      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{event.title}</span>
          <span className="text-xs text-gray-500">• {formatDate(event.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-400 mb-1">{event.description}</p>
        <p className="text-xs text-gray-500">Por: {event.actorName}</p>
      </div>
    </div>
  );
}
