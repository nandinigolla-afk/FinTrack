const express = require("express");
const router = express.Router();
const { getAllUsers, toggleUserStatus, deleteUser, getPlatformAnalytics } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);
router.get("/analytics", getPlatformAnalytics);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

module.exports = router;
