import { motion, AnimatePresence } from "framer-motion";
import { Link, Unlink, Zap } from "lucide-react";
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

  return (
    <AnimatePresence>
      {selectedCount >= 2 && (
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-lg shadow-black/[0.03]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="flex items-center gap-1.5 px-2"
            >
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">
                {selectedCount} selected
              </span>
            </motion.div>

            <div className="w-px h-5 bg-border" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={connect}
              title="Connect all selected shapes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200 text-primary hover:bg-primary/5"
            >
              <Link className="w-3.5 h-3.5" />
              Connect
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleDisconnect}
              title="Remove connections from selected"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Unlink className="w-3.5 h-3.5" />
              Unlink
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
