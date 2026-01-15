const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    enum: [
      "Human Resources",
      "Computer Science",
      "Business Administration",
      "Mathematics",
      "Engineering",
      "Natural Sciences",
      "Administration", // Added
      "Finance", // Added
      "Library", // Added
      "Maintenance", // Added
    ],
  },
  position: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  hireDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "on-leave"],
    default: "active",
  },
  leaveBalance: {
    type: Number,
    default: 20,
  },
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Employee", employeeSchema);
