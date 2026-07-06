import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import StampButton from "../components/StampButton";
import api from "../api/axios";

const FREQUENCIES = ["daily", "weekly", "monthly"];

const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ name: "", frequency: "daily" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHabits = async () => {
    setLoading(true);
    const { data } = await api.get("/habits");
    setHabits(data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const submitHabit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const { data } = await api.post("/habits", form);
    setHabits([data.data, ...habits]);
    setForm({ name: "", frequency: "daily" });
  };

  const handleStamp = async (habitId) => {
    setError("");
    try {
      const { data } = await api.post(`/habits/${habitId}/complete`);
      setHabits((prev) => prev.map((h) => (h._id === habitId ? data.data : h)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not stamp habit");
    }
  };

  const deleteHabit = async (id) => {
    await api.delete(`/habits/${id}`);
    setHabits(habits.filter((h) => h._id !== id));
  };

  return (
    <Layout title="Habit Tracker" subtitle="Stamp your passbook every day you show up">
      <div className="ledger-card rounded-lg p-5 shadow-ledger mb-6">
        <form onSubmit={submitHabit} className="grid sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Habit name (e.g. Save ₹100)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="sm:col-span-2 rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="rounded-md border border-ink/15 px-3 py-2 text-sm capitalize"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <motion.button whileTap={{ scale: 0.97 }} type="submit" className="bg-moss-600 text-linen rounded-md py-2 text-sm font-medium hover:bg-moss-700 transition-colors">
            Add habit
          </motion.button>
        </form>
      </div>

      {error && <p className="text-sm text-rust-500 bg-rust-500/10 rounded-md px-3 py-2 mb-4 inline-block">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading habits…</p>
      ) : habits.length === 0 ? (
        <p className="text-slate-500">No habits yet — add your first one above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {habits.map((h, idx) => {
              const stampedToday = h.lastCompletedAt && isSameDay(h.lastCompletedAt, new Date());
              return (
                <motion.div
                  key={h._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className="ledger-card rounded-lg p-5 shadow-ledger flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-ink font-medium truncate">{h.name}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{h.frequency} habit</p>
                    <p className="text-xs text-gold-600 mt-1">Longest streak: {h.longestStreak} day{h.longestStreak === 1 ? "" : "s"}</p>
                    <button onClick={() => deleteHabit(h._id)} className="text-xs text-slate-400 hover:text-rust-500 mt-2">
                      Remove habit
                    </button>
                  </div>
                  <StampButton stamped={stampedToday} streak={h.currentStreak} onStamp={() => handleStamp(h._id)} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Layout>
  );
};

export default HabitTracker;
