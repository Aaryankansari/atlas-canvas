import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, X, Zap, Loader2 } from "lucide-react";

interface BatchScanInputProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (entities: string[]) => void;
  scanning: boolean;
}

export const BatchScanInput = ({ isOpen, onClose, onScan, scanning }: BatchScanInputProps) => {
  const [text, setText] = useState("");

  const entities = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const handleScan = () => {
    if (entities.length === 0) return;
    onScan(entities);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">Batch Scan</span>
                {entities.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono">
                    {entities.length} entities
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Paste one entity per line:\n192.168.1.1\nuser@email.com\n@username\nexample.com"}
              className="w-full h-24 px-3 py-2 rounded-lg text-[11px] font-mono bg-background border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-foreground placeholder:text-muted-foreground/50"
            />
            <button
              onClick={handleScan}
              disabled={entities.length === 0 || scanning}
              className="w-full py-2 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Scanning {entities.length} entities...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  Scan {entities.length} entities
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
