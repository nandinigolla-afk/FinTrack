import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-linen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar title={title} subtitle={subtitle} />
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="px-5 md:px-8 py-6 max-w-6xl mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
