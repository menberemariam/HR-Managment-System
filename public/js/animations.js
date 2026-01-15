// animations.js - Add interactive animations and effects

class UIAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.addHoverEffects();
    this.addClickAnimations();
    this.addScrollAnimations();
    this.addFormAnimations();
    this.initializeTooltips();
    this.initializeNotifications();
  }

  addHoverEffects() {
    // Button hover ripple effect
    document.querySelectorAll(".btn").forEach((button) => {
      button.addEventListener("mouseenter", (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.style.position = "absolute";
        ripple.style.width = "0";
        ripple.style.height = "0";
        ripple.style.borderRadius = "50%";
        ripple.style.background = "rgba(255, 255, 255, 0.3)";
        ripple.style.transform = "translate(-50%, -50%)";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.animation = "ripple 0.6s linear";

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Card hover effects
    document.querySelectorAll(".card-hover").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      });
    });
  }

  addClickAnimations() {
    // Click animation for action buttons
    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        // Add click animation
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);

        // Add success/error animation based on button type
        if (this.classList.contains("btn-approve")) {
          this.classList.add("pulse-success");
          setTimeout(() => {
            this.classList.remove("pulse-success");
          }, 1000);
        }

        if (this.classList.contains("btn-reject")) {
          this.classList.add("shake");
          setTimeout(() => {
            this.classList.remove("shake");
          }, 500);
        }
      });
    });

    // Modal open/close animations
    document.querySelectorAll("[data-modal]").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute("data-modal");
        const modal = document.getElementById(modalId);

        if (modal) {
          this.openModal(modal);
        }
      });
    });

    document.querySelectorAll(".modal-close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        this.closeModal(closeBtn.closest(".modal"));
      });
    });
  }

  openModal(modal) {
    modal.classList.add("show");
    modal.style.display = "flex";

    // Add backdrop animation
    modal.style.animation = "fadeIn 0.3s ease-out";

    // Prevent body scrolling
    document.body.style.overflow = "hidden";

    // Focus first input in modal
    const firstInput = modal.querySelector("input, select, textarea");
    if (firstInput) firstInput.focus();
  }

  closeModal(modal) {
    modal.style.animation = "fadeOut 0.3s ease-out";

    setTimeout(() => {
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 300);
  }

  addScrollAnimations() {
    // Animate elements when they come into view
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe elements with animation classes
    document
      .querySelectorAll(".stat-card, .table-container, .info-card")
      .forEach((el) => {
        observer.observe(el);
      });
  }

  addFormAnimations() {
    // Form input animations
    document.querySelectorAll(".form-control").forEach((input) => {
      input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused");
      });

      input.addEventListener("blur", function () {
        if (!this.value) {
          this.parentElement.classList.remove("focused");
        }
      });
    });

    // Form submission animation
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", function (e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.classList.add("loading");
          submitBtn.disabled = true;

          // Simulate loading state
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Processing...';

          // Reset after 2 seconds (for demo)
          setTimeout(() => {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 2000);
        }
      });
    });
  }

  initializeTooltips() {
    // Simple tooltip implementation
    document.querySelectorAll("[data-tooltip]").forEach((element) => {
      element.addEventListener("mouseenter", function () {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = this.getAttribute("data-tooltip");
        document.body.appendChild(tooltip);

        const rect = this.getBoundingClientRect();
        tooltip.style.position = "fixed";
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 40}px`;
        tooltip.style.transform = "translateX(-50%)";

        this.tooltipElement = tooltip;
      });

      element.addEventListener("mouseleave", function () {
        if (this.tooltipElement) {
          this.tooltipElement.remove();
        }
      });
    });
  }

  initializeNotifications() {
    // Toast notification system
    window.showNotification = function (message, type = "info") {
      const notification = document.createElement("div");
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
                <i class="fas fa-${this.getIconForType(type)}"></i>
                <span>${message}</span>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.classList.add("show");
      }, 10);

      // Auto remove after 5 seconds
      setTimeout(() => {
        this.closeNotification(notification);
      }, 5000);

      // Close button
      notification
        .querySelector(".notification-close")
        .addEventListener("click", () => {
          this.closeNotification(notification);
        });
    }.bind(this);

    // Add notification styles
    this.addNotificationStyles();
  }

  getIconForType(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || "info-circle";
  }

  closeNotification(notification) {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  addNotificationStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 15px;
                transform: translateX(150%);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 9999;
                max-width: 350px;
                border-left: 4px solid var(--primary);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left-color: var(--success);
            }
            
            .notification-error {
                border-left-color: var(--danger);
            }
            
            .notification-warning {
                border-left-color: var(--warning);
            }
            
            .notification i {
                font-size: 20px;
            }
            
            .notification-success i {
                color: var(--success);
            }
            
            .notification-error i {
                color: var(--danger);
            }
            
            .notification-warning i {
                color: var(--warning);
            }
            
            .notification-info i {
                color: var(--info);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--gray);
                cursor: pointer;
                margin-left: auto;
                padding: 5px;
                border-radius: 50%;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background: rgba(0,0,0,0.05);
                color: var(--dark);
            }
            
            /* Animation keyframes */
            @keyframes ripple {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                100% {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes pulse-success {
                0%, 100% { 
                    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); 
                }
                70% { 
                    box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); 
                }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .shake {
                animation: shake 0.5s;
            }
            
            .animate-in {
                animation: fadeIn 0.6s ease-out;
            }
        `;
    document.head.appendChild(style);
  }

  // Theme switcher
  initializeThemeSwitcher() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("change", function () {
        document.body.classList.toggle("dark-mode", this.checked);
        localStorage.setItem("theme", this.checked ? "dark" : "light");
      });

      // Load saved theme
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
      }
    }
  }
}

// Initialize animations when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new UIAnimations();

  // Add loading animation for page transitions
  const links = document.querySelectorAll(
    'a:not([href^="#"]):not([href^="javascript"])'
  );
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.href && !link.target) {
        e.preventDefault();
        document.body.classList.add("page-transition");
        setTimeout(() => {
          window.location.href = link.href;
        }, 300);
      }
    });
  });
});

// Page transition styles
const pageTransitionStyles = document.createElement("style");
pageTransitionStyles.textContent = `
    .page-transition {
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }
    
    .tooltip {
        position: absolute;
        background: var(--dark);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .tooltip::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px;
        border-style: solid;
        border-color: var(--dark) transparent transparent transparent;
    }
    
    .loading {
        position: relative;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: shimmer 2s infinite;
    }
`;
document.head.appendChild(pageTransitionStyles);
