const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["annual", "sick", "emergency", "maternity", "paternity", "unpaid"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminComments: String,
  submittedDate: {
    type: Date,
    default: Date.now,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedDate: Date,
});

module.exports = mongoose.model("Leave", leaveSchema);
