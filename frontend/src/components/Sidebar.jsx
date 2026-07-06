import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", glyph: "01" },
  { to: "/expenses", label: "Expense Tracker", glyph: "02" },
  { to: "/habits", label: "Habit Tracker", glyph: "03" },
  { to: "/goals", label: "Savings Goals", glyph: "04" },
  { to: "/wealth", label: "Wealth Analytics", glyph: "05" },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink text-linen min-h-screen sticky top-0 py-8 px-5">
      <div className="mb-10 px-2">
        <p className="font-display text-2xl tracking-tight text-linen">FinTrack</p>
        <p className="text-xs text-moss-300 font-mono mt-1">passbook & progress</p>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative px-3 py-2.5 rounded-md flex items-center gap-3 group focus-ring"
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-moss-600 rounded-md"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 font-mono text-xs ${
                  active ? "text-gold-400" : "text-moss-300 group-hover:text-gold-400"
                } transition-colors`}
              >
                {link.glyph}
              </span>
              <span className={`relative z-10 text-sm ${active ? "text-linen" : "text-moss-100 group-hover:text-linen"}`}>
                {link.label}
              </span>
            </NavLink>
          );
        })}

        {user?.role === "admin" && (
          <NavLink to="/admin" className="relative px-3 py-2.5 rounded-md flex items-center gap-3 group focus-ring mt-4 border-t border-moss-700/50 pt-4">
            {location.pathname === "/admin" && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 mt-4 bg-rust-500 rounded-md"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative z-10 font-mono text-xs ${location.pathname === "/admin" ? "text-linen" : "text-rust-400"}`}>
              ⚑
            </span>
            <span className={`relative z-10 text-sm ${location.pathname === "/admin" ? "text-linen" : "text-rust-400"}`}>
              Admin Panel
            </span>
          </NavLink>
        )}
      </nav>

      <div className="mt-auto px-2 pt-6 border-t border-moss-700/40">
        <p className="text-xs text-moss-300">Signed in as</p>
        <p className="text-sm text-linen truncate">{user?.name}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
