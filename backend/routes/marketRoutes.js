const express = require("express");
const router = express.Router();
const { getLiveMarket } = require("../controllers/marketController");
const { protect } = require("../middleware/auth");

router.get("/live", protect, getLiveMarket);

module.exports = router;
