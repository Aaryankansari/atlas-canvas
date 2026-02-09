import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ExternalLink, User, MapPin, Wallet, AtSign, Brain, ChevronRight } from "lucide-react";
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground/75">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export const DeepDivePanel = ({ node, onClose }: DeepDivePanelProps) => {
  if (!node) return null;

  const { props } = node;
  const risk = riskColors[props.riskLevel] || riskColors.low;
  const icon = entityIcons[props.entityType] || "🔍";

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="absolute right-3 top-3 bottom-3 w-[380px] z-50 flex flex-col rounded-2xl overflow-hidden bg-card/90 backdrop-blur-xl border border-border shadow-xl"
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-secondary">
                {icon}
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-foreground tracking-tight">{props.label}</h2>
                <span className="text-[11px] capitalize text-muted-foreground">{props.entityType}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Risk Level */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: risk.dot }} />
              <span className="text-[11px] font-medium text-muted-foreground">Risk Level</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ml-auto" style={{ background: risk.bg, color: risk.text }}>
                {props.riskLevel}
              </span>
            </div>

            {/* AI Bio */}
            {props.aiBio && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground">Investigator's Brief</span>
                </div>
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[12px] leading-relaxed text-foreground/80">{props.aiBio}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            {props.summary && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Summary</span>
                </div>
                <p className="text-[12px] leading-relaxed text-foreground/60">{props.summary}</p>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-4">
              <CategorySection icon={<User className="w-3.5 h-3.5" />} title="Aliases" items={props.categories?.aliases} />
              <CategorySection icon={<MapPin className="w-3.5 h-3.5" />} title="Locations" items={props.categories?.locations} />
              <CategorySection icon={<Wallet className="w-3.5 h-3.5" />} title="Financials" items={props.categories?.financials} />
              <CategorySection icon={<AtSign className="w-3.5 h-3.5" />} title="Socials" items={props.categories?.socials} />
            </div>

            {/* Raw Results */}
            {props.rawResults && props.rawResults.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-medium text-muted-foreground">All Findings · {props.rawResults.length}</span>
                <div className="space-y-1">
                  {props.rawResults.map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.04em" }}>{r.label}</div>
                        <div className="text-[11px] truncate mt-0.5 text-foreground/70">{r.value}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>
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
