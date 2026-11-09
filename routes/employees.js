const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const User = require("../models/User");

// Get all employees
router.get("/", async (req, res) => {
  try {
    const { search, department } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "All Departments") {
      filter.department = department;
    }

    const employees = await Employee.find(filter)
      .select("-__v")
      .sort({ fullName: 1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee and its login account (admin only)
router.post("/", async (req, res) => {
  try {
    const { fullName, email, department, position, phone, dateOfBirth } =
      req.body;

    // Validate required fields
    if (!fullName || !email || !department || !position || !phone || !dateOfBirth) {
      return res.status(400).json({
        error:
          "All fields are required: fullName, email, department, position, phone, dateOfBirth",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingEmployee = await Employee.findOne({
      email: normalizedEmail,
    });
    if (existingEmployee) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: "A login account already exists for this email",
      });
    }

    // Generate employee ID
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    let employeeId = "ARSI001";
    if (lastEmployee && lastEmployee.employeeId) {
      const num = parseInt(lastEmployee.employeeId.replace("ARSI", "")) + 1;
      employeeId = "ARSI" + num.toString().padStart(3, "0");
    }

    // Create employee
    const employee = new Employee({
      employeeId,
      fullName,
      email: normalizedEmail,
      department,
      position,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      hireDate: new Date(),
      status: "active",
      leaveBalance: 20,
    });
    await employee.save();
    console.log("✅ Employee saved to database:", employee.fullName);

    // Create the login account. The User model hashes the password on save,
    // so pass the plain password here (never hash it twice).
    const initialPassword = req.body.password?.trim()
      ? req.body.password.trim()
      : "password123";

    await User.create({
      email: employee.email,
      password: initialPassword,
      role: "employee",
      employeeId: employee._id,
      isActive: true,
    });
    console.log("✅ Login account created for:", employee.email);

    res.status(201).json({
      success: true,
      message: `Employee added. Login with ${employee.email} and password "${initialPassword}".`,
      employee,
    });
  } catch (error) {
    console.error("❌ Error adding employee:", error.message);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
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

// Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get departments
router.get("/departments/all", async (req, res) => {
  try {
    const departments = await Employee.distinct("department");
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats for dashboard
router.get("/stats/dashboard", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: "active" });
    const departments = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    // Get upcoming birthdays (next 30 days)
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    const upcomingBirthdays = await Employee.find({
      dateOfBirth: {
        $gte: today,
        $lte: nextMonth,
      },
    }).select("fullName department dateOfBirth");

    res.json({
      totalEmployees,
      departments,
      upcomingBirthdays,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
