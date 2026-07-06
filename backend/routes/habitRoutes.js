const express = require("express");
const router = express.Router();
const { getHabits, createHabit, completeHabit, deleteHabit } = require("../controllers/habitController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getHabits).post(createHabit);
router.post("/:id/complete", completeHabit);
router.delete("/:id", deleteHabit);

module.exports = router;
