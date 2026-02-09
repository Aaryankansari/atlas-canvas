import React from "react";

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "cyan" | "emerald" | "amber";
}

const dotColors = {
  cyan: "rgba(99, 179, 237, 0.8)",
  emerald: "rgba(52, 211, 153, 0.8)",
  amber: "rgba(251, 191, 36, 0.8)",
};

export const StatusCard = ({ icon, label, value, color }: StatusCardProps) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.3)" }}>{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
        <div className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{value}</div>
      </div>
      <div className="w-2 h-2 rounded-full" style={{ background: dotColors[color] }} />
    </div>
  );
};
