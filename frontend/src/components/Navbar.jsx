import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const mobileLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/expenses", label: "Expenses" },
  { to: "/habits", label: "Habits" },
  { to: "/goals", label: "Goals" },
  { to: "/wealth", label: "Wealth" },
  { to: "/investment-advisor", label: "Investment Advisor" },
];

const Navbar = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-linen/90 backdrop-blur border-b border-ink/10">
      <div className="flex items-center justify-between px-5 md:px-8 py-4">
        <div>
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="font-display text-xl md:text-2xl text-ink"
          >
            {title}
          </motion.h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {user?.role === "admin" && (
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-1 rounded bg-rust-500/10 text-rust-600">
              ADMIN
            </span>
          )}
          <button
            onClick={handleLogout}
            className="hidden md:inline-block text-sm px-4 py-2 rounded-md border border-ink/15 text-ink hover:bg-ink hover:text-linen transition-colors focus-ring"
          >
            Log out
          </button>
          <button
            className="md:hidden text-ink px-2 py-1 focus-ring"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-b border-ink/10 bg-linen"
          >
            <nav className="flex flex-col px-5 py-2">
              {mobileLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-ink text-sm border-b border-ink/5 last:border-none"
                >
                  {l.label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="py-3 text-left text-sm text-rust-500">
                Log out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
