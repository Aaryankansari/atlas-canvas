import { Editor } from "tldraw";
import { MousePointer2, Square, Type, Minus, StickyNote, Pencil, Search, Network } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingToolbarProps {
  editor: Editor | null;
}

const tools = [
  { id: "select", icon: MousePointer2, label: "Select", group: "primary" },
  { id: "draw", icon: Pencil, label: "Draw", group: "primary" },
  { id: "text", icon: Type, label: "Text", group: "primary" },
  { id: "geo", icon: Square, label: "Shape", group: "primary" },
  { id: "line", icon: Minus, label: "Line", group: "primary" },
  { id: "note", icon: StickyNote, label: "Note", group: "primary" },
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
      transition={{ delay: 0.3, type: "spring", damping: 24, stiffness: 260 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30"
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-2xl"
        style={{
          background: "rgba(28, 28, 30, 0.65)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.05) inset",
        }}
      >
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleTool(tool.id)}
              title={tool.label}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/[0.08] active:bg-white/[0.12] active:scale-95"
              style={{ color: "rgba(255, 255, 255, 0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.95)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)")}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 mx-0.5" style={{ background: "rgba(255, 255, 255, 0.08)" }} />

        {/* OSINT tools */}
        <button
          onClick={() => handleTool("select")}
          title="Search Entity"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/[0.08] active:bg-white/[0.12] active:scale-95"
          style={{ color: "rgba(99, 179, 237, 0.7)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(99, 179, 237, 1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(99, 179, 237, 0.7)")}
        >
          <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => handleTool("select")}
          title="Link Nodes"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/[0.08] active:bg-white/[0.12] active:scale-95"
          style={{ color: "rgba(99, 179, 237, 0.7)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(99, 179, 237, 1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(99, 179, 237, 0.7)")}
        >
          <Network className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
};
