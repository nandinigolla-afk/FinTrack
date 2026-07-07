const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc  Register new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "This account has been deactivated" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get logged-in user's profile
// @route GET /api/auth/me
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc  Update profile (name, financial goals, income target)
// @route PUT /api/auth/me
const updateProfile = async (req, res) => {
  try {
    const { name, financialGoals, monthlyIncomeTarget, riskPreference, investmentHorizonYears } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (financialGoals !== undefined) user.financialGoals = financialGoals;
    if (monthlyIncomeTarget !== undefined) user.monthlyIncomeTarget = monthlyIncomeTarget;
    if (riskPreference !== undefined) user.riskPreference = riskPreference;
    if (investmentHorizonYears !== undefined) user.investmentHorizonYears = investmentHorizonYears;

    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
