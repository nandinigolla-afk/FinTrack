import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LockOpen } from "lucide-react";

// Password field themed like a passbook vault: a locked padlock while the
// password is hidden, which springs open into an unlocked padlock on reveal.
const PasswordInput = ({ value, onChange, placeholder = "••••••••", required = true, minLength }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-ink/15 bg-white pl-3 pr-11 py-2.5 text-ink focus-ring focus:border-moss-500 outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 translate-y-[calc(50%+1px)] text-slate-400 hover:text-gold-600 transition-colors focus-ring rounded p-0.5"
      >
        <AnimatePresence mode="wait" initial={false}>
          {visible ? (
            <motion.span
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              <LockOpen size={17} />
            </motion.span>
          ) : (
            <motion.span
              key="closed"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              <Lock size={17} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default PasswordInput;
