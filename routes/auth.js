const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Employee = require("../models/Employee");

// Pre-filled users (for demo)
const seedUsers = async () => {
  // In the login route:
  const user = await User.findOne({ email }).populate(
    "employeeId",
    "fullName department"
  );

  req.session.user = {
    id: user._id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId ? user.employeeId._id : null,
    employeeName: user.employeeId ? user.employeeId.fullName : null,
    department: user.employeeId ? user.employeeId.department : null,
  };

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const employee = await Employee.findOne({ email: userData.email });
      const user = new User({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        employeeId: employee ? employee._id : null,
      });
      await user.save();
    }
  }
};

// Login route
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", req.body.email);
      console.log("Password entered:", req.body.password);

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).populate("employeeId");
      console.log("User found:", user ? "YES" : "NO");

      if (!user) {
        console.log("❌ User not found in database");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("User email:", user.email);
      console.log("User password hash exists:", user.password ? "YES" : "NO");
      if (user.password) {
        console.log("Password hash:", user.password.substring(0, 30) + "...");
      }

      // Check password
      console.log("Comparing password...");
      const isMatch = await user.comparePassword(password);
      console.log("Password matches:", isMatch);

      if (!isMatch) {
        console.log("❌ Password comparison failed");
        console.log("Password entered:", password);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("✅ Login successful for:", email);

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ error: "Account is deactivated" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Store user in session
      req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId?._id,
        employeeName: user.employeeId?.fullName,
      };

      res.json({
        success: true,
        role: user.role,
        redirect:
          user.role === "admin" ? "/admin-dashboard" : "/employee-dashboard",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Logout route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

// Check authentication
router.get("/check", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Seed initial data
router.post("/seed", async (req, res) => {
  try {
    await seedUsers();
    res.json({ message: "Users seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
