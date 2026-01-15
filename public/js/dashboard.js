class Dashboard {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    try {
      await this.loadUser();
      // Only proceed if user is loaded and authenticated
      if (this.currentUser) {
        await this.loadData();
        this.bindEvents();
        this.updateUI();
      }
    } catch (error) {
      console.error("Dashboard initialization failed:", error);
    }
  }

  async loadUser() {
    try {
      const response = await fetch("/api/auth/check");

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.authenticated) {
        window.location.href = "/login";
        return;
      }

      this.currentUser = data.user;

      // Safely update user name if element exists
      const userNameElement = document.getElementById("userName");
      if (userNameElement) {
        userNameElement.textContent =
          this.currentUser.employeeName ||
          this.currentUser.fullName ||
          this.currentUser.name ||
          "User";
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Consider redirecting to login on auth failure
      if (error.message.includes("401") || error.message.includes("403")) {
        window.location.href = "/login";
      }
    }
  }

  async loadData() {
    if (!this.currentUser) {
      console.error("Cannot load data: No user loaded");
      return;
    }

    // Check if user has role property
    if (!this.currentUser.role) {
      console.error("User role not defined");
      return;
    }

    if (this.currentUser.role === "admin") {
      await this.loadAdminDashboard();
    } else {
      await this.loadEmployeeDashboard();
    }
  }

  async loadAdminDashboard() {
    try {
      // Load stats
      const [statsRes, leavesRes, employeesRes] = await Promise.all([
        fetch("/api/leaves/stats"),
        fetch("/api/leaves/all"),
        fetch("/api/employees/stats/dashboard"),
      ]);

      // Check all responses
      const [stats, leaves, employees] = await Promise.all([
        statsRes.ok
          ? statsRes.json()
          : { pending: 0, approved: 0, rejected: 0 },
        leavesRes.ok ? leavesRes.json() : [],
        employeesRes.ok
          ? employeesRes.json()
          : { totalEmployees: 0, upcomingBirthdays: [] },
      ]);

      // Safely update stats elements if they exist
      this.updateElementIfExists(
        "totalEmployees",
        employees.totalEmployees || 0
      );
      this.updateElementIfExists("pendingLeaves", stats.pending || 0);
      this.updateElementIfExists("approvedLeaves", stats.approved || 0);
      this.updateElementIfExists("rejectedLeaves", stats.rejected || 0);

      // Update leave requests table only if it exists
      if (document.getElementById("leaveRequestsTable")) {
        this.updateLeaveRequests(leaves || []);
      }

      // Update upcoming birthdays
      this.updateBirthdays(employees.upcomingBirthdays || []);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    }
  }

  async loadEmployeeDashboard() {
    try {
      // Load employee data
      const response = await fetch("/api/profile");

      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.status}`);
      }

      const data = await response.json();

      if (!data.employee) {
        console.error("Employee data not found in response");
        return;
      }

      // Update leave balance if element exists
      this.updateElementIfExists(
        "leaveBalance",
        data.employee.leaveBalance || 0
      );

      // Load leave history
      const leavesRes = await fetch(
        `/api/leaves/employee/${data.employee._id || data.employee.id}`
      );

      if (leavesRes.ok) {
        const leaves = await leavesRes.json();

        // Calculate stats
        let pending = 0,
          approved = 0,
          rejected = 0;
        if (Array.isArray(leaves)) {
          leaves.forEach((leave) => {
            if (leave.status === "pending") pending++;
            else if (leave.status === "approved") approved++;
            else if (leave.status === "rejected") rejected++;
          });
        }

        // Update stats on dashboard
        this.updateElementIfExists("pendingLeaves", pending);
        this.updateElementIfExists("approvedLeaves", approved);
        this.updateElementIfExists("rejectedLeaves", rejected);

        // Update leave history if container exists
        if (document.getElementById("leaveHistory")) {
          this.updateLeaveHistory(leaves || []);
        }
      }

      // Load upcoming birthdays
      await this.loadBirthdays();
    } catch (error) {
      console.error("Failed to load employee dashboard:", error);
    }
  }

  async loadBirthdays() {
    try {
      const response = await fetch("/api/employees/stats/dashboard");

      if (response.ok) {
        const data = await response.json();

        if (data.upcomingBirthdays && Array.isArray(data.upcomingBirthdays)) {
          this.updateBirthdays(data.upcomingBirthdays);
        }
      }
    } catch (error) {
      console.error("Failed to load birthdays:", error);
    }
  }

  // Helper method to safely update elements
  updateElementIfExists(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  updateLeaveRequests(leaves) {
    const tbody = document.getElementById("leaveRequestsTable");
    if (!tbody || !Array.isArray(leaves)) return;

    tbody.innerHTML = "";

    leaves.slice(0, 5).forEach((leave) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${leave.employeeName || leave.employee?.name || "Unknown"}</td>
        <td>${this.formatDateRange(leave.startDate, leave.endDate)}</td>
        <td>${leave.reason || "No reason provided"}</td>
        <td><span class="status-${leave.status}">${leave.status}</span></td>
        <td>
          ${
            leave.status === "pending"
              ? `
            <button class="btn-approve" onclick="dashboard.approveLeave('${
              leave._id || leave.id
            }')">Approve</button>
            <button class="btn-reject" onclick="dashboard.rejectLeave('${
              leave._id || leave.id
            }')">Reject</button>
          `
              : "Processed"
          }
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  updateLeaveHistory(leaves) {
    const container = document.getElementById("leaveHistory");
    if (!container || !Array.isArray(leaves)) return;

    container.innerHTML = "";

    if (leaves.length === 0) {
      container.innerHTML = '<p class="no-data">No leave history found.</p>';
      return;
    }

    leaves.forEach((leave) => {
      const div = document.createElement("div");
      div.className = "leave-item";
      div.innerHTML = `
        <strong>${this.formatDateRange(leave.startDate, leave.endDate)}</strong>
        <p>${leave.reason || "No reason provided"}</p>
        <span class="status-${leave.status}">${leave.status}</span>
      `;
      container.appendChild(div);
    });
  }

  updateBirthdays(birthdays) {
    const container = document.getElementById("upcomingBirthdays");
    if (!container || !Array.isArray(birthdays)) return;

    container.innerHTML = "";

    if (birthdays.length === 0) {
      container.innerHTML = '<p class="no-data">No upcoming birthdays.</p>';
      return;
    }

    birthdays.forEach((employee) => {
      const div = document.createElement("div");
      div.className = "birthday-item";
      div.innerHTML = `
        <strong>${employee.fullName || employee.name || "Unknown"}</strong>
        <p>${employee.department || "No department"}</p>
        <small>${this.formatBirthday(employee.dateOfBirth)}</small>
      `;
      container.appendChild(div);
    });
  }

  // Helper method to format date range
  formatDateRange(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    } catch (error) {
      return "Invalid date range";
    }
  }

  // Helper method to format birthday
  formatBirthday(dateOfBirth) {
    try {
      const date = new Date(dateOfBirth);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  }

  async approveLeave(leaveId) {
    if (!confirm("Approve this leave request?")) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        alert("Leave approved successfully");
        // Refresh dashboard based on current user role
        if (this.currentUser?.role === "admin") {
          await this.loadAdminDashboard();
        }
      } else {
        const error = await response.json();
        alert(`Failed to approve leave: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to approve leave:", error);
      alert("Failed to approve leave. Please try again.");
    }
  }

  async rejectLeave(leaveId) {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) {
      alert("Rejection reason is required.");
      return;
    }

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          status: "rejected",
          adminComments: reason,
        }),
      });

      if (response.ok) {
        alert("Leave rejected successfully");
        // Refresh dashboard based on current user role
        if (this.currentUser?.role === "admin") {
          await this.loadAdminDashboard();
        }
      } else {
        const error = await response.json();
        alert(`Failed to reject leave: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to reject leave:", error);
      alert("Failed to reject leave. Please try again.");
    }
  }

  bindEvents() {
    // Bind logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          // Call logout API
          await fetch("/api/auth/logout", { method: "POST" });
          // Clear local storage if used
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Redirect to login
          window.location.href = "/login";
        } catch (error) {
          console.error("Logout failed:", error);
          window.location.href = "/login";
        }
      });
    }

    // Add any additional event bindings here
  }

  updateUI() {
    // Update active menu item
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href") === currentPage) {
        item.classList.add("active");
      }
    });

    // Hide/show elements based on role
    if (this.currentUser) {
      if (this.currentUser.role === "admin") {
        // Show admin-specific elements
        const adminElements = document.querySelectorAll(".admin-only");
        adminElements.forEach((el) => (el.style.display = "block"));

        const employeeElements = document.querySelectorAll(".employee-only");
        employeeElements.forEach((el) => (el.style.display = "none"));
      } else {
        // Show employee-specific elements
        const adminElements = document.querySelectorAll(".admin-only");
        adminElements.forEach((el) => (el.style.display = "none"));

        const employeeElements = document.querySelectorAll(".employee-only");
        employeeElements.forEach((el) => (el.style.display = "block"));
      }
    }
  }
}

// Initialize dashboard only when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new Dashboard();
});
