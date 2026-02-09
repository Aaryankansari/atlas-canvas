import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Search, Shield, Globe, AlertTriangle, Sparkles, Mail, User, Hash, AtSign, ExternalLink, Activity, Crosshair, Network, Zap, Clock, Layers } from "lucide-react";
import { Editor } from "tldraw";
import { useState, forwardRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DraggableResultCard, type ScanResult } from "./DraggableResultCard";
import { StatusCard } from "./StatusCard";
import { BatchScanInput } from "./BatchScanInput";
import { InvestigationHistoryPanel } from "./InvestigationHistoryPanel";
import { useInvestigationHistory, Investigation } from "@/hooks/useInvestigationHistory";
import { toast } from "sonner";

interface AnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  selectedCount: number;
}

function detectEntityType(query: string): string {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query.trim())) return "email";
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query.trim())) return "ip";
  if (/^(1|3|bc1)[a-zA-Z0-9]{25,42}$/.test(query.trim())) return "btc";
  if (/^@?[a-zA-Z0-9_]{3,30}$/.test(query.trim())) return "username";
  if (/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(query.trim())) return "domain";
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
  infrastructure: <Network className="w-3.5 h-3.5" />,
  threat: <Crosshair className="w-3.5 h-3.5" />,
};

interface FullScanData {
  summary: string;
  aiBio: string;
  riskLevel: string;
  categories: { aliases: string[]; locations: string[]; financials: string[]; socials: string[]; infrastructure?: string[]; associates?: string[] };
  metadata: { emails: string[]; ips: string[]; btcWallets: string[]; usernames: string[]; domains: string[] };
  evidenceLinks: string[];
  results: any[];
  entityType: string;
  classification?: string;
  threatProfile?: any;
  networkMap?: any;
  timeline?: any[];
  recommendations?: any[];
  pivotSuggestions?: any[];
  rawIntel?: any;
}

type ScanMode = "quick" | "deep";
type PanelTab = "scan" | "history";

