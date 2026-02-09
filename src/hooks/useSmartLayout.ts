import { useCallback } from "react";
import { Editor, TLShapeId } from "tldraw";

interface LayoutNode {
  id: TLShapeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: Set<string>;
}

/**
 * Force-directed graph layout using Fruchterman-Reingold algorithm.
 * Arranges connected nodes organically based on relationships.
 */
export function useSmartLayout(editor: Editor | null) {
  const applyLayout = useCallback(() => {
    if (!editor) return;

    const allShapes = editor.getCurrentPageShapes();
    const nonArrows = allShapes.filter((s) => s.type !== "arrow");
    if (nonArrows.length < 2) return;

    // Build adjacency from arrow bindings
    const adjacency = new Map<string, Set<string>>();
    nonArrows.forEach((s) => adjacency.set(s.id, new Set()));

    for (const shape of allShapes) {
      if (shape.type !== "arrow") continue;
      const bindings = editor.getBindingsFromShape(shape.id, "arrow");
      if (bindings.length === 2) {
        const a = bindings[0].toId;
        const b = bindings[1].toId;
        adjacency.get(a)?.add(b);
        adjacency.get(b)?.add(a);
      }
    }

    // Initialize nodes at current positions
    const nodes: LayoutNode[] = nonArrows.map((s) => {
      const bounds = editor.getShapePageBounds(s.id);
      return {
        id: s.id,
        x: bounds?.midX ?? s.x,
        y: bounds?.midY ?? s.y,
        vx: 0,
        vy: 0,
        connections: adjacency.get(s.id) || new Set(),
      };
    });

    const area = Math.max(800, Math.sqrt(nodes.length) * 300);
    const k = area / Math.sqrt(nodes.length); // optimal distance
    const iterations = 100;

    // Force-directed simulation
    for (let iter = 0; iter < iterations; iter++) {
      const temperature = area * (1 - iter / iterations) * 0.1;

      // Repulsive forces between all pairs
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].vx = 0;
        nodes[i].vy = 0;
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = (k * k) / dist;
          nodes[i].vx += (dx / dist) * force;
          nodes[i].vy += (dy / dist) * force;
        }
      }

      // Attractive forces for connected pairs
      for (const node of nodes) {
        for (const connId of node.connections) {
          const other = nodes.find((n) => n.id === connId);
          if (!other) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = (dist * dist) / k;
          node.vx -= (dx / dist) * force;
          node.vy -= (dy / dist) * force;
        }
      }

      // Apply with temperature cooling
      for (const node of nodes) {
        const disp = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (disp > 0) {
          const scale = Math.min(disp, temperature) / disp;
          node.x += node.vx * scale;
          node.y += node.vy * scale;
        }
      }
    }

    // Center the layout on canvas viewport
    const viewport = editor.getViewportPageBounds();
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y));
    const centerX = viewport.midX - (minX + maxX) / 2;
    const centerY = viewport.midY - (minY + maxY) / 2;

    // Apply positions
    editor.run(() => {
      for (const node of nodes) {
        const shape = editor.getShape(node.id);
        if (!shape) continue;
        const bounds = editor.getShapePageBounds(node.id);
        const w = bounds?.width ?? 260;
        const h = bounds?.height ?? 160;
        editor.updateShape({
          id: node.id,
          type: shape.type,
          x: node.x + centerX - w / 2,
          y: node.y + centerY - h / 2,
        });
      }
    });
  }, [editor]);

  return { applyLayout };
}
