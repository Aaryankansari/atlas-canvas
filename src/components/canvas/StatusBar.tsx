import { Shield, Wifi } from "lucide-react";

interface StatusBarProps {
  selectedCount: number;
}

export const StatusBar = ({ selectedCount }: StatusBarProps) => {
  return (
    <footer className="h-7 flex items-center justify-between px-5 z-50 relative bg-card/60 backdrop-blur-xl border-t border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
          <Wifi className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
      </div>
    </footer>
  );
};
