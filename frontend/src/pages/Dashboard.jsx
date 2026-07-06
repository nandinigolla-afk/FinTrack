import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import StampButton from "../components/StampButton";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [wealthRes, habitsRes, goalsRes, expensesRes] = await Promise.all([
        api.get("/investments/wealth-summary"),
        api.get("/habits"),
        api.get("/goals"),
        api.get("/expenses"),
      ]);
      setSummary(wealthRes.data.data);
      setHabits(habitsRes.data.data);
      setGoals(goalsRes.data.data);
      setExpenses(expensesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

  const handleStamp = async (habitId) => {
    try {
      const { data } = await api.post(`/habits/${habitId}/complete`);
      setHabits((prev) => prev.map((h) => (h._id === habitId ? data.data : h)));
    } catch (err) {
      console.error(err);
    }
  };

  // Build a simple last-14-days expense trend for the chart
  const chartData = (() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayExpenses = expenses
        .filter((e) => isSameDay(e.date, d))
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({ day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), spent: dayExpenses });
    }
    return days;
  })();

  return (
    <Layout title={`Good to see you, ${user?.name?.split(" ")[0] || ""}`} subtitle="Here's where your finances stand today">
      {loading ? (
        <p className="text-slate-500">Loading your passbook…</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Net Worth" value={summary?.netWorth || 0} isCurrency index={0} accent="moss" />
            <StatCard label="Cash On Hand" value={summary?.cashOnHand || 0} isCurrency index={1} accent="moss" />
            <StatCard label="Total Savings" value={summary?.totalSavings || 0} isCurrency index={2} accent="gold" />
            <StatCard label="Investment Value" value={summary?.totalInvestmentValue || 0} isCurrency index={3} accent="gold" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="lg:col-span-2 ledger-card rounded-lg p-5 shadow-ledger"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink">Spending, last 14 days</h2>
                <Link to="/expenses" className="text-xs text-moss-600 hover:underline">View all →</Link>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B5533C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#B5533C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,43,34,0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: "#1B2B22", border: "none", borderRadius: 8, color: "#EFEDE3", fontSize: 12 }}
                    formatter={(v) => [`₹${v}`, "Spent"]}
                  />
                  <Area type="monotone" dataKey="spent" stroke="#B5533C" strokeWidth={2} fill="url(#spendGradient)" animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="ledger-card rounded-lg p-5 shadow-ledger"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink">Today's habits</h2>
                <Link to="/habits" className="text-xs text-moss-600 hover:underline">Manage →</Link>
              </div>
              {habits.length === 0 ? (
                <p className="text-sm text-slate-500">No habits yet. Add one to start your streak.</p>
              ) : (
                <div className="space-y-3">
                  {habits.slice(0, 3).map((h) => {
                    const stampedToday = h.lastCompletedAt && isSameDay(h.lastCompletedAt, new Date());
                    return (
                      <div key={h._id} className="flex items-center justify-between gap-3 bg-white/50 rounded-md px-3 py-2">
                        <div>
                          <p className="text-sm text-ink font-medium">{h.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{h.frequency} · streak {h.currentStreak}</p>
                        </div>
                        <div className="scale-75 -mr-3 -my-3">
                          <StampButton stamped={stampedToday} streak={h.currentStreak} onStamp={() => handleStamp(h._id)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.4 }}
            className="ledger-card rounded-lg p-5 shadow-ledger"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-ink">Savings goals in progress</h2>
              <Link to="/goals" className="text-xs text-moss-600 hover:underline">View all →</Link>
            </div>
            {goals.length === 0 ? (
              <p className="text-sm text-slate-500">No savings goals yet. Set one to start tracking progress.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {goals.slice(0, 4).map((g) => {
                  const pct = (g.currentAmount / g.targetAmount) * 100;
                  return (
                    <div key={g._id} className="bg-white/50 rounded-md p-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-ink font-medium">{g.title}</span>
                        <span className="text-slate-500">{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-ink/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gold-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
