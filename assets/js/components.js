/**
 * SOMOY SONDHAN — shared layout components
 * ---------------------------------------------------------------
 * Renders the site header (with theme switch, account menu, mobile
 * drawer and category mega-menu), the breaking-news ticker and the
 * footer. Every page includes this file once; no markup is duplicated.
 */
(function () {
  "use strict";

  var I = {
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    tag: '<path d="M20.59 13.41 12 22l-9-9V4a1 1 0 0 1 1-1h9l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    spark: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  };

  function icon(name, size, cls) {
    var body = I[name] || "";
    return (
      '<svg class="' + (cls || "") + '" width="' + (size || 18) + '" height="' + (size || 18) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>"
    );
  }

  function pageName() {
    var file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (file === "" || file === "/") file = "index.html";
    return file;
  }

  /* ---------------------------------------------------------
     Header
     --------------------------------------------------------- */
  /** Sections shared by the mega-menu, the drawer, the ticker and the footer. */
  var categories = [];

  function buildHeader() {
    var file = pageName();
    var isHome = file === "index.html";

    function navLink(href, label, active, extra) {
      return (
        '<a class="nav-link' + (active ? " is-active" : "") + '" href="' + href + '"' +
        (active ? ' aria-current="page"' : "") + ">" + label + (extra || "") + "</a>"
      );
    }

    var header = document.createElement("header");
    header.className = "site-header";
    header.id = "site-header";
    header.innerHTML =
      '<div class="shell site-header__bar">' +
      '<a class="brand" href="index.html" aria-label="Somoy Sondhan home">' +
      '<span class="brand__mark" aria-hidden="true">স</span>' +
      '<span class="brand__name">SOMOY <span>SONDHAN</span><span class="brand__tag">Truth in every moment</span></span>' +
      "</a>" +
      '<nav class="nav-links" aria-label="Primary">' +
      navLink("index.html", "Home", isHome) +
      '<div class="menu" id="cat-menu">' +
      '<button type="button" class="nav-link" aria-expanded="false" aria-haspopup="true">Sections ' +
      icon("chevron", 14) +
      "</button>" +
      '<div class="menu__panel" id="cat-menu-panel" role="menu" style="min-width:17rem"></div>' +
      "</div>" +
      '<a class="nav-link" href="index.html#trending">Trending</a>' +
      "</nav>" +
      '<div class="header-actions">' +
      '<button type="button" class="icon-btn" id="theme-toggle" aria-label="Toggle theme">' +
      '<span class="theme-icon-dark">' + icon("moon", 17) + "</span>" +
      '<span class="theme-icon-light" hidden>' + icon("sun", 17) + "</span>" +
      "</button>" +
      '<span id="header-account" class="header-account"></span>' +
      '<button type="button" class="icon-btn icon-btn--ghost only-mobile" id="drawer-open" aria-label="Open menu" aria-controls="mobile-drawer">' +
      icon("menu", 20) +
      "</button>" +
      "</div>" +
      '<div class="read-progress" id="read-progress" aria-hidden="true"></div>' +
      "</div>";

    document.body.insertBefore(header, document.body.firstChild);
    return header;
  }

  function accountMarkup(admin) {
    return (
      '<a class="btn btn--ghost btn--sm" href="login.html">Sign in</a>' +
      '<a class="btn btn--primary btn--sm" href="registration.html">Get started</a>' +
      (admin
        ? '<a class="btn btn--soft btn--sm" href="addArticle.html">' +
          icon("plus", 15) +
          "<span>Write</span></a>"
        : "")
    );
  }

  function accountSignedInMarkup(name, admin) {
    return (
      (admin
        ? '<a class="btn btn--soft btn--sm" href="addArticle.html">' + icon("plus", 15) + "<span>Write</span></a>"
        : "") +
      '<div class="menu" id="user-menu">' +
      '<button type="button" class="icon-btn" style="padding:2px;width:2.4rem;height:2.4rem" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">' +
      '<span class="avatar avatar--sm" id="user-avatar">' + "</span>" +
      "</button>" +
      '<div class="menu__panel" role="menu" style="min-width:14rem">' +
      '<div class="menu__head"><p style="margin:0;font-weight:700;font-size:.9rem" id="user-menu-name"></p>' +
      '<p style="margin:.15rem 0 0;font-size:.75rem;color:rgb(var(--text-subtle))">' +
      (admin ? "Editor account" : "Reader account") +
      "</p></div>" +
      '<a class="menu__item" role="menuitem" href="profile.html">' + icon("user", 16) + "My profile</a>" +
      (admin
        ? '<a class="menu__item" role="menuitem" href="addArticle.html">' + icon("plus", 16) + "New article</a>" +
          '<a class="menu__item" role="menuitem" href="addCategory.html">' + icon("tag", 16) + "New section</a>"
        : "") +
      '<div class="menu__divider"></div>' +
      '<a class="menu__item menu__item--danger" role="menuitem" href="#" data-logout>' + icon("logout", 16) + "Sign out</a>" +
      "</div></div>"
    );
  }

  function clipLabel(name, max) {
    var s = String(name || "");
    return s.length > max ? s.slice(0, max - 1).trim() + "…" : s;
  }

  function fillCategoryMenu(cats) {
    categories = cats || [];
    var panel = document.getElementById("cat-menu-panel");
    if (!panel) return;
    panel.innerHTML =
      '<a class="menu__item" role="menuitem" href="index.html">' + icon("home", 16) + "All stories</a>" +
      '<div class="menu__divider"></div>' +
      categories
        .map(function (c) {
          var slug = String(c.name || "").toLowerCase();
          return (
            '<a class="menu__item" role="menuitem" href="index.html?category=' + encodeURIComponent(slug) + '">' +
            icon("tag", 16) + "<span>" + window.SS.esc(clipLabel(c.name, 26)) + "</span></a>"
          );
        })
        .join("");
  }

  function bindHeader() {
    var header = document.getElementById("site-header");
    if (!header) return;

    // Sticky shadow
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Theme switch (two icons swapped by state)
    var themeBtn = document.getElementById("theme-toggle");
    function syncThemeIcons() {
      var dark = window.SSTheme.current() === "dark";
      var moon = themeBtn.querySelector(".theme-icon-dark");
      var sun = themeBtn.querySelector(".theme-icon-light");
      if (moon) moon.hidden = !dark;
      if (sun) sun.hidden = dark;
    }
    syncThemeIcons();
    window.addEventListener("ss:themechange", syncThemeIcons);
    themeBtn.addEventListener("click", function () {
      window.SSTheme.toggle();
      window.SS.toast(
        window.SSTheme.current() === "dark" ? "Dark theme on" : "Light theme on",
        "info",
        1600
      );
    });

    // Dropdown menus (category + account)
    var menus = window.SS.$$(".menu", header);
    menus.forEach(function (menu) {
      var trigger = menu.querySelector("button");
      if (!trigger) return;
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        menus.forEach(function (other) {
          if (other !== menu) {
            other.classList.remove("is-open");
            var t = other.querySelector("button");
            if (t) t.setAttribute("aria-expanded", "false");
          }
        });
      });
    });
    document.addEventListener("click", function () {
      menus.forEach(function (m) {
        m.classList.remove("is-open");
        var t = m.querySelector("button");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        menus.forEach(function (m) { m.classList.remove("is-open"); });
        closeDrawer();
      }
    });
    // Re-query menus once the account area is rendered.
    document.addEventListener("ss:accountrendered", function () {
      var userMenu = document.getElementById("user-menu");
      if (!userMenu) return;
      var trigger = userMenu.querySelector("button");
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = userMenu.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    header.addEventListener("click", function (e) {
      var logout = e.target.closest("[data-logout]");
      if (logout) {
        e.preventDefault();
        window.SS.logout();
      }
    });
  }

  /* ---------------------------------------------------------
     Mobile drawer
     --------------------------------------------------------- */
  function buildDrawer() {
    var drawer = document.createElement("div");
    drawer.className = "drawer";
    drawer.id = "mobile-drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML =
      '<div class="drawer__scrim" data-close></div>' +
      '<aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Site menu">' +
      '<div class="drawer__head">' +
      '<span class="brand" style="font-size:1rem"><span class="brand__mark" aria-hidden="true">স</span>' +
      '<span class="brand__name">SOMOY <span>SONDHAN</span></span></span>' +
      '<button type="button" class="icon-btn icon-btn--ghost" id="drawer-close" aria-label="Close menu">' +
      icon("close", 20) + "</button></div>" +
      '<div class="drawer__body" id="drawer-body"></div>' +
      "</aside>";
    document.body.appendChild(drawer);
    return drawer;
  }

  function fillDrawer() {
    var body = document.getElementById("drawer-body");
    if (!body) return;
    var user = window.SS.Session;
    var admin = window.SS.Session._admin === true;
    var file = pageName();
    var cats = window.__ssCategories || [];

    var links =
      '<a class="nav-link' + (file === "index.html" ? " is-active" : "") + '" href="index.html">' + icon("home", 17) + "Home</a>" +
      '<a class="nav-link" href="index.html#trending">' + icon("trending", 17) + "Trending</a>";

    if (user.isLoggedIn()) {
      links +=
        '<a class="nav-link' + (file === "profile.html" ? " is-active" : "") + '" href="profile.html">' + icon("user", 17) + "My profile</a>";
      if (admin) {
        links +=
          '<a class="nav-link' + (file === "addArticle.html" ? " is-active" : "") + '" href="addArticle.html">' + icon("plus", 17) + "New article</a>" +
          '<a class="nav-link' + (file === "addCategory.html" ? " is-active" : "") + '" href="addCategory.html">' + icon("tag", 17) + "New section</a>";
      }
      links += '<a class="nav-link" href="#" data-logout>' + icon("logout", 17) + "Sign out</a>";
    } else {
      links +=
        '<a class="nav-link' + (file === "login.html" ? " is-active" : "") + '" href="login.html">' + icon("user", 17) + "Sign in</a>" +
        '<a class="nav-link' + (file === "registration.html" ? " is-active" : "") + '" href="registration.html">' + icon("spark", 17) + "Create account</a>";
    }

    body.innerHTML =
      '<div class="drawer__section">Menu</div>' + links +
      (cats.length
        ? '<div class="drawer__section">Sections</div>' +
          cats
            .map(function (c) {
              return (
                '<a class="nav-link" href="index.html?category=' + encodeURIComponent(String(c.name).toLowerCase()) + '">' +
                icon("tag", 16) + "<span>" + window.SS.esc(c.name) + "</span></a>"
              );
            })
            .join("")
        : "");
  }

  function openDrawer() {
    var drawer = document.getElementById("mobile-drawer");
    if (!drawer) return;
    fillDrawer();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var close = document.getElementById("drawer-close");
    if (close) close.focus();
  }

  function closeDrawer() {
    var drawer = document.getElementById("mobile-drawer");
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindDrawer() {
    var open = document.getElementById("drawer-open");
    if (open) open.addEventListener("click", openDrawer);
    var drawer = document.getElementById("mobile-drawer");
    if (!drawer) return;
    var close = document.getElementById("drawer-close");
    if (close) close.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) closeDrawer();
      if (e.target.closest("a[href]") && !e.target.closest("[data-logout]")) closeDrawer();
      if (e.target.closest("[data-logout]")) {
        e.preventDefault();
        window.SS.logout();
      }
    });
  }

  /* ---------------------------------------------------------
     Account area
     --------------------------------------------------------- */
  function renderAccount() {
    var slot = document.getElementById("header-account");
    if (!slot) return;
    var S = window.SS;

    if (!S.Session.isLoggedIn()) {
      slot.innerHTML = accountMarkup(false);
      document.dispatchEvent(new CustomEvent("ss:accountrendered"));
      return;
    }

    S.Api.user(S.Session.userId())
      .then(function (user) {
        var name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Reader";
        var admin = S.Session._admin === true;
        slot.innerHTML = accountSignedInMarkup(name, admin);
        var avatar = document.getElementById("user-avatar");
        if (avatar) avatar.textContent = S.initials(name);
        var label = document.getElementById("user-menu-name");
        if (label) label.textContent = name;
        document.dispatchEvent(new CustomEvent("ss:accountrendered"));
      })
      .catch(function () {
        slot.innerHTML = accountMarkup(S.Session._admin === true);
        document.dispatchEvent(new CustomEvent("ss:accountrendered"));
      });
  }

  /* ---------------------------------------------------------
     Ticker
     --------------------------------------------------------- */
  function buildTicker() {
    var host = document.getElementById("ticker");
    if (!host) return;
    host.className = "ticker";
    host.innerHTML =
      '<div class="shell ticker__inner">' +
      '<span class="ticker__label"><span class="dot"></span>Live</span>' +
      '<div class="ticker__viewport"><div class="ticker__track" id="ticker-track">' +
      '<span style="color:rgb(var(--text-subtle));font-size:.82rem">Loading the latest headlines…</span>' +
      "</div></div></div>";
  }

  function fillTicker() {
    var track = document.getElementById("ticker-track");
    if (!track) return;
    window.SS.Api.allArticles()
      .then(function (articles) {
        var top = (articles || []).slice(0, 8);
        if (!top.length) {
          track.innerHTML = '<span style="color:rgb(var(--text-subtle));font-size:.82rem">No headlines yet — check back soon.</span>';
          return;
        }
        var items = top
          .map(function (a) {
            return '<a href="article_detail.html?id=' + a.id + '">' + window.SS.esc(a.headline) + "</a>";
          })
          .join("");
        // Duplicated so the marquee loops seamlessly.
        track.innerHTML = items + items;
      })
      .catch(function () {
        track.innerHTML = "";
        var host = document.getElementById("ticker");
        if (host) host.style.display = "none";
      });
  }

  /* ---------------------------------------------------------
     Footer
     --------------------------------------------------------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var cats = window.__ssCategories || [];
    var year = new Date().getFullYear();

    var sectionLinks = cats.length
      ? cats
          .slice(0, 5)
          .map(function (c) {
            return '<li><a href="index.html?category=' + encodeURIComponent(String(c.name).toLowerCase()) + '">' + window.SS.esc(c.name) + "</a></li>";
          })
          .join("")
      : '<li><a href="index.html">All stories</a></li>';

    host.className = "site-footer";
    host.innerHTML =
      '<div class="shell site-footer__grid">' +
      "<div>" +
      '<a class="brand" href="index.html"><span class="brand__mark" aria-hidden="true">স</span>' +
      '<span class="brand__name">SOMOY <span>SONDHAN</span><span class="brand__tag">Truth in every moment</span></span></a>' +
      '<p style="margin:1rem 0 0;max-width:38ch;font-size:.875rem;line-height:1.7;color:rgb(var(--text-muted))">' +
      "Independent journalism from Bangladesh and beyond — reporting that stays with you long after the headline." +
      "</p>" +
      '<div style="display:flex;gap:.5rem;margin-top:1.1rem">' +
      '<a class="icon-btn" href="#" aria-label="Email us">' + icon("mail", 17) + "</a>" +
      '<a class="icon-btn" href="#" aria-label="Source code">' + icon("github", 17) + "</a>" +
      "</div></div>" +
      "<div><h4>Sections</h4><ul style='list-style:none;margin:0;padding:0'>" + sectionLinks + "</ul></div>" +
      "<div><h4>Account</h4><ul style='list-style:none;margin:0;padding:0'>" +
      '<li><a href="login.html">Sign in</a></li>' +
      '<li><a href="registration.html">Create account</a></li>' +
      '<li><a href="profile.html">My profile</a></li>' +
      '<li><a href="index.html#trending">Trending</a></li>' +
      "</ul></div>" +
      "<div><h4>Company</h4><ul style='list-style:none;margin:0;padding:0'>" +
      '<li><a href="#">About us</a></li><li><a href="#">Careers</a></li>' +
      '<li><a href="#">Privacy policy</a></li><li><a href="#">Terms of service</a></li>' +
      "</ul></div>" +
      "</div>" +
      '<div class="shell site-footer__bottom">' +
      "<span>&copy; " + year + " Somoy Sondhan. All rights reserved.</span>" +
      '<span style="display:flex;gap:1rem"><a href="#" style="color:inherit;text-decoration:none">Privacy</a>' +
      '<a href="#" style="color:inherit;text-decoration:none">Terms</a>' +
      '<a href="#" style="color:inherit;text-decoration:none">Contact</a></span>' +
      "</div>";
  }

  /* ---------------------------------------------------------
     Page header (breadcrumb + title) used by inner pages
     --------------------------------------------------------- */
  function buildPageHeader() {
    var host = document.getElementById("page-header");
    if (!host || !window.SS_PAGE || !window.SS_PAGE.title) return;
    var crumbs = window.SS_PAGE.crumbs || [];
    host.className = "shell section section--tight";
    host.innerHTML =
      (crumbs.length
        ? '<nav aria-label="Breadcrumb" style="display:flex;gap:.5rem;align-items:center;font-size:.8rem;font-weight:600;color:rgb(var(--text-subtle));flex-wrap:wrap;margin-bottom:.9rem">' +
          crumbs
            .map(function (crumb, i) {
              var last = i === crumbs.length - 1;
              return (
                (last
                  ? "<span>" + window.SS.esc(crumb.label) + "</span>"
                  : "<a href='" + crumb.href + "' style='color:inherit;text-decoration:none'>" + window.SS.esc(crumb.label) + "</a>") +
                (last ? "" : "<span>/</span>")
              );
            })
            .join("") +
          "</nav>"
        : "") +
      '<div class="section-head" style="margin-bottom:0">' +
      "<div>" +
      (window.SS_PAGE.eyebrow
        ? '<p class="section-head__eyebrow">' + window.SS.esc(window.SS_PAGE.eyebrow) + "</p>"
        : "") +
      '<h1 class="section-head__title">' + window.SS.esc(window.SS_PAGE.title) + "</h1>" +
      (window.SS_PAGE.subtitle
        ? '<p style="margin:.6rem 0 0;font-size:.92rem;color:rgb(var(--text-muted));max-width:60ch">' +
          window.SS.esc(window.SS_PAGE.subtitle) + "</p>"
        : "") +
      "</div>" +
      (window.SS_PAGE.action || "") +
      "</div>";
  }

  /* ---------------------------------------------------------
     Reading progress (article pages)
     --------------------------------------------------------- */
  function bindReadProgress(targetSelector) {
    var bar = document.getElementById("read-progress");
    var target = document.querySelector(targetSelector || "[data-read-target]");
    if (!bar || !target) return;
    var update = function () {
      var rect = target.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function init() {
    buildHeader();
    buildDrawer();
    buildTicker();
    bindHeader();
    bindDrawer();

    window.SS.Api.categories()
      .then(function (cats) {
        window.__ssCategories = cats || [];
        fillCategoryMenu(window.__ssCategories);
        fillDrawer();
        buildFooter();
      })
      .catch(function (err) {
        // The chrome around the page must never break the page itself.
        console.warn("[somoy-sondhan] could not load sections:", err && err.message);
        window.__ssCategories = [];
        buildFooter();
      });

    fillTicker();
    buildPageHeader();

    // Admin flag first, then the account chip (so "Write" appears correctly).
    window.SS.Session.isAdmin().then(renderAccount);

    if (window.SS_PAGE && window.SS_PAGE.readTarget) bindReadProgress(window.SS_PAGE.readTarget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.SSComponents = {
    icon: icon,
    pageName: pageName,
    refreshFooter: buildFooter,
  };
})();
