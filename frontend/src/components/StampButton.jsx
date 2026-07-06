import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Signature interaction: stamping a habit "punches" an ink mark into the
// passbook, the way a bank teller once stamped a physical passbook.
const StampButton = ({ stamped, streak, onStamp, disabled }) => {
  const [justStamped, setJustStamped] = useState(false);

  const handleClick = async () => {
    if (stamped || disabled) return;
    setJustStamped(true);
    await onStamp();
  };

  return (
    <div className="relative w-20 h-20 flex items-center justify-center select-none">
      <AnimatePresence mode="wait">
        {stamped ? (
          <motion.button
            key="stamped"
            type="button"
            disabled
            initial={justStamped ? { scale: 2.4, opacity: 0, rotate: -18, y: -40 } : false}
            animate={{ scale: 1, opacity: 1, rotate: -8, y: 0 }}
            transition={
              justStamped
                ? { type: "spring", stiffness: 320, damping: 14, mass: 0.7 }
                : { duration: 0 }
            }
            className="relative w-16 h-16 rounded-full border-2 border-rust-500 flex flex-col items-center justify-center bg-rust-500/5 cursor-default"
            style={{ transform: "rotate(-8deg)" }}
          >
            <span className="font-display text-rust-500 text-lg leading-none">{streak}</span>
            <span className="text-[8px] uppercase tracking-wider text-rust-500/80 mt-0.5">day{streak === 1 ? "" : "s"}</span>
          </motion.button>
        ) : (
          <motion.button
            key="unstamped"
            type="button"
            onClick={handleClick}
            disabled={disabled}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full border-2 border-dashed border-gold-500/60 text-gold-600 flex items-center justify-center text-[10px] uppercase tracking-wide font-medium hover:border-gold-500 hover:bg-gold-400/10 transition-colors focus-ring disabled:opacity-40"
          >
            Stamp
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StampButton;
