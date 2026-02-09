import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Search, Shield, Globe, AlertTriangle, Sparkles, Mail, User, Hash, AtSign, ExternalLink } from "lucide-react";
import { Editor } from "tldraw";
import { useState, forwardRef } from "react";

interface AnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  selectedCount: number;
}

interface ScanResult {
  type: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
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

function generateMockResults(query: string, entityType: string): ScanResult[] {
  const q = query.trim();
  switch (entityType) {
    case "email": {
      const domain = q.split("@")[1] || "unknown.com";
      const user = q.split("@")[0] || "user";
      return [
        { type: "email", icon: <Mail className="w-3.5 h-3.5" />, label: "Email Identified", value: q, confidence: "high" },
        { type: "domain", icon: <Globe className="w-3.5 h-3.5" />, label: "Domain", value: domain, confidence: "high" },
        { type: "username", icon: <User className="w-3.5 h-3.5" />, label: "Possible Username", value: user, confidence: "medium" },
        { type: "breach", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Breach Check", value: "Requires API connection", confidence: "low" },
        { type: "social", icon: <AtSign className="w-3.5 h-3.5" />, label: "Social Profiles", value: `Searching for ${user}...`, confidence: "medium" },
      ];
    }
    case "ip":
      return [
        { type: "ip", icon: <Globe className="w-3.5 h-3.5" />, label: "IP Address", value: q, confidence: "high" },
        { type: "geo", icon: <Globe className="w-3.5 h-3.5" />, label: "Geolocation", value: "Requires API connection", confidence: "low" },
        { type: "asn", icon: <Hash className="w-3.5 h-3.5" />, label: "ASN Lookup", value: "Pending backend", confidence: "low" },
      ];
    case "username":
      return [
        { type: "username", icon: <User className="w-3.5 h-3.5" />, label: "Username", value: q.replace("@", ""), confidence: "high" },
        { type: "social", icon: <AtSign className="w-3.5 h-3.5" />, label: "Social Scan", value: `Checking platforms for ${q}`, confidence: "medium" },
        { type: "profile", icon: <ExternalLink className="w-3.5 h-3.5" />, label: "Profile Links", value: "Requires Sherlock integration", confidence: "low" },
      ];
    default:
      return [
        { type: "query", icon: <Search className="w-3.5 h-3.5" />, label: "Search Query", value: q, confidence: "high" },
        { type: "entities", icon: <User className="w-3.5 h-3.5" />, label: "Entity Extraction", value: "Requires AI backend", confidence: "low" },
      ];
  }
}

export const AnalystPanel = ({ isOpen, onClose, editor, selectedCount }: AnalystPanelProps) => {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scannedQuery, setScannedQuery] = useState("");

  const handleScan = () => {
    if (!query.trim() || scanning) return;
    setScanning(true);
    setResults([]);
    const entityType = detectEntityType(query);
    setTimeout(() => {
      setResults(generateMockResults(query, entityType));
      setScannedQuery(query);
      setScanning(false);
    }, 1500);
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

          {/* Results / Status */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {results.length > 0 ? (
              <>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                  Scan Results — <span className="text-primary">{scannedQuery}</span>
                </div>
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ResultCard result={result} />
                  </motion.div>
                ))}
                <div className="mt-4 p-3 rounded-lg border border-border bg-secondary/50">
                  <p className="text-[10px] font-mono text-muted-foreground">
                    ⚡ Local analysis complete. Enable Cloud backend for live OSINT queries (WHOIS, breach checks, social scanning).
                  </p>
                </div>
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

const ResultCard = ({ result }: { result: ScanResult }) => {
  const confColors = {
    high: "text-accent",
    medium: "text-primary",
    low: "text-muted-foreground",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/80 transition-all">
      <div className="mt-0.5 text-primary">{result.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{result.label}</div>
        <div className="text-xs font-mono text-foreground truncate mt-0.5">{result.value}</div>
      </div>
      <span className={`text-[9px] font-mono uppercase ${confColors[result.confidence]}`}>
        {result.confidence}
      </span>
    </div>
  );
};

const StatusCard = ({ icon, label, value, color }: {
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
