const express = require("express");
const router = express.Router();
const {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getWealthSummary,
} = require("../controllers/investmentController");
const {
  getRecommendations,
  simulate,
  getHistory,
  savePlan,
  deletePlan,
} = require("../controllers/investmentAdvisorController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/wealth-summary", getWealthSummary);
router.get("/recommendations", getRecommendations);
router.post("/simulate", simulate);
router.get("/history", getHistory);
router.post("/save-plan", savePlan);
router.delete("/save-plan/:id", deletePlan);
router.route("/").get(getInvestments).post(createInvestment);
router.route("/:id").put(updateInvestment).delete(deleteInvestment);

module.exports = router;

