class ProfileManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    await this.loadUser();
    await this.loadProfile();
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
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  async loadProfile() {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.employee) {
        this.renderProfile(data.employee);
        this.updateProfileForm(data.employee);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }

  renderProfile(employee) {
    const container = document.getElementById("profileInfo");
    if (!container) return;

    const formattedDOB = employee.dateOfBirth
      ? new Date(employee.dateOfBirth).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not set";

    const formattedHireDate = employee.hireDate
      ? new Date(employee.hireDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not set";

    container.innerHTML = `
          <div class="profile-header">
              <div class="profile-avatar">
                  <i class="fas fa-user-circle"></i>
              </div>
              <div class="profile-title">
                  <h3>${employee.fullName}</h3>
                  <p>${employee.position} • ${employee.department}</p>
              </div>
          </div>
          
          <div class="profile-section">
              <h4>Personal Information</h4>
              <p>Your profile details as registered in the system</p>
              
              <div class="info-grid">
                  <div class="info-item">
                      <label>Full Name</label>
                      <p>${employee.fullName}</p>
                  </div>
                  <div class="info-item">
                      <label>Email Address</label>
                      <p>${employee.email}</p>
                  </div>
                  <div class="info-item">
                      <label>Phone Number</label>
                      <p>${employee.phone}</p>
                  </div>
                  <div class="info-item">
                      <label>Date of Birth</label>
                      <p>${formattedDOB}</p>
                  </div>
                  <div class="info-item">
                      <label>Department</label>
                      <p>${employee.department}</p>
                  </div>
                  <div class="info-item">
                      <label>Position</label>
                      <p>${employee.position}</p>
                  </div>
                  <div class="info-item">
                      <label>Employee ID</label>
                      <p>${employee.employeeId}</p>
                  </div>
                  <div class="info-item">
                      <label>Hire Date</label>
                      <p>${formattedHireDate}</p>
                  </div>
                  <div class="info-item">
                      <label>Leave Balance</label>
                      <p><strong>${employee.leaveBalance} days</strong></p>
                  </div>
                  <div class="info-item">
                      <label>Status</label>
                      <p><span class="status-active">${
                        employee.status || "active"
                      }</span></p>
                  </div>
              </div>
          </div>
          
          ${
            employee.address
              ? `
              <div class="profile-section">
                  <h4>Address</h4>
                  <p>${employee.address}</p>
              </div>
          `
              : ""
          }
          
          ${
            employee.emergencyContact
              ? `
              <div class="profile-section">
                  <h4>Emergency Contact</h4>
                  <div class="info-grid">
                      <div class="info-item">
                          <label>Name</label>
                          <p>${employee.emergencyContact.name || "Not set"}</p>
                      </div>
                      <div class="info-item">
                          <label>Phone</label>
                          <p>${employee.emergencyContact.phone || "Not set"}</p>
                      </div>
                      <div class="info-item">
                          <label>Relationship</label>
                          <p>${
                            employee.emergencyContact.relationship || "Not set"
                          }</p>
                      </div>
                  </div>
              </div>
          `
              : ""
          }
      `;
  }

  updateProfileForm(employee) {
    // Populate edit form if it exists
    const form = document.getElementById("editProfileForm");
    if (!form) return;

    const elements = form.elements;

    // Set form values
    if (elements.fullName) elements.fullName.value = employee.fullName || "";
    if (elements.email) elements.email.value = employee.email || "";
    if (elements.phone) elements.phone.value = employee.phone || "";
    if (elements.department)
      elements.department.value = employee.department || "";
    if (elements.position) elements.position.value = employee.position || "";

    // Format date for date input
    if (elements.dateOfBirth && employee.dateOfBirth) {
      const dob = new Date(employee.dateOfBirth);
      elements.dateOfBirth.value = dob.toISOString().split("T")[0];
    }

    // Set emergency contact
    if (employee.emergencyContact) {
      if (elements.emergencyName) {
        elements.emergencyName.value = employee.emergencyContact.name || "";
      }
      if (elements.emergencyPhone) {
        elements.emergencyPhone.value = employee.emergencyContact.phone || "";
      }
      if (elements.emergencyRelationship) {
        elements.emergencyRelationship.value =
          employee.emergencyContact.relationship || "";
      }
    }

    // Set address
    if (elements.address) {
      elements.address.value = employee.address || "";
    }
  }

  bindEvents() {
    // Edit profile button
    const editBtn = document.getElementById("editProfileBtn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.showEditModal();
      });
    }

    // Save profile changes
    const saveForm = document.getElementById("editProfileForm");
    if (saveForm) {
      saveForm.addEventListener("submit", this.handleSaveProfile.bind(this));
    }

    // Change password form
    const changePasswordForm = document.getElementById("changePasswordForm");
    if (changePasswordForm) {
      changePasswordForm.addEventListener(
        "submit",
        this.handleChangePassword.bind(this)
      );
    }

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.style.display = "none";
        });
      });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        Auth.logout();
      });
    }
  }

  showEditModal() {
    const modal = document.getElementById("editProfileModal");
    if (modal) {
      modal.style.display = "block";
    }
  }

  async handleSaveProfile(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const profileData = Object.fromEntries(formData.entries());

    // Convert date format
    if (profileData.dateOfBirth) {
      profileData.dateOfBirth = new Date(profileData.dateOfBirth).toISOString();
    }

    // Structure emergency contact
    if (
      profileData.emergencyName ||
      profileData.emergencyPhone ||
      profileData.emergencyRelationship
    ) {
      profileData.emergencyContact = {
        name: profileData.emergencyName,
        phone: profileData.emergencyPhone,
        relationship: profileData.emergencyRelationship,
      };
      delete profileData.emergencyName;
      delete profileData.emergencyPhone;
      delete profileData.emergencyRelationship;
    }

    try {
      const response = await fetch(
        `/api/profile/employee/${this.currentUser.employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }
      );

      if (response.ok) {
        alert("Profile updated successfully!");
        document.getElementById("editProfileModal").style.display = "none";
        await this.loadProfile();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  }

  async handleChangePassword(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const passwordData = Object.fromEntries(formData.entries());

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        alert("Password changed successfully!");
        form.reset();

        // Close modal if in modal
        const modal = document.getElementById("changePasswordModal");
        if (modal) {
          modal.style.display = "none";
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password. Please try again.");
    }
  }
}

// Global instance
const profileManager = new ProfileManager();
