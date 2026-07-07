const Income = require("../models/Income");
const Expense = require("../models/Expense");
const SavingsGoal = require("../models/SavingsGoal");
const Investment = require("../models/Investment");
const Habit = require("../models/Habit");
const SimulationHistory = require("../models/SimulationHistory");
const SavedPlan = require("../models/SavedPlan");
const User = require("../models/User");
const { computeRecommendations } = require("../utils/recommendationEngine");
const { simulateInvestment } = require("../utils/simulationEngine");

// Builds the financial snapshot the recommendation engine and insights need.
const buildFinancialSnapshot = async (userId) => {
  const [incomeAgg, expenseAgg, monthlyExpenseAgg, goals, investments, habits, user] = await Promise.all([
    Income.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: { y: { $year: "$date" }, m: { $month: "$date" } }, total: { $sum: "$amount" } } },
    ]),
    SavingsGoal.find({ user: userId }),
    Investment.find({ user: userId }),
    Habit.find({ user: userId, isActive: true }),
    User.findById(userId),
  ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;
  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalInvestmentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);

  const monthsTracked = Math.max(monthlyExpenseAgg.length, 1);
  const avgMonthlyExpense = totalExpenses / monthsTracked;
  const emergencyFundMonths = avgMonthlyExpense > 0 ? totalSavings / avgMonthlyExpense : 0;

  const avgMonthlyIncome = totalIncome / monthsTracked;
  const monthlyDisposableIncome = Math.max(0, avgMonthlyIncome - avgMonthlyExpense);

  const habitConsistency = habits.length > 0
    ? habits.reduce((sum, h) => sum + Math.min(h.currentStreak, 30), 0) / (habits.length * 30)
    : 0;

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    totalInvestmentValue,
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
    avgMonthlyExpense: Math.round(avgMonthlyExpense),
    monthlyDisposableIncome: Math.round(monthlyDisposableIncome),
    emergencyFundMonths: Number(emergencyFundMonths.toFixed(1)),
    activeGoalsCount: goals.filter((g) => !g.isCompleted).length,
    habitConsistency: Number((habitConsistency * 100).toFixed(0)),
    riskPreference: user?.riskPreference || "Moderate",
    investmentHorizonYears: user?.investmentHorizonYears || 5,
    savingsRatePercent: totalIncome > 0 ? Number(((totalSavings / totalIncome) * 100).toFixed(1)) : 0,
  };
};

// Portfolio health score: blends savings rate, emergency fund coverage,
// habit consistency and diversification into a single 0-100 number.
const computeHealthScore = (snapshot) => {
  const savingsScore = Math.min(30, snapshot.savingsRatePercent * 1.2);
  const emergencyScore = Math.min(30, snapshot.emergencyFundMonths * 6);
  const habitScore = Math.min(20, snapshot.habitConsistency * 0.2);
  const goalScore = Math.min(20, snapshot.activeGoalsCount * 7);
  return Math.round(Math.min(100, savingsScore + emergencyScore + habitScore + goalScore));
};

const generateInsights = (snapshot) => {
  const insights = [];

  if (snapshot.savingsRatePercent > 0) {
    insights.push(`You save approximately ${snapshot.savingsRatePercent}% of your total income logged so far.`);
  }
  if (snapshot.emergencyFundMonths < 3) {
    insights.push(
      `Your emergency fund covers about ${snapshot.emergencyFundMonths} month(s) of expenses — consider building it to 3-6 months before increasing market-linked investments.`
    );
  } else {
    insights.push(`Your emergency fund covers ${snapshot.emergencyFundMonths} months of expenses — a solid cushion for taking on market risk.`);
  }
  if (snapshot.monthlyDisposableIncome > 0) {
    insights.push(`You have roughly ₹${snapshot.monthlyDisposableIncome.toLocaleString("en-IN")} in monthly disposable income available to invest.`);
  } else {
    insights.push("Your logged expenses currently match or exceed income — review spending before committing to new investments.");
  }
  if (snapshot.activeGoalsCount > 0) {
    insights.push(`You have ${snapshot.activeGoalsCount} active savings goal(s) — consider directing a fixed monthly amount toward each.`);
  }
  if (snapshot.habitConsistency < 50 && snapshot.habitConsistency > 0) {
    insights.push("Your financial habit streaks have some gaps — more consistent daily habits tend to correlate with steadier saving.");
  }

  return insights;
};

// @desc  Personalized recommendations, health score, risk meter and insights
// @route GET /api/investments/recommendations
const getRecommendations = async (req, res) => {
  try {
    const snapshot = await buildFinancialSnapshot(req.user._id);
    const recommendations = computeRecommendations(snapshot);
    const portfolioHealthScore = computeHealthScore(snapshot);
    const insights = generateInsights(snapshot);

    res.json({
      success: true,
      data: {
        snapshot,
        portfolioHealthScore,
        recommendations,
        insights,
        disclaimer:
          "This feature is for educational and financial planning purposes only. Investment projections are estimates based on historical data and assumptions, not guarantees or personalized financial advice.",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Run a what-if simulation across selected instruments
// @route POST /api/investments/simulate
const simulate = async (req, res) => {
  try {
    const { amount = 0, monthlySIP = 0, durationYears = 5, instrumentIds = [] } = req.body;
    if (amount < 0 || monthlySIP < 0 || durationYears <= 0) {
      return res.status(400).json({ success: false, message: "Provide a valid amount, SIP and duration" });
    }

    const results = simulateInvestment({ amount, monthlySIP, durationYears, instrumentIds });

    const record = await SimulationHistory.create({
      user: req.user._id,
      amount,
      monthlySIP,
      durationYears,
      instrumentIds,
      results,
    });

    res.json({ success: true, data: { results, simulationId: record._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Past simulations and saved recommendation plans
// @route GET /api/investments/history
const getHistory = async (req, res) => {
  try {
    const [simulations, savedPlans] = await Promise.all([
      SimulationHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
      SavedPlan.find({ user: req.user._id }).sort({ createdAt: -1 }),
    ]);
    res.json({ success: true, data: { simulations, savedPlans } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Save a recommended instrument as a tracked plan
// @route POST /api/investments/save-plan
const savePlan = async (req, res) => {
  try {
    const { instrumentId, instrumentName, suitabilityScore, plannedMonthlyAmount, notes } = req.body;
    if (!instrumentId || !instrumentName) {
      return res.status(400).json({ success: false, message: "instrumentId and instrumentName are required" });
    }
    const plan = await SavedPlan.create({
      user: req.user._id,
      instrumentId,
      instrumentName,
      suitabilityScore,
      plannedMonthlyAmount,
      notes,
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await SavedPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRecommendations, simulate, getHistory, savePlan, deletePlan };
