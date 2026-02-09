import { useState } from "react";
import { Editor } from "tldraw";
import { MousePointer2, Square, Type, Minus, StickyNote, Pencil, Search, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { connectAllSelected } from "./connector/useConnector";

interface FloatingToolbarProps {
  editor: Editor | null;
  selectedCount: number;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "draw", icon: Pencil, label: "Draw" },
  { id: "text", icon: Type, label: "Text" },
  { id: "geo", icon: Square, label: "Shape" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "note", icon: StickyNote, label: "Note" },
];

export const FloatingToolbar = ({ editor, selectedCount }: FloatingToolbarProps) => {
  const [activeTool, setActiveTool] = useState("select");
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const handleTool = (toolId: string) => {
    if (!editor) return;
    editor.setCurrentTool(toolId);
    setActiveTool(toolId);
  };

  const handleConnect = () => {
    if (!editor || selectedCount < 2) return;
    connectAllSelected(editor);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", damping: 22, stiffness: 240 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30"
    >
      <div className="flex items-center gap-1 px-3 py-2 rounded-full glass-panel border-primary/20 shadow-2xl shadow-primary/5">
        {/* Status LED */}
        <div className="flex items-center gap-3 px-3 mr-1.5 border-r border-border/50">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">Engine: Active</span>
        </div>

        {tools.map((tool, i) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05, type: "spring", stiffness: 400 }}
              onClick={() => handleTool(tool.id)}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              title={tool.label}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90 ${isActive
                  ? "text-primary bg-primary/10 shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <Icon className="w-[18px] h-[18px] relative z-10" strokeWidth={isActive ? 2 : 1.5} />

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredTool === tool.id && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest shadow-2xl pointer-events-none whitespace-nowrap"
                  >
                    {tool.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        <div className="w-px h-6 mx-2 bg-border/50" />

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleTool("select")}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 text-primary hover:bg-primary/10"
        >
          <Search className="w-[18px] h-[18px]" strokeWidth={2} />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.85, type: "spring", stiffness: 400 }}
          whileHover={{ scale: selectedCount >= 2 ? 1.1 : 1 }}
          whileTap={{ scale: selectedCount >= 2 ? 0.9 : 1 }}
          onClick={handleConnect}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${selectedCount >= 2
              ? "text-primary bg-primary/10 animate-pulse"
              : "text-muted-foreground/30 cursor-not-allowed"
            }`}
        >
          <Network className="w-[18px] h-[18px]" strokeWidth={2} />
        </motion.button>
      </div>
    </motion.div>
  );
};
