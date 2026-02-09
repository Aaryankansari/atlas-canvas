import { useState, useCallback, useRef } from "react";
import { Tldraw, Editor, createShapeId, TLComponents } from "tldraw";
import "tldraw/tldraw.css";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingToolbar } from "@/components/canvas/FloatingToolbar";
import { AnalystPanel } from "@/components/canvas/AnalystPanel";
import { CanvasHeader } from "@/components/canvas/CanvasHeader";
import { StatusBar } from "@/components/canvas/StatusBar";
import { DeepDivePanel } from "@/components/canvas/DeepDivePanel";
import { SelectionToolbar } from "@/components/canvas/SelectionToolbar";
import { CanvasContextMenu } from "@/components/canvas/CanvasContextMenu";
import { IntelNodeShapeUtil } from "@/components/canvas/intel-node/IntelNodeShapeUtil";
import { useAutoLinker } from "@/components/canvas/intel-node/useAutoLinker";
import { useCanvasDrop } from "@/hooks/useCanvasDrop";
import { useSmartLayout } from "@/hooks/useSmartLayout";
import { useCanvasExport } from "@/hooks/useCanvasExport";
import { IntelNodeShape, INTEL_NODE_TYPE } from "@/components/canvas/intel-node/types";

const customShapeUtils = [IntelNodeShapeUtil];

const hiddenComponents: TLComponents = {
  Toolbar: null,
  StylePanel: null,
  PageMenu: null,
  NavigationPanel: null,
  MainMenu: null,
  KeyboardShortcutsDialog: null,
  QuickActions: null,
  HelperButtons: null,
  MenuPanel: null,
  TopPanel: null,
  SharePanel: null,
};

const Index = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [analystOpen, setAnalystOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [deepDiveNode, setDeepDiveNode] = useState<IntelNodeShape | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useAutoLinker(editor);
  const { applyLayout } = useSmartLayout(editor);
  const { exportAsPng, exportAsSvg } = useCanvasExport(editor);

  const { isDraggingOver, handleDrop, handleDragOver, handleDragEnter, handleDragLeave } =
    useCanvasDrop(editor, canvasRef);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    editor.store.listen(() => {
      const selected = editor.getSelectedShapes();
      setSelectedCount(selected.length);

      if (selected.length === 1 && selected[0].type === INTEL_NODE_TYPE) {
        setDeepDiveNode(selected[0] as IntelNodeShape);
      } else {
        setDeepDiveNode(null);
      }
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <CanvasHeader
        onToggleAnalyst={() => setAnalystOpen(!analystOpen)}
        analystOpen={analystOpen}
        onSmartLayout={applyLayout}
        onExportPng={exportAsPng}
        onExportSvg={exportAsSvg}
      />

      <div
        ref={canvasRef}
        className="flex-1 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg pointer-events-none z-[1] opacity-40" />

        {/* tldraw canvas */}
        <div className="absolute inset-0 z-0">
          <Tldraw onMount={handleMount} shapeUtils={customShapeUtils} components={hiddenComponents} />
        </div>

        {/* Drop overlay with visual indicator */}
        <AnimatePresence>
          {isDraggingOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-[25] flex items-center justify-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="absolute inset-0 bg-primary/[0.03]" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="absolute inset-4 rounded-3xl border-2 border-dashed border-primary/20 pointer-events-none"
              />
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-5 py-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-primary/20 shadow-lg pointer-events-none"
              >
                <span className="text-sm font-medium text-primary">Drop to create node</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <FloatingToolbar editor={editor} selectedCount={selectedCount} />
        <SelectionToolbar editor={editor} selectedCount={selectedCount} />
        <CanvasContextMenu editor={editor} onDeepDive={(node) => setDeepDiveNode(node)} />

        <AnalystPanel
          isOpen={analystOpen}
          onClose={() => setAnalystOpen(false)}
          editor={editor}
          selectedCount={selectedCount}
        />

        {!analystOpen && deepDiveNode && (
          <DeepDivePanel node={deepDiveNode} onClose={() => setDeepDiveNode(null)} />
        )}
      </div>

      <StatusBar selectedCount={selectedCount} />
    </div>
  );
};

export default Index;
