import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import api from "../api/axios";

const CATEGORIES = ["Emergency Fund", "Vacation", "Vehicle", "Home", "Education", "Retirement", "Other"];
const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ title: "", targetAmount: "", targetDate: "", category: "Other" });
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadGoals = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/goals");
      setGoals(data.data);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load your savings goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const submitGoal = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount) return;
    const { data } = await api.post("/goals", { ...form, targetAmount: Number(form.targetAmount) });
    setGoals([data.data, ...goals]);
    setForm({ title: "", targetAmount: "", targetDate: "", category: "Other" });
  };

  const contribute = async (id) => {
    const amount = Number(contributions[id]);
    if (!amount || amount <= 0) return;
    const { data } = await api.post(`/goals/${id}/contribute`, { amount });
    setGoals(goals.map((g) => (g._id === id ? data.data : g)));
    setContributions({ ...contributions, [id]: "" });
  };

  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    setGoals(goals.filter((g) => g._id !== id));
  };

  return (
    <Layout title="Savings Goals" subtitle="Give every rupee saved a purpose">
      {loadError && (
        <div className="flex items-center justify-between gap-3 bg-rust-500/10 border border-rust-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-rust-600">{loadError}</p>
          <button onClick={loadGoals} className="text-xs font-medium text-rust-600 underline shrink-0">Retry</button>
        </div>
      )}
      <div className="ledger-card rounded-lg p-5 shadow-ledger mb-6">
        <form onSubmit={submitGoal} className="grid sm:grid-cols-5 gap-3">
          <input
            type="text"
            required
            placeholder="Goal title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="sm:col-span-2 rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-md border border-ink/15 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            required
            placeholder="Target amount"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            className="rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <motion.button whileTap={{ scale: 0.97 }} type="submit" className="sm:col-span-5 bg-gold-500 text-ink rounded-md py-2 text-sm font-medium hover:bg-gold-600 hover:text-linen transition-colors">
            Set new goal
          </motion.button>
        </form>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading goals…</p>
      ) : goals.length === 0 ? (
        <p className="text-slate-500">No savings goals yet — set your first one above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          <AnimatePresence>
            {goals.map((g, idx) => {
              const pct = (g.currentAmount / g.targetAmount) * 100;
              return (
                <motion.div
                  key={g._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="ledger-card rounded-lg p-5 shadow-ledger"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-ink font-medium">{g.title}</p>
                      <p className="text-xs text-slate-500">{g.category}{g.targetDate ? ` · by ${new Date(g.targetDate).toLocaleDateString("en-IN")}` : ""}</p>
                    </div>
                    {g.isCompleted && (
                      <motion.span
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: -8 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-xs font-mono text-gold-600 border border-gold-500 rounded-full px-2 py-0.5"
                      >
                        Achieved
                      </motion.span>
                    )}
                  </div>

                  <div className="my-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-ink font-mono">{formatINR(g.currentAmount)}</span>
                      <span className="text-slate-500">of {formatINR(g.targetAmount)}</span>
                    </div>
                    <ProgressBar percent={pct} color={g.isCompleted ? "bg-gold-500" : "bg-moss-500"} />
                  </div>

                  {!g.isCompleted && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Add amount"
                        value={contributions[g._id] || ""}
                        onChange={(e) => setContributions({ ...contributions, [g._id]: e.target.value })}
                        className="flex-1 rounded-md border border-ink/15 px-3 py-1.5 text-sm"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => contribute(g._id)}
                        className="bg-moss-600 text-linen rounded-md px-3 py-1.5 text-sm hover:bg-moss-700 transition-colors"
                      >
                        Contribute
                      </motion.button>
                    </div>
                  )}
                  <button onClick={() => deleteGoal(g._id)} className="text-xs text-slate-400 hover:text-rust-500 mt-3">
                    Remove goal
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Layout>
  );
};

export default SavingsGoals;
