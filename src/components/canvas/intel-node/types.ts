import { TLBaseShape } from "tldraw";

export interface IntelNodeMetadata {
  emails: string[];
  ips: string[];
  btcWallets: string[];
  usernames: string[];
  domains: string[];
}

export interface IntelNodeProps {
  w: number;
  h: number;
  label: string;
  entityType: "suspect" | "wallet" | "email" | "ip" | "domain" | "username" | "general";
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  confidence: "high" | "medium" | "low";
  metadata: IntelNodeMetadata;
  categories: {
    aliases: string[];
    locations: string[];
    financials: string[];
    socials: string[];
  };
  evidenceLinks: string[];
  aiBio: string;
  rawResults: Array<{
    type: string;
    label: string;
    value: string;
    confidence: string;
  }>;
}

export type IntelNodeShape = TLBaseShape<"intel-node", IntelNodeProps>;

export const INTEL_NODE_TYPE = "intel-node" as const;

export const entityIcons: Record<IntelNodeProps["entityType"], string> = {
  suspect: "🛡️",
  wallet: "💰",
  email: "📧",
  ip: "🌐",
  domain: "🔗",
  username: "👤",
  general: "🔍",
};

export const riskColors: Record<IntelNodeProps["riskLevel"], string> = {
  low: "emerald",
  medium: "amber",
  high: "destructive",
  critical: "destructive",
};

// Module augmentation so tldraw recognizes our custom shape type
declare module "tldraw" {
  interface TLGlobalShapePropsMap {
    "intel-node": IntelNodeProps;
  }
}
