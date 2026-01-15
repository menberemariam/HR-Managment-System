const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employee = require("../models/Employee");

// Get profile
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(req.session.user.id).populate(
      "employeeId"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        email: user.email,
        role: user.role,
      },
      employee: user.employeeId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee profile
router.put("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
