import { IntelNodeShape, entityIcons, riskColors } from "./types";

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
  const { label, entityType, riskLevel, summary, confidence, aiBio, isWatched } = shape.props;
  const icon = entityIcons[entityType] || "🔍";
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
      className={`glass-panel data-float relative premium-glow-border ${isWatched ? "radar-pulse glow-cyan" : ""}`}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 20,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
        color: "#1a1a1a",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Risk indicator bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `hsl(var(--neon-${riskColors[riskLevel]}))`,
          zIndex: 10
        }}
      />

      {isWatched && <div className="digital-scan" />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "hsl(var(--muted))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            border: "1px solid hsl(var(--border))",
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
              color: "#1a1a1a",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#666",
              textTransform: "uppercase",
              marginTop: 2,
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            {entityType}
          </div>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "4px 8px",
            borderRadius: 6,
            background: badge.bg,
            color: badge.color,
            flexShrink: 0,
            border: `1px solid ${badge.color}33`,
          }}
        >
          {riskLevel}
        </span>
      </div>

      {/* Summary */}
      {(aiBio || summary) && (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "#444",
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
          paddingTop: 8,
          borderTop: "1px solid hsl(var(--border) / 0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            className={confidence === "high" ? "glow-cyan" : ""}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: confidence === "high" ? "hsl(var(--neon-cyan))" : confidence === "medium" ? "hsl(var(--neon-amber))" : "hsl(var(--muted-foreground))",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "#666",
              textTransform: "capitalize",
              letterSpacing: "0.02em",
              fontWeight: 600,
            }}
          >
            {confidence} Match
          </span>
        </div>

        {indicatorCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 11,
                color: "hsl(var(--primary))",
                fontWeight: 700,
                background: "hsl(var(--primary) / 0.1)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {indicatorCount}
            </span>
            <span style={{ fontSize: 10, color: "#888", fontWeight: 500 }}>
              Pivots
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

