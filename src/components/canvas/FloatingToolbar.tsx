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
      <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-lg shadow-black/[0.03]">
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
              className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 active:scale-90 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeToolBg"
                  className="absolute inset-0 rounded-full bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                />
              )}
              <Icon className="w-[17px] h-[17px] relative z-10" strokeWidth={1.5} />

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredTool === tool.id && (
                  <motion.span
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-foreground text-background text-[10px] font-medium whitespace-nowrap shadow-lg pointer-events-none"
                  >
                    {tool.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        <div className="w-px h-5 mx-1 bg-border" />

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleTool("select")}
          title="Search Entity"
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 text-primary/60 hover:text-primary hover:bg-primary/5"
        >
          <Search className="w-[17px] h-[17px]" strokeWidth={1.5} />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.85, type: "spring", stiffness: 400 }}
          whileHover={{ scale: selectedCount >= 2 ? 1.1 : 1 }}
          whileTap={{ scale: selectedCount >= 2 ? 0.9 : 1 }}
          onClick={handleConnect}
          title={selectedCount >= 2 ? "Connect selected shapes" : "Select 2+ shapes to connect"}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
            selectedCount >= 2
              ? "text-primary hover:bg-primary/5"
              : "text-muted-foreground/40 cursor-not-allowed"
          }`}
        >
          <Network className="w-[17px] h-[17px]" strokeWidth={1.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};
