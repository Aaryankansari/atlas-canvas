import React from "react";

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "cyan" | "emerald" | "amber";
}

const colorMap = {
  cyan: "text-primary border-primary/20 bg-primary/5",
  emerald: "text-accent border-accent/20 bg-accent/5",
  amber: "text-amber-glow border-amber-glow/20 bg-amber-glow/5",
};

export const StatusCard = ({ icon, label, value, color }: StatusCardProps) => {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colorMap[color]} transition-all`}>
      <div className="opacity-70">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">{label}</div>
        <div className="text-xs font-semibold">{value}</div>
      </div>
    </div>
  );
};
