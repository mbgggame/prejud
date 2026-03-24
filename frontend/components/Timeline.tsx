"use client";

import { TimelineEvent } from "@/types/agreement";

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}
import { TimelineEventItem } from "./TimelineEventItem";
import { History } from "lucide-react";

export function Timeline({ events, className }: TimelineProps) {
  // Ordenar eventos por data (mais recente primeiro)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedEvents.length === 0) {
    return (
      <div className={`bg-[#1A1A1D] rounded-xl border border-white/10 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Histórico do Caso</h3>
        </div>
        <p className="text-gray-500 text-center py-8">
          Nenhum evento registrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[#1A1A1D] rounded-xl border border-white/10 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-semibold text-white">Histórico do Caso</h3>
        <span className="text-sm text-gray-500 ml-auto">
          {sortedEvents.length} evento{sortedEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-0">
        {sortedEvents.map((event, index) => (
          <TimelineEventItem 
            key={event.id} 
            event={event} 
            isLast={index === sortedEvents.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
