import { motion, AnimatePresence } from "framer-motion";
import { Link, Unlink } from "lucide-react";
import { Editor } from "tldraw";
import { useConnector } from "./connector/useConnector";

interface SelectionToolbarProps {
  editor: Editor | null;
  selectedCount: number;
}

export const SelectionToolbar = ({ editor, selectedCount }: SelectionToolbarProps) => {
  const { connect } = useConnector(editor);

  const handleDisconnect = () => {
    if (!editor) return;
    const selected = editor.getSelectedShapes();
    const selectedIds = new Set(selected.map((s) => s.id));

    const allShapes = editor.getCurrentPageShapes();
    const arrowsToDelete = allShapes.filter((shape) => {
      if (shape.type !== "arrow") return false;
      const bindings = editor.getBindingsFromShape(shape.id, "arrow");
      return bindings.some((b) => selectedIds.has(b.toId));
    });

    if (arrowsToDelete.length > 0) {
      editor.deleteShapes(arrowsToDelete.map((a) => a.id));
    }
  };

  if (selectedCount < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 10, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-card border border-border shadow-lg">
          <span className="text-[11px] text-muted-foreground px-2 font-medium">
            {selectedCount} selected
          </span>

          <div className="w-px h-5 bg-border" />

          <button
            onClick={connect}
            title="Connect all selected shapes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 text-primary hover:bg-primary/5 active:scale-95"
          >
            <Link className="w-3.5 h-3.5" />
            Connect
          </button>

          <button
            onClick={handleDisconnect}
            title="Remove connections from selected"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/5 active:scale-95"
          >
            <Unlink className="w-3.5 h-3.5" />
            Unlink
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
