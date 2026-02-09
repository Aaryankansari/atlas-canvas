import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Search, Shield, Globe, AlertTriangle, Sparkles, Mail, User, Hash, AtSign, ExternalLink, Activity } from "lucide-react";
import { Editor } from "tldraw";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DraggableResultCard, type ScanResult } from "./DraggableResultCard";
import { StatusCard } from "./StatusCard";
import { toast } from "sonner";

interface AnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  selectedCount: number;
}

function detectEntityType(query: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const btcRegex = /^(1|3|bc1)[a-zA-Z0-9]{25,42}$/;
  const usernameRegex = /^@?[a-zA-Z0-9_]{3,30}$/;

  if (emailRegex.test(query.trim())) return "email";
  if (ipRegex.test(query.trim())) return "ip";
  if (btcRegex.test(query.trim())) return "btc";
  if (usernameRegex.test(query.trim())) return "username";
  return "general";
}

const iconMap: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  domain: <Globe className="w-3.5 h-3.5" />,
  username: <User className="w-3.5 h-3.5" />,
  breach: <AlertTriangle className="w-3.5 h-3.5" />,
  social: <AtSign className="w-3.5 h-3.5" />,
  ip: <Globe className="w-3.5 h-3.5" />,
  geo: <Globe className="w-3.5 h-3.5" />,
  asn: <Hash className="w-3.5 h-3.5" />,
  profile: <ExternalLink className="w-3.5 h-3.5" />,
  query: <Search className="w-3.5 h-3.5" />,
  entities: <User className="w-3.5 h-3.5" />,
  raw: <Brain className="w-3.5 h-3.5" />,
  risk: <Activity className="w-3.5 h-3.5" />,
};

interface FullScanData {
  summary: string;
  aiBio: string;
  riskLevel: string;
  categories: { aliases: string[]; locations: string[]; financials: string[]; socials: string[] };
  metadata: { emails: string[]; ips: string[]; btcWallets: string[]; usernames: string[]; domains: string[] };
  evidenceLinks: string[];
  results: any[];
  entityType: string;
}

export const AnalystPanel = ({ isOpen, onClose, editor, selectedCount }: AnalystPanelProps) => {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scannedQuery, setScannedQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [fullScanData, setFullScanData] = useState<FullScanData | null>(null);

  const handleScan = async () => {
    if (!query.trim() || scanning) return;
    setScanning(true);
    setResults([]);
    setSummary("");
    setRiskLevel("");
    setFullScanData(null);

    const entityType = detectEntityType(query);

    try {
      const { data, error } = await supabase.functions.invoke("osint-scan", {
        body: { query: query.trim(), entityType },
      });

      if (error) throw error;

      if (data?.results && Array.isArray(data.results)) {
        const mapped: ScanResult[] = data.results.map((r: any) => ({
          type: r.type || "general",
          icon: iconMap[r.type] || <Search className="w-3.5 h-3.5" />,
          label: r.label || r.type,
          value: r.value || "",
          confidence: r.confidence || "medium",
        }));
        setResults(mapped);
        setSummary(data.summary || "");
        setRiskLevel(data.riskLevel || "low");
        setFullScanData({
          summary: data.summary || "",
          aiBio: data.aiBio || "",
          riskLevel: data.riskLevel || "low",
          categories: data.categories || { aliases: [], locations: [], financials: [], socials: [] },
          metadata: data.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
          evidenceLinks: data.evidenceLinks || [],
          results: data.results || [],
          entityType: data.entityType || entityType,
        });
      } else if (data?.error) {
        toast.error(data.error);
      }

      setScannedQuery(query);
    } catch (err: any) {
      console.error("Scan failed:", err);
      toast.error(err.message || "Scan failed. Check your connection.");
    } finally {
      setScanning(false);
    }
  };

  const handleDragFullResult = (e: React.DragEvent) => {
    if (!fullScanData) return;
    const data = {
      isIntelNode: true,
      label: scannedQuery,
      entityType: fullScanData.entityType,
      riskLevel: fullScanData.riskLevel,
      summary: fullScanData.summary,
      aiBio: fullScanData.aiBio,
      confidence: "high",
      metadata: fullScanData.metadata,
      categories: fullScanData.categories,
      evidenceLinks: fullScanData.evidenceLinks,
      rawResults: fullScanData.results,
    };
    e.dataTransfer.setData("application/icarus-node", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="absolute right-3 top-3 bottom-3 w-[360px] z-40 flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "rgba(28, 28, 30, 0.75)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.05) inset",
          }}
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99, 179, 237, 0.1)" }}
              >
                <Brain className="w-3.5 h-3.5" style={{ color: "rgba(99, 179, 237, 0.8)" }} />
              </div>
              <h2 className="text-[13px] font-semibold text-foreground tracking-tight">AI Analyst</h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-all"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="Email, IP, username, wallet..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all font-mono"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99, 179, 237, 0.3)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 179, 237, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={!query.trim() || scanning}
              className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: scanning ? "rgba(99, 179, 237, 0.08)" : "rgba(99, 179, 237, 0.12)",
                color: "rgba(99, 179, 237, 0.9)",
                border: "1px solid rgba(99, 179, 237, 0.15)",
              }}
            >
              {scanning ? (
                <>
                  <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,179,237,0.2)", borderTopColor: "rgba(99,179,237,0.8)" }} />
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

          {/* Results */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {results.length > 0 ? (
              <>
                <div className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Results for <span style={{ color: "rgba(99,179,237,0.8)" }}>{scannedQuery}</span>
                </div>

                {summary && (
                  <div className="p-3.5 rounded-xl" style={{ background: "rgba(99, 179, 237, 0.06)", border: "1px solid rgba(99,179,237,0.1)" }}>
                    <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{summary}</p>
                    {riskLevel && (
                      <span
                        className="mt-2 inline-block text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
                        style={{
                          background: riskLevel === "critical" || riskLevel === "high" ? "rgba(248,113,113,0.12)" : riskLevel === "medium" ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
                          color: riskLevel === "critical" || riskLevel === "high" ? "#f87171" : riskLevel === "medium" ? "#fbbf24" : "#34d399",
                        }}
                      >
                        {riskLevel}
                      </span>
                    )}
                  </div>
                )}

                {fullScanData && (
                  <div
                    draggable
                    onDragStart={handleDragFullResult}
                    className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200"
                    style={{
                      background: "rgba(99, 179, 237, 0.06)",
                      border: "1px solid rgba(99,179,237,0.12)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(99, 179, 237, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(99, 179, 237, 0.06)";
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Brain className="w-4 h-4" style={{ color: "rgba(99, 179, 237, 0.7)" }} />
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold" style={{ color: "rgba(99,179,237,0.9)" }}>
                          Create Intelligence Node
                        </div>
                        <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Drag to canvas · {results.length} findings · auto-links
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Drag items onto the canvas
                </div>

                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <DraggableResultCard result={result} />
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                <div className="text-[11px] font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Status
                </div>
                <StatusCard icon={<Shield className="w-4 h-4" />} label="OPSEC" value="Protected" color="emerald" />
                <StatusCard icon={<Globe className="w-4 h-4" />} label="Selected" value={`${selectedCount} nodes`} color="cyan" />
                <StatusCard icon={<AlertTriangle className="w-4 h-4" />} label="Threat" value="Low" color="amber" />

                <div className="mt-6">
                  <div className="text-[11px] font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Trace IP", "Find Emails", "WHOIS Lookup", "Social Scan"].map((action) => (
                      <button
                        key={action}
                        onClick={() => setQuery(action)}
                        className="px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 text-left"
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                          e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                          e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
