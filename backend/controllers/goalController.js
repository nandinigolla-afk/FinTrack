const SavingsGoal = require("../models/SavingsGoal");

const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, targetDate, category } = req.body;
    if (!title || targetAmount === undefined) {
      return res.status(400).json({ success: false, message: "Title and target amount are required" });
    }
    const goal = await SavingsGoal.create({ user: req.user._id, title, targetAmount, targetDate, category });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Add a contribution to a goal's current amount
const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Contribution amount must be greater than 0" });
    }
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.currentAmount = goal.targetAmount;
      goal.isCompleted = true;
    }
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
    Object.assign(goal, req.body);
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getGoals, createGoal, contributeToGoal, updateGoal, deleteGoal };
