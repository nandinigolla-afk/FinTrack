const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Stocks", "Mutual Funds", "Fixed Deposit", "Gold", "Real Estate", "Crypto", "Bonds", "Other"],
      default: "Other",
    },
    amountInvested: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
