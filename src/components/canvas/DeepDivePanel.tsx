import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ExternalLink, User, MapPin, Wallet, AtSign, AlertTriangle, Brain, ChevronRight } from "lucide-react";
import { IntelNodeShape, entityIcons } from "./intel-node/types";

interface DeepDivePanelProps {
  node: IntelNodeShape | null;
  onClose: () => void;
}

const riskColors: Record<string, { dot: string; text: string; bg: string }> = {
  low: { dot: "#34d399", text: "#34d399", bg: "rgba(52, 211, 153, 0.1)" },
  medium: { dot: "#fbbf24", text: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
  high: { dot: "#f87171", text: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },
  critical: { dot: "#ef4444", text: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span style={{ color: "rgba(255,255,255,0.35)" }}>{icon}</span>
        <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
          {title}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="text-[11px] px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              color: "rgba(255, 255, 255, 0.75)",
            }}
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
          className="absolute right-3 top-3 bottom-3 w-[380px] z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(28, 28, 30, 0.75)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.05) inset",
          }}
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(255, 255, 255, 0.06)" }}
              >
                {icon}
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-foreground tracking-tight">{props.label}</h2>
                <span className="text-[11px] capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {props.entityType}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-all"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Risk Level */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: risk.dot }} />
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Risk Level
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ml-auto"
                style={{ background: risk.bg, color: risk.text }}
              >
                {props.riskLevel}
              </span>
            </div>

            {/* AI Bio */}
            {props.aiBio && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5" style={{ color: "rgba(99, 179, 237, 0.7)" }} />
                  <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Investigator's Brief
                  </span>
                </div>
                <div
                  className="p-3.5 rounded-xl"
                  style={{
                    background: "rgba(99, 179, 237, 0.06)",
                    border: "1px solid rgba(99, 179, 237, 0.1)",
                  }}
                >
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {props.aiBio}
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            {props.summary && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
                  <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Summary
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {props.summary}
                </p>
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
                <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  All Findings · {props.rawResults.length}
                </span>
                <div className="space-y-1">
                  {props.rawResults.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                      style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
                          {r.label}
                        </div>
                        <div className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {r.value}
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Links */}
            {props.evidenceLinks && props.evidenceLinks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Evidence
                </span>
                <div className="space-y-1">
                  {props.evidenceLinks.map((link: string, i: number) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl transition-all hover:bg-white/[0.04]"
                      style={{ color: "rgba(99, 179, 237, 0.8)" }}
                    >
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
