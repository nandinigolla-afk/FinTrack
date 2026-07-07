import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExpenseTracker from "./pages/ExpenseTracker";
import HabitTracker from "./pages/HabitTracker";
import SavingsGoals from "./pages/SavingsGoals";
import WealthAnalytics from "./pages/WealthAnalytics";
import InvestmentAdvisor from "./pages/InvestmentAdvisor";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpenseTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <HabitTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <SavingsGoals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wealth"
          element={
            <ProtectedRoute>
              <WealthAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investment-advisor"
          element={
            <ProtectedRoute>
              <InvestmentAdvisor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
