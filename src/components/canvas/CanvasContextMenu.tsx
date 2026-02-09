import { useCallback, useEffect, useState, useRef } from "react";
import { Editor, TLShapeId } from "tldraw";
import { Link, Unlink, Trash2, Copy, ArrowRightLeft, Layers, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { connectShapes, connectAllSelected } from "./connector/useConnector";
import { INTEL_NODE_TYPE, IntelNodeShape } from "./intel-node/types";

interface ContextMenuState {
  x: number;
  y: number;
  shapeId: TLShapeId;
}

interface CanvasContextMenuProps {
  editor: Editor | null;
  onDeepDive?: (node: IntelNodeShape) => void;
}

export const CanvasContextMenu = ({ editor, onDeepDive }: CanvasContextMenuProps) => {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Listen for right-click on the canvas container
  useEffect(() => {
    if (!editor) return;

    const container = document.querySelector(".tl-container");
    if (!container) return;

    const handleContextMenu = (e: Event) => {
      const me = e as MouseEvent;

      // Find shape at click point
      const point = editor.screenToPage({ x: me.clientX, y: me.clientY });
      const shapesAtPoint = editor.getShapesAtPoint(point);

      if (shapesAtPoint.length === 0) {
        setMenu(null);
        return;
      }

      me.preventDefault();
      me.stopPropagation();

      const topShape = shapesAtPoint[shapesAtPoint.length - 1];
      editor.select(topShape.id);

      setMenu({ x: me.clientX, y: me.clientY, shapeId: topShape.id });
    };

    container.addEventListener("contextmenu", handleContextMenu);
    return () => container.removeEventListener("contextmenu", handleContextMenu);
  }, [editor]);

  // Close on outside click or escape
  useEffect(() => {
    if (!menu) return;

    const handleClose = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };

    window.addEventListener("mousedown", handleClose);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClose);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [menu]);

  const close = useCallback(() => setMenu(null), []);

  const handleConnectToAll = useCallback(() => {
    if (!editor || !menu) return;
    const allShapes = editor.getCurrentPageShapes().filter((s) => s.type !== "arrow");
    const others = allShapes.filter((s) => s.id !== menu.shapeId);
    for (const other of others) {
      connectShapes(editor, menu.shapeId, other.id);
    }
    close();
  }, [editor, menu, close]);

  const handleConnectToSelected = useCallback(() => {
    if (!editor) return;
    connectAllSelected(editor);
    close();
  }, [editor, close]);

  const handleUnlink = useCallback(() => {
    if (!editor || !menu) return;
    const allShapes = editor.getCurrentPageShapes();
    const arrowsToDelete = allShapes.filter((shape) => {
      if (shape.type !== "arrow") return false;
      const bindings = editor.getBindingsFromShape(shape.id, "arrow");
      return bindings.some((b) => b.toId === menu.shapeId);
    });
    if (arrowsToDelete.length > 0) {
      editor.deleteShapes(arrowsToDelete.map((a) => a.id));
    }
    close();
  }, [editor, menu, close]);

  const handleDuplicate = useCallback(() => {
    if (!editor || !menu) return;
    editor.select(menu.shapeId);
    editor.duplicateShapes([menu.shapeId], { x: 40, y: 40 });
    close();
  }, [editor, menu, close]);

  const handleDelete = useCallback(() => {
    if (!editor || !menu) return;
    editor.deleteShapes([menu.shapeId]);
    close();
  }, [editor, menu, close]);

  const handleBringToFront = useCallback(() => {
    if (!editor || !menu) return;
    editor.select(menu.shapeId);
    editor.bringToFront([menu.shapeId]);
    close();
  }, [editor, menu, close]);

  const handleDeepDive = useCallback(() => {
    if (!editor || !menu || !onDeepDive) return;
    const shape = editor.getShape(menu.shapeId);
    if (shape && shape.type === INTEL_NODE_TYPE) {
      onDeepDive(shape as IntelNodeShape);
    }
    close();
  }, [editor, menu, onDeepDive, close]);

  const isIntelNode = menu && editor ? editor.getShape(menu.shapeId)?.type === INTEL_NODE_TYPE : false;
  const selectedCount = editor?.getSelectedShapes().length ?? 0;

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[100] min-w-[180px] rounded-xl bg-card border border-border shadow-lg py-1.5 overflow-hidden"
          style={{ left: menu.x, top: menu.y }}
        >
          {/* Connectors section */}
          <div className="px-2 pt-1 pb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
              Connectors
            </span>
          </div>

          <MenuItem icon={Link} label="Connect to all" onClick={handleConnectToAll} />
          {selectedCount >= 2 && (
            <MenuItem icon={ArrowRightLeft} label={`Connect ${selectedCount} selected`} onClick={handleConnectToSelected} />
          )}
          <MenuItem icon={Unlink} label="Remove connections" onClick={handleUnlink} variant="muted" />

          <div className="my-1.5 mx-2 h-px bg-border" />

          {/* Actions section */}
          <div className="px-2 pt-1 pb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
              Actions
            </span>
          </div>

          {isIntelNode && onDeepDive && (
            <MenuItem icon={Eye} label="Deep dive" onClick={handleDeepDive} accent />
          )}
          <MenuItem icon={Copy} label="Duplicate" onClick={handleDuplicate} />
          <MenuItem icon={Layers} label="Bring to front" onClick={handleBringToFront} />
          <MenuItem icon={Trash2} label="Delete" onClick={handleDelete} variant="destructive" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function MenuItem({
  icon: Icon,
  label,
  onClick,
  variant,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "destructive" | "muted";
  accent?: boolean;
}) {
  const colorClass =
    variant === "destructive"
      ? "text-destructive hover:bg-destructive/5"
      : variant === "muted"
        ? "text-muted-foreground hover:bg-muted"
        : accent
          ? "text-primary hover:bg-primary/5"
          : "text-foreground hover:bg-muted";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium transition-colors ${colorClass}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
      {label}
    </button>
  );
}
