import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const AnimatedNumber = ({ value, prefix = "", isCurrency = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const duration = 900;
    const from = 0;
    const to = value;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular">
      {isCurrency ? formatCurrency(Math.round(display)) : `${prefix}${Math.round(display)}`}
    </span>
  );
};

const StatCard = ({ label, value, isCurrency = false, prefix = "", accent = "moss", index = 0 }) => {
  const accentMap = {
    moss: "text-moss-600 bg-moss-50",
    gold: "text-gold-600 bg-gold-400/10",
    rust: "text-rust-600 bg-rust-400/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="ledger-card rounded-lg p-5 shadow-ledger"
    >
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-2">{label}</p>
      <p className={`font-display text-2xl md:text-3xl ${accentMap[accent]?.split(" ")[0] || "text-ink"}`}>
        <AnimatedNumber value={value} isCurrency={isCurrency} prefix={prefix} />
      </p>
    </motion.div>
  );
};

export default StatCard;
