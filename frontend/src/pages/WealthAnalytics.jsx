import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Landmark, Coins, TrendingUp, PercentCircle } from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../api/axios";

const TYPES = ["Stocks", "Mutual Funds", "Fixed Deposit", "Gold", "Real Estate", "Crypto", "Bonds", "Other"];
const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const WealthAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [form, setForm] = useState({ name: "", type: "Stocks", amountInvested: "", currentValue: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [sumRes, invRes] = await Promise.all([api.get("/investments/wealth-summary"), api.get("/investments")]);
      setSummary(sumRes.data.data);
      setInvestments(invRes.data.data);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load your wealth data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitInvestment = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amountInvested || !form.currentValue) return;
    const { data } = await api.post("/investments", {
      ...form,
      amountInvested: Number(form.amountInvested),
      currentValue: Number(form.currentValue),
    });
    setInvestments([data.data, ...investments]);
    setForm({ name: "", type: "Stocks", amountInvested: "", currentValue: "" });
    const sumRes = await api.get("/investments/wealth-summary");
    setSummary(sumRes.data.data);
  };

  const deleteInvestment = async (id) => {
    await api.delete(`/investments/${id}`);
    setInvestments(investments.filter((i) => i._id !== id));
    const sumRes = await api.get("/investments/wealth-summary");
    setSummary(sumRes.data.data);
  };

  const chartData = investments.map((i) => ({
    name: i.name.length > 12 ? i.name.slice(0, 12) + "…" : i.name,
    invested: i.amountInvested,
    current: i.currentValue,
  }));

  return (
    <Layout title="Wealth Analytics" subtitle="Watch your net worth compound over time">
      {loadError && (
        <div className="flex items-center justify-between gap-3 bg-rust-500/10 border border-rust-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-rust-600">{loadError}</p>
          <button onClick={loadData} className="text-xs font-medium text-rust-600 underline shrink-0">Retry</button>
        </div>
      )}
      {loading ? (
        <p className="text-slate-500">Crunching the numbers…</p>
      ) : loadError ? null : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Net Worth" value={summary?.netWorth || 0} isCurrency accent="moss" index={0} Icon={Landmark} />
            <StatCard label="Total Invested" value={summary?.totalInvested || 0} isCurrency accent="gold" index={1} Icon={Coins} />
            <StatCard label="Current Value" value={summary?.totalInvestmentValue || 0} isCurrency accent="gold" index={2} Icon={TrendingUp} />
            <StatCard label="Growth %" value={summary?.investmentGrowthPercent || 0} prefix="" accent="moss" index={3} Icon={PercentCircle} />
          </div>

          <div className="ledger-card rounded-lg p-5 shadow-ledger">
            <h2 className="font-display text-lg text-ink mb-4">Invested vs current value</h2>
            {investments.length === 0 ? (
              <p className="text-sm text-slate-500">Add an investment or asset to see the comparison.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,43,34,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: "#1B2B22", border: "none", borderRadius: 8, color: "#EFEDE3", fontSize: 12 }} />
                  <Bar dataKey="invested" fill="#8CB89B" radius={[4, 4, 0, 0]} animationDuration={700} />
                  <Bar dataKey="current" fill="#B98B3E" radius={[4, 4, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="ledger-card rounded-lg p-5 shadow-ledger">
            <h2 className="font-display text-lg text-ink mb-4">Add an investment or asset</h2>
            <form onSubmit={submitInvestment} className="grid sm:grid-cols-5 gap-3">
              <input
                type="text"
                required
                placeholder="Name (e.g. Nifty 50 Index Fund)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="sm:col-span-2 rounded-md border border-ink/15 px-3 py-2 text-sm"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="rounded-md border border-ink/15 px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                required
                placeholder="Amount invested"
                value={form.amountInvested}
                onChange={(e) => setForm({ ...form, amountInvested: e.target.value })}
                className="rounded-md border border-ink/15 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                required
                placeholder="Current value"
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                className="rounded-md border border-ink/15 px-3 py-2 text-sm"
              />
              <motion.button whileTap={{ scale: 0.97 }} type="submit" className="sm:col-span-5 bg-moss-600 text-linen rounded-md py-2 text-sm font-medium hover:bg-moss-700 transition-colors">
                Add to portfolio
              </motion.button>
            </form>
          </div>

          <div className="ledger-card rounded-lg shadow-ledger overflow-hidden">
            <div className="px-5 py-3 border-b border-ink/10">
              <h2 className="font-display text-lg text-ink">Your portfolio</h2>
            </div>
            <AnimatePresence>
              {investments.length === 0 && <p className="text-sm text-slate-500 px-5 py-6">No assets tracked yet.</p>}
              {investments.map((i) => {
                const growth = i.amountInvested > 0 ? ((i.currentValue - i.amountInvested) / i.amountInvested) * 100 : 0;
                return (
                  <motion.div
                    key={i._id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="flex items-center justify-between px-5 py-3 border-b border-ink/5 last:border-none hover:bg-white/40"
                  >
                    <div>
                      <p className="text-sm text-ink font-medium">{i.name}</p>
                      <p className="text-xs text-slate-500">{i.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-ink">{formatINR(i.currentValue)}</span>
                      <span className={`text-xs font-mono ${growth >= 0 ? "text-moss-600" : "text-rust-500"}`}>
                        {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                      </span>
                      <button onClick={() => deleteInvestment(i._id)} className="text-slate-400 hover:text-rust-500 text-xs">✕</button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WealthAnalytics;
