import { Radar, PanelRightOpen, PanelRightClose, Download, Layers } from "lucide-react";

interface CanvasHeaderProps {
  onToggleAnalyst: () => void;
  analystOpen: boolean;
}

export const CanvasHeader = ({ onToggleAnalyst, analystOpen }: CanvasHeaderProps) => {
  return (
    <header
      className="h-12 flex items-center justify-between px-5 z-50 relative"
      style={{
        background: "rgba(28, 28, 30, 0.6)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(99, 179, 237, 0.12)",
              border: "1px solid rgba(99, 179, 237, 0.2)",
            }}
          >
            <Radar className="w-4 h-4" style={{ color: "rgba(99, 179, 237, 0.9)" }} />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            ICARUS
          </h1>
        </div>
        <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span className="text-[11px] text-muted-foreground font-medium">Canvas</span>
      </div>

      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/[0.06] transition-all duration-200">
          <Layers className="w-3.5 h-3.5" />
          Scenes
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/[0.06] transition-all duration-200">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <div className="h-4 w-px mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
        <button
          onClick={onToggleAnalyst}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
          style={
            analystOpen
              ? {
                  background: "rgba(99, 179, 237, 0.12)",
                  color: "rgba(99, 179, 237, 0.95)",
                  border: "1px solid rgba(99, 179, 237, 0.2)",
                }
              : {
                  color: "rgba(255, 255, 255, 0.5)",
                  border: "1px solid transparent",
                }
          }
          onMouseEnter={(e) => {
            if (!analystOpen) e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
          }}
          onMouseLeave={(e) => {
            if (!analystOpen) e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
          }}
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
