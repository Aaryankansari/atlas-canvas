import { motion } from "framer-motion";
import { AlertCircle, Globe, Shield, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

interface IntelEvent {
    id: string;
    source: string;
    type: string;
    message: string;
    timestamp: string;
}

const SOURCES = ["INTERPOL", "CIA-DATA", "MI6-NET", "DARK-WEB-MD", "CYBER-WATCH"];
const TYPES = ["BREACH", "TARGET-ACTIVE", "SIGNAL-DETECTED", "LEAK", "DISSIDENT-MOVE"];
const MESSAGES = [
    "Large BTC transfer on monitored wallet",
    "New metadata correlate found in Eastern Europe",
    "DDoS attack detected on infrastructure node",
    "Shadow profile identified on dark forum",
    "Encrypted communication intercept (unresolvable)",
    "Geo-location hit in designated high-risk zone",
];

export const ThreatIntelFeed = () => {
    const [events, setEvents] = useState<IntelEvent[]>([]);

    useEffect(() => {
        const generateEvent = () => {
            const newEvent: IntelEvent = {
                id: Math.random().toString(36).substr(2, 9),
                source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
                type: TYPES[Math.floor(Math.random() * TYPES.length)],
                message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            };
            setEvents(prev => [newEvent, ...prev].slice(0, 10));
        };

        const interval = setInterval(generateEvent, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[40] w-full max-w-4xl px-4 pointer-events-none">
            <div className="relative h-10 overflow-hidden flex items-center bg-black/40 backdrop-blur-md rounded-full border border-primary/10 px-6 shadow-2xl">
                <div className="flex items-center gap-2 mr-6 flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Global Intel Feed</span>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/0 to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/0 to-transparent z-10" />

                    <div className="flex gap-12 animate-infinite-scroll whitespace-nowrap">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-center gap-3">
                                <span className="text-[8px] font-mono text-muted-foreground/50">[{event.timestamp}]</span>
                                <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{event.source}:</span>
                                <span className="text-[10px] font-medium text-foreground/70 uppercase tracking-tight">{event.message}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
        }
      `}</style>
        </div>
    );
};
