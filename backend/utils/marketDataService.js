const axios = require("axios");

// Simple in-memory cache so we don't burn through the free API quota:
// one shared cache entry per process, refreshed at most every CACHE_TTL_MS.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache = { data: null, fetchedAt: 0 };

// Fallback figures shown when no API key is configured, or a symbol/request fails.
// Clearly flagged with isLive:false so the UI can label them as estimates.
const FALLBACK_QUOTES = [
  { key: "nifty50", name: "Nifty 50", price: 25850, change: 142.3, percentChange: 0.55 },
  { key: "sensex", name: "Sensex", price: 84900, change: -210.1, percentChange: -0.25 },
  { key: "gold", name: "Gold (per 10g, approx.)", price: 74200, change: 380, percentChange: 0.51 },
  { key: "etfNifty", name: "Nifty ETF (NIFTYBEES)", price: 258.4, change: 1.2, percentChange: 0.47 },
  { key: "etfGold", name: "Gold ETF (GOLDBEES)", price: 74.1, change: 0.35, percentChange: 0.47 },
];

const getSymbolMap = () => ({
  nifty50: { symbol: process.env.MARKET_SYMBOL_NIFTY50 || "NIFTY", name: "Nifty 50" },
  sensex: { symbol: process.env.MARKET_SYMBOL_SENSEX || "SENSEX", name: "Sensex" },
  gold: { symbol: process.env.MARKET_SYMBOL_GOLD || "XAU/USD", name: "Gold (XAU/USD)" },
  etfNifty: { symbol: process.env.MARKET_SYMBOL_ETF_NIFTY || "NIFTYBEES", name: "Nifty ETF (NIFTYBEES)" },
  etfGold: { symbol: process.env.MARKET_SYMBOL_ETF_GOLD || "GOLDBEES", name: "Gold ETF (GOLDBEES)" },
});

const fetchQuote = async (apiKey, symbol) => {
  const { data } = await axios.get("https://api.twelvedata.com/quote", {
    params: { symbol, apikey: apiKey },
    timeout: 8000,
  });
  if (!data || data.status === "error" || data.code) {
    throw new Error(data?.message || `No data for symbol ${symbol}`);
  }
  return {
    price: Number(data.close),
    change: Number(data.change),
    percentChange: Number(data.percent_change),
  };
};

// @desc  Returns live market data where possible; falls back to labeled
// estimated figures for any symbol that fails or when no API key is set.
const getLiveMarketData = async () => {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const symbolMap = getSymbolMap();
  const entries = Object.entries(symbolMap);

  const results = await Promise.all(
    entries.map(async ([key, meta]) => {
      const fallback = FALLBACK_QUOTES.find((f) => f.key === key);
      if (!apiKey) {
        return { key, name: meta.name, ...fallback, isLive: false, lastUpdated: new Date().toISOString() };
      }
      try {
        const quote = await fetchQuote(apiKey, meta.symbol);
        if (!quote.price || Number.isNaN(quote.price)) throw new Error("Empty quote");
        return { key, name: meta.name, ...quote, isLive: true, lastUpdated: new Date().toISOString() };
      } catch (err) {
        return {
          key,
          name: meta.name,
          price: fallback.price,
          change: fallback.change,
          percentChange: fallback.percentChange,
          isLive: false,
          lastUpdated: new Date().toISOString(),
        };
      }
    })
  );

  cache = { data: results, fetchedAt: now };
  return results;
};

module.exports = { getLiveMarketData };
