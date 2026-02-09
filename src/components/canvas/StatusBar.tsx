import { Shield, Wifi } from "lucide-react";

interface StatusBarProps {
  selectedCount: number;
}

export const StatusBar = ({ selectedCount }: StatusBarProps) => {
  return (
    <footer className="h-7 glass-panel border-t flex items-center justify-between px-4 z-50 relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">SECURE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-mono text-muted-foreground">OPSEC ACTIVE</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "Ready"}
        </span>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-accent" />
          <span className="text-[10px] font-mono text-muted-foreground">ONLINE</span>
        </div>
      </div>
    </footer>
  );
};
