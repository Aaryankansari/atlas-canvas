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

const confColors = {
  high: "text-accent",
  medium: "text-primary",
  low: "text-muted-foreground",
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
      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/80 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="mt-0.5 text-primary">{result.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {result.label}
        </div>
        <div className="text-xs font-mono text-foreground truncate mt-0.5">
          {result.value}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[9px] font-mono uppercase ${confColors[result.confidence]}`}>
          {result.confidence}
        </span>
        <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};
