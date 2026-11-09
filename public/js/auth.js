class Auth {
  constructor() {
    this.init();
  }

  init() {
    this.checkAuth();
    this.bindEvents();
  }

  async checkAuth() {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      // Point shared pages at the dashboard for the signed-in role.
      if (data.authenticated && data.user) {
        const dashboardHref =
          data.user.role === "admin"
            ? "/admin-dashboard"
            : "/employee-dashboard";
        document.querySelectorAll("[data-dashboard-link]").forEach((link) => {
          link.setAttribute("href", dashboardHref);
        });
      }

      if (data.authenticated && window.location.pathname === "/login.html") {
        // Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "/admin-dashboard.html";
        } else {
          window.location.href = "/employee-dashboard.html";
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  }

  bindEvents() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin.bind(this));
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", this.handleLogout.bind(this));
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("errorMessage");
    const submitBtn = document.querySelector(
      '#loginForm button[type="submit"]',
    );
    const submitMarkup = submitBtn ? submitBtn.innerHTML : "";

    if (!email || !password) {
      this.showError("Please fill in all fields");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing In...";
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // SIMPLE FIX: Let server decide where to redirect
        // If server returns redirect, use it, otherwise decide here
        if (data.redirect) {
          window.location.href = data.redirect;
        } else if (data.user && data.user.role === "admin") {
          window.location.href = "/admin-dashboard.html";
        } else {
          window.location.href = "/employee-dashboard.html";
        }
      } else {
        this.showError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login network error:", error);
      this.showError("Network error. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitMarkup;
      }
    }
  }

  async handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/login.html";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Used by pages that call Auth.logout() directly.
  static logout() {
    new Auth().handleLogout();
  }

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    } else {
      alert(message);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Auth();
});

function logout() {
  new Auth().handleLogout();
}
