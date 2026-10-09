/**
 * SOMOY SONDHAN — authentication pages
 * ---------------------------------------------------------------
 * Sign in and registration for login.html / registration.html.
 * `handleLogin` and `handleRegistration` remain global so inline
 * handlers keep working.
 */
(function () {
  "use strict";

  var S = window.SS;

  function fieldError(id, message) {
    var box = document.getElementById(id);
    if (!box) return;
    if (message) {
      box.textContent = message;
      box.className = "alert alert--error";
    } else {
      box.textContent = "";
    }
  }

  function fieldSuccess(id, message) {
    var box = document.getElementById(id);
    if (!box) return;
    box.textContent = message;
    box.className = "alert alert--success";
  }

  function getValue(id) {
    var node = document.getElementById(id);
    return node ? node.value.trim() : "";
  }

  /** Where to send the visitor after a successful sign in. */
  function nextUrl() {
    var next = S.param("next");
    if (!next) return "index.html";
    // Only allow same-site relative targets.
    if (/^(https?:)?\/\//i.test(next) || next.indexOf("..") !== -1) return "index.html";
    return next;
  }

  var handleLogin = function (event) {
    if (event) event.preventDefault();
    var username = getValue("login-username");
    var password = document.getElementById("login-password").value;
    var button = document.getElementById("login-submit");

    fieldError("login-error", "");

    if (!username || !password) {
      fieldError("login-error", "Enter both your username and password.");
      return;
    }

    S.setLoading(button, true);
    S.Api.login(username, password)
      .then(function (data) {
        if (data && data.token && (data.user_id || data.user_id === 0)) {
          S.Session.save(data.token, data.user_id);
          S.toast("Signed in. Welcome back!", "success");
          setTimeout(function () {
            window.location.href = nextUrl();
          }, 500);
        } else {
          fieldError("login-error", (data && data.error) || "Those credentials did not match our records.");
          S.setLoading(button, false);
        }
      })
      .catch(function (err) {
        fieldError("login-error", err.message || "Could not sign you in. Please try again.");
        S.setLoading(button, false);
      });
  };

  var handleRegistration = function (event) {
    if (event) event.preventDefault();
    var payload = {
      username: getValue("username"),
      first_name: getValue("first-name"),
      last_name: getValue("last-name"),
      email: getValue("email"),
      password: document.getElementById("password").value,
      confirm_password: document.getElementById("confirm-password").value,
    };
    var button = document.getElementById("register-submit");

    fieldError("login-error", "");

    if (!payload.username || !payload.email || !payload.password) {
      fieldError("login-error", "Username, email and password are all required.");
      return;
    }
    if (payload.password !== payload.confirm_password) {
      fieldError("login-error", "The two passwords do not match.");
      return;
    }
    if (payload.password.length < 8) {
      fieldError("login-error", "Choose a password with at least 8 characters.");
      return;
    }

    S.setLoading(button, true);
    S.Api.register(payload)
      .then(function (data) {
        S.setLoading(button, false);
        var message = firstError(data);
        if (message) {
          fieldError("login-error", message);
          return;
        }
        fieldSuccess("login-error", "Account created — check your inbox for the confirmation link.");
        S.toast("Check your email to confirm your account.", "success", 6000);
        var form = document.getElementById("register");
        if (form) {
          Array.prototype.forEach.call(form.querySelectorAll("input"), function (input) {
            if (input.type !== "submit") input.disabled = true;
          });
        }
      })
      .catch(function (err) {
        S.setLoading(button, false);
        fieldError("login-error", err.message || "Could not create your account.");
      });
  };

  /**
   * Pull a human message out of a registration response.
   * The API echoes the created account (including `username`) on success,
   * so only fields that actually carry failures are treated as errors.
   */
  function firstError(data) {
    if (!data || typeof data !== "object") return "";
    var order = ["error", "detail", "non_field_errors", "email", "password", "confirm_password", "username"];
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      var value = data[key];
      if (!value) continue;
      // `username` is only an error when it is a validation message.
      if (key === "username" && !isValidationMessage(value)) continue;
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === "string" && value) return value;
    }
    return "";
  }

  /** True when a value looks like an error, not a successful echo of input. */
  function isValidationMessage(value) {
    var text = Array.isArray(value) ? String(value[0] || "") : String(value);
    return /already|exist|required|invalid|must|taken|short|valid/i.test(text);
  }

  function init() {
    var loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    var registerForm = document.getElementById("register");
    if (registerForm) registerForm.addEventListener("submit", handleRegistration);

    var toggle = document.getElementById("toggle-password");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var input = document.getElementById("login-password");
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
        toggle.style.color = show ? "rgb(var(--brand-500))" : "";
        input.focus();
      });
    }

    // Signed-in visitors do not need the auth screens.
    if (S.Session.isLoggedIn()) {
      var banner = document.createElement("div");
      banner.className = "alert alert--info";
      banner.style.marginBottom = "1rem";
      banner.innerHTML =
        "You are already signed in. <a class='link-underline' href='" + nextUrl() + "'>Continue reading</a>";
      var card = document.querySelector(".auth-card");
      if (card) card.insertBefore(banner, card.firstChild);
    }
  }

  window.handleLogin = handleLogin;
  window.handleRegistration = handleRegistration;
  window.getValue = getValue;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
