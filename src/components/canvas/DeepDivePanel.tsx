import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ExternalLink, User, MapPin, Wallet, AtSign, Brain, ChevronRight, Network, Clock, Crosshair, ArrowRight } from "lucide-react";
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
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="absolute right-3 top-3 bottom-3 w-[380px] z-50 flex flex-col rounded-2xl overflow-hidden bg-card/95 backdrop-blur-xl border border-border shadow-xl"
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-muted"
              >
                {icon}
              </motion.div>
              <div>
                <h2 className="text-[14px] font-semibold text-foreground tracking-tight">{props.label}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] capitalize text-muted-foreground">{props.entityType}</span>
                  {indicatorCount > 0 && (
                    <span className="text-[9px] text-muted-foreground/50">· {indicatorCount} indicators</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Risk Level */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30"
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: risk.dot }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[11px] font-medium text-muted-foreground flex-1">Risk Level</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg" style={{ background: risk.bg, color: risk.text }}>
                {props.riskLevel}
              </span>
            </motion.div>

            {/* AI Bio */}
            {props.aiBio && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground">Investigator's Brief</span>
                </div>
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[12px] leading-relaxed text-foreground/80">{props.aiBio}</p>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            {props.summary && !props.aiBio && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Summary</span>
                </div>
                <p className="text-[12px] leading-relaxed text-foreground/60">{props.summary}</p>
              </motion.div>
            )}

            {/* Categories */}
            <div className="space-y-4">
              <CategorySection icon={<User className="w-3.5 h-3.5" />} title="Aliases" items={props.categories?.aliases} />
              <CategorySection icon={<MapPin className="w-3.5 h-3.5" />} title="Locations" items={props.categories?.locations} />
              <CategorySection icon={<Wallet className="w-3.5 h-3.5" />} title="Financials" items={props.categories?.financials} />
              <CategorySection icon={<AtSign className="w-3.5 h-3.5" />} title="Socials" items={props.categories?.socials} />
              <CategorySection icon={<Network className="w-3.5 h-3.5" />} title="Infrastructure" items={(props.categories as any)?.infrastructure} />
              <CategorySection icon={<User className="w-3.5 h-3.5" />} title="Associates" items={(props.categories as any)?.associates} />
            </div>

            {/* Raw Results */}
            {props.rawResults && props.rawResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2.5"
              >
                <span className="text-[11px] font-medium text-muted-foreground">All Findings · {props.rawResults.length}</span>
                <div className="space-y-1.5">
                  {props.rawResults.map((r: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-primary/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.04em" }}>{r.label}</div>
                          {r.source && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground/50 font-mono">{r.source}</span>
                          )}
                        </div>
                        <div className="text-[11px] truncate mt-0.5 text-foreground/70">{r.value}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          r.confidence === "high" ? "bg-emerald-500" : r.confidence === "medium" ? "bg-blue-500" : "bg-gray-300"
                        }`} />
                        <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/30" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Evidence Links */}
            {props.evidenceLinks && props.evidenceLinks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-medium text-muted-foreground">Evidence</span>
                <div className="space-y-1">
                  {props.evidenceLinks.map((link: string, i: number) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl transition-all text-primary hover:bg-primary/5">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
