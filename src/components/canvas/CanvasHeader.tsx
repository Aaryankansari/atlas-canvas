import { Radar, PanelRightOpen, PanelRightClose, Download, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface CanvasHeaderProps {
  onToggleAnalyst: () => void;
  analystOpen: boolean;
}

export const CanvasHeader = ({ onToggleAnalyst, analystOpen }: CanvasHeaderProps) => {
  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="h-12 flex items-center justify-between px-5 z-50 relative bg-card/80 backdrop-blur-xl border-b border-border"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="flex items-center gap-2.5"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.div
            className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Radar className="w-4 h-4 text-primary" />
          </motion.div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            ICARUS
          </h1>
        </motion.div>
        <div className="h-4 w-px bg-border" />
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[11px] text-muted-foreground font-medium"
        >
          Canvas
        </motion.span>
      </div>

      <div className="flex items-center gap-1">
        {[
          { icon: Layers, label: "Scenes" },
          { icon: Download, label: "Export" },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors duration-200"
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </motion.button>
        ))}
        <div className="h-4 w-px mx-1 bg-border" />
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggleAnalyst}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
            analystOpen
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <motion.span
            animate={{ rotate: analystOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {analystOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
          </motion.span>
          AI Analyst
        </motion.button>
      </div>
    </motion.header>
  );
};
