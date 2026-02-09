import { useState, useCallback, RefObject } from "react";
import { Editor, createShapeId } from "tldraw";
import { INTEL_NODE_TYPE, IntelNodeProps } from "@/components/canvas/intel-node/types";

export function useCanvasDrop(editor: Editor | null, canvasRef: RefObject<HTMLDivElement | null>) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      const raw = e.dataTransfer.getData("application/icarus-node");
      if (!raw || !editor) return;

      try {
        const data = JSON.parse(raw);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const point = editor.screenToPage({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });

        const id = createShapeId();

        if (data.isIntelNode) {
          editor.createShape({
            id,
            type: INTEL_NODE_TYPE,
            x: point.x - 130,
            y: point.y - 80,
            props: {
              w: 260,
              h: 160,
              label: data.label || "Unknown",
              entityType: data.entityType || "general",
              riskLevel: data.riskLevel || "low",
              summary: data.summary || "",
              confidence: data.confidence || "medium",
              metadata: data.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
              categories: data.categories || { aliases: [], locations: [], financials: [], socials: [] },
              evidenceLinks: data.evidenceLinks || [],
              aiBio: data.aiBio || "",
              rawResults: data.rawResults || [],
            } satisfies IntelNodeProps,
          });
        } else {
          editor.createShape({
            id,
            type: INTEL_NODE_TYPE,
            x: point.x - 130,
            y: point.y - 80,
            props: {
              w: 260,
              h: 160,
              label: data.label || data.value || "Finding",
              entityType: mapEntityType(data.entityType || data.type),
              riskLevel: data.confidence === "high" ? "medium" : "low",
              summary: data.value || "",
              confidence: data.confidence || "medium",
              metadata: extractMetadataFromValue(data.value || "", data.entityType || data.type),
              categories: { aliases: [], locations: [], financials: [], socials: [] },
              evidenceLinks: [],
              aiBio: "",
              rawResults: [{ type: data.type, label: data.label, value: data.value, confidence: data.confidence }],
            } satisfies IntelNodeProps,
          });
        }

        editor.select(id);
      } catch (err) {
        console.error("Drop failed:", err);
      }
    },
    [editor, canvasRef]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/icarus-node")) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/icarus-node")) {
      e.preventDefault();
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const { clientX, clientY } = e;
        if (clientX <= rect.left || clientX >= rect.right || clientY <= rect.top || clientY >= rect.bottom) {
          setIsDraggingOver(false);
        }
      }
    },
    [canvasRef]
  );

  return { isDraggingOver, handleDrop, handleDragOver, handleDragEnter, handleDragLeave };
}

function mapEntityType(type: string): IntelNodeProps["entityType"] {
  const map: Record<string, IntelNodeProps["entityType"]> = {
    email: "email",
    ip: "ip",
    btc: "wallet",
    username: "username",
    domain: "domain",
    social: "username",
    breach: "suspect",
    profile: "username",
    geo: "general",
    asn: "ip",
  };
  return map[type] || "general";
}

function extractMetadataFromValue(value: string, type: string): IntelNodeProps["metadata"] {
  const meta = { emails: [] as string[], ips: [] as string[], btcWallets: [] as string[], usernames: [] as string[], domains: [] as string[] };

  const emails = value.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g);
  if (emails) meta.emails = emails;
  const ips = value.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g);
  if (ips) meta.ips = ips;
  const btcs = value.match(/\b(1|3|bc1)[a-zA-Z0-9]{25,42}\b/g);
  if (btcs) meta.btcWallets = btcs;

  if (type === "domain") meta.domains = [value];
  if (type === "username") meta.usernames = [value];

  return meta;
}
