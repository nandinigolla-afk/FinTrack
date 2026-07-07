import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const HealthScoreRing = ({ score = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const duration = 1000;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(score * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, score]);

  const color = score >= 70 ? "#3F6C51" : score >= 40 ? "#B98B3E" : "#B5533C";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "Needs attention" : "At risk";

  return (
    <div ref={ref} className="ledger-card rounded-lg p-5 shadow-ledger flex flex-col items-center justify-center">
      <h2 className="font-display text-lg text-ink mb-3 self-start">Portfolio Health Score</h2>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
          <circle cx="66" cy="66" r={radius} fill="none" stroke="rgba(27,43,34,0.1)" strokeWidth="12" />
          <motion.circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: inView ? offset : circumference }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-ink tabular">{display}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <p className="text-sm mt-3 font-medium" style={{ color }}>{label}</p>
    </div>
  );
};

export default HealthScoreRing;
