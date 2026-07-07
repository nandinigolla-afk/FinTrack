const { getLiveMarketData } = require("../utils/marketDataService");

// @desc  Get live (or estimated fallback) market data for indices, gold, ETFs
// @route GET /api/market/live
const getLiveMarket = async (req, res) => {
  try {
    const data = await getLiveMarketData();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLiveMarket };
