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
import { LiveRadar } from "@/components/canvas/LiveRadar";
import { ThreatIntelFeed } from "@/components/canvas/ThreatIntelFeed";
import { CommandConsole } from "@/components/canvas/CommandConsole";
import { OmniSearch } from "@/components/canvas/OmniSearch";
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
  const [satelliteMode, setSatelliteMode] = useState(false);
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
        satelliteMode={satelliteMode}
        onToggleSatellite={() => setSatelliteMode(!satelliteMode)}
      />

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {/* Advanced Background Layers */}
        <div className={`absolute inset-0 grid-bg pointer-events-none z-[1] transition-opacity duration-1000 ${satelliteMode ? "opacity-10" : "opacity-30"}`} />
        <div className="absolute inset-0 matrix-bg pointer-events-none z-[1] opacity-[0.03]" />

        <AnimatePresence>
          {satelliteMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 satellite-bg pointer-events-none z-[1]"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 scanline pointer-events-none z-[20] opacity-[0.1]" />

        {/* Digital Signature Watermark with Glitch */}
        <div className="absolute top-4 left-4 z-[20] pointer-events-none opacity-20 hover:opacity-100 transition-opacity">
          <div className="flex flex-col border-l-2 border-primary/40 pl-3">
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase glitch-text">Atlas Terminal</span>
            <span className="text-[8px] font-mono text-primary/60">S-LEVEL CLEARANCE REQ.</span>
          </div>
        </div>

        {/* tldraw canvas */}
        <div className="absolute inset-0 z-0 hue-rotate-glow neural-link-pulse">
          <Tldraw onMount={handleMount} shapeUtils={customShapeUtils} components={hiddenComponents} />
        </div>

        {/* Specialized OSINT UI Layers */}
        <ThreatIntelFeed />
        <LiveRadar editor={editor} />
        <CommandConsole />
        <OmniSearch editor={editor} />

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
                className="absolute inset-4 rounded-[40px] border-2 border-dashed border-primary/20 pointer-events-none"
              />
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-6 py-4 rounded-2xl bg-card border border-primary/20 shadow-2xl pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-sm font-black uppercase tracking-widest text-primary">Deploy Intelligence Node</span>
                </div>
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
