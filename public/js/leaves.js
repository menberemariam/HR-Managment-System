class LeaveManagement {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    await this.loadUser();
    this.setupUI();
    await this.loadData();
    this.bindEvents();
  }

  async loadUser() {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (!data.authenticated) {
        window.location.href = "/login";
        return;
      }

      this.currentUser = data.user;
      document.getElementById("userName").textContent =
        this.currentUser.employeeName || "User";

      // Log for debugging
      console.log("Current user:", this.currentUser);
      console.log("Employee ID:", this.currentUser.employeeId);

      // Set current employee ID in form - IMPORTANT FIX
      if (this.currentUser.employeeId) {
        const employeeIdInput = document.getElementById("employeeId");
        if (employeeIdInput) {
          employeeIdInput.value = this.currentUser.employeeId;
          console.log("Set employeeId input to:", this.currentUser.employeeId);
        }
      } else {
        console.error("Employee ID is missing from user session!");
        alert(
          "Your account is not linked to an employee record. Please contact admin."
        );
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  setupUI() {
    // Show/hide sections based on role
    const adminSection = document.getElementById("adminLeaveSection");
    const employeeSection = document.getElementById("employeeLeaveSection");

    if (this.currentUser.role === "admin") {
      if (adminSection) adminSection.style.display = "block";
      if (employeeSection) employeeSection.style.display = "none";
    } else {
      if (adminSection) adminSection.style.display = "none";
      if (employeeSection) employeeSection.style.display = "block";
    }
  }

  async loadData() {
    try {
      if (this.currentUser.role === "admin") {
        // Load all leaves for admin
        const response = await fetch("/api/leaves/all");
        const leaves = await response.json();
        this.renderAdminLeaves(leaves);
      } else {
        // Load employee's leaves
        if (this.currentUser.employeeId) {
          const response = await fetch(
            `/api/leaves/employee/${this.currentUser.employeeId}`
          );
          const leaves = await response.json();
          this.renderEmployeeLeaves(leaves);
        }

        // Load leave balance
        await this.loadLeaveBalance();
      }

      // Load stats for both
      await this.loadStats();
    } catch (error) {
      console.error("Failed to load leave data:", error);
    }
  }

  async loadLeaveBalance() {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.employee && data.employee.leaveBalance) {
        const balanceElement = document.getElementById("leaveBalance");
        if (balanceElement) {
          balanceElement.textContent = data.employee.leaveBalance;
        }
      }
    } catch (error) {
      console.error("Failed to load leave balance:", error);
    }
  }

  async loadStats() {
    try {
      const response = await fetch("/api/leaves/stats");
      const stats = await response.json();

      // Update stats display
      document.getElementById("pendingCount").textContent = stats.pending;
      document.getElementById("approvedCount").textContent = stats.approved;
      document.getElementById("rejectedCount").textContent = stats.rejected;
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  renderAdminLeaves(leaves) {
    const container = document.getElementById("adminLeaveList");
    if (!container) return;

    container.innerHTML = "";

    if (leaves.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #666;">No leave requests found.</p>';
      return;
    }

    // Filter pending leaves
    const pendingLeaves = leaves.filter((leave) => leave.status === "pending");

    if (pendingLeaves.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #666;">No pending leave requests.</p>';
      return;
    }

    pendingLeaves.forEach((leave) => {
      const leaveElement = this.createLeaveCard(leave);
      container.appendChild(leaveElement);
    });
  }

  renderEmployeeLeaves(leaves) {
    const container = document.getElementById("employeeLeaveList");
    if (!container) return;

    container.innerHTML = "";

    if (leaves.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #666;">No leave requests found.</p>';
      return;
    }

    leaves.forEach((leave) => {
      const leaveElement = this.createLeaveCard(leave);
      container.appendChild(leaveElement);
    });
  }

  createLeaveCard(leave) {
    const div = document.createElement("div");
    div.className = "leave-card";
    div.id = `leave-${leave._id}`;

    const statusClass = `status-${leave.status}`;
    const statusText =
      leave.status.charAt(0).toUpperCase() + leave.status.slice(1);

    // Format dates
    const startDate = new Date(leave.startDate).toLocaleDateString();
    const endDate = new Date(leave.endDate).toLocaleDateString();
    const submittedDate = new Date(leave.submittedDate).toLocaleDateString();

    // Create buttons HTML
    let actions = "";
    if (this.currentUser.role === "admin" && leave.status === "pending") {
      actions = `
            <div class="leave-actions">
                <button class="btn-approve" data-id="${leave._id}" onclick="leaveManagement.approveLeave('${leave._id}')">
                    Approve
                </button>
                <button class="btn-reject" data-id="${leave._id}" onclick="leaveManagement.rejectLeave('${leave._id}')">
                    Reject
                </button>
            </div>
        `;
    }

    div.innerHTML = `
        <div class="leave-header">
            <div>
                <h4>${leave.employeeName || "Employee"}</h4>
                <p>${leave.department || ""}</p>
            </div>
            <span class="${statusClass}">${statusText}</span>
        </div>
        <div class="leave-dates">
            <strong>${startDate} - ${endDate}</strong>
            <span>(${leave.totalDays} days)</span>
        </div>
        <div class="leave-reason">
            <p><strong>Reason:</strong> ${leave.reason}</p>
        </div>
        <div class="leave-footer">
            <small>Submitted: ${submittedDate}</small>
            ${
              leave.leaveType
                ? `<span class="leave-type">${leave.leaveType}</span>`
                : ""
            }
        </div>
        ${actions}
    `;

    return div;
  }

  async approveLeave(leaveId) {
    if (!confirm("Approve this leave request?")) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          adminComments: "Leave approved",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Leave approved successfully!");

        // Update the specific leave card
        const leaveCard = document.getElementById(`leave-${leaveId}`);
        if (leaveCard) {
          // Update status
          const statusSpan = leaveCard.querySelector(".leave-header span");
          statusSpan.className = "status-approved";
          statusSpan.textContent = "Approved";

          // Remove action buttons
          const actionsDiv = leaveCard.querySelector(".leave-actions");
          if (actionsDiv) {
            actionsDiv.remove();
          }
        }

        // Also update stats
        await this.loadStats();
      } else {
        alert(`Error: ${result.error || "Failed to approve leave"}`);
      }
    } catch (error) {
      console.error("Failed to approve leave:", error);
      alert("Failed to approve leave. Please try again.");
    }
  }

  async rejectLeave(leaveId) {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          adminComments: reason,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Leave rejected successfully!");

        // Update the specific leave card
        const leaveCard = document.getElementById(`leave-${leaveId}`);
        if (leaveCard) {
          // Update status
          const statusSpan = leaveCard.querySelector(".leave-header span");
          statusSpan.className = "status-rejected";
          statusSpan.textContent = "Rejected";

          // Remove action buttons
          const actionsDiv = leaveCard.querySelector(".leave-actions");
          if (actionsDiv) {
            actionsDiv.remove();
          }
        }

        // Also update stats
        await this.loadStats();
      } else {
        alert(`Error: ${result.error || "Failed to reject leave"}`);
      }
    } catch (error) {
      console.error("Failed to reject leave:", error);
      alert("Failed to reject leave. Please try again.");
    }
  }

  async approveLeave(leaveId) {
    if (!confirm("Approve this leave request?")) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          adminComments: "Leave approved",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Leave approved successfully!");

        // Update the specific leave card
        const leaveCard = document.getElementById(`leave-${leaveId}`);
        if (leaveCard) {
          // Update status
          const statusSpan = leaveCard.querySelector(".leave-header span");
          statusSpan.className = "status-approved";
          statusSpan.textContent = "Approved";

          // Remove action buttons
          const actionsDiv = leaveCard.querySelector(".leave-actions");
          if (actionsDiv) {
            actionsDiv.remove();
          }
        }

        // Also update stats
        await this.loadStats();
      } else {
        alert(`Error: ${result.error || "Failed to approve leave"}`);
      }
    } catch (error) {
      console.error("Failed to approve leave:", error);
      alert("Failed to approve leave. Please try again.");
    }
  }

  async rejectLeave(leaveId) {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          adminComments: reason,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Leave rejected successfully!");

        // Update the specific leave card
        const leaveCard = document.getElementById(`leave-${leaveId}`);
        if (leaveCard) {
          // Update status
          const statusSpan = leaveCard.querySelector(".leave-header span");
          statusSpan.className = "status-rejected";
          statusSpan.textContent = "Rejected";

          // Remove action buttons
          const actionsDiv = leaveCard.querySelector(".leave-actions");
          if (actionsDiv) {
            actionsDiv.remove();
          }
        }

        // Also update stats
        await this.loadStats();
      } else {
        alert(`Error: ${result.error || "Failed to reject leave"}`);
      }
    } catch (error) {
      console.error("Failed to reject leave:", error);
      alert("Failed to reject leave. Please try again.");
    }
  }

  bindEvents() {
    // Apply leave form
    const applyForm = document.getElementById("applyLeaveForm");
    if (applyForm) {
      applyForm.addEventListener("submit", this.handleApplyLeave.bind(this));
    }

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.dataset.filter;
        this.filterLeaves(filter);
      });
    });

    // Date validation
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    if (startDateInput && endDateInput) {
      startDateInput.addEventListener("change", () => {
        if (startDateInput.value) {
          endDateInput.min = startDateInput.value;
          if (endDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = startDateInput.value;
          }
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        Auth.logout();
      });
    }
  }
  async handleApplyLeave(e) {
    e.preventDefault();

    console.log("Applying for leave...");
    console.log("Current user:", this.currentUser);

    const form = e.target;
    const formData = new FormData(form);
    const leaveData = Object.fromEntries(formData.entries());

    // Remove empty employeeId if it's empty
    if (!leaveData.employeeId || leaveData.employeeId === "") {
      // Use employeeId from session
      if (this.currentUser && this.currentUser.employeeId) {
        leaveData.employeeId = this.currentUser.employeeId;
      } else {
        alert(
          "Cannot submit leave: Your account is not linked to an employee."
        );
        return;
      }
    }

    console.log("Leave data to send:", leaveData);

    // Validate dates
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);

    if (endDate < startDate) {
      alert("End date must be after start date");
      return;
    }

    // Calculate total days
    const timeDiff = endDate - startDate;
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      alert("Invalid date range");
      return;
    }

    // Add total days to data
    leaveData.totalDays = totalDays;

    try {
      const response = await fetch("/api/leaves/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveData),
      });

      const result = await response.json();
      console.log("Response:", result);

      if (response.ok) {
        alert("Leave request submitted successfully!");
        form.reset();
        await this.loadData();
      } else {
        alert(`Error: ${result.error || "Failed to submit leave request"}`);
      }
    } catch (error) {
      console.error("Failed to submit leave:", error);
      alert("Failed to submit leave request. Please try again.");
    }
  }

  async approveLeave(leaveId) {
    if (!confirm("Approve this leave request?")) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          adminComments: "Leave approved",
        }),
      });

      if (response.ok) {
        alert("Leave approved successfully!");
        await this.loadData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to approve leave");
      }
    } catch (error) {
      console.error("Failed to approve leave:", error);
      alert("Failed to approve leave. Please try again.");
    }
  }

  async rejectLeave(leaveId) {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/leaves/${leaveId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          adminComments: reason,
        }),
      });

      if (response.ok) {
        alert("Leave rejected successfully!");
        await this.loadData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reject leave");
      }
    } catch (error) {
      console.error("Failed to reject leave:", error);
      alert("Failed to reject leave. Please try again.");
    }
  }

  filterLeaves(filter) {
    const cards = document.querySelectorAll(".leave-card");

    cards.forEach((card) => {
      if (filter === "all") {
        card.style.display = "block";
      } else {
        const status = card
          .querySelector(".leave-header span")
          .className.includes(filter);
        card.style.display = status ? "block" : "none";
      }
    });

    // Update active filter button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");
  }
}

// Global instance
const leaveManagement = new LeaveManagement();
