import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Layout from "../components/Layout";
import api from "../api/axios";

const CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Education", "Other"];
const PIE_COLORS = ["#3F6C51", "#B98B3E", "#B5533C", "#5C6670", "#8CB89B", "#D3A552", "#294933", "#C56B52", "#96702F"];

const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const ExpenseTracker = () => {
  const [tab, setTab] = useState("expense");
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState([]);
  const [expForm, setExpForm] = useState({ category: "Food", amount: "", date: new Date().toISOString().slice(0, 10), description: "" });
  const [incForm, setIncForm] = useState({ source: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "" });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [expRes, incRes, sumRes] = await Promise.all([
      api.get("/expenses"),
      api.get("/incomes"),
      api.get("/expenses/summary"),
    ]);
    setExpenses(expRes.data.data);
    setIncomes(incRes.data.data);
    setSummary(sumRes.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitExpense = async (e) => {
    e.preventDefault();
    if (!expForm.amount) return;
    const { data } = await api.post("/expenses", { ...expForm, amount: Number(expForm.amount) });
    setExpenses([data.data, ...expenses]);
    setExpForm({ ...expForm, amount: "", description: "" });
    const sumRes = await api.get("/expenses/summary");
    setSummary(sumRes.data.data);
  };

  const submitIncome = async (e) => {
    e.preventDefault();
    if (!incForm.source || !incForm.amount) return;
    const { data } = await api.post("/incomes", { ...incForm, amount: Number(incForm.amount) });
    setIncomes([data.data, ...incomes]);
    setIncForm({ ...incForm, source: "", amount: "", notes: "" });
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    setExpenses(expenses.filter((e) => e._id !== id));
    const sumRes = await api.get("/expenses/summary");
    setSummary(sumRes.data.data);
  };

  const deleteIncome = async (id) => {
    await api.delete(`/incomes/${id}`);
    setIncomes(incomes.filter((i) => i._id !== id));
  };

  return (
    <Layout title="Expense & Income Tracker" subtitle="Log every rupee in and out">
      <div className="flex gap-2 mb-6">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors focus-ring ${
              tab === t ? "bg-moss-600 text-linen" : "bg-white/60 text-ink hover:bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div layout className="lg:col-span-2 space-y-6">
          <div className="ledger-card rounded-lg p-5 shadow-ledger">
            <AnimatePresence mode="wait">
              {tab === "expense" ? (
                <motion.form
                  key="expense-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submitExpense}
                  className="grid sm:grid-cols-4 gap-3"
                >
                  <select
                    value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm sm:col-span-1"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Amount"
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" className="sm:col-span-4 bg-rust-500 text-linen rounded-md py-2 text-sm font-medium hover:bg-rust-600 transition-colors">
                    Add expense
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="income-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submitIncome}
                  className="grid sm:grid-cols-4 gap-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Source (e.g. Salary)"
                    value={incForm.source}
                    onChange={(e) => setIncForm({ ...incForm, source: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Amount"
                    value={incForm.amount}
                    onChange={(e) => setIncForm({ ...incForm, amount: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={incForm.date}
                    onChange={(e) => setIncForm({ ...incForm, date: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={incForm.notes}
                    onChange={(e) => setIncForm({ ...incForm, notes: e.target.value })}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                  />
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" className="sm:col-span-4 bg-moss-600 text-linen rounded-md py-2 text-sm font-medium hover:bg-moss-700 transition-colors">
                    Add income
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="ledger-card rounded-lg shadow-ledger overflow-hidden">
            <div className="px-5 py-3 border-b border-ink/10">
              <h2 className="font-display text-lg text-ink capitalize">{tab} history</h2>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <AnimatePresence>
                {(tab === "expense" ? expenses : incomes).length === 0 && !loading && (
                  <p className="text-sm text-slate-500 px-5 py-6">No records yet.</p>
                )}
                {tab === "expense"
                  ? expenses.map((e) => (
                      <motion.div
                        key={e._id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className="flex items-center justify-between px-5 py-3 border-b border-ink/5 last:border-none hover:bg-white/40"
                      >
                        <div>
                          <p className="text-sm text-ink font-medium">{e.category}</p>
                          <p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString("en-IN")} {e.description && `· ${e.description}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-rust-500">-{formatINR(e.amount)}</span>
                          <button onClick={() => deleteExpense(e._id)} className="text-slate-400 hover:text-rust-500 text-xs">✕</button>
                        </div>
                      </motion.div>
                    ))
                  : incomes.map((i) => (
                      <motion.div
                        key={i._id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className="flex items-center justify-between px-5 py-3 border-b border-ink/5 last:border-none hover:bg-white/40"
                      >
                        <div>
                          <p className="text-sm text-ink font-medium">{i.source}</p>
                          <p className="text-xs text-slate-500">{new Date(i.date).toLocaleDateString("en-IN")} {i.notes && `· ${i.notes}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-moss-600">+{formatINR(i.amount)}</span>
                          <button onClick={() => deleteIncome(i._id)} className="text-slate-400 hover:text-rust-500 text-xs">✕</button>
                        </div>
                      </motion.div>
                    ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="ledger-card rounded-lg p-5 shadow-ledger h-fit"
        >
          <h2 className="font-display text-lg text-ink mb-4">Spending by category</h2>
          {summary.length === 0 ? (
            <p className="text-sm text-slate-500">Add expenses to see a breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={summary} dataKey="total" nameKey="_id" innerRadius={55} outerRadius={90} paddingAngle={2} animationDuration={800}>
                  {summary.map((entry, idx) => (
                    <Cell key={entry._id} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ExpenseTracker;
