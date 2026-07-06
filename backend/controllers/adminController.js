const User = require("../models/User");
const Habit = require("../models/Habit");
const SavingsGoal = require("../models/SavingsGoal");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Platform-wide analytics for admin dashboard
const getPlatformAnalytics = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalHabits, totalGoals, completedGoals, incomeAgg, expenseAgg] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Habit.countDocuments({ isActive: true }),
        SavingsGoal.countDocuments(),
        SavingsGoal.countDocuments({ isCompleted: true }),
        Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
        Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      ]);

    const avgGoalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalHabits,
        totalGoals,
        completedGoals,
        avgGoalCompletionRate,
        platformTotalIncome: incomeAgg[0]?.total || 0,
        platformTotalExpenses: expenseAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers, toggleUserStatus, deleteUser, getPlatformAnalytics };
