import { IntelNodeShape, entityIcons } from "./types";

interface IntelNodeComponentProps {
  shape: IntelNodeShape;
}

const riskBorderColors: Record<string, string> = {
  low: "rgba(16, 185, 129, 0.4)",
  medium: "rgba(245, 158, 11, 0.4)",
  high: "rgba(239, 68, 68, 0.5)",
  critical: "rgba(239, 68, 68, 0.7)",
};

const riskGlowColors: Record<string, string> = {
  low: "rgba(16, 185, 129, 0.15)",
  medium: "rgba(245, 158, 11, 0.15)",
  high: "rgba(239, 68, 68, 0.2)",
  critical: "rgba(239, 68, 68, 0.3)",
};

const riskBadgeBg: Record<string, string> = {
  low: "rgba(16, 185, 129, 0.2)",
  medium: "rgba(245, 158, 11, 0.2)",
  high: "rgba(239, 68, 68, 0.2)",
  critical: "rgba(239, 68, 68, 0.3)",
};

const riskBadgeText: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#ef4444",
};

const confidenceDot: Record<string, string> = {
  high: "#10b981",
  medium: "#0ea5e9",
  low: "#6b7280",
};

export const IntelNodeComponent = ({ shape }: IntelNodeComponentProps) => {
  const { label, entityType, riskLevel, summary, confidence, aiBio } = shape.props;
  const icon = entityIcons[entityType] || "🔍";

  // Count total indicators
  const meta = shape.props.metadata;
  const indicatorCount =
    (meta?.emails?.length || 0) +
    (meta?.ips?.length || 0) +
    (meta?.btcWallets?.length || 0) +
    (meta?.usernames?.length || 0) +
    (meta?.domains?.length || 0);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${riskBorderColors[riskLevel] || riskBorderColors.low}`,
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        color: "#e2e8f0",
        overflow: "hidden",
        boxShadow: `0 0 24px ${riskGlowColors[riskLevel] || riskGlowColors.low}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(transparent 0%, rgba(0,200,255,0.02) 50%, transparent 100%)",
          animation: "scanline 4s linear infinite",
          pointerEvents: "none",
          borderRadius: 12,
        }}
      />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#64748b",
              marginTop: 1,
            }}
          >
            {entityType}
          </div>
        </div>

        {/* Risk badge */}
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "2px 6px",
            borderRadius: 4,
            background: riskBadgeBg[riskLevel],
            color: riskBadgeText[riskLevel],
          }}
        >
          {riskLevel}
        </span>
      </div>

      {/* Summary */}
      {(aiBio || summary) && (
        <div
          style={{
            fontSize: 10,
            lineHeight: 1.4,
            color: "#94a3b8",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            zIndex: 1,
          }}
        >
          {aiBio || summary}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: confidenceDot[confidence] || confidenceDot.medium,
            }}
          />
          <span style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {confidence} conf.
          </span>
        </div>

        {indicatorCount > 0 && (
          <span style={{ fontSize: 8, color: "#64748b" }}>
            {indicatorCount} indicator{indicatorCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};
