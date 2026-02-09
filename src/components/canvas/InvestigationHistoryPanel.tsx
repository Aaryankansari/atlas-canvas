import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Search, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";
import { Investigation } from "@/hooks/useInvestigationHistory";

interface InvestigationHistoryPanelProps {
  history: Investigation[];
  loading: boolean;
  onRerun: (investigation: Investigation) => void;
  onDelete: (id: string) => void;
}

const riskDot: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-destructive",
  critical: "bg-destructive",
};

export const InvestigationHistoryPanel = ({
  history,
  loading,
  onRerun,
  onDelete,
}: InvestigationHistoryPanelProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          className="w-5 h-5 border-2 rounded-full border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto" />
        <p className="text-[11px] text-muted-foreground">No investigations yet</p>
        <p className="text-[10px] text-muted-foreground/60">Scan an entity to start building history</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {history.map((inv, i) => (
        <motion.div
          key={inv.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border hover:border-primary/10 hover:bg-muted/50 transition-all cursor-pointer"
          onClick={() => onRerun(inv)}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${riskDot[inv.risk_level || "low"]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-foreground truncate">{inv.query}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground/60 font-mono flex-shrink-0">
                {inv.scan_mode}
              </span>
            </div>
            <div className="text-[9px] text-muted-foreground/50 mt-0.5">
              {new Date(inv.created_at).toLocaleDateString()} · {inv.entity_type}
              {inv.risk_level && ` · ${inv.risk_level}`}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRerun(inv);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              title="Re-investigate"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(inv.id);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  );
};
