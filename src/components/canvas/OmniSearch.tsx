import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, FileText, Image as ImageIcon, Database, Globe, Cpu, Shield, Zap, Terminal, Hash, User, Mail, ExternalLink, X } from 'lucide-react';
import { Editor, createShapeId } from 'tldraw';
import { toast } from 'sonner';

interface ResultItem {
    id: string;
    type: 'file' | 'node' | 'osint' | 'log';
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    category: string;
    data?: any;
}

interface OmniSearchProps {
    editor: Editor | null;
}

export const OmniSearch = ({ editor }: OmniSearchProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [results, setResults] = useState<ResultItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev);
        setQuery('');
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleOpen();
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, toggleOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const mockSearch = useCallback((q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        const lowerQ = q.toLowerCase();
        const categories = [
            {
                name: 'Workspace Nodes',
                items: [
                    { id: 'n1', type: 'node', label: 'Identity Mapping - V1', sublabel: 'Canvas Node #412', icon: <Cpu className="w-4 h-4" /> },
                    { id: 'n2', type: 'node', label: 'Traffic Analysis', sublabel: 'Canvas Node #88', icon: <Cpu className="w-4 h-4" /> },
                ]
            },
            {
                name: 'OSINT Crawl (Simulated)',
                items: [
                    { id: 'o1', type: 'osint', label: `${q} Identity Profile`, sublabel: 'Deep Web Repository', icon: <Database className="w-4 h-4" /> },
                    { id: 'o2', type: 'osint', label: `@${q} Social Footprint`, sublabel: 'Indexed Social Media', icon: <User className="w-4 h-4" /> },
                    { id: 'o3', type: 'osint', label: `${q}@proton.me`, sublabel: 'Leaked Email Database', icon: <Mail className="w-4 h-4" /> },
                ]
            },
            {
                name: 'System Files & Photos',
                items: [
                    { id: 'f1', type: 'file', label: `intelligence_packet_${q}.pdf`, sublabel: 'Encrypted Document', icon: <FileText className="w-4 h-4" /> },
                    { id: 'f2', type: 'file', label: `surveillance_image_${q}_01.png`, sublabel: 'Satellite Imagery', icon: <ImageIcon className="w-4 h-4" /> },
                ]
            },
            {
                name: 'Telemetry Logs',
                items: [
                    { id: 'l1', type: 'log', label: `Unauthorized access attempt: ${q}`, sublabel: 'System Security Log', icon: <Terminal className="w-4 h-4" /> },
                    { id: 'l2', type: 'log', label: `Pivoting to ${q} infrastructure`, sublabel: 'Investigation Trace', icon: <Zap className="w-4 h-4" /> },
                ]
            }
        ];

        const filtered = categories.flatMap(cat =>
            cat.items.filter(item =>
                item.label.toLowerCase().includes(lowerQ) ||
                item.sublabel.toLowerCase().includes(lowerQ)
            ).map(item => ({ ...item, category: cat.name } as ResultItem))
        );

        setResults(filtered.slice(0, 8));
        setSelectedIndex(0);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            mockSearch(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query, mockSearch]);

    const handleSelect = (result: ResultItem) => {
        if (result.type === 'osint' || result.type === 'node') {
            if (editor) {
                const { x, y } = editor.getViewportPageBounds().center;
                const id = createShapeId();
                editor.createShape({
                    id,
                    type: 'intel-node',
                    x: x - 140,
                    y: y - 85,
                    props: {
                        label: result.label,
                        entityType: 'general',
                        riskLevel: 'medium',
                        summary: `Automated recovery of ${result.label} from ${result.sublabel}.`,
                        isWatched: true,
                    } as any,
                });
                editor.select(id);
                toast.success(`Deployed: ${result.label}`);
            }
        } else {
            toast.info(`Accessing ${result.label}...`);
        }
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#020205]/40 backdrop-blur-md pointer-events-auto"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-[#09090b]/90 border border-primary/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto shadow-primary/5"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input */}
                        <div className="relative flex items-center p-4 border-b border-border/50">
                            <Search className="w-5 h-5 text-primary/60 mr-3" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search Omni Intelligence (files, text, photos, OSINT)..."
                                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 text-sm font-mono"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50 shadow-inner">
                                <Command className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground">K</span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar relative">
                            <div className="absolute inset-0 pointer-events-none z-10 scanline opacity-[0.05]" />
                            {query.length === 0 ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                        <Globe className="w-6 h-6 text-primary animate-pulse" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">Omni Search Active</h3>
                                    <p className="text-[11px] text-muted-foreground/60 mt-2 max-w-[240px]">
                                        Type any identifier to crawl local nodes, files, and global OSINT databases.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
                                        {[
                                            { icon: <Hash />, label: 'File Indexing' },
                                            { icon: <User />, label: 'Social Recon' },
                                            { icon: <Mail />, label: 'Breach Search' },
                                            { icon: <ImageIcon />, label: 'Visual Intel' },
                                        ].map((tip, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                                                <span className="w-4 h-4 text-primary/40">{tip.icon}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{tip.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {results.map((result, index) => (
                                        <div
                                            key={result.id}
                                            onClick={() => handleSelect(result)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${index === selectedIndex
                                                ? 'bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                                : 'hover:bg-muted/30 border border-transparent'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${index === selectedIndex ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground group-hover:text-primary'
                                                }`}>
                                                {result.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-foreground truncate">{result.label}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-muted/50 text-muted-foreground">
                                                        {result.category}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{result.sublabel}</div>
                                            </div>
                                            <div className={`transition-opacity ${index === selectedIndex ? 'opacity-100' : 'opacity-0'}`}>
                                                <ExternalLink className="w-4 h-4 text-primary" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <Shield className="w-8 h-8 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground font-mono">No intelligence found for "{query}"</p>
                                    <button
                                        onClick={() => toast.success(`Initiating global broadcast for: ${query}`)}
                                        className="mt-4 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                    >
                                        Broadcast Wide-Spectrum Search
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border shadow-sm">↑↓</kbd> Navigate</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border shadow-sm">Enter</kbd> Deploy</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Omni Index v2.4.0
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
