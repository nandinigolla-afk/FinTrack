const express = require("express");
const router = express.Router();
const {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getWealthSummary,
} = require("../controllers/investmentController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/wealth-summary", getWealthSummary);
router.route("/").get(getInvestments).post(createInvestment);
router.route("/:id").put(updateInvestment).delete(deleteInvestment);

module.exports = router;
