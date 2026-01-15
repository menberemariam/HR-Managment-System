class EmployeeDirectory {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    await this.loadUser();
    await this.loadDepartments();
    await this.loadEmployees();
    this.bindEvents();
  }

  async loadUser() {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (!data.authenticated) {
        window.location.href = "/login.html";
        return;
      }

      this.currentUser = data.user;

      // Check if user is on wrong page
      const isAdminPage = window.location.pathname.includes("admin-employees");
      const isEmployeePage =
        window.location.pathname.includes("employee-employees") ||
        window.location.pathname.includes("employee-directory");

      if (this.currentUser.role === "admin" && isEmployeePage) {
        window.location.href = "admin-employees.html";
        return;
      } else if (this.currentUser.role !== "admin" && isAdminPage) {
        window.location.href = "employee-directory.html";
        return;
      }

      // Update user name
      const userNameElement = document.getElementById("userName");
      if (userNameElement) {
        userNameElement.textContent = this.currentUser.employeeName || "User";
      }

      // Hide admin features for non-admin
      this.hideAdminFeatures();
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  hideAdminFeatures() {
    // Hide add button for non-admin
    const addBtn = document.getElementById("addEmployeeBtn");
    if (addBtn && this.currentUser.role !== "admin") {
      addBtn.style.display = "none";
    }

    // Hide modal if exists and user is not admin
    const modal = document.getElementById("addEmployeeModal");
    if (modal && this.currentUser.role !== "admin") {
      modal.style.display = "none";
    }
  }

  async loadDepartments() {
    try {
      const response = await fetch("/api/employees/departments/all");
      const departments = await response.json();

      const select = document.getElementById("departmentFilter");
      if (select) {
        select.innerHTML =
          '<option value="All Departments">All Departments</option>';
        departments.forEach((dept) => {
          const option = document.createElement("option");
          option.value = dept;
          option.textContent = dept;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  }

  async loadEmployees() {
    try {
      const search = document.getElementById("searchInput")?.value || "";
      const department =
        document.getElementById("departmentFilter")?.value || "All Departments";

      let query = "";
      if (search) query += `search=${encodeURIComponent(search)}`;
      if (department && department !== "All Departments") {
        query +=
          (query ? "&" : "") + `department=${encodeURIComponent(department)}`;
      }

      const url = `/api/employees${query ? "?" + query : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const employees = await response.json();
      this.renderEmployees(employees);
    } catch (error) {
      console.error("Failed to load employees:", error);
      alert("Failed to load employees. Please try again.");
    }
  }

  renderEmployees(employees) {
    const tbody = document.getElementById("employeesTable");
    const countElement = document.getElementById("employeeCount");

    if (!tbody) return;

    // Update count
    if (countElement) {
      countElement.textContent = `Showing ${employees.length} of ${employees.length} employees`;
    }

    tbody.innerHTML = "";

    if (employees.length === 0) {
      const row = document.createElement("tr");
      // Check if Actions column exists by looking at table header
      const hasActionsColumn =
        document.querySelector("thead tr th:nth-child(6)") !== null;
      const colSpan = hasActionsColumn ? 6 : 5;

      row.innerHTML = `
        <td colspan="${colSpan}" style="text-align: center; padding: 40px; color: #666;">
          No employees found
        </td>
      `;
      tbody.appendChild(row);
      return;
    }

    // Check if table has Actions column
    const tableHeaders = document.querySelectorAll("thead tr th");
    const hasActionsColumn = tableHeaders.length === 6;

    employees.forEach((employee) => {
      const row = document.createElement("tr");

      if (hasActionsColumn && this.currentUser.role === "admin") {
        // Admin view with actions
        row.innerHTML = `
          <td>${employee.fullName}</td>
          <td>${employee.department}</td>
          <td>${employee.position}</td>
          <td><a href="mailto:${employee.email}">${employee.email}</a></td>
          <td><a href="tel:${employee.phone}">${employee.phone}</a></td>
          <td>
            <button class="btn-edit" onclick="employeeDirectory.editEmployee('${employee._id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" onclick="employeeDirectory.deleteEmployee('${employee._id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
      } else {
        // Employee view without actions
        row.innerHTML = `
          <td>${employee.fullName}</td>
          <td>${employee.department}</td>
          <td>${employee.position}</td>
          <td><a href="mailto:${employee.email}">${employee.email}</a></td>
          <td><a href="tel:${employee.phone}">${employee.phone}</a></td>
          ${hasActionsColumn ? "<td></td>" : ""}
        `;
      }
      tbody.appendChild(row);
    });
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        this.debounce(() => {
          this.loadEmployees();
        }, 300)
      );
    }

    // Department filter
    const deptFilter = document.getElementById("departmentFilter");
    if (deptFilter) {
      deptFilter.addEventListener("change", () => {
        this.loadEmployees();
      });
    }

    // Add employee button (only for admin)
    const addBtn = document.getElementById("addEmployeeBtn");
    if (addBtn && this.currentUser && this.currentUser.role === "admin") {
      addBtn.addEventListener("click", () => {
        this.showAddEmployeeModal();
      });
    }

    // Add employee form (only for admin)
    const addForm = document.getElementById("addEmployeeForm");
    if (addForm && this.currentUser && this.currentUser.role === "admin") {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addEmployee(e);
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.handleLogout();
      });
    }

    // Modal close
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.style.display = "none";
        });
      });
    });

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  async addEmployee(e) {
    e.preventDefault();

    const form = document.getElementById("addEmployeeForm");
    if (!form) return;

    const formData = new FormData(form);
    const employeeData = Object.fromEntries(formData.entries());

    // Basic validation
    const required = [
      "fullName",
      "email",
      "department",
      "position",
      "phone",
      "dateOfBirth",
    ];
    for (const field of required) {
      if (!employeeData[field]) {
        alert(`Please fill in ${field}`);
        return;
      }
    }

    // Add default values
    employeeData.hireDate = new Date().toISOString();
    employeeData.status = "active";
    employeeData.leaveBalance = 20;

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add employee");
      }

      alert("Employee added successfully!");

      // Close modal
      const modal = document.getElementById("addEmployeeModal");
      if (modal) {
        modal.style.display = "none";
      }

      // Reset form and reload
      form.reset();
      await this.loadEmployees();
    } catch (error) {
      console.error("Failed to add employee:", error);
      alert("Error: " + error.message);
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showAddEmployeeModal() {
    const modal = document.getElementById("addEmployeeModal");
    if (modal) {
      modal.style.display = "block";
      const form = document.getElementById("addEmployeeForm");
      if (form) form.reset();
    }
  }

  editEmployee(employeeId) {
    console.log("Edit employee:", employeeId);
    alert("Edit functionality will be implemented in the next version.");
  }

  async deleteEmployee(employeeId) {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Employee deleted successfully!");
        await this.loadEmployees();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Failed to delete employee:", error);
      alert("Failed to delete employee.");
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
}

// Global instance
const employeeDirectory = new EmployeeDirectory();
