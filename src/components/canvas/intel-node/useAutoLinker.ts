import { useEffect, useRef } from "react";
import { Editor, createShapeId, TLShapeId, toRichText } from "tldraw";
import { IntelNodeMetadata, INTEL_NODE_TYPE } from "./types";

interface SharedIndicator {
  type: string;
  value: string;
}

function findSharedIndicators(a: IntelNodeMetadata, b: IntelNodeMetadata): SharedIndicator[] {
  const shared: SharedIndicator[] = [];

  const checkOverlap = (listA: string[], listB: string[], type: string) => {
    for (const val of listA) {
      if (listB.some((v) => v.toLowerCase() === val.toLowerCase())) {
        shared.push({ type, value: val });
      }
    }
  };

  checkOverlap(a.emails || [], b.emails || [], "email");
  checkOverlap(a.ips || [], b.ips || [], "ip");
  checkOverlap(a.btcWallets || [], b.btcWallets || [], "btc");
  checkOverlap(a.usernames || [], b.usernames || [], "username");
  checkOverlap(a.domains || [], b.domains || [], "domain");

  return shared;
}

function pairKey(a: TLShapeId, b: TLShapeId): string {
  return [a, b].sort().join(":::");
}

export function useAutoLinker(editor: Editor | null) {
  const existingLinks = useRef<Map<string, TLShapeId>>(new Map());

  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      const allShapes = editor.getCurrentPageShapes();
      const intelNodes = allShapes.filter(
        (s) => s.type === INTEL_NODE_TYPE
      );

      if (intelNodes.length < 2) return;

      const activePairKeys = new Set<string>();

      for (let i = 0; i < intelNodes.length; i++) {
        for (let j = i + 1; j < intelNodes.length; j++) {
          const nodeA = intelNodes[i];
          const nodeB = intelNodes[j];
          const metaA = (nodeA.props as any).metadata as IntelNodeMetadata;
          const metaB = (nodeB.props as any).metadata as IntelNodeMetadata;

          if (!metaA || !metaB) continue;

          const shared = findSharedIndicators(metaA, metaB);
          if (shared.length === 0) continue;

          const key = pairKey(nodeA.id, nodeB.id);
          activePairKeys.add(key);

          if (existingLinks.current.has(key)) {
            const arrowId = existingLinks.current.get(key)!;
            const arrowShape = editor.getShape(arrowId);
            if (!arrowShape) {
              existingLinks.current.delete(key);
            } else {
              continue;
            }
          }

          const labelText = shared
            .slice(0, 3)
            .map((s) => `${s.type}: ${s.value}`)
            .join(", ");

          const arrowId = createShapeId();

          const boundsA = editor.getShapePageBounds(nodeA.id);
          const boundsB = editor.getShapePageBounds(nodeB.id);
          if (!boundsA || !boundsB) continue;

          const centerA = { x: boundsA.midX, y: boundsA.midY };
          const centerB = { x: boundsB.midX, y: boundsB.midY };

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
                color: "light-green",
                labelColor: "light-green",
                richText: toRichText(labelText.length > 40 ? labelText.slice(0, 37) + "…" : labelText),
              },
            });

            editor.createBindings([
              {
                fromId: arrowId,
                toId: nodeA.id,
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
                toId: nodeB.id,
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

          existingLinks.current.set(key, arrowId);
        }
      }

      // Clean up stale links
      for (const [key, arrowId] of existingLinks.current.entries()) {
        if (!activePairKeys.has(key)) {
          const arrowShape = editor.getShape(arrowId);
          if (arrowShape) {
            editor.deleteShape(arrowId);
          }
          existingLinks.current.delete(key);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [editor]);
}
