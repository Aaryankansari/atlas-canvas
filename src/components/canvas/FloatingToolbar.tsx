import { Editor } from "tldraw";
import { MousePointer2, Square, Type, Minus, Image, StickyNote, Pencil } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingToolbarProps {
  editor: Editor | null;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "draw", icon: Pencil, label: "Draw" },
  { id: "text", icon: Type, label: "Text" },
  { id: "geo", icon: Square, label: "Shape" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "note", icon: StickyNote, label: "Note" },
  { id: "asset", icon: Image, label: "Image" },
];

export const FloatingToolbar = ({ editor }: FloatingToolbarProps) => {
  const handleTool = (toolId: string) => {
    if (!editor) return;
    editor.setCurrentTool(toolId);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", damping: 20 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
    >
      <div className="glass-panel rounded-xl px-2 py-1.5 flex items-center gap-0.5 glow-cyan">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleTool(tool.id)}
              title={tool.label}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all group relative"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
