import { Radar, PanelRightOpen, PanelRightClose, Download, Layers } from "lucide-react";

interface CanvasHeaderProps {
  onToggleAnalyst: () => void;
  analystOpen: boolean;
}

export const CanvasHeader = ({ onToggleAnalyst, analystOpen }: CanvasHeaderProps) => {
  return (
    <header className="h-12 flex items-center justify-between px-5 z-50 relative bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10">
            <Radar className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            ICARUS
          </h1>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-[11px] text-muted-foreground font-medium">Canvas</span>
      </div>

      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-all duration-200">
          <Layers className="w-3.5 h-3.5" />
          Scenes
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-all duration-200">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <div className="h-4 w-px mx-1 bg-border" />
        <button
          onClick={onToggleAnalyst}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
            analystOpen
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
