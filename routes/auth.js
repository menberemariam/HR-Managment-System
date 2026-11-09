const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Employee = require("../models/Employee");

// The single admin account used to sign in to the system.
const ADMIN_ACCOUNT = {
  email: "admin@arsi.edu",
  password: "admin123",
  role: "admin",
};

// Ensure the admin account exists and that its password is the expected one.
// Existing installs may have been seeded with a different password, so the
// password is re-hashed and saved when it does not match.
const seedUsers = async () => {
  try {
    console.log("🌱 Ensuring admin account...");

    let employee = await Employee.findOne({ email: ADMIN_ACCOUNT.email });
    if (!employee) {
      // Generate employee ID
      const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
      let newId = "ARSI001";
      if (lastEmployee && lastEmployee.employeeId) {
        const num =
          parseInt(lastEmployee.employeeId.replace("ARSI", "")) + 1;
        newId = "ARSI" + num.toString().padStart(3, "0");
      }

      employee = await Employee.create({
        employeeId: newId,
        fullName: "System Administrator",
        email: ADMIN_ACCOUNT.email,
        department: "Administration",
        position: "Administrator",
        phone: "123-456-7890",
        dateOfBirth: new Date("1990-01-01"),
        hireDate: new Date(),
        status: "active",
        leaveBalance: 30,
      });
      console.log(`✅ Created employee: ${employee.fullName}`);
    }

    const existingUser = await User.findOne({ email: ADMIN_ACCOUNT.email });
    if (!existingUser) {
      await User.create({
        email: ADMIN_ACCOUNT.email,
        password: ADMIN_ACCOUNT.password, // Hashed by the User model
        role: ADMIN_ACCOUNT.role,
        employeeId: employee._id,
        isActive: true,
      });
      console.log(`✅ Created admin user: ${ADMIN_ACCOUNT.email}`);
    } else {
      let needsSave = false;

      const passwordMatches = await existingUser.comparePassword(
        ADMIN_ACCOUNT.password,
      );
      if (!passwordMatches) {
        existingUser.password = ADMIN_ACCOUNT.password; // Re-hashed on save
        needsSave = true;
      }
      if (existingUser.role !== ADMIN_ACCOUNT.role) {
        existingUser.role = ADMIN_ACCOUNT.role;
        needsSave = true;
      }
      if (!existingUser.employeeId) {
        existingUser.employeeId = employee._id;
        needsSave = true;
      }
      if (!existingUser.isActive) {
        existingUser.isActive = true;
        needsSave = true;
      }

      if (needsSave) {
        await existingUser.save();
        console.log(`✅ Admin account updated: ${ADMIN_ACCOUNT.email}`);
      } else {
        console.log(`Admin account ready: ${ADMIN_ACCOUNT.email}`);
      }
    }

    console.log("🎉 Seed completed!");
    return { success: true, message: "Users seeded successfully" };
  } catch (error) {
    console.error("Seed error:", error);
    throw error; // Let the route handler catch it
  }
};

// ========== ACTUAL ROUTES ========== //

// Login route
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", req.body.email);

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).populate("employeeId");

      if (!user) {
        console.log("❌ User not found in database");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      let isMatch = false;
      try {
        isMatch = await user.comparePassword(password);
      } catch (bcryptError) {
        console.error("❌ bcrypt error (likely corrupted hash in DB):", bcryptError.message);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log("Password matches:", isMatch);

      if (!isMatch) {
        console.log("❌ Password comparison failed");
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
      console.error("=== LOGIN ERROR ===");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "Server error" });
    }
  },
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

// Request a password reset link.
// No mail service is configured on this installation, so the generated link is
// returned to the page (and logged) instead of being emailed. Replace the
// response field with a mailer when SMTP credentials are available.
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    const genericMessage =
      "If that address belongs to an active staff account, a reset link has been issued.";

    try {
      const user = await User.findOne({
        email: req.body.email,
        isActive: true,
      });

      // Do not reveal whether an account exists for the address.
      if (!user) {
        return res.json({ success: true, message: genericMessage });
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${rawToken}`;
      console.log(`🔐 Password reset link for ${user.email}: ${resetUrl}`);

      res.json({
        success: true,
        message: genericMessage,
        resetUrl,
        expiresInMinutes: 30,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Unable to process the reset request." });
    }
  },
);

// Complete a password reset using a single-use, time-limited token.
router.post(
  "/reset-password",
  [
    body("token").isString().isLength({ min: 32 }),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.body.token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          error: "This reset link is invalid or has expired. Request a new one.",
        });
      }

      user.password = req.body.password; // Re-hashed by the User model
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({
        success: true,
        message: "Password updated. You can now sign in with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Unable to reset the password." });
    }
  },
);

// Seed initial data
router.post("/seed", async (req, res) => {
  try {
    await seedUsers();
    res.json({ message: "Users seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Allow server.js to call seed on startup
router.seedUsers = seedUsers;

// ⭐⭐⭐ MUST BE AT THE END ⭐⭐⭐
module.exports = router;
