import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: -8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-linen rounded-lg shadow-2xl p-8 border border-moss-700/30">
          <div className="text-center mb-8">
            <p className="font-mono text-xs text-gold-600 tracking-widest mb-2">FINANCIAL HABIT BUILDER</p>
            <h1 className="font-display text-3xl text-ink">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Open your passbook to continue</p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-rust-500 bg-rust-500/10 rounded-md px-3 py-2 mb-4"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-ink focus-ring focus:border-moss-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-medium">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-ink focus-ring focus:border-moss-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-moss-600 text-linen rounded-md py-2.5 font-medium hover:bg-moss-700 transition-colors disabled:opacity-60 focus-ring"
            >
              {loading ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            New here?{" "}
            <Link to="/register" className="text-moss-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
