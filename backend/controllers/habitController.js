const Habit = require("../models/Habit");

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, frequency } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Habit name is required" });

    const habit = await Habit.create({ user: req.user._id, name, frequency });
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Mark habit as completed today, updates streak ("stamp")
const completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: "Habit not found" });

    const now = new Date();

    if (habit.lastCompletedAt && isSameDay(new Date(habit.lastCompletedAt), now)) {
      return res.status(400).json({ success: false, message: "Habit already stamped for today" });
    }

    const msInDay = 1000 * 60 * 60 * 24;
    const daysSinceLast = habit.lastCompletedAt
      ? Math.round((now - new Date(habit.lastCompletedAt)) / msInDay)
      : null;

    if (daysSinceLast === 1) {
      habit.currentStreak += 1;
    } else {
      habit.currentStreak = 1;
    }

    habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
    habit.lastCompletedAt = now;
    habit.completionLog.push(now);

    await habit.save();
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: "Habit not found" });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getHabits, createHabit, completeHabit, deleteHabit };
