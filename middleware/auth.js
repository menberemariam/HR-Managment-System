// Authentication middleware for protected routes

const User = require("../models/User");

const authMiddleware = {
  // Check if user is authenticated
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }

    // If it's an API request, return JSON error
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Otherwise redirect to login
    res.redirect("/login");
  },

  // Check if user is admin
  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
      return next();
    }

    if (req.path.startsWith("/api/")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    res.redirect("/login");
  },

  // Check if user is employee
  isEmployee: (req, res, next) => {
    if (req.session.user && req.session.user.role === "employee") {
      return next();
    }

    if (req.path.startsWith("/api/")) {
      return res.status(403).json({ error: "Employee access required" });
    }

    res.redirect("/login");
  },
};

module.exports = authMiddleware;
