const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Employee = require("../models/Employee");

// Pre-filled users (for demo)
const seedUsers = async () => {
  try {
    console.log("🌱 Seeding initial users...");

    // Define the users array that was missing
    const users = [
      {
        email: "admin@company.com",
        password: "admin123", // Will be auto-hashed by User model
        role: "admin",
      },
      {
        email: "john@company.com",
        password: "password123",
        role: "employee",
      },
      {
        email: "admin@arsi.edu",
        password: "password123",
        role: "admin",
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        console.log(`Creating user: ${userData.email}`);

        // Check if employee exists first
        const employee = await Employee.findOne({ email: userData.email });

        // If no employee exists, create a basic one
        let employeeId = null;
        if (!employee) {
          console.log(`Employee not found for ${userData.email}, creating...`);

          // Generate employee ID
          const lastEmployee = await Employee.findOne().sort({
            employeeId: -1,
          });
          let newId = "ARSI001";
          if (lastEmployee && lastEmployee.employeeId) {
            const num =
              parseInt(lastEmployee.employeeId.replace("ARSI", "")) + 1;
            newId = "ARSI" + num.toString().padStart(3, "0");
          }

          // Create employee record
          const newEmployee = new Employee({
            employeeId: newId,
            fullName:
              userData.role === "admin" ? "System Administrator" : "John Doe",
            email: userData.email,
            department: userData.role === "admin" ? "Administration" : "Computer Science",
            position: userData.role === "admin" ? "Administrator" : "Employee",
            phone: "123-456-7890",
            dateOfBirth: new Date("1990-01-01"),
            hireDate: new Date(),
            status: "active",
            leaveBalance: 30,
          });

          await newEmployee.save();
          employeeId = newEmployee._id;
          console.log(`✅ Created employee: ${newEmployee.fullName}`);
        } else {
          employeeId = employee._id;
          console.log(`✅ Using existing employee: ${employee.fullName}`);
        }

        // Create user account
        const user = new User({
          email: userData.email,
          password: userData.password, // Will auto-hash in User model pre-save
          role: userData.role,
          employeeId: employeeId,
          isActive: true,
        });

        await user.save();
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
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
