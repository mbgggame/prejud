"use client";

import { TimelineEvent } from "@/types/agreement";
import { TimelineEventItem } from "./TimelineEventItem";

interface TimelineProps {
  events: TimelineEvent[];
  title?: string;
}

export function Timeline({ events, title = "Histórico do caso" }: TimelineProps) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-6">{title}</h2>

      <div className="space-y-0">
        {events.map((event, index) => (
          <TimelineEventItem
            key={event.id}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
