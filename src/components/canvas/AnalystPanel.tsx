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
                  Scanning with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Scan with AI
                </>
              )}
            </button>
          </div>

          {/* Results / Status */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {results.length > 0 ? (
              <>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  AI Scan — <span className="text-primary">{scannedQuery}</span>
                </div>
                {summary && (
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 mb-3">
                    <p className="text-xs font-mono text-foreground">{summary}</p>
                    {riskLevel && (
                      <span className={`mt-2 inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        riskLevel === "critical" ? "bg-destructive/20 text-destructive" :
                        riskLevel === "high" ? "bg-destructive/15 text-destructive" :
                        riskLevel === "medium" ? "bg-amber-glow/15 text-amber-glow" :
                        "bg-accent/15 text-accent"
                      }`}>
                        Risk: {riskLevel}
                      </span>
                    )}
                  </div>
                )}

                {/* Drag full scan as IntelNode */}
                {fullScanData && (
                  <div
                    draggable
                    onDragStart={handleDragFullResult}
                    className="p-3 rounded-lg border border-primary/30 bg-primary/10 cursor-grab active:cursor-grabbing hover:bg-primary/15 transition-all mb-2 glow-cyan"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-primary">Drag to create Intelligence Node</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Full scan with auto-linking • {results.length} findings
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-mono text-muted-foreground mb-2">
                  ↕ Drag individual results or the full scan onto the canvas
                </div>
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <DraggableResultCard result={result} />
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                  Canvas Status
                </div>
                <StatusCard icon={<Shield className="w-4 h-4" />} label="OPSEC Status" value="Protected" color="emerald" />
                <StatusCard icon={<Globe className="w-4 h-4" />} label="Nodes Active" value={`${selectedCount} selected`} color="cyan" />
                <StatusCard icon={<AlertTriangle className="w-4 h-4" />} label="Threat Level" value="Low" color="amber" />

                <div className="mt-6">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Trace IP", "Find Emails", "WHOIS Lookup", "Social Scan"].map((action) => (
                      <button
                        key={action}
                        onClick={() => setQuery(action)}
                        className="px-3 py-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-xs font-mono text-secondary-foreground hover:text-foreground transition-all text-left"
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
