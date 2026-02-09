import { Shield, Wifi, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface StatusBarProps {
  selectedCount: number;
}

export const StatusBar = ({ selectedCount }: StatusBarProps) => {
  return (
    <motion.footer
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", damping: 28, stiffness: 300 }}
      className="h-8 flex items-center justify-between px-5 z-50 relative bg-card/80 backdrop-blur-xl border-t border-border"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] text-muted-foreground">Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">OPSEC</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <motion.span
          key={selectedCount}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-muted-foreground"
        >
          {selectedCount > 0 ? (
            <span className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-primary" />
              {selectedCount} selected
            </span>
          ) : (
            "Ready"
          )}
        </motion.span>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wifi className="w-3 h-3 text-primary" />
          </motion.div>
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
      </div>
    </motion.footer>
  );
};
