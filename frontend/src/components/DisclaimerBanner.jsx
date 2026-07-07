import { AlertTriangle } from "lucide-react";

const DisclaimerBanner = () => (
  <div className="flex items-start gap-3 bg-gold-400/10 border border-gold-500/30 rounded-lg px-4 py-3 mb-6">
    <AlertTriangle size={18} className="text-gold-600 shrink-0 mt-0.5" />
    <p className="text-xs text-ink/80 leading-relaxed">
      This feature is for educational and financial planning purposes only. Investment projections are
      estimates based on historical data and assumptions, not guarantees or personalized financial advice.
    </p>
  </div>
);

export default DisclaimerBanner;
