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

  useEffect(() => {
    if (!editor) return;
    const container = document.querySelector(".tl-container");
    if (!container) return;

    const handleContextMenu = (e: Event) => {
      const me = e as MouseEvent;
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

  useEffect(() => {
    if (!menu) return;
    const handleClose = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
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
    for (const other of others) connectShapes(editor, menu.shapeId, other.id);
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
    if (arrowsToDelete.length > 0) editor.deleteShapes(arrowsToDelete.map((a) => a.id));
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
    if (shape && shape.type === INTEL_NODE_TYPE) onDeepDive(shape as IntelNodeShape);
    close();
  }, [editor, menu, onDeepDive, close]);

  const isIntelNode = menu && editor ? editor.getShape(menu.shapeId)?.type === INTEL_NODE_TYPE : false;
  const selectedCount = editor?.getSelectedShapes().length ?? 0;

  type MenuItem =
    | { kind: "section"; section: string }
    | { kind: "divider" }
    | { kind: "item"; icon: React.ElementType; label: string; onClick: () => void; variant?: "destructive" | "muted"; accent?: boolean };

  const menuItems: MenuItem[] = [
    { kind: "section", section: "Connectors" },
    { kind: "item", icon: Link, label: "Connect to all", onClick: handleConnectToAll },
    ...(selectedCount >= 2
      ? [{ kind: "item" as const, icon: ArrowRightLeft, label: `Connect ${selectedCount} selected`, onClick: handleConnectToSelected }]
      : []),
    { kind: "item", icon: Unlink, label: "Remove connections", onClick: handleUnlink, variant: "muted" },
    { kind: "divider" },
    { kind: "section", section: "Actions" },
    ...(isIntelNode && onDeepDive ? [{ kind: "item" as const, icon: Eye, label: "Deep dive", onClick: handleDeepDive, accent: true }] : []),
    { kind: "item", icon: Copy, label: "Duplicate", onClick: handleDuplicate },
    { kind: "item", icon: Layers, label: "Bring to front", onClick: handleBringToFront },
    { kind: "item", icon: Trash2, label: "Delete", onClick: handleDelete, variant: "destructive" },
  ];

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.88, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ type: "spring", damping: 24, stiffness: 400 }}
          className="fixed z-[100] min-w-[200px] rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl shadow-black/[0.06] py-2 overflow-hidden"
          style={{ left: menu.x, top: menu.y }}
        >
          {menuItems.map((item, i) => {
            if (item.kind === "divider") return <div key={i} className="my-1.5 mx-3 h-px bg-border" />;
            if (item.kind === "section") {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="px-4 pt-1.5 pb-1"
                >
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {item.section}
                  </span>
                </motion.div>
              );
            }

            const Icon = item.icon;
            const colorClass =
              item.variant === "destructive"
                ? "text-destructive hover:bg-destructive/5"
                : item.variant === "muted"
                  ? "text-muted-foreground hover:bg-muted"
                  : item.accent
                    ? "text-primary hover:bg-primary/5"
                    : "text-foreground hover:bg-muted";

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 + i * 0.03, type: "spring", stiffness: 400, damping: 28 }}
                whileHover={{ x: 2 }}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium transition-colors ${colorClass}`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                {item.label}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
