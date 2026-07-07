import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("fintrack_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const userData = data.data;
    localStorage.setItem("fintrack_token", userData.token);
    localStorage.setItem("fintrack_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    const userData = data.data;
    localStorage.setItem("fintrack_token", userData.token);
    localStorage.setItem("fintrack_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("fintrack_token");
    localStorage.removeItem("fintrack_user");
    setUser(null);
  };

  // When any API call comes back 401 (expired/invalid token), the axios
  // interceptor clears storage and fires this event. Clearing user state here
  // lets ProtectedRoute redirect client-side via React Router — no hard reload.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("fintrack:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("fintrack:unauthorized", handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
