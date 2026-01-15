require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leaves");
const profileRoutes = require("./routes/profile");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "hr-system-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hr_system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/profile", profileRoutes);

// Serve HTML files
app.get("/", (req, res) => {
  if (req.session.user) {
    const redirectPath =
      req.session.user.role === "admin"
        ? "/admin-dashboard.html"
        : "/employee-dashboard.html";
    res.redirect(redirectPath);
  } else {
    res.sendFile(path.join(__dirname, "views", "login.html"));
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/admin-dashboard", (req, res) => {
  if (req.session.user && req.session.user.role === "admin") {
    res.sendFile(path.join(__dirname, "views", "admin-dashboard.html"));
  } else {
    res.redirect("/login");
  }
});
// Add these routes to server.js after existing routes

app.get("/employee-dashboard", (req, res) => {
  if (req.session.user && req.session.user.role === "employee") {
    res.sendFile(path.join(__dirname, "views", "employee-dashboard.html"));
  } else if (req.session.user && req.session.user.role === "admin") {
    res.redirect("/admin-dashboard");
  } else {
    res.redirect("/login");
  }
});

app.get("/employee-directory", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "views", "employee-directory.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/leave-management", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "views", "leave-management.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "views", "profile.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/change-password", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "views", "change-password.html"));
  } else {
    res.redirect("/login");
  }
});

// Other route handlers for HTML files...

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    const newPort = parseInt(PORT) + 1;
    const newServer = app.listen(newPort, () => {
      console.log(`Server running on port ${newPort}`);
    });
  } else {
    console.error("Server error:", err);
  }
});
