import { useCallback } from "react";
import { Editor } from "tldraw";
import { toast } from "sonner";

export function useCanvasExport(editor: Editor | null) {
  const exportAsPng = useCallback(async () => {
    if (!editor) return;

    const shapeIds = editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) {
      toast.error("Nothing to export");
      return;
    }

    try {
      const { blob } = await editor.toImage([...shapeIds], { format: "png", background: true });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `icarus-canvas-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Canvas exported as PNG");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed — try selecting fewer shapes");
    }
  }, [editor]);

  const exportAsSvg = useCallback(async () => {
    if (!editor) return;

    const shapeIds = editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) {
      toast.error("Nothing to export");
      return;
    }

    try {
      const { blob } = await editor.toImage([...shapeIds], { format: "svg", background: true });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `icarus-canvas-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Canvas exported as SVG");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed");
    }
  }, [editor]);

  return { exportAsPng, exportAsSvg };
}
