import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import api from "../api/axios";

const REFRESH_MS = 5 * 60 * 1000; // matches backend cache TTL

const formatPrice = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

const LiveMarketOverview = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data } = await api.get("/market/live");
      setQuotes(data.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="ledger-card rounded-lg p-5 shadow-ledger">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg text-ink">Live Market Overview</h2>
          <p className="text-xs text-slate-500">Refreshes automatically every 5 minutes</p>
        </div>
        <button
          onClick={() => load(true)}
          className="text-slate-500 hover:text-moss-600 transition-colors focus-ring rounded p-1"
          aria-label="Refresh market data"
        >
          <motion.span animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.6, ease: "linear" }} className="block">
            <RefreshCw size={16} />
          </motion.span>
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Fetching market prices…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {quotes.map((q, idx) => {
              const isUp = q.change >= 0;
              return (
                <motion.div
                  key={q.key}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white/50 rounded-md p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-ink font-medium">{q.name}</p>
                    {!q.isLive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-500 uppercase tracking-wide">
                        Estimated
                      </span>
                    )}
                  </div>
                  <p className="font-display text-lg text-ink tabular">{formatPrice(q.price)}</p>
                  <div className={`flex items-center gap-1 text-xs mt-0.5 ${isUp ? "text-moss-600" : "text-rust-500"}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{isUp ? "+" : ""}{q.change} ({isUp ? "+" : ""}{q.percentChange}%)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Updated {new Date(q.lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LiveMarketOverview;
