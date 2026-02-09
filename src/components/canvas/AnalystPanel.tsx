import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Search, Shield, Globe, AlertTriangle, Sparkles } from "lucide-react";
import { Editor } from "tldraw";
import { useState } from "react";

interface AnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  selectedCount: number;
}

export const AnalystPanel = ({ isOpen, onClose, editor, selectedCount }: AnalystPanelProps) => {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    if (!query.trim()) return;
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-[380px] glass-panel border-l z-40 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Intelligence Analyst</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="Search entity, IP, email, handle..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono transition-all"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={!query.trim() || scanning}
              className="mt-3 w-full py-2 bg-primary/15 text-primary border border-primary/30 rounded-lg text-xs font-semibold hover:bg-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-cyan"
            >
              {scanning ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Scan with AI
                </>
              )}
            </button>
          </div>

          {/* Status */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
              Canvas Status
            </div>

            <StatusCard
              icon={<Shield className="w-4 h-4" />}
              label="OPSEC Status"
              value="Protected"
              color="emerald"
            />
            <StatusCard
              icon={<Globe className="w-4 h-4" />}
              label="Nodes Active"
              value={`${selectedCount} selected`}
              color="cyan"
            />
            <StatusCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Threat Level"
              value="Low"
              color="amber"
            />

            <div className="mt-6">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Trace IP", "Find Emails", "WHOIS Lookup", "Social Scan"].map((action) => (
                  <button
                    key={action}
                    className="px-3 py-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-xs font-mono text-secondary-foreground hover:text-foreground transition-all text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Briefing placeholder */}
            <div className="mt-6 p-4 rounded-lg border border-border bg-secondary/50">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                Live Briefing
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select canvas elements and run a scan to generate an intelligence briefing from visible nodes.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatusCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "cyan" | "emerald" | "amber";
}) => {
  const colorMap = {
    cyan: "text-primary border-primary/20 bg-primary/5",
    emerald: "text-accent border-accent/20 bg-accent/5",
    amber: "text-amber-glow border-amber-glow/20 bg-amber-glow/5",
  };

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
