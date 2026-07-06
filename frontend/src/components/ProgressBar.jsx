import { motion } from "framer-motion";

const ProgressBar = ({ percent, color = "bg-moss-500" }) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full h-2.5 rounded-full bg-ink/10 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;
