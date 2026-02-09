import { Editor } from "tldraw";
import { MousePointer2, Square, Type, Minus, StickyNote, Pencil, Search, Network } from "lucide-react";
import { motion } from "framer-motion";
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
  const handleTool = (toolId: string) => {
    if (!editor) return;
    editor.setCurrentTool(toolId);
  };

  const handleConnect = () => {
    if (!editor || selectedCount < 2) return;
    connectAllSelected(editor);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", damping: 24, stiffness: 260 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30"
    >
      <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-card border border-border shadow-lg">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleTool(tool.id)}
              title={tool.label}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95"
            >
              <Icon className="w-[17px] h-[17px]" strokeWidth={1.5} />
            </button>
          );
        })}

        <div className="w-px h-5 mx-1 bg-border" />

        <button
          onClick={() => handleTool("select")}
          title="Search Entity"
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 text-primary/60 hover:text-primary hover:bg-primary/5 active:scale-95"
        >
          <Search className="w-[17px] h-[17px]" strokeWidth={1.5} />
        </button>
        <button
          onClick={handleConnect}
          title={selectedCount >= 2 ? "Connect selected shapes" : "Select 2+ shapes to connect"}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            selectedCount >= 2
              ? "text-primary hover:bg-primary/5"
              : "text-muted-foreground/40 cursor-not-allowed"
          }`}
        >
          <Network className="w-[17px] h-[17px]" strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
};
