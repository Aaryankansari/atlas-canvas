import { motion, AnimatePresence } from "framer-motion";
import { Image, FileCode, X } from "lucide-react";

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
}

export const ExportMenu = ({ isOpen, onClose, onExportPng, onExportSvg }: ExportMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ type: "spring", damping: 24, stiffness: 400 }}
          className="absolute right-20 top-12 z-[60] min-w-[180px] rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl py-2"
        >
          <div className="px-4 pt-1.5 pb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Export Canvas</span>
          </div>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => { onExportPng(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Image className="w-3.5 h-3.5" strokeWidth={1.8} />
            Export as PNG
          </motion.button>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => { onExportSvg(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-foreground hover:bg-muted transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" strokeWidth={1.8} />
            Export as SVG
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
