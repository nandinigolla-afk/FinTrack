import { motion } from "framer-motion";

// Ambient money-themed background: currency glyphs drift upward and fade,
// like coins rising through a passbook ledger. Purely decorative, sits
// behind the auth card with pointer-events disabled.
const SYMBOLS = ["₹", "$", "€", "¢", "₹", "£"];

const FloatingCurrency = ({ count = 14 }) => {
  const items = Array.from({ length: count }, (_, i) => {
    const symbol = SYMBOLS[i % SYMBOLS.length];
    const left = (i * 137.5) % 100; // spread deterministically across width
    const delay = (i * 0.6) % 8;
    const duration = 10 + (i % 5) * 2;
    const size = 14 + (i % 4) * 6;
    return { symbol, left, delay, duration, size, key: i };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item) => (
        <motion.span
          key={item.key}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "-20%", opacity: [0, 0.5, 0.5, 0] }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ left: `${item.left}%`, fontSize: item.size }}
          className="absolute font-display text-moss-300/40 select-none"
        >
          {item.symbol}
        </motion.span>
      ))}
    </div>
  );
};

export default FloatingCurrency;
