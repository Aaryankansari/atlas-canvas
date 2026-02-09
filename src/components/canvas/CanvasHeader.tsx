import { Radar, PanelRightOpen, PanelRightClose, Download, Layers } from "lucide-react";

interface CanvasHeaderProps {
  onToggleAnalyst: () => void;
  analystOpen: boolean;
}

export const CanvasHeader = ({ onToggleAnalyst, analystOpen }: CanvasHeaderProps) => {
  return (
    <header className="h-12 glass-panel border-b flex items-center justify-between px-4 z-50 relative">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
            <Radar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-foreground">
              ICARUS <span className="text-primary text-glow-cyan">CANVAS</span>
            </h1>
          </div>
        </div>
        <div className="h-5 w-px bg-border mx-1" />
        <span className="text-xs font-mono text-muted-foreground">v1.0</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
          <Layers className="w-3.5 h-3.5" />
          Scenes
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <div className="h-5 w-px bg-border mx-1" />
        <button
          onClick={onToggleAnalyst}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            analystOpen
              ? "bg-primary/15 text-primary border border-primary/30 glow-cyan"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {analystOpen ? (
            <PanelRightClose className="w-3.5 h-3.5" />
          ) : (
            <PanelRightOpen className="w-3.5 h-3.5" />
          )}
          AI Analyst
        </button>
      </div>
    </header>
  );
};
