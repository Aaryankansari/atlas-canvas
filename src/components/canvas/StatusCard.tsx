import React from "react";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="flex items-center gap-3 p-3 rounded-xl transition-colors bg-muted/50 border border-border hover:border-primary/10 hover:shadow-sm"
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[11px] font-medium text-foreground/70">{value}</div>
      </div>
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: dotColors[color] }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
