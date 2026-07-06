const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date },
    category: {
      type: String,
      enum: ["Emergency Fund", "Vacation", "Vehicle", "Home", "Education", "Retirement", "Other"],
      default: "Other",
    },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
