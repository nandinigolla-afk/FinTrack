import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";

const INSTRUMENT_OPTIONS = [
  { id: "fd", label: "Fixed Deposit" },
  { id: "ppf", label: "PPF" },
  { id: "gold_etf", label: "Gold ETF" },
  { id: "nifty50", label: "Nifty Index Fund" },
  { id: "mutual_fund", label: "Mutual Fund" },
  { id: "debt_fund", label: "Debt Fund" },
];

const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const WhatIfSimulator = () => {
  const [form, setForm] = useState({ amount: 500000, monthlySIP: 5000, durationYears: 10 });
  const [selected, setSelected] = useState(["nifty50"]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleInstrument = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runSimulation = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.post("/investments/simulate", { ...form, instrumentIds: selected });
      setResults(data.data.results);
    } finally {
      setLoading(false);
    }
  };

  const primary = results?.[0];

  return (
    <div className="ledger-card rounded-lg p-5 shadow-ledger">
      <h2 className="font-display text-lg text-ink mb-1">What-If Investment Simulator</h2>
      <p className="text-xs text-slate-500 mb-4">Compare instruments side by side using historical average returns</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Lumpsum amount</label>
          <input
            type="number"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Monthly SIP</label>
          <input
            type="number"
            min="0"
            value={form.monthlySIP}
            onChange={(e) => setForm({ ...form, monthlySIP: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Duration (years)</label>
          <input
            type="number"
            min="1"
            max="40"
            value={form.durationYears}
            onChange={(e) => setForm({ ...form, durationYears: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {INSTRUMENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggleInstrument(opt.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus-ring ${
              selected.includes(opt.id) ? "bg-moss-600 text-linen border-moss-600" : "border-ink/15 text-ink hover:bg-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={runSimulation}
        disabled={loading || selected.length === 0}
        className="bg-gold-500 text-ink rounded-md px-4 py-2 text-sm font-medium hover:bg-gold-600 hover:text-linen transition-colors disabled:opacity-50"
      >
        {loading ? "Simulating…" : "Run simulation"}
      </motion.button>

      {results && (
        <div className="mt-6 space-y-6">
          {results.map((r) => (
            <div key={r.instrumentId} className="border-t border-ink/10 pt-5">
              <p className="text-ink font-medium mb-3">{r.instrumentName}</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Worst Case", data: r.worst, color: "text-rust-500" },
                  { label: "Average Case", data: r.average, color: "text-gold-600" },
                  { label: "Best Case", data: r.best, color: "text-moss-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/50 rounded-md p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</p>
                    <p className={`font-display text-base ${s.color} tabular`}>{formatINR(s.data.futureValue)}</p>
                    <p className="text-[10px] text-slate-500">{s.data.annualReturnPercent}% p.a. · gain {formatINR(s.data.gain)}</p>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={r.growthCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,43,34,0.08)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} width={55} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={{ background: "#1B2B22", border: "none", borderRadius: 8, color: "#EFEDE3", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="best" name="Best case" stroke="#3F6C51" strokeWidth={2} dot={false} animationDuration={700} />
                  <Line type="monotone" dataKey="average" name="Average case" stroke="#B98B3E" strokeWidth={2} dot={false} animationDuration={700} />
                  <Line type="monotone" dataKey="worst" name="Worst case" stroke="#B5533C" strokeWidth={2} dot={false} animationDuration={700} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulator;
