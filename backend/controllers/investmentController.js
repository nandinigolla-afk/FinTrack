const Investment = require("../models/Investment");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const SavingsGoal = require("../models/SavingsGoal");

const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, data: investments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createInvestment = async (req, res) => {
  try {
    const { name, type, amountInvested, currentValue, date } = req.body;
    if (!name || amountInvested === undefined || currentValue === undefined) {
      return res.status(400).json({ success: false, message: "Name, amount invested and current value are required" });
    }
    const investment = await Investment.create({ user: req.user._id, name, type, amountInvested, currentValue, date });
    res.status(201).json({ success: true, data: investment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });
    if (!investment) return res.status(404).json({ success: false, message: "Investment not found" });
    Object.assign(investment, req.body);
    await investment.save();
    res.json({ success: true, data: investment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!investment) return res.status(404).json({ success: false, message: "Investment not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Net worth = total savings goal balances + total investment current value
// @route GET /api/investments/wealth-summary
const getWealthSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [incomeAgg, expenseAgg, investments, goals] = await Promise.all([
      Income.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Investment.find({ user: userId }),
      SavingsGoal.find({ user: userId }),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalInvested = investments.reduce((sum, i) => sum + i.amountInvested, 0);
    const totalInvestmentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const netWorth = totalSavings + totalInvestmentValue + (totalIncome - totalExpenses);
    const investmentGrowth = totalInvested > 0 ? ((totalInvestmentValue - totalInvested) / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        cashOnHand: totalIncome - totalExpenses,
        totalSavings,
        totalInvested,
        totalInvestmentValue,
        investmentGrowthPercent: Number(investmentGrowth.toFixed(2)),
        netWorth,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getInvestments, createInvestment, updateInvestment, deleteInvestment, getWealthSummary };
