import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Bookmark, BookmarkCheck } from "lucide-react";

const riskColor = (level) => {
  if (level.includes("Low") && !level.includes("Medium")) return "text-moss-600 bg-moss-50";
  if (level.includes("High")) return "text-rust-500 bg-rust-400/10";
  return "text-gold-600 bg-gold-400/10";
};

const RecommendationCard = ({ rec, index, onSave, saved }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="ledger-card rounded-lg shadow-ledger overflow-hidden"
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-ink font-medium">{rec.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${riskColor(rec.riskLevel)}`}>{rec.riskLevel} risk</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{rec.category} · CAGR ~{rec.historicalCAGR}% · {rec.minHorizonYears}+ yr horizon</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-display text-xl text-moss-600 tabular">{rec.suitabilityScore}%</p>
            <p className="text-[10px] text-slate-500 uppercase">Suitability</p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-slate-400">
            <ChevronDown size={18} />
          </motion.span>
        </div>
      </button>

      <div className="px-5 pb-2">
        <div className="w-full h-1.5 rounded-full bg-ink/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-moss-500"
            initial={{ width: 0 }}
            animate={{ width: `${rec.suitabilityScore}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-ink/10 space-y-3">
              <p className="text-sm text-ink/80 italic">{rec.recommendationReason}</p>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 uppercase tracking-wide mb-0.5">Liquidity</p>
                  <p className="text-ink">{rec.liquidity}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wide mb-0.5">Tax Benefits</p>
                  <p className="text-ink">{rec.taxBenefits}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-moss-600 uppercase tracking-wide mb-1">Pros</p>
                  <ul className="text-xs text-ink/80 space-y-1 list-disc list-inside">
                    {rec.pros.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-rust-500 uppercase tracking-wide mb-1">Cons</p>
                  <ul className="text-xs text-ink/80 space-y-1 list-disc list-inside">
                    {rec.cons.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onSave(rec)}
                disabled={saved}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gold-500/10 text-gold-600 hover:bg-gold-500/20 transition-colors disabled:opacity-50 focus-ring"
              >
                {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {saved ? "Saved to your plans" : "Save this plan"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecommendationCard;
