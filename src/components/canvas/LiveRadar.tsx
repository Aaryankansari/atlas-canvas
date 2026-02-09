import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, AlertCircle, Signal, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { Editor } from "tldraw";
import { INTEL_NODE_TYPE, IntelNodeShape } from "./intel-node/types";

interface RadarEvent {
    id: string;
    nodeId: string;
    nodeLabel: string;
    type: "footprint" | "breach" | "network" | "alert";
    message: string;
    timestamp: string;
}

const EVENT_TYPES = {
    footprint: { icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
    breach: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
    network: { icon: Signal, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    alert: { icon: Shield, color: "text-amber-400", bg: "bg-amber-400/10" },
};

const MESSAGES = [
    "New metadata footprint detected",
    "Associated IP address active",
    "Correlation found with known database",
    "Domain WHOIS record updated",
    "Social media hit on related alias",
    "Leaked credential detected in batch",
    "Encrypted traffic pattern matched",
    "DNS resolution change observed",
];

export const LiveRadar = ({ editor }: { editor: Editor | null }) => {
    const [events, setEvents] = useState<RadarEvent[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [watchedNodes, setWatchedNodes] = useState<IntelNodeShape[]>([]);

    // Update watched nodes
    useEffect(() => {
        if (!editor) return;
        const unsub = editor.store.listen(() => {
            const allIntel = editor.getCurrentPageShapes().filter(s => s.type === INTEL_NODE_TYPE) as IntelNodeShape[];
            const watched = allIntel.filter(s => s.props.isWatched);
            setWatchedNodes(watched);
        });
        return unsub;
    }, [editor]);

    // Simulate live events
    useEffect(() => {
        if (watchedNodes.length === 0) return;

        const interval = setInterval(() => {
            const node = watchedNodes[Math.floor(Math.random() * watchedNodes.length)];
            const typeKeys = Object.keys(EVENT_TYPES) as (keyof typeof EVENT_TYPES)[];
            const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];

            const newEvent: RadarEvent = {
                id: Math.random().toString(36).substr(2, 9),
                nodeId: node.id,
                nodeLabel: node.props.label,
                type,
                message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            };

            setEvents(prev => [newEvent, ...prev].slice(0, 10));
        }, 8000 + Math.random() * 5000);

        return () => clearInterval(interval);
    }, [watchedNodes]);

    if (watchedNodes.length === 0 && !isExpanded) return null;

    return (
        <div className={`absolute bottom-16 left-4 z-[40] transition-all duration-500 ease-in-out ${isExpanded ? "w-[320px]" : "w-[240px]"}`}>
            <motion.div
                layout
                className="glass-panel border-primary/20 overflow-hidden shadow-2xl flex flex-col"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {/* Header */}
                <div
                    className="p-3 bg-primary/5 flex items-center justify-between cursor-pointer border-b border-border/50"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <Radio className={`w-4 h-4 text-primary ${watchedNodes.length > 0 ? "animate-pulse" : ""}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Intelligence Radar</span>
                        {watchedNodes.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black">
                                {watchedNodes.length} ACTIVE
                            </span>
                        )}
                    </div>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>

                {/* Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="max-h-[300px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                {events.length === 0 ? (
                                    <div className="p-8 text-center space-y-2">
                                        <Activity className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">No live telemetry yet</p>
                                        <p className="text-[9px] text-muted-foreground/50">Nodes marked for 'Watch' will appear here</p>
                                    </div>
                                ) : (
                                    events.map((event) => {
                                        const Config = EVENT_TYPES[event.type];
                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-2.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                                                onClick={() => editor?.select(event.nodeId as any)}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <div className={`p-1.5 rounded-lg ${Config.bg} ${Config.color} mt-0.5 shadow-inner`}>
                                                        <Config.icon className="w-3 h-3" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-[10px] font-black text-primary/80 truncate group-hover:text-primary transition-colors">{event.nodeLabel}</span>
                                                            <span className="text-[8px] font-mono text-muted-foreground/50">{event.timestamp}</span>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground leading-tight">{event.message}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer / Status */}
                            <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-emerald-500" /> OPSEC NOMINAL
                                </div>
                                <button
                                    onClick={() => setEvents([])}
                                    className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                                >
                                    Clear Logs
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mini Preview (when collapsed) */}
                {!isExpanded && events.length > 0 && (
                    <div className="px-3 py-2 flex items-center gap-2 overflow-hidden bg-background/20 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                        <p className="text-[10px] text-foreground/60 truncate font-medium">
                            Latest: <span className="text-foreground">{events[0].message}</span>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
