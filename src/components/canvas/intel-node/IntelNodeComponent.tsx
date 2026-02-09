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
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: 20,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
        color: "#262626",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
        cursor: "pointer",
        position: "relative",
        transition: "box-shadow 0.25s ease, transform 0.2s ease",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
              color: "#262626",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#999",
              textTransform: "capitalize",
              marginTop: 2,
              letterSpacing: "0.01em",
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
            borderRadius: 8,
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
            fontSize: 12,
            lineHeight: 1.55,
            color: "#777",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: confidence === "high" ? "#16a34a" : confidence === "medium" ? "#3b82f6" : "#d1d5db",
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: "#aaa",
              textTransform: "capitalize",
              letterSpacing: "0.02em",
              fontWeight: 500,
            }}
          >
            {confidence}
          </span>
        </div>

        {indicatorCount > 0 && (
          <span
            style={{
              fontSize: 10,
              color: "#bbb",
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
