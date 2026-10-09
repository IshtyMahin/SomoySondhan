/**
 * Legacy auth helpers — registration and login.
 *
 * These are kept for backward compatibility with pages that include
 * auth.js directly.  New code should use SS.Api (defined in core.js).
 *
 * The backend base URL is resolved from SS.Api so it never needs to be
 * hard-coded here.
 */

/* global SS */

const getValue = (id) => {
  const el = document.getElementById(id);
  return el ? el.value : "";
};

const handleRegistration = (event) => {
  event.preventDefault();
  const info = {
    username: getValue("username"),
    first_name: getValue("first-name"),
    last_name: getValue("last-name"),
    email: getValue("email"),
    password: getValue("password"),
    confirm_password: getValue("confirm-password"),
  };

  const element = document.getElementById("login-error");
  if (!element) return;

  if (window.SS && SS.Api) {
    showSpinner();
    SS.Api.register(info)
      .then((data) => {
        if (data && data.token && (data.user_id || data.id)) {
          SS.Session.save(data.token, data.user_id || data.id);
        }
        element.textContent = "Account created successfully! Redirecting...";
        element.classList.remove("text-red-500");
        element.classList.add("text-green-500");
        setTimeout(() => {
          window.location.href = data && data.token ? "index.html" : "login.html";
        }, 1200);
      })
      .catch((err) => {
        const data = (err && err.data) || {};
        if (Array.isArray(data["username"])) {
          element.textContent = data["username"][0];
        } else if (Array.isArray(data["password"])) {
          element.textContent = data["password"][0];
        } else if (data["error"]) {
          element.textContent = data["error"];
        } else {
          element.textContent = err.message || "Registration failed.";
        }
      })
      .finally(() => hideSpinner());
    return;
  }

  // Fallback when SS is not loaded yet (should not happen in normal flow).
  console.error("SS.Api not available — core.js must load before auth.js");
};

const handleLogin = (event) => {
  event.preventDefault();
  const username = getValue("login-username");
  const password = getValue("login-password");
  const errorEl = document.getElementById("login-error");

  if (window.SS && SS.Api) {
    showSpinner();
    SS.Api.login(username, password)
      .then((data) => {
        if (data.token && data.user_id) {
          SS.Session.save(data.token, data.user_id);
          // Honour a ?next= redirect, fall back to the homepage.
          const next = new URLSearchParams(window.location.search).get("next");
          window.location.href = next || "index.html";
        } else if (errorEl) {
          errorEl.textContent = data.error || "Login failed.";
        }
      })
      .catch((err) => {
        const msg =
          (err.data && (err.data.error || err.data.detail)) || err.message || "Login failed.";
        if (errorEl) errorEl.textContent = msg;
      })
      .finally(() => hideSpinner());
    return;
  }

  console.error("SS.Api not available — core.js must load before auth.js");
};
