require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hr_system";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: {
    type: String,
    required: true,
    enum: ["Human Resources", "Computer Science", "Business Administration", "Mathematics", "Engineering", "Natural Sciences", "Administration", "Finance", "Library", "Maintenance"],
  },
  position: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  hireDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive", "on-leave"], default: "active" },
  leaveBalance: { type: Number, default: 20 },
  address: String,
  emergencyContact: { name: String, phone: String, relationship: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Employee = mongoose.model("Employee", employeeSchema);
const User = mongoose.model("User", userSchema);

const users = [
  { email: "admin@company.com", password: "admin123", role: "admin" },
  { email: "john@company.com", password: "password123", role: "employee" },
  { email: "admin@arsi.edu", password: "password123", role: "admin" },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      console.log(`Creating user: ${userData.email}`);
      let employee = await Employee.findOne({ email: userData.email });

      if (!employee) {
        const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
        let newId = "ARSI001";
        if (lastEmployee && lastEmployee.employeeId) {
          const num = parseInt(lastEmployee.employeeId.replace("ARSI", "")) + 1;
          newId = "ARSI" + num.toString().padStart(3, "0");
        }

        employee = await Employee.create({
          employeeId: newId,
          fullName: userData.role === "admin" ? "System Administrator" : "John Doe",
          email: userData.email,
          department: userData.role === "admin" ? "Administration" : "Computer Science",
          position: userData.role === "admin" ? "Administrator" : "Employee",
          phone: "123-456-7890",
          dateOfBirth: new Date("1990-01-01"),
          hireDate: new Date(),
          status: "active",
          leaveBalance: 30,
        });
        console.log(`Created employee: ${employee.fullName}`);
      }

      await User.create({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        employeeId: employee._id,
        isActive: true,
      });
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log("Seed completed!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
