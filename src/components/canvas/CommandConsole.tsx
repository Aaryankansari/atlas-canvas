import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, ChevronRight, Hash, Shield, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface LogEntry {
    id: string;
    type: "info" | "warning" | "success" | "error";
    text: string;
    timestamp: string;
}

export const CommandConsole = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        const addLog = (text: string, type: LogEntry["type"] = "info") => {
            setLogs(prev => [...prev, {
                id: Math.random().toString(36),
                type,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            }].slice(-30));
        };

        // Initial system logs
        addLog("ICARUS KERNEL V.1.04 INITIALIZED", "success");
        addLog("DECRYPTING VISINT STREAMS...", "info");
        addLog("CONNECTION SECURE - AES-256 ENCRYPTION ACTIVE", "success");

        const timer = setInterval(() => {
            if (Math.random() > 0.7) {
                const events = [
                    "Ping received from relay node 10.4.55.1",
                    "Cache refreshed for active search parameters",
                    "OPSEC check: No surveillance detected",
                    "SDK: Google Maps API resolution completed",
                    "Scanning local memory for unauthorized hooks",
                ];
                addLog(events[Math.floor(Math.random() * events.length)], "info");
            }
        }, 10000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute bottom-16 right-4 z-[40]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[400px] h-[300px] glass-panel border-primary/20 flex flex-col overflow-hidden mb-2"
                    >
                        <div className="p-3 bg-black/40 flex items-center justify-between border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Command Console</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-1.5 custom-scrollbar bg-black/20">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-3 leading-relaxed">
                                    <span className="text-muted-foreground/40 font-bold">[{log.timestamp}]</span>
                                    <span className={`font-black uppercase tracking-tighter ${log.type === "success" ? "text-emerald-500" :
                                            log.type === "warning" ? "text-amber-500" :
                                                log.type === "error" ? "text-red-500" : "text-primary/70"
                                        }`}>
                                        {log.type === "info" ? "SYS" : log.type.slice(0, 3)}
                                    </span>
                                    <span className="text-foreground/80 terminal-glow italic">{log.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-black/40 border-t border-border/50 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
                            <input
                                type="text"
                                placeholder="EXECUTE COMMAND..."
                                className="bg-transparent border-none outline-none text-[10px] font-mono text-primary placeholder:text-primary/20 flex-1 uppercase font-black"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setLogs(prev => [...prev, {
                                            id: Math.random().toString(36),
                                            type: "info",
                                            text: `EXECUTING: ${(e.target as HTMLInputElement).value}`,
                                            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                                        }]);
                                        (e.target as HTMLInputElement).value = "";
                                    }
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full glass-panel flex items-center justify-center transition-all ${isOpen ? "bg-primary text-primary-foreground border-primary" : "text-primary hover:border-primary/40"}`}
            >
                <Terminal className="w-5 h-5" />
            </button>
        </div>
    );
};
