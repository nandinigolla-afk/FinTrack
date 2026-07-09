import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../api/axios";

const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [analyticsRes, usersRes] = await Promise.all([api.get("/admin/analytics"), api.get("/admin/users")]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load platform data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStatus = async (id) => {
    const { data } = await api.put(`/admin/users/${id}/toggle-status`);
    setUsers(users.map((u) => (u._id === id ? data.data : u)));
  };

  const removeUser = async (id) => {
    if (!window.confirm("Permanently delete this user and their data?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(users.filter((u) => u._id !== id));
  };

  return (
    <Layout title="Admin Panel" subtitle="Platform-wide usage and user management">
      {loadError && (
        <div className="flex items-center justify-between gap-3 bg-rust-500/10 border border-rust-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-rust-600">{loadError}</p>
          <button onClick={loadData} className="text-xs font-medium text-rust-600 underline shrink-0">Retry</button>
        </div>
      )}
      {loading ? (
        <p className="text-slate-500">Loading platform data…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={analytics?.totalUsers || 0} accent="moss" index={0} />
            <StatCard label="Active Users" value={analytics?.activeUsers || 0} accent="moss" index={1} />
            <StatCard label="Active Habits" value={analytics?.totalHabits || 0} accent="gold" index={2} />
            <StatCard label="Goal Completion Rate" value={Number(analytics?.avgGoalCompletionRate) || 0} accent="gold" index={3} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="ledger-card rounded-lg p-5 shadow-ledger">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Platform Total Income Logged</p>
              <p className="font-display text-xl text-moss-600">{formatINR(analytics?.platformTotalIncome || 0)}</p>
            </div>
            <div className="ledger-card rounded-lg p-5 shadow-ledger">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Platform Total Expenses Logged</p>
              <p className="font-display text-xl text-rust-500">{formatINR(analytics?.platformTotalExpenses || 0)}</p>
            </div>
          </div>

          <div className="ledger-card rounded-lg shadow-ledger overflow-hidden">
            <div className="px-5 py-3 border-b border-ink/10">
              <h2 className="font-display text-lg text-ink">User management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-500 border-b border-ink/10">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {users.map((u) => (
                      <motion.tr
                        key={u._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-ink/5 hover:bg-white/40"
                      >
                        <td className="px-5 py-3 text-ink font-medium">{u.name}</td>
                        <td className="px-5 py-3 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3 capitalize">{u.role}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? "bg-moss-50 text-moss-600" : "bg-rust-400/10 text-rust-500"}`}>
                            {u.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => toggleStatus(u._id)} className="text-xs text-moss-600 hover:underline">
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                            {u.role !== "admin" && (
                              <button onClick={() => removeUser(u._id)} className="text-xs text-rust-500 hover:underline">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminPanel;
