/**
 * SOMOY SONDHAN — shared runtime
 * ---------------------------------------------------------------
 * One place for: API access, auth state, themed confirm dialogs,
 * toasts, skeletons, formatting and small DOM helpers.
 *
 * Backwards compatibility: the legacy global helpers `showSpinner()`
 * and `hideSpinner()` are kept so existing page scripts keep working.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     API
     --------------------------------------------------------- */
  /**
   * Where the API lives. Resolution order:
   *   1. `window.SS_CONFIG.apiBase` set by the page before this file loads,
   *   2. `localStorage["ss-api-base"]` — a runtime override for local testing,
   *   3. the local development backend.
   * Point at production with `localStorage.setItem("ss-api-base", "https://…")`.
   */
  var PRODUCTION_API = "https://somoysondhan-backend.onrender.com";
  var LOCAL_API = "http://127.0.0.1:8000";

  function resolveApiBase() {
    var configured = window.SS_CONFIG && window.SS_CONFIG.apiBase;
    if (configured) return String(configured).replace(/\/+$/, "");
    try {
      var stored = localStorage.getItem("ss-api-base");
      if (stored) return String(stored).replace(/\/+$/, "");
    } catch (e) {}
    var isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return isLocal ? LOCAL_API : PRODUCTION_API;
  }

  var API_BASE = resolveApiBase();
  // Bump when the backend contract changes; keeps responses fresh.
  var API_VERSION = "v3";

  function withVersion(path) {
    if (/^https?:/i.test(path)) return path;
    var url = API_BASE + (path.charAt(0) === "/" ? path : "/" + path);
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "v=" + API_VERSION;
  }

  function token() {
    try {
      return localStorage.getItem("token");
    } catch (e) {
      return null;
    }
  }

  function userId() {
    try {
      return localStorage.getItem("user_id");
    } catch (e) {
      return null;
    }
  }

  function authHeaders(extra) {
    var headers = Object.assign({ Accept: "application/json" }, extra || {});
    var t = token();
    // The backend uses DRF TokenAuthentication, whose scheme keyword is `Token`.
    if (t) headers.Authorization = "Token " + t;
    return headers;
  }

  function isFormData(body) {
    return typeof FormData !== "undefined" && body instanceof FormData;
  }

  /** Low-level request. Resolves parsed JSON, rejects on failure. */
  function request(path, options) {
    options = options || {};
    var init = { method: options.method || "GET", headers: authHeaders(options.headers) };
    if (options.body !== undefined) {
      if (isFormData(options.body)) {
        // Let the browser set the multipart boundary itself.
        init.body = options.body;
      } else {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(options.body);
      }
    }
    if (options.signal) init.signal = options.signal;

    return fetch(withVersion(path), init).then(function (res) {
      var isJson = (res.headers.get("content-type") || "").indexOf("json") !== -1;
      return (isJson ? res.json().catch(function () { return null; }) : res.text()).then(function (data) {
        if (!res.ok) {
          var err = new Error(messageFrom(data, res.status));
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  /**
   * The list endpoints answer either with a plain array or — when a page is
   * requested — with the DRF envelope `{count, results, next, previous}`.
   * Every caller in this app wants the array, so unwrap once, here.
   */
  function unwrap(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  }

  /** Full paginated response, for callers that want count/next/previous. */
  function pageInfo(data) {
    if (!data || Array.isArray(data)) return null;
    if (!Array.isArray(data.results)) return null;
    return {
      count: data.count,
      page: data.page,
      pageSize: data.page_size,
      numPages: data.num_pages,
      next: data.next,
      previous: data.previous,
      results: data.results,
    };
  }

  function messageFrom(data, status) {
    if (typeof data === "string" && data) return data.slice(0, 180);
    if (data && typeof data === "object") {
      var keys = Object.keys(data);
      if (keys.length) {
        var first = data[keys[0]];
        var text = Array.isArray(first) ? first[0] : first;
        if (typeof text === "string") return text;
      }
    }
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You do not have permission to do that.";
    if (status === 404) return "We could not find what you asked for.";
    if (status >= 500) return "The server had a problem. Please try again shortly.";
    return "Something went wrong. Please try again.";
  }

  var Api = {
    base: API_BASE,
    url: withVersion,
    request: request,
    get: function (path, options) {
      return request(path, Object.assign({ method: "GET" }, options));
    },
    post: function (path, body, options) {
      return request(path, Object.assign({ method: "POST", body: body }, options));
    },
    patch: function (path, body, options) {
      return request(path, Object.assign({ method: "PATCH", body: body }, options));
    },
    del: function (path, options) {
      return request(path, Object.assign({ method: "DELETE" }, options));
    },

    /** Categories, memoised in sessionStorage — read by the navbar + ticker. */
    categories: function (force) {
      var KEY = "ss-categories";
      if (!force) {
        try {
          var cached = sessionStorage.getItem(KEY);
          if (cached) {
            var parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) return Promise.resolve(parsed);
          }
        } catch (e) {}
      }
      return Api.get("/article/categories/").then(function (data) {
        var list = unwrap(data);
        try {
          sessionStorage.setItem(KEY, JSON.stringify(list));
        } catch (e) {}
        return list;
      });
    },
    /** All articles, memoised for the life of the page. */
    allArticles: function (force) {
      if (!force && Api._all) return Promise.resolve(Api._all);
      return Api.articles().then(function (data) {
        Api._all = unwrap(data);
        return Api._all;
      });
    },
    articles: function (category) {
      return Api.get("/article/list/" + (category ? "?category=" + encodeURIComponent(category) : ""))
        .then(unwrap);
    },
    /** Stories carrying a given tag (matched on tag slug or name). */
    articlesByTag: function (tag) {
      return Api.get("/article/list/?tag=" + encodeURIComponent(tag)).then(unwrap);
    },
    /** Paged feed: `articlesPage(2, 12)` resolves to the DRF envelope. */
    articlesPage: function (page, pageSize, params) {
      var query = ["page=" + (page || 1)];
      if (pageSize !== undefined && pageSize !== null) query.push("page_size=" + pageSize);
      if (params) {
        Object.keys(params).forEach(function (key) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
          }
        });
      }
      return Api.get("/article/list/?" + query.join("&")).then(function (data) {
        return pageInfo(data) || { count: unwrap(data).length, results: unwrap(data), next: null, previous: null, page: 1 };
      });
    },
    article: function (id) {
      return Api.get("/article/list/" + id + "/");
    },
    related: function (id) {
      return Api.get("/article/list/" + id + "/related/").then(unwrap);
    },
    trending: function () {
      return Api.get("/article/list/trending/").then(unwrap);
    },
    search: function (term) {
      return Api.get("/article/list/search/?q=" + encodeURIComponent(term || ""));
    },
    reviews: function (articleId) {
      return Api.get("/article/" + articleId + "/reviews/").then(unwrap);
    },
    addReview: function (articleId, payload) {
      return Api.post("/article/" + articleId + "/reviews/", payload);
    },
    createArticle: function (payload) {
      return Api.post("/article/list/", payload);
    },
    updateArticle: function (id, payload) {
      return Api.patch("/article/list/" + id + "/", payload);
    },
    deleteArticle: function (id) {
      return Api.del("/article/list/" + id + "/");
    },
    createCategory: function (name) {
      return Api.post("/article/categories/", { name: name });
    },
    user: function (id) {
      return Api.get("/user/list/" + id + "/");
    },
    isSuperuser: function (id) {
      return Api.get("/user/" + id + "/is_superuser/");
    },
    login: function (username, password) {
      return Api.post("/user/login/", { username: username, password: password });
    },
    register: function (payload) {
      return Api.post("/user/register/", payload);
    },
    /** Delete the token server-side, then the caller clears local state. */
    logout: function () {
      return Api.post("/user/logout/", {});
    },

    /* --- account / profile --- */
    me: function () {
      return Api.get("/user/me/");
    },
    updateMe: function (payload) {
      return Api.patch("/user/me/", payload);
    },
    deleteMe: function () {
      return Api.del("/user/me/delete/");
    },
    /** `avatar` may be a File (upload) or null (clear). Multipart request. */
    setAvatar: function (avatar) {
      var form = new FormData();
      if (avatar) form.append("avatar", avatar);
      else form.append("avatar", "");
      return Api.post("/user/me/avatar/", form);
    },
    changePassword: function (payload) {
      return Api.post("/user/password/change/", payload);
    },
    requestPasswordReset: function (email) {
      return Api.post("/user/password/reset/", { email: email });
    },
    confirmPasswordReset: function (payload) {
      return Api.post("/user/password/reset/confirm/", payload);
    },
    /** Headline numbers for the editorial dashboard (editors only). */
    userStats: function () {
      return Api.get("/user/stats/");
    },

    /* --- tags --- */
    tags: function () {
      return Api.get("/article/tags/").then(unwrap);
    },

    /* --- article lifecycle (editors) --- */
    publish: function (id, payload) {
      return Api.post("/article/list/" + id + "/publish/", payload || {});
    },
    archive: function (id, payload) {
      return Api.post("/article/list/" + id + "/archive/", payload || {});
    },
    feature: function (id, isFeatured) {
      return Api.post("/article/list/" + id + "/feature/", isFeatured === undefined ? {} : { is_featured: isFeatured });
    },
    registerView: function (id) {
      return Api.post("/article/list/" + id + "/view/", {});
    },
    /** Editorial dashboard: article + engagement counts. */
    stats: function () {
      return Api.get("/article/stats/");
    },

    /* --- bookmarks --- */
    toggleBookmark: function (id) {
      return Api.post("/article/list/" + id + "/bookmark/", {});
    },
    bookmarks: function () {
      return Api.get("/article/bookmarks/").then(unwrap);
    },

    /* --- comments --- */
    comments: function (params) {
      var query = [];
      Object.keys(params || {}).forEach(function (key) {
        var value = params[key];
        if (value !== undefined && value !== null && value !== "") {
          query.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
      });
      return Api.get("/article/comments/" + (query.length ? "?" + query.join("&") : "")).then(unwrap);
    },
    addComment: function (payload) {
      return Api.post("/article/comments/", payload);
    },
    updateComment: function (id, payload) {
      return Api.patch("/article/comments/" + id + "/", payload);
    },
    deleteComment: function (id) {
      return Api.del("/article/comments/" + id + "/");
    },
    approveComment: function (id, note) {
      return Api.post("/article/comments/" + id + "/approve/", note ? { note: note } : {});
    },
    rejectComment: function (id, note) {
      return Api.post("/article/comments/" + id + "/reject/", note ? { note: note } : {});
    },
    /** Comments awaiting a decision (editors only). */
    commentQueue: function () {
      return Api.get("/article/comments/queue/");
    },
  };

  /* ---------------------------------------------------------
     Session
     --------------------------------------------------------- */
  var Session = {
    token: token,
    userId: userId,
    isLoggedIn: function () {
      return !!(token() && userId());
    },
    save: function (t, id) {
      try {
        localStorage.setItem("token", t);
        localStorage.setItem("user_id", id);
      } catch (e) {}
    },
    clear: function () {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
      } catch (e) {}
    },
    /** Cache the superuser check for the life of the page. */
    isAdmin: function () {
      if (Session._admin !== undefined) return Promise.resolve(Session._admin);
      if (!Session.isLoggedIn()) return Promise.resolve((Session._admin = false));
      return Api.isSuperuser(userId())
        .then(function (data) {
          Session._admin = !!(data && data.is_superuser);
          return Session._admin;
        })
        .catch(function () {
          Session._admin = false;
          return false;
        });
    },
    /** Redirect to login when the visitor is not signed in. */
    requireLogin: function () {
      if (Session.isLoggedIn()) return true;
      var here = window.location.pathname.split("/").pop() + window.location.search;
      window.location.href = "login.html?next=" + encodeURIComponent(here);
      return false;
    },
  };

  /* ---------------------------------------------------------
     Formatting
     --------------------------------------------------------- */
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function fmtDateTime(value) {
    var d = new Date(value);
    if (isNaN(d)) return "—";
    return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  function fmtDateTimeFull(value) {
    var d = new Date(value);
    if (isNaN(d)) return "—";
    var h = d.getHours();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    var m = String(d.getMinutes()).padStart(2, "0");
    return fmtDateTime(value) + " at " + h + ":" + m + " " + ampm;
  }

  /** "3 hours ago", "just now", … */
  function fmtRelative(value) {
    var d = new Date(value);
    if (isNaN(d)) return "";
    var secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 45) return "just now";
    var table = [
      [60, "second", 1],
      [3600, "minute", 60],
      [86400, "hour", 3600],
      [604800, "day", 86400],
      [2629800, "week", 604800],
      [31557600, "month", 2629800],
      [Infinity, "year", 31557600],
    ];
    for (var i = 0; i < table.length; i++) {
      if (secs < table[i][0]) {
        var n = Math.max(1, Math.floor(secs / table[i][2]));
        return n + " " + table[i][1] + (n > 1 ? "s" : "") + " ago";
      }
    }
    return fmtDateTime(value);
  }

  /** Rough read time from a body of text. */
  function readTime(text) {
    var words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200)) + " min read";
  }

  function excerpt(text, maxChars) {
    var clean = String(text || "").replace(/\s+/g, " ").trim();
    if (clean.length <= maxChars) return clean;
    var cut = clean.slice(0, maxChars);
    var lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
  }

  function initials(name) {
    var parts = String(name || "?").trim().split(/[\s._-]+/).filter(Boolean);
    if (!parts.length) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }

  /** Deterministic cover style + monogram so every article looks distinct. */
  var COVERS = ["brand", "ocean", "forest", "plum", "amber", "slate"];
  function hash(text) {
    var h = 0;
    var s = String(text || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function coverClass(article) {
    if (!article) return "card__media--" + COVERS[0];
    return "card__media--" + COVERS[hash((article.headline || "") + article.id) % COVERS.length];
  }
  function monogram(article) {
    if (!article) return "SS";
    var cats = article.categories || [];
    var source = cats.length ? cats[0] : article.headline || "";
    var words = String(source).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "SS";
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  /* ---------------------------------------------------------
     DOM helpers
     --------------------------------------------------------- */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) node.innerHTML = html;
    return node;
  }
  /** Escape untrusted values before interpolating into innerHTML. */
  function esc(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  var ICONS = {
    success: '<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"/></svg>',
    error: '<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>',
    info: '<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.25v2.25a.75.75 0 0 0 1.5 0V10a1 1 0 0 0-1-1H9Z" clip-rule="evenodd"/></svg>',
  };

  function toastStack() {
    var stack = document.getElementById("toast-stack");
    if (!stack) {
      stack = el("div", { id: "toast-stack", class: "toast-stack", role: "status", "aria-live": "polite" });
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(message, type, ms) {
    type = type || "info";
    var node = el(
      "div",
      { class: "toast toast--" + type },
      '<span class="toast__icon">' + (ICONS[type] || ICONS.info) + "</span><span>" + esc(message) + "</span>"
    );
    toastStack().appendChild(node);
    var life = ms || (type === "error" ? 6000 : 3800);
    setTimeout(function () {
      node.classList.add("is-leaving");
      setTimeout(function () { node.remove(); }, 220);
    }, life);
    return node;
  }

  /* ---------------------------------------------------------
     Confirm dialog (replaces window.confirm)
     --------------------------------------------------------- */
  function confirmDialog(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var wrap = el("div", { class: "modal", role: "dialog", "aria-modal": "true" });
      wrap.innerHTML =
        '<div class="modal__scrim" data-close></div>' +
        '<div class="modal__panel">' +
        '<h3 class="modal__title">' + esc(opts.title || "Are you sure?") + "</h3>" +
        '<p class="modal__text">' + esc(opts.text || "") + "</p>" +
        '<div class="modal__actions">' +
        '<button type="button" class="btn btn--soft" data-close>' + esc(opts.cancelText || "Cancel") + "</button>" +
        '<button type="button" class="btn ' + (opts.danger ? "btn--danger" : "btn--primary") + '" data-ok>' +
        esc(opts.confirmText || "Confirm") +
        "</button></div></div>";
      document.body.appendChild(wrap);

      var prevFocus = document.activeElement;
      var ok = wrap.querySelector("[data-ok]");
      ok.focus();

      function done(value) {
        document.removeEventListener("keydown", onKey);
        wrap.remove();
        if (prevFocus && prevFocus.focus) prevFocus.focus();
        resolve(value);
      }
      function onKey(e) {
        if (e.key === "Escape") done(false);
        if (e.key === "Enter" && document.activeElement === ok) done(true);
      }
      wrap.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-close")) done(false);
        if (e.target === ok) done(true);
      });
      document.addEventListener("keydown", onKey);
    });
  }

  /* ---------------------------------------------------------
     Loading indicators (legacy spinner + modern progress bar)
     --------------------------------------------------------- */
  function progressBar() {
    var bar = document.getElementById("progress-bar");
    if (!bar) {
      bar = el("div", { id: "progress-bar", class: "progress-bar" }, '<div class="progress-bar__fill"></div>');
      document.body.appendChild(bar);
    }
    return bar;
  }

  var progressTimer = null;
  function showSpinner() {
    var spinner = document.getElementById("loading-spinner");
    if (spinner) spinner.classList.remove("hidden");
    var bar = progressBar();
    var fill = bar.firstElementChild;
    bar.classList.add("is-active");
    var value = 12;
    fill.style.width = value + "%";
    clearInterval(progressTimer);
    progressTimer = setInterval(function () {
      value = Math.min(value + Math.random() * 12, 88);
      fill.style.width = value + "%";
    }, 320);
  }

  function hideSpinner() {
    var spinner = document.getElementById("loading-spinner");
    if (spinner) spinner.classList.add("hidden");
    clearInterval(progressTimer);
    var bar = document.getElementById("progress-bar");
    if (!bar) return;
    bar.firstElementChild.style.width = "100%";
    setTimeout(function () {
      bar.classList.remove("is-active");
      bar.firstElementChild.style.width = "0%";
    }, 320);
  }

  /* ---------------------------------------------------------
     Loading / empty states
     --------------------------------------------------------- */
  function skeletonCards(count, cols) {
    var out = "";
    for (var i = 0; i < count; i++) {
      out +=
        '<div class="sk--card">' +
        '<div class="sk sk--media"></div>' +
        '<div style="padding:1.1rem;display:flex;flex-direction:column;gap:.6rem">' +
        '<div class="sk sk--title" style="width:88%"></div>' +
        '<div class="sk sk--title" style="width:60%"></div>' +
        '<div class="sk sk--line"></div>' +
        '<div class="sk sk--line" style="width:78%"></div>' +
        "</div></div>";
    }
    return '<div class="grid-cards ' + (cols ? "grid-cards--" + cols : "") + '">' + out + "</div>";
  }

  function emptyState(opts) {
    opts = opts || {};
    return (
      '<div class="empty-state">' +
      '<span class="empty-state__icon">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="24" height="24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>' +
      "</svg></span>" +
      "<h3>" + esc(opts.title || "Nothing here yet") + "</h3>" +
      "<p style='margin:0'>" + esc(opts.text || "") + "</p>" +
      (opts.action || "") +
      "</div>"
    );
  }

  function errorState(opts) {
    opts = opts || {};
    return emptyState({
      title: opts.title || "Could not load content",
      text: opts.text || "The newsroom service did not respond. Check your connection and try again.",
      action:
        '<button type="button" class="btn btn--primary btn--sm" onclick="location.reload()" style="margin-top:.5rem">Retry</button>',
    });
  }

  /* ---------------------------------------------------------
     Button loading state
     --------------------------------------------------------- */
  function setLoading(button, loading) {
    if (!button) return;
    if (loading) {
      if (!button.querySelector(".btn__spinner")) {
        button.appendChild(el("span", { class: "btn__spinner" }));
      }
      button.classList.add("is-loading");
      button.disabled = true;
    } else {
      button.classList.remove("is-loading");
      button.disabled = false;
      var s = button.querySelector(".btn__spinner");
      if (s) s.remove();
    }
  }

  /* ---------------------------------------------------------
     Shared partials data
     --------------------------------------------------------- */
  function logout() {
    var finish = function () {
      Session.clear();
      toast("You have been signed out.", "info");
      setTimeout(function () {
        window.location.href = "login.html";
      }, 400);
    };
    // Revoke the token server-side; succeed or fail, always clear locally.
    if (Session.isLoggedIn()) {
      Api.logout().then(finish, finish);
    } else {
      finish();
    }
  }

  window.SS = {
    Api: Api,
    Session: Session,
    $: $,
    $$: $$,
    el: el,
    esc: esc,
    param: param,
    fmtDateTime: fmtDateTime,
    fmtDateTimeFull: fmtDateTimeFull,
    fmtRelative: fmtRelative,
    readTime: readTime,
    excerpt: excerpt,
    initials: initials,
    coverClass: coverClass,
    monogram: monogram,
    toast: toast,
    confirm: confirmDialog,
    setLoading: setLoading,
    skeletonCards: skeletonCards,
    emptyState: emptyState,
    errorState: errorState,
    unwrap: unwrap,
    pageInfo: pageInfo,
    icons: ICONS,
    logout: logout,
  };

  // Legacy globals used by existing page scripts.
  window.showSpinner = showSpinner;
  window.hideSpinner = hideSpinner;
  window.handleLogout = logout;
})();