export const AnalystPanel = ({ isOpen, onClose, editor, selectedCount }: AnalystPanelProps) => {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scannedQuery, setScannedQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [fullScanData, setFullScanData] = useState<FullScanData | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>("quick");
  const [sourcesQueried, setSourcesQueried] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<PanelTab>("scan");
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchScanning, setBatchScanning] = useState(false);

  const { history, loading: historyLoading, saveInvestigation, deleteInvestigation } = useInvestigationHistory();

  const processScanResult = (data: any, entityType: string, queryText: string) => {
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
      setSourcesQueried(data.rawIntel?.sources || data.rawIntel?.sourcesQueried || []);

      const scanData: FullScanData = {
        summary: data.summary || "",
        aiBio: data.aiBio || "",
        riskLevel: data.riskLevel || "low",
        categories: data.categories || { aliases: [], locations: [], financials: [], socials: [] },
        metadata: data.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
        evidenceLinks: data.evidenceLinks || [],
        results: data.results || [],
        entityType: data.entityType || entityType,
        classification: data.classification,
        threatProfile: data.threatProfile,
        networkMap: data.networkMap,
        timeline: data.timeline,
        recommendations: data.recommendations,
        pivotSuggestions: data.pivotSuggestions,
        rawIntel: data.rawIntel,
      };
      setFullScanData(scanData);

      // Save to history
      saveInvestigation({
        query: queryText,
        entity_type: entityType,
        scan_mode: scanMode,
        risk_level: data.riskLevel || "low",
        classification: data.classification || null,
        summary: data.summary || null,
        ai_bio: data.aiBio || null,
        results: data.results || [],
        categories: data.categories || {},
        metadata: data.metadata || {},
        evidence_links: data.evidenceLinks || [],
        threat_profile: data.threatProfile || null,
        network_map: data.networkMap || null,
        pivot_suggestions: data.pivotSuggestions || null,
        recommendations: data.recommendations || null,
        raw_intel: data.rawIntel || null,
      });
    } else if (data?.error) {
      toast.error(data.error);
    }
  };

  const handleScan = async () => {
    if (!query.trim() || scanning) return;
    setScanning(true);
    setResults([]);
    setSummary("");
    setRiskLevel("");
    setFullScanData(null);
    setSourcesQueried([]);

    const entityType = detectEntityType(query);
    const endpoint = scanMode === "deep" ? "deep-search" : "osint-scan";

    try {
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { query: query.trim(), entityType },
      });
      if (error) throw error;
      processScanResult(data, entityType, query.trim());
      setScannedQuery(query);
    } catch (err: any) {
      console.error("Scan failed:", err);
      toast.error(err.message || "Scan failed. Check your connection.");
    } finally {
      setScanning(false);
    }
  };

  const handleBatchScan = async (entities: string[]) => {
    setBatchScanning(true);
    let completed = 0;

    for (const entity of entities) {
      const entityType = detectEntityType(entity);
      const endpoint = scanMode === "deep" ? "deep-search" : "osint-scan";

      try {
        const { data, error } = await supabase.functions.invoke(endpoint, {
          body: { query: entity.trim(), entityType },
        });
        if (!error && data) {
          // Save each result
          await saveInvestigation({
            query: entity.trim(),
            entity_type: entityType,
            scan_mode: scanMode,
            risk_level: data.riskLevel || "low",
            classification: data.classification || null,
            summary: data.summary || null,
            ai_bio: data.aiBio || null,
            results: data.results || [],
            categories: data.categories || {},
            metadata: data.metadata || {},
            evidence_links: data.evidenceLinks || [],
            threat_profile: data.threatProfile || null,
            network_map: data.networkMap || null,
            pivot_suggestions: data.pivotSuggestions || null,
            recommendations: data.recommendations || null,
            raw_intel: data.rawIntel || null,
          });
        }
        completed++;
        toast.success(`Scanned ${completed}/${entities.length}: ${entity}`);
      } catch {
        completed++;
        toast.error(`Failed: ${entity}`);
      }
    }

    setBatchScanning(false);
    setBatchOpen(false);
    setActiveTab("history");
    toast.success(`Batch scan complete: ${completed}/${entities.length}`);
  };

  const handleRerunInvestigation = (inv: Investigation) => {
    setQuery(inv.query);
    setScanMode(inv.scan_mode as ScanMode);
    setActiveTab("scan");

    // Restore the results display
    if (inv.results && Array.isArray(inv.results)) {
      const mapped: ScanResult[] = inv.results.map((r: any) => ({
        type: r.type || "general",
        icon: iconMap[r.type] || <Search className="w-3.5 h-3.5" />,
        label: r.label || r.type,
        value: r.value || "",
        confidence: r.confidence || "medium",
      }));
      setResults(mapped);
      setSummary(inv.summary || "");
      setRiskLevel(inv.risk_level || "");
      setScannedQuery(inv.query);
      setFullScanData({
        summary: inv.summary || "",
        aiBio: inv.ai_bio || "",
        riskLevel: inv.risk_level || "low",
        categories: inv.categories || { aliases: [], locations: [], financials: [], socials: [] },
        metadata: inv.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
        evidenceLinks: inv.evidence_links || [],
        results: inv.results || [],
        entityType: inv.entity_type,
        classification: inv.classification || undefined,
        threatProfile: inv.threat_profile,
        networkMap: inv.network_map,
        recommendations: inv.recommendations,
        pivotSuggestions: inv.pivot_suggestions,
        rawIntel: inv.raw_intel,
      });
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

  const handlePivot = (entity: string) => {
    setQuery(entity);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="absolute right-3 top-3 bottom-3 w-[380px] z-40 flex flex-col rounded-2xl overflow-hidden bg-card/95 backdrop-blur-xl border border-border shadow-xl"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2.5">
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10"
                animate={scanning ? { rotate: 360 } : {}}
                transition={scanning ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
              >
                <Brain className="w-3.5 h-3.5 text-primary" />
              </motion.div>
              <h2 className="text-[13px] font-semibold text-foreground tracking-tight">AI Analyst</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Tabs */}
          <div className="px-4 pt-3 pb-1 space-y-2">
            <div className="flex gap-1 p-0.5 rounded-xl bg-muted/50 border border-border">
              {([
                { id: "scan" as const, icon: Search, label: "Investigate" },
                { id: "history" as const, icon: Clock, label: `History${history.length > 0 ? ` (${history.length})` : ""}` },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="p-4 flex-1 overflow-y-auto">
              <InvestigationHistoryPanel
                history={history}
                loading={historyLoading}
                onRerun={handleRerunInvestigation}
                onDelete={deleteInvestigation}
              />
            </div>
          )}

          {/* Scan Tab */}
          {activeTab === "scan" && (
            <>
              {/* Mode Toggle */}
              <div className="px-4 pt-2 pb-1">
                <div className="flex gap-1 p-0.5 rounded-xl bg-muted/50 border border-border">
                  {(["quick", "deep"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setScanMode(mode)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                        scanMode === mode
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode === "quick" ? (
                        <><Zap className="w-3 h-3" /> Quick Scan</>
                      ) : (
                        <><Crosshair className="w-3 h-3" /> Deep Search</>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    placeholder="Email, IP, username, domain, wallet..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleScan}
                    disabled={!query.trim() || scanning}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      scanMode === "deep"
                        ? "bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground hover:opacity-90"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {scanning ? (
                      <>
                        <motion.div
                          className="w-3 h-3 border-2 rounded-full border-primary-foreground/20 border-t-primary-foreground"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        {scanMode === "deep" ? "Deep scanning..." : "Scanning..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {scanMode === "deep" ? "Deep Search" : "Scan"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setBatchOpen(!batchOpen)}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title="Batch scan multiple entities"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                </div>

                <BatchScanInput
                  isOpen={batchOpen}
                  onClose={() => setBatchOpen(false)}
                  onScan={handleBatchScan}
                  scanning={batchScanning}
                />
              </div>

              {/* Results */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {(results.length > 0 || fullScanData) ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-mono text-muted-foreground">
                        Results for <span className="text-primary font-semibold">{scannedQuery}</span>
                      </div>
                      {sourcesQueried.length > 0 && (
                        <span className="text-[9px] text-muted-foreground/60 font-mono">
                          {sourcesQueried.length} sources
                        </span>
                      )}
                    </div>

                    {/* Classification badge for deep search */}
                    {fullScanData?.classification && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-medium text-muted-foreground">Classification:</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                          fullScanData.classification === "malicious"
                            ? "bg-destructive/10 text-destructive"
                            : fullScanData.classification === "suspicious"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-primary/10 text-primary"
                        }`}>
                          {fullScanData.classification}
                        </span>
                      </motion.div>
                    )}

                    {summary && (
                      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[11px] leading-relaxed text-foreground/70">{summary}</p>
                        {riskLevel && (
                          <span
                            className="mt-2 inline-block text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
                            style={{
                              background: riskLevel === "critical" || riskLevel === "high" ? "rgba(220,38,38,0.08)" : riskLevel === "medium" ? "rgba(217,119,6,0.08)" : "rgba(22,163,74,0.08)",
                              color: riskLevel === "critical" || riskLevel === "high" ? "#dc2626" : riskLevel === "medium" ? "#d97706" : "#16a34a",
                            }}
                          >
                            {riskLevel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Sources queried */}
                    {sourcesQueried.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sourcesQueried.map((src, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground font-mono">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pivot Suggestions */}
                    {fullScanData?.pivotSuggestions && fullScanData.pivotSuggestions.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                          <Network className="w-3 h-3" /> Investigate Next
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {fullScanData.pivotSuggestions.slice(0, 5).map((p: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => handlePivot(p.entity)}
                              className="text-[10px] px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-all font-mono"
                              title={p.rationale}
                            >
                              {p.entity}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drag to canvas */}
                    {fullScanData && (
                      <div
                        draggable
                        onDragStart={handleDragFullResult}
                        className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 bg-primary/5 border border-primary/10 hover:bg-primary/10"
                      >
                        <div className="flex items-center gap-2.5">
                          <Brain className="w-4 h-4 text-primary" />
                          <div className="flex-1">
                            <div className="text-[11px] font-semibold text-primary">Create Intelligence Node</div>
                            <div className="text-[10px] text-muted-foreground">Drag to canvas · {results.length} findings · auto-links</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-muted-foreground/60">Drag items onto the canvas</div>

                    {results.map((result, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <DraggableResultCard result={result} />
                      </motion.div>
                    ))}

                    {/* Recommendations */}
                    {fullScanData?.recommendations && fullScanData.recommendations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                          <Shield className="w-3 h-3" /> Recommendations
                        </span>
                        {fullScanData.recommendations.slice(0, 4).map((rec: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/30 border border-border">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                              (rec.priority || "medium") === "high" ? "bg-destructive" : (rec.priority || "medium") === "medium" ? "bg-amber-500" : "bg-primary"
                            }`} />
                            <span className="text-[11px] text-foreground/70 leading-relaxed">
                              {typeof rec === "string" ? rec : rec.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-[11px] font-medium mb-3 text-muted-foreground">Status</div>
                    <StatusCard icon={<Shield className="w-4 h-4" />} label="OPSEC" value="Protected" color="emerald" />
                    <StatusCard icon={<Globe className="w-4 h-4" />} label="Selected" value={`${selectedCount} nodes`} color="cyan" />
                    <StatusCard icon={<AlertTriangle className="w-4 h-4" />} label="Threat" value="Low" color="amber" />

                    <div className="mt-6">
                      <div className="text-[11px] font-medium mb-3 text-muted-foreground">Quick Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Trace IP", hint: "192.168.1.1" },
                          { label: "Find Emails", hint: "user@example.com" },
                          { label: "WHOIS Lookup", hint: "example.com" },
                          { label: "Social Scan", hint: "@username" },
                          { label: "Breach Check", hint: "user@email.com" },
                          { label: "Wallet Trace", hint: "1A1zP1..." },
                        ].map((action) => (
                          <button
                            key={action.label}
                            onClick={() => { setQuery(action.hint); setScanMode("deep"); }}
                            className="px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 text-left bg-muted border border-border text-foreground/60 hover:bg-muted/80 hover:text-foreground hover:border-primary/10"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
