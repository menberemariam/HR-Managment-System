const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Apply for leave
// Apply for leave - UPDATED VERSION
router.post("/apply", async (req, res) => {
  try {
    console.log("Leave application request:", req.body);
    console.log("Session user:", req.session.user);

    const { startDate, endDate, reason, leaveType } = req.body;

    // Get employeeId from session instead of form
    const employeeId = req.session.user?.employeeId;

    if (!employeeId) {
      return res.status(400).json({
        error: "User not associated with an employee. Please contact admin.",
      });
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (end < start) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check leave balance for annual leave
    if (leaveType === "annual") {
      if (employee.leaveBalance < totalDays) {
        return res.status(400).json({
          error: `Insufficient leave balance. You have ${employee.leaveBalance} days left.`,
        });
      }
    }

    // Create leave request
    const leave = new Leave({
      employeeId,
      employeeName: employee.fullName,
      department: employee.department,
      startDate,
      endDate,
      totalDays,
      reason,
      leaveType,
      status: "pending",
    });

    await leave.save();
    console.log("✅ Leave saved:", leave);

    // Update leave balance if annual leave
    if (leaveType === "annual") {
      employee.leaveBalance -= totalDays;
      await employee.save();
      console.log("✅ Updated leave balance:", employee.leaveBalance);
    }

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully!",
      leave: leave,
    });
  } catch (error) {
    console.error("Error applying for leave:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid employee ID format. Please log out and log in again.",
      });
    }

    res.status(400).json({ error: error.message });
  }
});

// Get all leaves (admin)
router.get("/all", async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "fullName department")
      .sort({ submittedDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaves by employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId }).sort(
      { submittedDate: -1 }
    );
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update leave status (approve/reject)
router.put("/:id/status", async (req, res) => {
  try {
    const { status, adminComments } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminComments,
        reviewedBy: req.session.user.id,
        reviewedDate: new Date(),
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // If rejected and it was annual leave, restore balance
    if (status === "rejected" && leave.leaveType === "annual") {
      const employee = await Employee.findById(leave.employeeId);
      if (employee) {
        employee.leaveBalance += leave.totalDays;
        await employee.save();
      }
    }

    res.json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get leave statistics
router.get("/stats", async (req, res) => {
  try {
    const pending = await Leave.countDocuments({ status: "pending" });
    const approved = await Leave.countDocuments({ status: "approved" });
    const rejected = await Leave.countDocuments({ status: "rejected" });

    // Monthly stats
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyApproved = await Leave.countDocuments({
      status: "approved",
      submittedDate: { $gte: firstDay },
    });

    res.json({
      pending,
      approved,
      rejected,
      monthlyApproved,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete leave request
router.delete("/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    res.json({ message: "Leave request deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
