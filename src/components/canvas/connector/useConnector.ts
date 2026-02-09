import { useCallback } from "react";
import { Editor, createShapeId, TLShapeId, toRichText } from "tldraw";

/**
 * Creates an arrow binding between two shapes on the canvas.
 */
export function connectShapes(
  editor: Editor,
  fromId: TLShapeId,
  toId: TLShapeId,
  label?: string
) {
  const boundsA = editor.getShapePageBounds(fromId);
  const boundsB = editor.getShapePageBounds(toId);
  if (!boundsA || !boundsB) return null;

  const centerA = { x: boundsA.midX, y: boundsA.midY };
  const centerB = { x: boundsB.midX, y: boundsB.midY };

  const arrowId = createShapeId();

  editor.run(() => {
    editor.createShape({
      id: arrowId,
      type: "arrow",
      x: centerA.x,
      y: centerA.y,
      props: {
        start: { x: 0, y: 0 },
        end: {
          x: centerB.x - centerA.x,
          y: centerB.y - centerA.y,
        },
        color: "black",
        ...(label
          ? { richText: toRichText(label.length > 50 ? label.slice(0, 47) + "…" : label) }
          : {}),
      },
    });

    editor.createBindings([
      {
        fromId: arrowId,
        toId: fromId,
        type: "arrow",
        props: {
          terminal: "start",
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      },
      {
        fromId: arrowId,
        toId: toId,
        type: "arrow",
        props: {
          terminal: "end",
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      },
    ]);
  });

  return arrowId;
}

/**
 * Connects all selected shapes in sequence (A→B→C→...).
 */
export function connectSelectedShapes(editor: Editor, label?: string) {
  const selected = editor.getSelectedShapes();
  if (selected.length < 2) return;

  const ids = selected.map((s) => s.id);
  const createdArrows: TLShapeId[] = [];

  for (let i = 0; i < ids.length - 1; i++) {
    const arrowId = connectShapes(editor, ids[i], ids[i + 1], label);
    if (arrowId) createdArrows.push(arrowId);
  }

  return createdArrows;
}

/**
 * Connects all selected shapes to each other (full mesh).
 */
export function connectAllSelected(editor: Editor) {
  const selected = editor.getSelectedShapes();
  if (selected.length < 2) return;

  const ids = selected.map((s) => s.id);
  const createdArrows: TLShapeId[] = [];

  // Check existing bindings to avoid duplicates
  const existingPairs = new Set<string>();
  const allShapes = editor.getCurrentPageShapes();
  for (const shape of allShapes) {
    if (shape.type === "arrow") {
      const bindings = editor.getBindingsFromShape(shape.id, "arrow");
      if (bindings.length === 2) {
        const pair = [bindings[0].toId, bindings[1].toId].sort().join(":::");
        existingPairs.add(pair);
      }
    }
  }

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const pair = [ids[i], ids[j]].sort().join(":::");
      if (existingPairs.has(pair)) continue;

      const arrowId = connectShapes(editor, ids[i], ids[j]);
      if (arrowId) createdArrows.push(arrowId);
    }
  }

  return createdArrows;
}

export function useConnector(editor: Editor | null) {
  const connect = useCallback(() => {
    if (!editor) return;
    connectAllSelected(editor);
  }, [editor]);

  const connectSequence = useCallback(
    (label?: string) => {
      if (!editor) return;
      connectSelectedShapes(editor, label);
    },
    [editor]
  );

  return { connect, connectSequence };
}
