const mongoose = require("mongoose");

const savedPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instrumentId: { type: String, required: true },
    instrumentName: { type: String, required: true },
    suitabilityScore: { type: Number },
    plannedMonthlyAmount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedPlan", savedPlanSchema);
