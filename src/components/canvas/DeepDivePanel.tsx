import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ExternalLink, User, MapPin, Wallet, AtSign, Brain, ChevronRight, Network, Clock, Crosshair, ArrowRight, Sparkles, Layers } from "lucide-react";
import { IntelNodeShape, entityIcons } from "./intel-node/types";

interface DeepDivePanelProps {
  node: IntelNodeShape | null;
  onClose: () => void;
}

const riskColors: Record<string, { dot: string; text: string; bg: string }> = {
  low: { dot: "#16a34a", text: "#16a34a", bg: "rgba(22,163,74,0.06)" },
  medium: { dot: "#d97706", text: "#d97706", bg: "rgba(217,119,6,0.06)" },
  high: { dot: "#dc2626", text: "#dc2626", bg: "rgba(220,38,38,0.06)" },
  critical: { dot: "#dc2626", text: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};

const CategorySection = ({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{title}</span>
        <span className="text-[9px] text-muted-foreground/50 ml-auto">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground/75 hover:border-primary/20 transition-colors cursor-default"
          >
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export const DeepDivePanel = ({ node, onClose }: DeepDivePanelProps) => {
  if (!node) return null;

  const { props } = node;
  const risk = riskColors[props.riskLevel] || riskColors.low;
  const icon = entityIcons[props.entityType] || "🔍";

  const indicatorCount =
    (props.metadata?.emails?.length || 0) +
    (props.metadata?.ips?.length || 0) +
    (props.metadata?.btcWallets?.length || 0) +
    (props.metadata?.usernames?.length || 0) +
    (props.metadata?.domains?.length || 0);

  return (
    <AnimatePresence mode="wait">
      {node && (
        <motion.div
          key={node.id}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
          className="absolute right-4 top-4 bottom-4 w-[420px] z-[60] flex flex-col rounded-[24px] overflow-hidden glass-panel border-primary/20 shadow-2xl shadow-primary/10"
        >
          {/* Animated Scanline Effect */}
          <div className="scanline" />

          {/* Header */}
          <div className="relative p-6 border-b border-border/50 overflow-hidden">
            {/* Glow background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-muted/50 border border-border/50 shadow-inner ${props.isWatched ? "radar-pulse" : ""}`}
                >
                  {icon}
                </motion.div>
                <div className="min-w-0">
                  <h2 className="text-[17px] font-black text-foreground tracking-tight truncate leading-tight">{props.label}</h2>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary/70">{props.entityType}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">ID: {node.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Status & Risk Section */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl border border-border/50 bg-muted/20"
              >
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1.5 leading-none">Intelligence Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${props.isWatched ? "bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" : "bg-emerald-500"}`} />
                  <span className="text-[11px] font-bold uppercase tracking-tight">{props.isWatched ? "Active Radar" : "Historical"}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-3.5 rounded-2xl border border-border/50 bg-muted/20"
              >
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1.5 leading-none">Security Risk</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: risk.dot }} />
                  <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: risk.text }}>{props.riskLevel}</span>
                </div>
              </motion.div>
            </div>

            {/* AI Analysis */}
            {(props.aiBio || props.summary) && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Semantic Analysis</h3>
                </div>
                <div className="relative p-5 rounded-2xl bg-primary/[0.03] border border-primary/20 backdrop-blur-sm overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-foreground/80 font-medium italic">
                    {props.aiBio || props.summary}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Visual Indicators Grid (Mini Charts Mockup) */}
            <div className="grid grid-cols-2 gap-4">
              <CategorySection icon={<User className="w-4 h-4" />} title="Aliases" items={props.categories?.aliases} />
              <CategorySection icon={<MapPin className="w-4 h-4" />} title="Locations" items={props.categories?.locations} />
              <CategorySection icon={<Wallet className="w-4 h-4" />} title="Financials" items={props.categories?.financials} />
              <CategorySection icon={<AtSign className="w-4 h-4" />} title="Digital Identities" items={props.categories?.socials} />
            </div>

            {/* Timeline/Acitivity Mockup */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Recent Activity</h3>
              </div>
              <div className="space-y-3 pl-2 border-l border-border/50">
                {[1, 2].map((_, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-primary/40 border-2 border-background" />
                    <div className="text-[10px] text-muted-foreground/60 font-mono mb-0.5">2024-02-09 14:00:23</div>
                    <div className="text-[12px] font-bold text-foreground/80">{i === 0 ? "New footprint detected on Darknet" : "Node relationship mapped automatically"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & External Intelligence */}
            {props.rawResults && props.rawResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Raw Intelligence</h3>
                  </div>
                  <span className="text-[10px] font-mono text-primary/50">{props.rawResults.length} Units</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {props.rawResults.slice(0, 6).map((r: any, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/30 hover:bg-muted/40 hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] uppercase font-bold text-muted-foreground/40 tracking-widest mb-0.5 group-hover:text-primary transition-colors">{r.label}</div>
                        <div className="text-xs font-mono text-foreground/70 truncate">{r.value}</div>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ml-3 ${r.confidence === "high" ? "bg-primary animate-pulse" : r.confidence === "medium" ? "bg-amber-500" : "bg-muted-foreground/30"
                        }`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-muted/30 border-t border-border/50 grid grid-cols-2 gap-3">
            <button className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Full Report
            </button>
            <button className="py-2.5 px-4 rounded-xl bg-muted border border-border/50 text-foreground text-[11px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center justify-center gap-2">
              <Network className="w-3.5 h-3.5" /> Map Network
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
