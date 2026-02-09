import React from "react";

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "cyan" | "emerald" | "amber";
}

const dotColors = {
  cyan: "#3b82f6",
  emerald: "#16a34a",
  amber: "#d97706",
};

export const StatusCard = ({ icon, label, value, color }: StatusCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all bg-muted/50 border border-border">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[11px] font-medium text-foreground/70">{value}</div>
      </div>
      <div className="w-2 h-2 rounded-full" style={{ background: dotColors[color] }} />
    </div>
  );
};
