import { IntelNodeShape, entityIcons } from "./types";

interface IntelNodeComponentProps {
  shape: IntelNodeShape;
}

const riskAccent: Record<string, string> = {
  low: "#16a34a",
  medium: "#d97706",
  high: "#dc2626",
  critical: "#dc2626",
};

const riskBadgeStyle: Record<string, { bg: string; color: string }> = {
  low: { bg: "rgba(22, 163, 74, 0.08)", color: "#16a34a" },
  medium: { bg: "rgba(217, 119, 6, 0.08)", color: "#d97706" },
  high: { bg: "rgba(220, 38, 38, 0.08)", color: "#dc2626" },
  critical: { bg: "rgba(220, 38, 38, 0.1)", color: "#dc2626" },
};

export const IntelNodeComponent = ({ shape }: IntelNodeComponentProps) => {
  const { label, entityType, riskLevel, summary, confidence, aiBio } = shape.props;
  const icon = entityIcons[entityType] || "🔍";
  const accent = riskAccent[riskLevel] || riskAccent.low;
  const badge = riskBadgeStyle[riskLevel] || riskBadgeStyle.low;

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
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: "-apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif",
        color: "#1a1a2e",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        cursor: "pointer",
        position: "relative",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: "0 2px 2px 0",
          background: accent,
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 4 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(0, 0, 0, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
              color: "#1a1a2e",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(0, 0, 0, 0.4)",
              textTransform: "capitalize",
              marginTop: 2,
              letterSpacing: "0.02em",
            }}
          >
            {entityType}
          </div>
        </div>

        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "3px 8px",
            borderRadius: 6,
            background: badge.bg,
            color: badge.color,
            flexShrink: 0,
          }}
        >
          {riskLevel}
        </span>
      </div>

      {/* Summary */}
      {(aiBio || summary) && (
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.5,
            color: "rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            paddingLeft: 4,
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
          paddingLeft: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: confidence === "high" ? "#16a34a" : confidence === "medium" ? "#3b82f6" : "#9ca3af",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: "rgba(0, 0, 0, 0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontWeight: 500,
            }}
          >
            {confidence}
          </span>
        </div>

        {indicatorCount > 0 && (
          <span
            style={{
              fontSize: 9,
              color: "rgba(0, 0, 0, 0.3)",
              fontWeight: 500,
            }}
          >
            {indicatorCount} link{indicatorCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};
