import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Tldraw, Editor, createShapeId, TLComponents } from "tldraw";
import "tldraw/tldraw.css";
import { FloatingToolbar } from "@/components/canvas/FloatingToolbar";
import { AnalystPanel } from "@/components/canvas/AnalystPanel";
import { CanvasHeader } from "@/components/canvas/CanvasHeader";
import { StatusBar } from "@/components/canvas/StatusBar";
import { DeepDivePanel } from "@/components/canvas/DeepDivePanel";
import { SelectionToolbar } from "@/components/canvas/SelectionToolbar";
import { CanvasContextMenu } from "@/components/canvas/CanvasContextMenu";
import { IntelNodeShapeUtil } from "@/components/canvas/intel-node/IntelNodeShapeUtil";
import { useAutoLinker } from "@/components/canvas/intel-node/useAutoLinker";
import { IntelNodeShape, INTEL_NODE_TYPE, IntelNodeProps } from "@/components/canvas/intel-node/types";

const customShapeUtils = [IntelNodeShapeUtil];

// Hide tldraw's built-in UI — we use our own toolbar, header, and panels
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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-link intel nodes sharing indicators
  useAutoLinker(editor);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    editor.store.listen(() => {
      const selected = editor.getSelectedShapes();
      setSelectedCount(selected.length);

      // Check if a single intel-node is selected for deep dive
      if (selected.length === 1 && selected[0].type === INTEL_NODE_TYPE) {
        setDeepDiveNode(selected[0] as IntelNodeShape);
      } else {
        setDeepDiveNode(null);
      }
    });
  }, []);

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
    [editor]
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

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only hide if leaving the container entirely
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (clientX <= rect.left || clientX >= rect.right || clientY <= rect.top || clientY >= rect.bottom) {
        setIsDraggingOver(false);
      }
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <CanvasHeader onToggleAnalyst={() => setAnalystOpen(!analystOpen)} analystOpen={analystOpen} />

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

        {/* Transparent drop target overlay — sits above tldraw to intercept drops */}
        {isDraggingOver && (
          <div
            className="absolute inset-0 z-[25]"
            style={{ background: "rgba(0,0,0,0.02)" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        )}

        {/* Floating toolbar */}
        <FloatingToolbar editor={editor} selectedCount={selectedCount} />

        {/* Selection connector toolbar */}
        <SelectionToolbar editor={editor} selectedCount={selectedCount} />

        {/* Right-click context menu */}
        <CanvasContextMenu editor={editor} onDeepDive={(node) => setDeepDiveNode(node)} />

        {/* Analyst Panel */}
        <AnalystPanel
          isOpen={analystOpen}
          onClose={() => setAnalystOpen(false)}
          editor={editor}
          selectedCount={selectedCount}
        />

        {/* Deep Dive Panel */}
        {!analystOpen && deepDiveNode && (
          <DeepDivePanel node={deepDiveNode} onClose={() => setDeepDiveNode(null)} />
        )}
      </div>

      <StatusBar selectedCount={selectedCount} />
    </div>
  );
};

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

function extractMetadataFromValue(
  value: string,
  type: string
): IntelNodeProps["metadata"] {
  const meta = { emails: [] as string[], ips: [] as string[], btcWallets: [] as string[], usernames: [] as string[], domains: [] as string[] };

  const emailRe = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
  const ipRe = /\b(\d{1,3}\.){3}\d{1,3}\b/g;
  const btcRe = /\b(1|3|bc1)[a-zA-Z0-9]{25,42}\b/g;

  const emails = value.match(emailRe);
  if (emails) meta.emails = emails;
  const ips = value.match(ipRe);
  if (ips) meta.ips = ips;
  const btcs = value.match(btcRe);
  if (btcs) meta.btcWallets = btcs;

  if (type === "domain") meta.domains = [value];
  if (type === "username") meta.usernames = [value];

  return meta;
}

export default Index;
