import { motion } from "framer-motion";

const RISK_LEVELS = ["Conservative", "Moderate", "Aggressive"];
const RISK_TO_ANGLE = { Conservative: -60, Moderate: 0, Aggressive: 60 };

// Semi-circular gauge with an animated needle, in the passbook palette.
const RiskMeter = ({ riskPreference = "Moderate", onChange }) => {
  const angle = RISK_TO_ANGLE[riskPreference] ?? 0;

  return (
    <div className="ledger-card rounded-lg p-5 shadow-ledger">
      <h2 className="font-display text-lg text-ink mb-1">Risk Meter</h2>
      <p className="text-xs text-slate-500 mb-4">Your declared risk appetite drives every recommendation below</p>

      <div className="flex justify-center">
        <svg viewBox="0 0 200 120" width="220" height="132">
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#3F6C51" strokeWidth="14" strokeLinecap="round" opacity="0.15" />
          <path d="M 20 110 A 80 80 0 0 1 76 33" fill="none" stroke="#3F6C51" strokeWidth="14" strokeLinecap="round" />
          <path d="M 76 33 A 80 80 0 0 1 124 33" fill="none" stroke="#B98B3E" strokeWidth="14" strokeLinecap="round" />
          <path d="M 124 33 A 80 80 0 0 1 180 110" fill="none" stroke="#B5533C" strokeWidth="14" strokeLinecap="round" />
          <motion.g
            initial={{ rotate: -60 }}
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 90, damping: 12 }}
            style={{ originX: "100px", originY: "110px" }}
          >
            <line x1="100" y1="110" x2="100" y2="42" stroke="#1B2B22" strokeWidth="3" strokeLinecap="round" />
          </motion.g>
          <circle cx="100" cy="110" r="6" fill="#1B2B22" />
        </svg>
      </div>

      <div className="flex justify-between text-xs text-slate-500 px-2 -mt-2 mb-4">
        <span>Conservative</span>
        <span>Moderate</span>
        <span>Aggressive</span>
      </div>

      {onChange && (
        <div className="flex gap-2">
          {RISK_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`flex-1 text-xs py-1.5 rounded-md border transition-colors focus-ring ${
                riskPreference === level
                  ? "bg-moss-600 text-linen border-moss-600"
                  : "border-ink/15 text-ink hover:bg-white"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskMeter;
