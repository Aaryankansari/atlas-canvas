import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Search, Shield, Globe, AlertTriangle, Sparkles, Mail, User, Hash, AtSign, ExternalLink, Activity, Crosshair, Network, Zap, Clock, Layers } from "lucide-react";
import { Editor, createShapeId } from "tldraw";
import { useState, forwardRef, useEffect, useCallback } from "react";
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
  researchSteps?: string[];
}

type ScanMode = "quick" | "deep";
type PanelTab = "scan" | "history";

const ResearchProgress = ({ scanning, mode }: { scanning: boolean, mode: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Initializing Atlas Neural Link...",
    "Bypassing perimeter firewalls...",
    "Querying surface web indices...",
    "Accessing darknet data repositories...",
    "Correlating breach identity footprints...",
    "Synthesizing tactical intelligence..."
  ];

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, mode === "deep" ? 2000 : 800);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [scanning, mode]);

  if (!scanning) return null;

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-md overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[2px] loading-bar-sweep" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Deep Research Active</span>
        </div>
        <span className="text-[10px] font-mono text-primary/60">{Math.round((currentStep + 1) / steps.length * 100)}%</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.2,
              x: 0,
              color: i === currentStep ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
            }}
            className="flex items-center gap-3"
          >
            <div className={`w-1 h-1 rounded-full ${i <= currentStep ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-muted"}`} />
            <span className={`text-[11px] font-mono ${i === currentStep ? "font-bold step-pulse" : ""}`}>
              {step}
            </span>
            {i < currentStep && <Shield className="w-3 h-3 text-emerald-500 ml-auto" />}
          </motion.div>
        ))}
      </div>

      <div className="pt-2">
        <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const AnalystPanel = ({ isOpen, onClose, editor, selectedCount }: AnalystPanelProps) => {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [researchSteps, setResearchSteps] = useState<string[]>([]);
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
  const [autoMap, setAutoMap] = useState(true);

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
      setResearchSteps(data.researchSteps || []);

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
        researchSteps: data.researchSteps,
      };
      setFullScanData(scanData);

      if (autoMap && editor) {
        const { x, y } = editor.getViewportPageBounds().center;
        const id = createShapeId();
        editor.createShape({
          id,
          type: "intel-node",
          x: x - 140,
          y: y - 85,
          props: {
            label: queryText,
            entityType: entityType as any,
            riskLevel: scanData.riskLevel as any,
            summary: scanData.summary,
            aiBio: scanData.aiBio,
            confidence: "high",
            metadata: scanData.metadata,
            categories: scanData.categories,
            evidenceLinks: scanData.evidenceLinks,
            rawResults: scanData.results,
            isWatched: scanMode === "deep",
          },
        });
        editor.select(id);
        toast.success("Intelligence node spawned");
      }

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
    setResearchSteps([]);
    setResults([]);
    setSummary("");
    setRiskLevel("");
    setFullScanData(null);
    setSourcesQueried([]);

    const entityType = detectEntityType(query);

    try {
      const endpoint = scanMode === "deep" ? "deep-search" : "osint-scan";
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { query: query.trim(), entityType },
      });
      if (error) throw error;
      processScanResult(data, entityType, query.trim());
      setScannedQuery(query);
    } finally {
      setScanning(false);
    }
  };

  const handleBatchScan = async (entities: string[]) => {
    setBatchScanning(true);
    let completed = 0;

    for (const entity of entities) {
      const entityType = detectEntityType(entity);
      try {
        const endpoint = scanMode === "deep" ? "deep-search" : "osint-scan";
        const { data, error: fnError } = await supabase.functions.invoke(endpoint, {
          body: { query: entity.trim(), entityType },
        });

        if (!fnError && data) {
          // data already available from supabase.functions.invoke
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
          completed++;
          toast.success(`Captured: ${entity}`);
        } else {
          throw new Error("API error");
        }
      } catch {
        completed++;
        toast.error(`Failed connection: ${entity}`);
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
    e.dataTransfer.setData("application/atlas-node", JSON.stringify(data));
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
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${activeTab === tab.id
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
                <div className="flex gap-1 p-0.5 rounded-xl bg-muted/30 border border-border/50">
                  {(["quick", "deep"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setScanMode(mode)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-300 ${scanMode === mode
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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

              {/* Search & Controls */}
              <div className="p-4 border-b border-border/50 space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    placeholder="Search footprint..."
                    className="relative w-full pl-10 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 bg-muted/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleScan}
                    disabled={!query.trim() || scanning}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${scanMode === "deep"
                      ? "bg-gradient-to-r from-primary via-emerald-500 to-primary background-animate text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                      : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20"
                      }`}
                  >
                    {scanning ? (
                      <>
                        <motion.div
                          className="w-3 h-3 border-2 rounded-full border-primary-foreground/20 border-t-primary-foreground"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        {scanMode === "deep" ? "Analyzing..." : "Scanning..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {scanMode === "deep" ? "Run Intelligence" : "Deep Scan"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setBatchOpen(!batchOpen)}
                    className="px-3.5 py-3 rounded-xl text-xs font-medium bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
                    title="Batch investigation"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>

                {/* Auto-Map Toggle */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 cursor-help" title="Automatically spawn discovery nodes on the canvas.">
                    <div className={`w-2 h-2 rounded-full ${autoMap ? "bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" : "bg-muted-foreground/30"}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto-Map Intelligence</span>
                  </div>
                  <button
                    onClick={() => setAutoMap(!autoMap)}
                    className={`w-9 h-5 rounded-full transition-all duration-300 relative ${autoMap ? "bg-primary" : "bg-muted"}`}
                  >
                    <motion.div
                      animate={{ x: autoMap ? 18 : 2 }}
                      initial={false}
                      className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                    />
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
              <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                <ResearchProgress scanning={scanning} mode={scanMode} />

                {(results.length > 0 || fullScanData) && !scanning ? (
                  <>
                    <div className="flex items-center justify-between px-1">
                      <div className="text-[11px] font-mono text-muted-foreground/60 flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Target: <span className="text-primary font-bold">{scannedQuery}</span>
                      </div>
                      {sourcesQueried.length > 0 && (
                        <span className="text-[9px] text-muted-foreground/40 font-mono bg-muted/30 px-2 py-0.5 rounded-md">
                          {sourcesQueried.length} SDKs
                        </span>
                      )}
                    </div>

                    {/* Classification badge */}
                    {fullScanData?.classification && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[9px] font-bold text-primary/60 uppercase tracking-tighter">AI Classification</div>
                          <div className={`text-xs font-black uppercase tracking-widest ${fullScanData.classification === "malicious"
                            ? "text-red-500 glitch-text"
                            : fullScanData.classification === "suspicious"
                              ? "text-amber-500"
                              : "text-primary"
                            }`}>
                            {fullScanData.classification}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {summary && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                        <p className="text-[12px] leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors italic">"{summary}"</p>
                        {riskLevel && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Risk Level:</span>
                            <span
                              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border"
                              style={{
                                background: riskLevel === "critical" || riskLevel === "high" ? "rgba(239,68,68,0.1)" : riskLevel === "medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                                color: riskLevel === "critical" || riskLevel === "high" ? "#ef4444" : riskLevel === "medium" ? "#f59e0b" : "#10b981",
                                borderColor: riskLevel === "critical" || riskLevel === "high" ? "#ef444433" : riskLevel === "medium" ? "#f59e0b33" : "#10b98133",
                              }}
                            >
                              {riskLevel}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pivot Suggestions */}
                    {fullScanData?.pivotSuggestions && fullScanData.pivotSuggestions.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                          <Network className="w-3.5 h-3.5 text-primary" /> Discovery Pivots
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {fullScanData.pivotSuggestions.slice(0, 5).map((p: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => handlePivot(p.entity)}
                              className="text-[11px] px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all font-mono group"
                              title={p.rationale}
                            >
                              <span className="text-primary/50 group-hover:text-primary transition-colors mr-1">#</span>
                              {p.entity}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1 flex justify-between items-center">
                        <span>Intelligence Findings</span>
                        <span className="text-[9px] opacity-40">Drag to Workspace</span>
                      </div>
                      <div className="space-y-2.5">
                        {results.map((result, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <DraggableResultCard result={result} />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {fullScanData?.recommendations && fullScanData.recommendations.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                          <Shield className="w-3.5 h-3.5 text-primary" /> Counterintelligence
                        </span>
                        {fullScanData.recommendations.slice(0, 3).map((rec: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${(rec.priority || "medium") === "high" ? "bg-red-500 animate-pulse" : (rec.priority || "medium") === "medium" ? "bg-amber-500" : "bg-primary"
                              }`} />
                            <span className="text-[11px] text-muted-foreground leading-relaxed">
                              {typeof rec === "string" ? rec : rec.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Telemetry Status</div>
                    <div className="space-y-2">
                      <StatusCard icon={<Shield className="w-4 h-4" />} label="OPSEC Status" value="Encrypted" color="emerald" />
                      <StatusCard icon={<Globe className="w-4 h-4" />} label="Active Nodes" value={`${selectedCount} units`} color="cyan" />
                      <StatusCard icon={<AlertTriangle className="w-4 h-4" />} label="Threat Level" value="Nominal" color="amber" />
                    </div>

                    <div className="mt-8">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Quick Scanners</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "IP Tracer", hint: "8.8.8.8", icon: Globe },
                          { label: "Email Breach", hint: "leak@intel.com", icon: Mail },
                          { label: "WHOIS Deep", hint: "target.com", icon: ExternalLink },
                          { label: "Profile Recon", hint: "@shadow", icon: User },
                          { label: "Wallet Trace", hint: "bc1q...", icon: Hash },
                          { label: "DNS Audit", hint: "ns1.target.com", icon: Network },
                        ].map((action) => (
                          <button
                            key={action.label}
                            onClick={() => { setQuery(action.hint); setScanMode("deep"); }}
                            className="p-3 rounded-xl text-left bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted transition-all group"
                          >
                            <action.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                            <div className="text-[11px] font-bold text-foreground/80">{action.label}</div>
                            <div className="text-[9px] text-muted-foreground font-mono mt-0.5 truncate">{action.hint}</div>
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
