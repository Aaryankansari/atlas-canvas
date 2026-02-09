import { useState, useCallback } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { FloatingToolbar } from "@/components/canvas/FloatingToolbar";
import { AnalystPanel } from "@/components/canvas/AnalystPanel";
import { CanvasHeader } from "@/components/canvas/CanvasHeader";
import { StatusBar } from "@/components/canvas/StatusBar";

const Index = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [analystOpen, setAnalystOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);

    editor.store.listen(() => {
      const selected = editor.getSelectedShapes();
      setSelectedCount(selected.length);
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <CanvasHeader onToggleAnalyst={() => setAnalystOpen(!analystOpen)} analystOpen={analystOpen} />

      <div className="flex-1 relative">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg pointer-events-none z-[1] opacity-40" />

        {/* tldraw canvas */}
        <div className="absolute inset-0 z-0">
          <Tldraw
            onMount={handleMount}
            inferDarkMode
          />
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
