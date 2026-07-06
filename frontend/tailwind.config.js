/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2B22",
        linen: "#EFEDE3",
        linenDark: "#E2DFCF",
        moss: {
          50: "#EAF1EC",
          100: "#CFE0D5",
          300: "#8CB89B",
          500: "#3F6C51",
          600: "#335A43",
          700: "#294933",
        },
        gold: {
          400: "#D3A552",
          500: "#B98B3E",
          600: "#96702F",
        },
        rust: {
          400: "#C56B52",
          500: "#B5533C",
          600: "#95412D",
        },
        slate: {
          500: "#5C6670",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 0 rgba(27,43,34,0.08), 0 8px 24px -12px rgba(27,43,34,0.25)",
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(27,43,34,0.06) 36px)",
      },
    },
  },
  plugins: [],
};
