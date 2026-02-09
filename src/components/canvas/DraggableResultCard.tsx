import { GripVertical } from "lucide-react";
import React from "react";

export interface ScanResult {
  type: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
}

interface DraggableResultCardProps {
  result: ScanResult;
}

const confDot: Record<string, string> = {
  high: "#16a34a",
  medium: "#3b82f6",
  low: "#d1d5db",
};

export const DraggableResultCard = ({ result }: DraggableResultCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    const data = {
      type: "osint-result",
      label: result.label,
      value: result.value,
      confidence: result.confidence,
      entityType: result.type,
    };
    e.dataTransfer.setData("application/icarus-node", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing group bg-muted/50 border border-border hover:bg-muted hover:border-primary/10 hover:shadow-sm hover:scale-[1.01] hover:-translate-y-px active:scale-[0.98]"
    >
      <div className="mt-0.5 text-primary/50 group-hover:text-primary/80 transition-colors">{result.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{result.label}</div>
        <div className="text-[11px] font-mono truncate mt-0.5 text-foreground/75">{result.value}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: confDot[result.confidence] }}
        />
        <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40" />
      </div>
    </div>
  );
};
