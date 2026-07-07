const mongoose = require("mongoose");

const simulationHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    monthlySIP: { type: Number, default: 0 },
    durationYears: { type: Number, required: true },
    instrumentIds: [{ type: String }],
    results: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SimulationHistory", simulationHistorySchema);
