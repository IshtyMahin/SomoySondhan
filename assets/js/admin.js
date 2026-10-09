/**
 * SOMOY SONDHAN — editorial tools
 * ---------------------------------------------------------------
 * Powers addArticle.html, edit_article.html and addCategory.html:
 * category chip selection, live counters, unsaved-work guards and
 * publishing. Legacy globals (handleSubmit, handleCategorySubmit,
 * handleEditSubmit) are preserved.
 */
(function () {
  "use strict";

  var S = window.SS;
  var DRAFT_KEY = "ss-draft-article";

  /* ---------------------------------------------------------
     Category chips
     --------------------------------------------------------- */
  function renderChips(host, categories, selected) {
    selected = selected || [];
    if (!host) return;
    if (!categories.length) {
      host.innerHTML =
        '<div class="alert alert--info" style="margin:0">No sections exist yet. ' +
        "<a class='link-underline' href='addCategory.html'>Create the first section</a> before publishing.</div>";
      return;
    }
    host.classList.add("chip-group");
    host.innerHTML = categories
      .map(function (category) {
        var isOn = selected.some(function (name) {
          return String(name).toLowerCase() === String(category.name).toLowerCase();
        });
        return (
          '<label class="chip">' +
          '<input type="checkbox" name="categories" value="' + S.esc(category.name) + '"' +
          (isOn ? " checked" : "") + ">" +
          S.esc(category.name) +
          "</label>"
        );
      })
      .join("");
  }

  function selectedCategories() {
    var host = document.getElementById("categories");
    if (!host) return [];
    return S.$$('input[name="categories"]:checked', host).map(function (input) {
      return input.getAttribute("value");
    });
  }

  /** "a, b ,c" -> ["a","b","c"] */
  function parseTags() {
    var input = document.getElementById("tags");
    if (!input) return [];
    return input.value
      .split(",")
      .map(function (t) { return t.trim(); })
      .filter(Boolean);
  }

  function value(id) {
    var node = document.getElementById(id);
    return node ? node.value.trim() : "";
  }

  function selectedCoverFile() {
    var input = document.getElementById("cover-image");
    return input && input.files && input.files.length ? input.files[0] : null;
  }

  /** Show a thumbnail of the chosen (or existing) cover image. */
  function bindCoverPreview(existingUrl) {
    var input = document.getElementById("cover-image");
    var host = document.getElementById("cover-preview");
    if (!host) return;
    function show(url) {
      host.innerHTML = url
        ? '<img src="' + S.esc(url) + '" alt="Cover preview" style="width:100%;max-width:22rem;border-radius:.9rem;display:block">'
        : "";
    }
    if (existingUrl) show(existingUrl);
    if (!input) return;
    input.addEventListener("change", function () {
      var file = selectedCoverFile();
      if (!file) { show(existingUrl || ""); return; }
      var reader = new FileReader();
      reader.onload = function () { show(reader.result); };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Build the request body for create/update. When a cover image is chosen we
   * must send multipart form data; otherwise plain JSON keeps things simple.
   */
  function buildArticlePayload() {
    var fields = {
      headline: value("headline"),
      body: value("body"),
      summary: value("summary"),
      cover_caption: value("cover-caption"),
      status: value("status") || "published",
      categories: selectedCategories(),
      tags: parseTags(),
    };
    var file = selectedCoverFile();
    if (!file) return fields;

    var form = new FormData();
    form.append("headline", fields.headline);
    form.append("body", fields.body);
    form.append("summary", fields.summary);
    form.append("cover_caption", fields.cover_caption);
    form.append("status", fields.status);
    fields.categories.forEach(function (c) { form.append("categories", c); });
    fields.tags.forEach(function (t) { form.append("tags", t); });
    form.append("cover_image", file);
    return form;
  }

  /* ---------------------------------------------------------
     Counters + autosave
     --------------------------------------------------------- */
  function bindCounter(inputId, counterId, max) {
    var input = document.getElementById(inputId);
    var counter = document.getElementById(counterId);
    if (!input || !counter) return;
    var update = function () {
      var len = input.value.length;
      counter.textContent = len + " / " + max;
      counter.style.color = len > max * 0.9 ? "rgb(var(--brand-500))" : "";
    };
    input.addEventListener("input", update);
    update();
  }

  function saveDraft() {
    var headline = document.getElementById("headline");
    var body = document.getElementById("body");
    if (!headline || !body) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          headline: headline.value,
          body: body.value,
          categories: selectedCategories(),
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {}
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
  }

  function restoreDraft() {
    if (!S.param("draft")) return;
    var raw;
    try {
      raw = localStorage.getItem(DRAFT_KEY);
    } catch (e) {
      return;
    }
    if (!raw) return;
    var draft = JSON.parse(raw);
    document.getElementById("headline").value = draft.headline || "";
    document.getElementById("body").value = draft.body || "";
    var host = document.getElementById("categories");
    if (host) {
      S.$$('input[name="categories"]', host).forEach(function (input) {
        input.checked = (draft.categories || []).some(function (name) {
          return String(name).toLowerCase() === String(input.getAttribute("value")).toLowerCase();
        });
      });
    }
    S.toast("Unsaved draft restored.", "info");
  }

  function bindDraftAutosave() {
    var form = document.getElementById("add-article-form");
    if (!form) return;
    ["headline", "body"].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.addEventListener("input", debounce(saveDraft, 600));
    });
    var host = document.getElementById("categories");
    if (host) host.addEventListener("change", saveDraft);

    window.addEventListener("beforeunload", function (e) {
      var headline = document.getElementById("headline");
      var body = document.getElementById("body");
      if (!headline || !submitting) return;
      if ((headline.value.trim() || body.value.trim()) && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  var submitting = false;
  var submitted = false;

  /* ---------------------------------------------------------
     Form errors
     --------------------------------------------------------- */
  function showErrors(containerId, message) {
    var box = document.getElementById(containerId);
    if (!box) return;
    if (!message) {
      box.textContent = "";
      box.className = "alert alert--error";
      return;
    }
    box.textContent = message;
    box.className = "alert alert--error";
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function apiMessage(err) {
    if (!err) return "Something went wrong.";
    if (err.data && typeof err.data === "object") {
      var keys = Object.keys(err.data);
      for (var i = 0; i < keys.length; i++) {
        var value = err.data[keys[i]];
        var text = Array.isArray(value) ? value[0] : value;
        if (typeof text === "string") return text;
      }
    }
    return err.message || "Something went wrong.";
  }

  /* ---------------------------------------------------------
     Add article
     --------------------------------------------------------- */
  function initAddArticle() {
    var form = document.getElementById("add-article-form");
    if (!form) return;

    S.Api.categories().then(function (categories) {
      renderChips(document.getElementById("categories"), categories || []);
      restoreDraft();
    });

    bindCounter("headline", "headline-count", 1000);
    bindCounter("body", "body-count", 20000);
    bindDraftAutosave();
    bindCoverPreview(null);

    var preview = document.getElementById("preview-btn");
    if (preview) {
      preview.addEventListener("click", function () {
        saveDraft();
        var headline = document.getElementById("headline").value;
        if (!headline.trim()) {
          S.toast("Write a headline first — then you can preview.", "error");
          return;
        }
        window.open("index.html", "_blank", "noopener");
      });
    }

    form.addEventListener("submit", handleSubmit);
  }

  var handleSubmit = function (event) {
    if (event) event.preventDefault();
    var headline = document.getElementById("headline").value.trim();
    var body = document.getElementById("body").value.trim();
    var categories = selectedCategories();
    var button = document.getElementById("publish-btn");

    showErrors("form-error", "");
    if (!headline) return showErrors("form-error", "A headline is required.");
    if (!body) return showErrors("form-error", "The article body cannot be empty.");
    if (!categories.length) return showErrors("form-error", "Select at least one section for this story.");

    submitting = true;
    S.setLoading(button, true);
    S.Api.createArticle(buildArticlePayload())
      .then(function (article) {
        submitted = true;
        clearDraft();
        S.toast("Article published.", "success");
        var target = article && article.id ? "article_detail.html?id=" + article.id : "index.html";
        setTimeout(function () {
          window.location.href = target;
        }, 600);
      })
      .catch(function (err) {
        submitting = false;
        S.setLoading(button, false);
        showErrors("form-error", apiMessage(err));
      });
  };

  /* ---------------------------------------------------------
     Add category
     --------------------------------------------------------- */
  function initAddCategory() {
    var form = document.getElementById("add-category-form");
    if (!form) return;

    var input = document.getElementById("category");
    var slugOut = document.getElementById("slug-preview");
    var counter = document.getElementById("category-count");

    var sync = function () {
      var value = input.value.trim();
      if (counter) counter.textContent = value.length + " / 200";
      if (slugOut) {
        slugOut.textContent = value
          ? "index.html?category=" +
            value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
          : "index.html?category=…";
      }
    };
    input.addEventListener("input", sync);
    sync();

    // Show what already exists so editors avoid duplicates.
    S.Api.categories().then(function (categories) {
      var host = document.getElementById("existing-sections");
      if (!host) return;
      if (!categories || !categories.length) {
        host.innerHTML = '<p style="margin:0;font-size:.85rem;color:rgb(var(--text-subtle))">No sections yet — this will be the first.</p>';
        return;
      }
      host.innerHTML =
        '<div class="chip-group">' +
        categories
          .map(function (c) {
            return (
              '<a class="pill" href="index.html?category=' +
              encodeURIComponent(String(c.name).toLowerCase()) + '">' + S.esc(c.name) + "</a>"
            );
          })
          .join("") +
        "</div>";
    });

    form.addEventListener("submit", handleCategorySubmit);
  }

  var handleCategorySubmit = function (event) {
    if (event) event.preventDefault();
    var input = document.getElementById("category");
    var name = input.value.trim();
    var button = document.getElementById("category-submit");

    showErrors("form-error", "");
    if (name.length < 2) return showErrors("form-error", "Give the section a name of at least two characters.");

    S.setLoading(button, true);
    S.Api.createCategory(name)
      .then(function () {
        try {
          sessionStorage.removeItem("ss-categories");
        } catch (e) {}
        S.toast("Section “" + name + "” created.", "success");
        submitted = true;
        setTimeout(function () {
          window.location.href = "index.html?category=" + encodeURIComponent(name.toLowerCase());
        }, 700);
      })
      .catch(function (err) {
        S.setLoading(button, false);
        showErrors("form-error", apiMessage(err));
      });
  };

  /* ---------------------------------------------------------
     Edit article
     --------------------------------------------------------- */
  function initEditArticle() {
    var form = document.getElementById("edit-article-form");
    if (!form) return;
    var articleId = S.param("id");
    if (!articleId) {
      showErrors("form-error", "This page needs an article id, for example edit_article.html?id=12.");
      return;
    }

    S.Api.article(articleId)
      .then(function (article) {
        document.getElementById("headline").value = article.headline || "";
        document.getElementById("body").value = article.body || "";
        var summaryEl = document.getElementById("summary");
        if (summaryEl) summaryEl.value = article.summary || "";
        var tagsEl = document.getElementById("tags");
        if (tagsEl) {
          tagsEl.value = (article.tags || [])
            .map(function (t) { return typeof t === "string" ? t : (t.name || t.slug || ""); })
            .filter(Boolean)
            .join(", ");
        }
        var captionEl = document.getElementById("cover-caption");
        if (captionEl) captionEl.value = article.cover_caption || "";
        var statusEl = document.getElementById("status");
        if (statusEl) statusEl.value = article.status || "published";
        bindCoverPreview(article.cover_image_url || null);
        var crumb = document.getElementById("article-crumb");
        if (crumb) {
          crumb.textContent = S.excerpt(article.headline, 60);
          crumb.href = "article_detail.html?id=" + article.id;
        }
        var view = document.getElementById("view-link");
        if (view) view.href = "article_detail.html?id=" + article.id;
        return S.Api.categories().then(function (categories) {
          renderChips(document.getElementById("categories"), categories || [], article.categories || []);
        });
      })
      .catch(function (err) {
        showErrors("form-error", "Could not load this article. " + apiMessage(err));
      });

    bindCounter("headline", "headline-count", 1000);
    bindCounter("body", "body-count", 20000);

    form.addEventListener("submit", handleEditSubmit);
  }

  var handleEditSubmit = function (event) {
    if (event) event.preventDefault();
    var articleId = S.param("id");
    var headline = document.getElementById("headline").value.trim();
    var body = document.getElementById("body").value.trim();
    var categories = selectedCategories();
    var button = document.getElementById("save-btn");

    showErrors("form-error", "");
    if (!headline) return showErrors("form-error", "A headline is required.");
    if (!body) return showErrors("form-error", "The article body cannot be empty.");
    if (!categories.length) return showErrors("form-error", "Select at least one section.");

    S.setLoading(button, true);
    S.Api.updateArticle(articleId, buildArticlePayload())
      .then(function () {
        submitted = true;
        S.toast("Changes saved.", "success");
        setTimeout(function () {
          window.location.href = "article_detail.html?id=" + articleId;
        }, 600);
      })
      .catch(function (err) {
        S.setLoading(button, false);
        showErrors("form-error", apiMessage(err));
      });
  };

  /* ---------------------------------------------------------
     Guard + boot
     --------------------------------------------------------- */
  function boot() {
    if (!S.Session.isLoggedIn()) {
      window.location.href = "login.html?next=" + encodeURIComponent(window.location.pathname.split("/").pop() + window.location.search);
      return;
    }
    S.Session.isAdmin().then(function (admin) {
      if (!admin) {
        document.getElementById("editor-shell").innerHTML =
          '<div class="auth-card" style="max-width:32rem">' +
          '<div class="auth-card__head"><h1>Editors only</h1>' +
          "<p>This area is for editorial accounts. Your account does not have publishing rights.</p></div>" +
          '<a class="btn btn--primary btn--block" href="index.html">Back to the news</a></div>';
        return;
      }
      var page = (window.location.pathname.split("/").pop() || "").toLowerCase();
      if (page === "addarticle.html") initAddArticle();
      else if (page === "edit_article.html") initEditArticle();
      else if (page === "addcategory.html") initAddCategory();
    });
  }

  window.handleSubmit = handleSubmit;
  window.handleCategorySubmit = handleCategorySubmit;
  window.handleEditSubmit = handleEditSubmit;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
