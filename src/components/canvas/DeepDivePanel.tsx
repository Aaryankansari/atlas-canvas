import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ExternalLink, User, MapPin, Wallet, AtSign, AlertTriangle, Brain } from "lucide-react";
import { IntelNodeShape, entityIcons } from "./intel-node/types";

interface DeepDivePanelProps {
  node: IntelNodeShape | null;
  onClose: () => void;
}

const riskTagColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: "bg-accent/15", text: "text-accent", border: "border-accent/30" },
  medium: { bg: "bg-amber-glow/15", text: "text-amber-glow", border: "border-amber-glow/30" },
  high: { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30" },
  critical: { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/40" },
};

const CategorySection = ({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="text-[10px] font-mono px-2 py-1 rounded bg-secondary border border-border text-foreground"
          >
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
  const risk = riskTagColors[props.riskLevel] || riskTagColors.low;
  const icon = entityIcons[props.entityType] || "🔍";

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-[400px] glass-panel border-l z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{props.label}</h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {props.entityType} • Deep Dive
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Risk Level */}
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Risk Level</span>
              <span
                className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded border ${risk.bg} ${risk.text} ${risk.border}`}
              >
                {props.riskLevel}
              </span>
            </div>

            {/* AI Bio */}
            {props.aiBio && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">Investigator's Brief</span>
                </div>
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-xs leading-relaxed text-foreground">{props.aiBio}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            {props.summary && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">Summary</span>
                </div>
                <p className="text-xs leading-relaxed text-secondary-foreground">{props.summary}</p>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-3">
              <CategorySection icon={<User className="w-3.5 h-3.5" />} title="Aliases" items={props.categories?.aliases} />
              <CategorySection icon={<MapPin className="w-3.5 h-3.5" />} title="Locations" items={props.categories?.locations} />
              <CategorySection icon={<Wallet className="w-3.5 h-3.5" />} title="Financials" items={props.categories?.financials} />
              <CategorySection icon={<AtSign className="w-3.5 h-3.5" />} title="Socials" items={props.categories?.socials} />
            </div>

            {/* Raw Results */}
            {props.rawResults && props.rawResults.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  All Findings ({props.rawResults.length})
                </span>
                <div className="space-y-1.5">
                  {props.rawResults.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded border border-border bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-mono uppercase text-muted-foreground">{r.label}</div>
                        <div className="text-[11px] font-mono text-foreground truncate">{r.value}</div>
                      </div>
                      <span className="text-[8px] font-mono uppercase text-muted-foreground">{r.confidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Links */}
            {props.evidenceLinks && props.evidenceLinks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Evidence Links</span>
                <div className="space-y-1">
                  {props.evidenceLinks.map((link: string, i: number) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link.length > 50 ? link.slice(0, 47) + "..." : link}
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
