(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const eyeIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeOffIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l16 16"/><path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.7 17.7 0 0 1-3.4 4.2"/><path d="M6.2 7.8A17.6 17.6 0 0 0 2.5 12S6 18.5 12 18.5a9.7 9.7 0 0 0 4.1-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  function setError(id, message) {
    const box = $(id);
    if (!box) return;
    box.textContent = message || "";
    box.style.display = message ? "block" : "none";
  }

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", function () {
      const input = $(button.getAttribute("data-toggle-password"));
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.innerHTML = show ? eyeOffIcon : eyeIcon;
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  /* ---------------- Forgot password ---------------- */
  const forgotForm = $("forgotPasswordForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = $("email").value.trim();
      const success = $("forgotSuccess");
      const linkBox = $("resetLinkBox");
      const button = forgotForm.querySelector('button[type="submit"]');
      const originalMarkup = button.innerHTML;

      setError("forgotError", "");
      success.classList.remove("is-visible");
      linkBox.classList.remove("is-visible");

      if (!email) {
        setError("forgotError", "Enter your university email address.");
        return;
      }

      button.disabled = true;
      button.textContent = "Requesting link…";

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError("forgotError", data.error || "Unable to process the request.");
          return;
        }

        success.textContent =
          data.message ||
          "If that address belongs to an active staff account, a reset link has been issued.";
        success.classList.add("is-visible");

        if (data.resetUrl) {
          $("resetLink").href = data.resetUrl;
          $("resetLink").textContent = data.resetUrl;
          linkBox.classList.add("is-visible");
        }
      } catch (error) {
        setError("forgotError", "Network error. Please try again.");
      } finally {
        button.disabled = false;
        button.innerHTML = originalMarkup;
      }
    });
  }

  const copyButton = $("copyResetLink");
  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      const link = $("resetLink");
      if (!link) return;
      try {
        await navigator.clipboard.writeText(link.href);
        copyButton.textContent = "Copied";
      } catch (error) {
        copyButton.textContent = "Copy failed";
      }
      setTimeout(function () {
        copyButton.textContent = "Copy link";
      }, 1800);
    });
  }

  /* ---------------- Reset password ---------------- */
  const resetForm = $("resetPasswordForm");
  if (resetForm) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    const tokenField = $("token");
    const newPassword = $("newPassword");
    const confirmPassword = $("confirmPassword");
    const strengthBar = $("strengthBar");
    const strengthText = $("strengthText");
    const success = $("resetSuccess");
    const requirements = {
      length: $("reqLength"),
      mixed: $("reqMixed"),
      number: $("reqNumber"),
      symbol: $("reqSymbol"),
    };

    if (tokenField) tokenField.value = token;

    if (!token) {
      setError(
        "resetError",
        "This reset link is missing its token. Request a new link from the forgot password page.",
      );
      const submit = resetForm.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
    }

    function updateStrength() {
      const value = newPassword.value;
      const checks = {
        length: value.length >= 6,
        mixed: /[a-z]/.test(value) && /[A-Z]/.test(value),
        number: /\d/.test(value),
        symbol: /[^A-Za-z0-9]/.test(value),
      };

      Object.keys(requirements).forEach(function (key) {
        if (requirements[key]) {
          requirements[key].classList.toggle("is-met", Boolean(checks[key]));
        }
      });

      const met = Object.keys(checks).filter(function (key) {
        return checks[key];
      }).length;
      const percentage = value ? Math.max(12, met * 25) : 0;

      if (strengthBar) {
        strengthBar.style.width = percentage + "%";
        strengthBar.style.background = ["#ba1a1a", "#ba1a1a", "#b06a00", "#7f5700", "#2e7d4f"][met];
      }
      if (strengthText) {
        strengthText.textContent = value
          ? ["Too short", "Weak", "Fair", "Good", "Strong"][met] + " password"
          : "Use at least 6 characters";
      }
    }

    if (newPassword) {
      newPassword.addEventListener("input", updateStrength);
      updateStrength();
    }

    resetForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      setError("resetError", "");

      if (!token) return;

      if (newPassword.value.length < 6) {
        setError("resetError", "Your new password must be at least 6 characters long.");
        newPassword.focus();
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        setError("resetError", "The two passwords do not match.");
        confirmPassword.focus();
        return;
      }

      const button = resetForm.querySelector('button[type="submit"]');
      const originalMarkup = button.innerHTML;
      button.disabled = true;
      button.textContent = "Updating password…";

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: newPassword.value }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError("resetError", data.error || "Unable to reset the password.");
          return;
        }

        resetForm.style.display = "none";
        success.classList.add("is-visible");
        success.textContent =
          data.message || "Password updated. You can sign in now.";
        const done = $("resetDone");
        if (done) done.style.display = "block";
      } catch (error) {
        setError("resetError", "Network error. Please try again.");
      } finally {
        button.disabled = false;
        button.innerHTML = originalMarkup;
      }
    });
  }
})();
