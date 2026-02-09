import { useState, useCallback, useRef } from "react";
import { Tldraw, Editor, createShapeId, toRichText } from "tldraw";
import "tldraw/tldraw.css";
import { FloatingToolbar } from "@/components/canvas/FloatingToolbar";
import { AnalystPanel } from "@/components/canvas/AnalystPanel";
import { CanvasHeader } from "@/components/canvas/CanvasHeader";
import { StatusBar } from "@/components/canvas/StatusBar";

const Index = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [analystOpen, setAnalystOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    editor.store.listen(() => {
      const selected = editor.getSelectedShapes();
      setSelectedCount(selected.length);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const raw = e.dataTransfer.getData("application/icarus-node");
      if (!raw || !editor) return;

      e.preventDefault();
      try {
        const data = JSON.parse(raw);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const point = editor.screenToPage({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });

        const id = createShapeId();
        editor.createShape({
          id,
          type: "note",
          x: point.x,
          y: point.y,
          props: {
            richText: toRichText(`[${data.confidence?.toUpperCase()}] ${data.label}\n${data.value}`),
            color: data.confidence === "high" ? "light-green" : data.confidence === "medium" ? "light-blue" : "light-violet",
            size: "m",
          },
        });

        editor.select(id);
      } catch (err) {
        console.error("Drop failed:", err);
      }
    },
    [editor]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/icarus-node")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <CanvasHeader onToggleAnalyst={() => setAnalystOpen(!analystOpen)} analystOpen={analystOpen} />

      <div
        ref={canvasRef}
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg pointer-events-none z-[1] opacity-40" />

        {/* tldraw canvas */}
        <div className="absolute inset-0 z-0">
          <Tldraw onMount={handleMount} inferDarkMode />
        </div>

        {/* Floating toolbar */}
        <FloatingToolbar editor={editor} />

        {/* Analyst Panel */}
        <AnalystPanel
          isOpen={analystOpen}
          onClose={() => setAnalystOpen(false)}
          editor={editor}
          selectedCount={selectedCount}
        />
      </div>

      <StatusBar selectedCount={selectedCount} />
    </div>
  );
};

export default Index;
