const Income = require("../models/Income");

const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, data: incomes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createIncome = async (req, res) => {
  try {
    const { source, amount, date, notes } = req.body;
    if (!source || amount === undefined) {
      return res.status(400).json({ success: false, message: "Source and amount are required" });
    }
    const income = await Income.create({ user: req.user._id, source, amount, date, notes });
    res.status(201).json({ success: true, data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: "Income record not found" });

    Object.assign(income, req.body);
    await income.save();
    res.json({ success: true, data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: "Income record not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getIncomes, createIncome, updateIncome, deleteIncome };
