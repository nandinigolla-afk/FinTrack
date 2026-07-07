import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fintrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("fintrack_token");
      localStorage.removeItem("fintrack_user");
      // Notify the app in-place instead of forcing a hard page reload.
      // A hard reload to a non-root path (e.g. /login) depends on the host
      // rewriting all paths to index.html for the SPA to render correctly —
      // dispatching an event and letting React Router handle it client-side
      // avoids that dependency entirely and prevents blank-page redirects.
      window.dispatchEvent(new Event("fintrack:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;
