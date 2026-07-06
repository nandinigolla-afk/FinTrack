// Run with: npm run seed
// Creates a default admin account: admin@fintrack.com / Admin@123
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "admin@fintrack.com" });
  if (existing) {
    console.log("Admin user already exists.");
  } else {
    await User.create({
      name: "Platform Admin",
      email: "admin@fintrack.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("Admin user created: admin@fintrack.com / Admin@123");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
