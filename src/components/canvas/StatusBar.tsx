import { Shield, Wifi } from "lucide-react";

interface StatusBarProps {
  selectedCount: number;
}

export const StatusBar = ({ selectedCount }: StatusBarProps) => {
  return (
    <footer
      className="h-7 flex items-center justify-between px-5 z-50 relative"
      style={{
        background: "rgba(28, 28, 30, 0.5)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">OPSEC</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "Ready"}
        </span>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-accent" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
      </div>
    </footer>
  );
};
