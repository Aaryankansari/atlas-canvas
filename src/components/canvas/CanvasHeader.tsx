import { useState } from "react";
import { Radar, Download, Globe, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { ExportMenu } from "./ExportMenu";

interface CanvasHeaderProps {
  onToggleAnalyst: () => void;
  analystOpen: boolean;
  onSmartLayout: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  satelliteMode: boolean;
  onToggleSatellite: () => void;
}

export const CanvasHeader = ({
  onToggleAnalyst,
  analystOpen,
  onSmartLayout,
  onExportPng,
  onExportSvg,
  satelliteMode,
  onToggleSatellite,
}: CanvasHeaderProps) => {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="h-12 flex items-center justify-between px-5 z-50 relative bg-card/85 backdrop-blur-3xl border-b border-primary/10"
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center gap-2.5"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative">
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/20 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Radar className="w-4 h-4 text-primary" />
            </motion.div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary threat-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[13px] font-black tracking-[0.15em] text-foreground leading-none">
              ATLAS
            </h1>
            <span className="text-[8px] font-bold text-primary/60 tracking-widest uppercase mt-0.5">Visint Alpha</span>
          </div>
        </motion.div>

        <div className="h-6 w-px bg-border/40 mx-2" />

        {/* Threat Level Indicator */}
        <div className="flex items-center gap-4 px-3 py-1 rounded-lg bg-black/40 border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Threat:</span>
            <div className="flex gap-0.5">
              <div className="w-1.5 h-3 bg-primary rounded-sm shadow-[0_0_5px_hsl(var(--primary))]" />
              <div className="w-1.5 h-3 bg-primary rounded-sm shadow-[0_0_5px_hsl(var(--primary))]" />
              <div className="w-1.5 h-3 bg-muted rounded-sm" />
              <div className="w-1.5 h-3 bg-muted rounded-sm" />
            </div>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">ELEVATED</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <motion.button
          onClick={onToggleSatellite}
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${satelliteMode
            ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50"
            }`}
        >
          <Globe className="w-3.5 h-3.5" />
          {satelliteMode ? "Satellite Active" : "Grid Mode"}
        </motion.button>

        <div className="h-6 w-px bg-border/40 mx-2" />

        <motion.button
          onClick={onSmartLayout}
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Auto-Map
        </motion.button>

        <motion.button
          onClick={() => setExportOpen(!exportOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </motion.button>

        <ExportMenu
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          onExportPng={onExportPng}
          onExportSvg={onExportSvg}
        />

        <div className="w-6" /> {/* Spacer */}

        <motion.button
          onClick={onToggleAnalyst}
          className={`flex items-center gap-2.5 px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] rounded-full transition-all duration-500 ${analystOpen
            ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] border border-primary/50"
            : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50"
            }`}
        >
          <Radar className={`w-4 h-4 ${analystOpen ? "animate-spin" : ""}`} />
          AI Analyst
        </motion.button>
      </div>
    </motion.header>
  );
};
