/**
 * SOMOY SONDHAN — article rendering
 * ---------------------------------------------------------------
 * Builds every article surface: hero, trending rail, category
 * sections, the category archive listing, and the article detail
 * page (body, rating breakdown, star picker, review stream).
 *
 * Loaded by index.html and article_detail.html.
 */
(function () {
  "use strict";

  var S = window.SS;
  var icon = function (name, size) {
    return window.SSComponents ? window.SSComponents.icon(name, size) : "";
  };
  var page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

  /* =========================================================
     Shared pieces
     ========================================================= */
  function starRow(rating, max, big) {
    max = max || 4;
    var out = '<span class="stars' + (big ? " stars--lg" : "") + '" aria-label="' + rating.toFixed(1) + ' out of ' + max + '">';
    for (var i = 1; i <= max; i++) {
      var filled = rating >= i - 0.25;
      out +=
        '<svg viewBox="0 0 22 20" fill="currentColor" class="' + (filled ? "" : "stars__empty") + '" aria-hidden="true">' +
        '<path d="M20.9 7.6a1.5 1.5 0 0 0-1.2-1L14.6 5.8 12.4 1.2a1.5 1.5 0 0 0-2.8 0L7.4 5.8l-5.1.7A1.5 1.5 0 0 0 1.5 9.2l3.6 3.6-.8 5a1.5 1.5 0 0 0 2.2 1.6L11 17l4.5 2.4a1.5 1.5 0 0 0 2.2-1.6l-.8-5 3.6-3.6a1.5 1.5 0 0 0 .4-1.6Z"/></svg>';
    }
    return out + "</span>";
  }

  function ratingBadge(article) {
    var rating = Number(article.average_rating || 0);
    var count = Number(article.total_ratings || 0);
    if (!count) return '<span class="badge">New</span>';
    return (
      '<span class="badge" style="gap:.3rem">' + starRow(rating, 1) +
      rating.toFixed(1) + " · " + count + "</span>"
    );
  }

  function categoryChips(article, limit) {
    var cats = (article.categories || []).slice(0, limit || 2);
    return cats
      .map(function (c) {
        return (
          '<a class="badge badge--outline-brand" style="text-decoration:none" href="index.html?category=' +
          encodeURIComponent(String(c).toLowerCase()) + '">' + S.esc(c) + "</a>"
        );
      })
      .join("");
  }

  function card(article) {
    return (
      '<article class="card">' +
      '<a href="article_detail.html?id=' + article.id + '" class="card__media ' + S.coverClass(article) + '" aria-hidden="true" tabindex="-1">' +
      '<span class="card__glyph">' + S.esc(S.monogram(article)) + "</span></a>" +
      '<div class="card__body">' +
      '<div class="card__meta">' + categoryChips(article, 1) +
      "<span>" + S.esc(S.fmtRelative(article.publishing_time)) + "</span>" +
      "<span>·</span><span>" + S.esc(S.readTime(article.body)) + "</span></div>" +
      '<h3 class="card__title"><a href="article_detail.html?id=' + article.id + '">' + S.esc(article.headline) + "</a></h3>" +
      '<p class="card__excerpt">' + S.esc(S.excerpt(article.body, 130)) + "</p>" +
      '<div class="card__footer">' + ratingBadge(article) +
      '<a class="link-underline" style="font-size:.82rem" href="article_detail.html?id=' + article.id + '">Read more</a>' +
      "</div></div></article>"
    );
  }

  function rowCard(article, index) {
    return (
      '<article class="card card--row reveal">' +
      '<span class="card__rank">' + (index + 1) + "</span>" +
      '<div class="card__body">' +
      '<h3 class="card__title"><a href="article_detail.html?id=' + article.id + '">' + S.esc(article.headline) + "</a></h3>" +
      '<div class="card__meta"><span>' + S.esc(S.fmtRelative(article.publishing_time)) + "</span>" +
      "<span>·</span>" + ratingBadge(article) + "</div></div></article>"
    );
  }

  /** One-slot-per-category reveal animation. */
  function reveal() {
    var nodes = S.$$(".reveal");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    nodes.forEach(function (n, i) {
      n.style.animationDelay = Math.min(i * 45, 320) + "ms";
      n.classList.add("reveal--pending");
      io.observe(n);
    });
  }

  function sectionHead(opts) {
    return (
      '<div class="section-head">' +
      "<div><p class='section-head__eyebrow'>" + S.esc(opts.eyebrow || "") + "</p>" +
      "<h2 class='section-head__title'>" + S.esc(opts.title) + "</h2></div>" +
      (opts.action || "") +
      "</div>"
    );
  }

  /* =========================================================
     Home page
     ========================================================= */
  function renderHero(articles) {
    var lead = articles[0];
    var rest = articles.slice(1, 3);
    var glyph = S.monogram(lead);
    var cover = S.coverClass(lead).replace("card__media--", "feature__cover--");

    return (
      '<section class="shell" style="padding-top:1.75rem">' +
      '<div class="hero-grid">' +
      '<article class="feature ' + cover + '" style="position:relative">' +
      '<span class="feature__glyph" aria-hidden="true">' + S.esc(glyph) + "</span>" +
      '<div class="feature__content">' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">' +
      '<span class="badge badge--live">Top story</span>' + categoryChips(lead, 2) + "</div>" +
      '<h1 class="feature__title"><a href="article_detail.html?id=' + lead.id + '">' + S.esc(lead.headline) + "</a></h1>" +
      '<p class="feature__excerpt">' + S.esc(S.excerpt(lead.body, 200)) + "</p>" +
      '<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">' +
      '<a class="btn btn--primary" href="article_detail.html?id=' + lead.id + '">Read the story' +
      icon("trending", 16) + "</a>" +
      '<span class="feature__meta">' + starRow(Number(lead.average_rating || 0), 4) +
      "<span>" + S.esc(S.fmtRelative(lead.publishing_time)) + "</span>" +
      "<span>·</span><span>" + S.esc(S.readTime(lead.body)) + "</span></span>" +
      "</div></div></article>" +
      '<div class="hero-side">' +
      rest
        .map(function (a, i) {
          return (
            '<article class="card reveal" style="flex:1">' +
            '<a href="article_detail.html?id=' + a.id + '" class="card__media ' + S.coverClass(a) + '" style="aspect-ratio:21/9" aria-hidden="true" tabindex="-1">' +
            '<span class="card__glyph" style="font-size:1.75rem">' + S.esc(S.monogram(a)) + "</span></a>" +
            '<div class="card__body"><div class="card__meta">' + categoryChips(a, 1) +
            "<span>" + S.esc(S.fmtRelative(a.publishing_time)) + "</span></div>" +
            '<h3 class="card__title" style="font-size:1.05rem"><a href="article_detail.html?id=' + a.id + '">' +
            S.esc(a.headline) + "</a></h3></div></article>"
          );
        })
        .join("") +
      "</div></div></section>"
    );
  }

  function renderTrendingAndLatest(articles) {
    var rated = articles
      .filter(function (a) { return Number(a.total_ratings || 0) > 0; })
      .sort(function (a, b) { return Number(b.average_rating) - Number(a.average_rating); })
      .slice(0, 5);
    var trending = rated.length ? rated : articles.slice(0, 5);

    var latest = articles
      .slice()
      .sort(function (a, b) { return new Date(b.publishing_time) - new Date(a.publishing_time); })
      .slice(0, 4);

    return (
      '<section class="shell section" id="trending">' +
      sectionHead({
        eyebrow: "Most read",
        title: "Trending now",
        action: '<a class="btn btn--ghost btn--sm" href="#latest">Latest coverage' + icon("trending", 15) + "</a>",
      }) +
      '<div class="split-grid">' +
      '<div style="display:grid;gap:.85rem">' + trending.map(rowCard).join("") + "</div>" +
      '<div id="latest"><p class="section-head__eyebrow">Just published</p>' +
      '<div class="grid-cards grid-cards--2" style="margin-top:.9rem">' + latest.map(card).join("") + "</div></div>" +
      "</div></section>"
    );
  }

  function renderCategorySection(category, articles) {
    var slug = String(category.name).toLowerCase();
    return (
      '<section class="shell section" id="' + S.esc(slug) + '-news">' +
      sectionHead({
        eyebrow: "Section",
        title: category.name,
        action:
          '<a class="btn btn--outline btn--sm" href="index.html?category=' + encodeURIComponent(slug) + '">See all' +
          icon("chevron", 15) + "</a>",
      }) +
      '<div class="grid-cards grid-cards--4">' + articles.slice(0, 4).map(card).join("") + "</div>" +
      "</section>"
    );
  }

  function initHome() {
    var host = document.getElementById("news-section");
    if (!host) return;
    host.innerHTML =
      '<section class="shell" style="padding-top:1.75rem">' + S.skeletonCards(1) + "</section>" +
      '<section class="shell section">' + S.skeletonCards(4, 4) + "</section>";

    Promise.all([S.Api.categories(), S.Api.allArticles()])
      .then(function (res) {
        var categories = res[0] || [];
        var articles = res[1] || [];

        if (!articles.length) {
          host.innerHTML =
            '<section class="shell section">' +
            '<div class="grid-cards">' +
            S.emptyState({
              title: "The newsroom is warming up",
              text: "No stories have been published yet. Check back in a little while.",
            }) +
            "</div></section>";
          return;
        }

        host.innerHTML = renderHero(articles) + renderTrendingAndLatest(articles);

        // Fetch each category rail in parallel — first paint is not blocked.
        var rails = categories.map(function (category) {
          return S.Api.articles(String(category.name).toLowerCase())
            .then(function (list) {
              return { category: category, articles: list || [] };
            })
            .catch(function () {
              return { category: category, articles: [] };
            });
        });

        Promise.all(rails).then(function (results) {
          var html = results
            .filter(function (r) { return r.articles.length; })
            .map(function (r) { return renderCategorySection(r.category, r.articles); })
            .join("");
          if (html) host.insertAdjacentHTML("beforeend", html);
          reveal();
        });
      })
      .catch(function (err) {
        console.error(err);
        host.innerHTML = '<section class="shell section"><div class="grid-cards">' + S.errorState({}) + "</div></section>";
      });
  }

  /* =========================================================
     Category archive page
     ========================================================= */
  function initCategory(categorySlug) {
    var host = document.getElementById("news-section");
    if (!host) return;
    var title = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    host.innerHTML =
      '<section class="shell section">' +
      '<div class="section-head"><div><p class="section-head__eyebrow">Section</p>' +
      '<h1 class="section-head__title">' + S.esc(title) + "</h1></div>" +
      '<span class="badge" id="archive-count">Loading…</span></div>' +
      S.skeletonCards(6, 3) +
      "</section>";

    S.Api.articles(categorySlug)
      .then(function (articles) {
        articles = (articles || []).slice().sort(function (a, b) {
          return Number(b.average_rating || 0) - Number(a.average_rating || 0);
        });
        var count = document.getElementById("archive-count");
        if (count) count.textContent = articles.length + (articles.length === 1 ? " story" : " stories");
        var grid = host.querySelector(".grid-cards");
        if (!grid) return;
        if (!articles.length) {
          grid.innerHTML = S.emptyState({
            title: "No stories in this section yet",
            text: "Try another section from the menu above.",
            action: '<a class="btn btn--primary btn--sm" href="index.html" style="margin-top:.5rem">Back to all stories</a>',
          });
          return;
        }
        grid.innerHTML = articles.map(card).join("");
        reveal();
      })
      .catch(function (err) {
        console.error(err);
        var grid = host.querySelector(".grid-cards");
        if (grid) grid.innerHTML = S.errorState({});
      });
  }

  /* =========================================================
     Tag archive page (index.html?tag=slug)
     ========================================================= */
  function initTag(tagSlug) {
    var host = document.getElementById("news-section");
    if (!host) return;
    host.innerHTML =
      '<section class="shell section">' +
      '<div class="section-head"><div><p class="section-head__eyebrow">Tag</p>' +
      '<h1 class="section-head__title">#' + S.esc(tagSlug) + "</h1></div>" +
      '<a class="btn btn--outline btn--sm" href="index.html">All stories</a></div>' +
      '<div class="grid-cards grid-cards--3" style="margin-top:1rem"></div>' +
      "</section>";

    S.Api.articlesByTag(tagSlug)
      .then(function (articles) {
        articles = (articles || []).slice().sort(function (a, b) {
          return new Date(b.publishing_time) - new Date(a.publishing_time);
        });
        var grid = host.querySelector(".grid-cards");
        if (!grid) return;
        if (!articles.length) {
          grid.innerHTML = S.emptyState({
            title: "No stories with this tag yet",
            text: "Try another tag or browse all sections.",
          });
          return;
        }
        grid.innerHTML = articles.map(card).join("");
        reveal();
      })
      .catch(function (err) {
        console.error(err);
        var grid = host.querySelector(".grid-cards");
        if (grid) grid.innerHTML = S.errorState({});
      });
  }

  /* =========================================================
     Article detail page
     ========================================================= */
  function detailSkeleton() {
    return (
      '<section class="shell section">' +
      '<div class="sk sk--line" style="width:8rem"></div>' +
      '<div class="sk sk--title" style="height:2.6rem;width:85%;margin:1rem 0 .6rem"></div>' +
      '<div class="sk sk--title" style="height:2.6rem;width:55%"></div>' +
      '<div class="sk sk--media" style="margin:1.75rem 0;border-radius:1.25rem"></div>' +
      '<div class="sk sk--line"></div><div class="sk sk--line" style="margin-top:.6rem"></div>' +
      '<div class="sk sk--line" style="margin-top:.6rem;width:70%"></div>' +
      "</section>"
    );
  }

  function breadcrumb(article) {
    var cats = article.categories || [];
    var first = cats.length ? cats[0] : null;
    return (
      '<nav aria-label="Breadcrumb" style="display:flex;gap:.5rem;align-items:center;font-size:.8rem;font-weight:600;color:rgb(var(--text-subtle));flex-wrap:wrap">' +
      '<a href="index.html" style="color:inherit;text-decoration:none">Home</a><span>/</span>' +
      (first
        ? '<a href="index.html?category=' + encodeURIComponent(String(first).toLowerCase()) + '" style="color:inherit;text-decoration:none">' +
          S.esc(first) + "</a><span>/</span>"
        : "") +
      "<span>" + S.esc(S.excerpt(article.headline, 42)) + "</span></nav>"
    );
  }

  function tagPills(article) {
    var tags = article.tags || [];
    if (!tags.length) return "";
    return (
      '<div class="pill-row" style="margin-top:.75rem">' +
      tags
        .map(function (t) {
          var name = typeof t === "string" ? t : t.name;
          return (
            '<a class="pill" href="index.html?tag=' + encodeURIComponent(String(name).toLowerCase()) + '">' +
            icon("tag", 13) + S.esc(name) + "</a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function statusBadge(article) {
    var map = {
      published: ["badge--live", "Published"],
      draft: ["badge", "Draft"],
      archived: ["badge", "Archived"],
    };
    var entry = map[article.status] || ["badge", article.status || "—"];
    var out = '<span class="badge ' + entry[0] + '">' + S.esc(entry[1]) + "</span>";
    if (article.is_featured) out += '<span class="badge badge--brand">Featured</span>';
    return out;
  }

  function bookmarkBtn(article) {
    var on = !!article.is_bookmarked;
    return (
      '<button type="button" class="btn btn--soft btn--sm' + (on ? " is-on" : "") + '" id="bookmark-btn" ' +
      'data-on="' + (on ? "1" : "0") + '" aria-pressed="' + (on ? "true" : "false") + '">' +
      icon("bookmark", 15) + '<span>' + (on ? "Saved" : "Save") + "</span></button>"
    );
  }

  /** Editor-only lifecycle controls, reflecting the current status. */
  function editorControls(article) {
    var isPub = article.status === "published";
    return (
      '<div class="card no-print" style="padding:1rem;display:grid;gap:.6rem" id="editor-controls">' +
      '<div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">' + statusBadge(article) + "</div>" +
      '<div style="display:flex;gap:.4rem;flex-wrap:wrap">' +
      (isPub
        ? '<button type="button" class="btn btn--soft btn--sm" data-action="archive">Archive</button>'
        : '<button type="button" class="btn btn--primary btn--sm" data-action="publish">Publish</button>') +
      '<button type="button" class="btn btn--soft btn--sm" data-action="feature">' +
      (article.is_featured ? "Unfeature" : "Feature") + "</button>" +
      '<a class="btn btn--soft btn--sm" href="edit_article.html?id=' + article.id + '">Edit</a>' +
      '<button type="button" class="btn btn--danger btn--sm" id="delete-article" data-id="' + article.id + '">Delete</button>' +
      "</div></div>"
    );
  }

  function renderArticle(article, admin) {
    var rating = Number(article.average_rating || 0);
    var paragraphs = String(article.body || "")
      .split(/\n{1,}/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) { return "<p>" + S.esc(p) + "</p>"; })
      .join("");

    var adminActions = admin
      ? '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">' + statusBadge(article) + "</div>"
      : "";

    return (
      '<article class="shell section" data-read-target>' +
      breadcrumb(article) +
      '<header style="margin:1.5rem 0 2rem;max-width:56rem">' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">' + categoryChips(article, 3) + "</div>" +
      '<h1 style="font-size:clamp(1.85rem,4.4vw,3rem);line-height:1.12;margin:0 0 1.1rem" class="text-balance">' +
      S.esc(article.headline) + "</h1>" +
      '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:space-between">' +
      '<div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">' +
      '<span class="avatar avatar--md">' + S.esc(S.initials((article.categories || ["SS"])[0])) + "</span>" +
      '<div><p style="margin:0;font-size:.85rem;font-weight:700">Somoy Sondhan Desk</p>' +
      '<p style="margin:.1rem 0 0;font-size:.78rem;color:rgb(var(--text-subtle))">' +
      S.esc(S.fmtDateTimeFull(article.publishing_time)) + " · " + S.esc(S.readTime(article.body)) + "</p></div></div>" +
      adminActions +
      "</div></header>" +
      '<div class="detail-grid">' +
      '<div>' +
      '<div class="card__media ' + S.coverClass(article) + '" style="border-radius:1.25rem;aspect-ratio:21/9;margin-bottom:2rem">' +
      '<span class="card__glyph" style="font-size:clamp(2.5rem,8vw,5rem)">' + S.esc(S.monogram(article)) + "</span></div>" +
      '<div class="prose-article">' + (paragraphs || "<p>" + S.esc(article.body) + "</p>") + "</div>" +
      '<div class="divider">End of story</div>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;justify-content:space-between">' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' + categoryChips(article, 3) + "</div>" +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
      bookmarkBtn(article) +
      '<button type="button" class="btn btn--soft btn--sm" id="share-btn">Share</button>' +
      '<button type="button" class="btn btn--soft btn--sm" id="print-btn">Print</button>' +
      "</div></div>" +
      tagPills(article) +
      "</div>" +
      '<aside class="sticky-side" style="display:grid;gap:1.25rem;align-content:start">' +
      (admin ? editorControls(article) : "") +
      '<div class="card" style="padding:1.25rem">' +
      '<p class="section-head__eyebrow" style="margin-bottom:.6rem">Reader score</p>' +
      '<div style="display:flex;align-items:baseline;gap:.5rem">' +
      '<span style="font-family:var(--font-serif);font-size:2.75rem;font-weight:800;line-height:1">' +
      rating.toFixed(1) + "</span>" +
      '<span style="color:rgb(var(--text-subtle));font-size:.85rem">/ 4</span></div>' +
      '<div style="margin:.6rem 0 .35rem">' + starRow(rating, 4, true) + "</div>" +
      '<p style="margin:0;font-size:.8rem;color:rgb(var(--text-subtle))">' +
      (article.total_ratings || 0) + ((article.total_ratings || 0) === 1 ? " rating" : " ratings") + "</p></div>" +
      '<div class="card" style="padding:1.25rem" id="ratingSection"></div>' +
      "</aside></div></article>"
    );
  }

  function renderRatingBreakdown(article) {
    var host = document.getElementById("ratingSection");
    if (!host) return;
    var counts = article.star_counts || {};
    var total = Number(article.total_ratings || 0);
    var rows = [4, 3, 2, 1]
      .map(function (star) {
        var count = Number(counts[star] || counts[String(star)] || 0);
        var pct = total > 0 ? (count * 100) / total : 0;
        return (
          '<div class="rating-row"><span>' + star + " star</span>" +
          '<span class="rating-row__bar"><span class="rating-row__fill" style="width:' + pct.toFixed(1) + '%"></span></span>' +
          "<span>" + count + "</span></div>"
        );
      })
      .join("");
    host.innerHTML =
      '<p class="section-head__eyebrow" style="margin-bottom:.85rem">Rating breakdown</p>' +
      '<div style="display:grid;gap:.6rem">' + rows + "</div>";
  }

  function renderReviewForm() {
    var host = document.getElementById("review-form-host");
    if (!host) return;
    if (!S.Session.isLoggedIn()) {
      host.innerHTML =
        '<div class="card" style="padding:1.5rem;text-align:center">' +
        '<h3 style="margin:0 0 .35rem;font-size:1.1rem">Join the conversation</h3>' +
        '<p style="margin:0 0 1rem;font-size:.875rem;color:rgb(var(--text-muted))">Sign in to rate this story and leave a review.</p>' +
        '<a class="btn btn--primary" href="login.html?next=' +
        encodeURIComponent("article_detail.html" + window.location.search) + '">Sign in to review</a></div>';
      return;
    }

    var stars = "";
    for (var i = 1; i <= 4; i++) {
      stars +=
        '<button type="button" data-star="' + i + '" class="' + (i === 4 ? "is-on" : "") + '" aria-label="' + i + ' star' + (i > 1 ? "s" : "") + '">' +
        '<svg viewBox="0 0 22 20" fill="currentColor"><path d="M20.9 7.6a1.5 1.5 0 0 0-1.2-1L14.6 5.8 12.4 1.2a1.5 1.5 0 0 0-2.8 0L7.4 5.8l-5.1.7A1.5 1.5 0 0 0 1.5 9.2l3.6 3.6-.8 5a1.5 1.5 0 0 0 2.2 1.6L11 17l4.5 2.4a1.5 1.5 0 0 0 2.2-1.6l-.8-5 3.6-3.6a1.5 1.5 0 0 0 .4-1.6Z"/></svg></button>';
    }

    host.innerHTML =
      '<div class="card" style="padding:1.5rem">' +
      '<h3 style="margin:0 0 .35rem;font-size:1.2rem">Leave a review</h3>' +
      '<p style="margin:0 0 1.1rem;font-size:.85rem;color:rgb(var(--text-muted))">Tell other readers what you think.</p>' +
      '<form id="review-form" novalidate>' +
      '<div class="field"><span class="field__label">Your rating</span>' +
      '<div class="star-picker" id="star-picker" role="radiogroup" aria-label="Rating">' + stars + "</div>" +
      '<input type="hidden" id="rating" name="rating" value="4"></div>' +
      '<div class="field"><label class="field__label" for="review">Your review' +
      '<span class="field__hint" id="review-count">0 / 600</span></label>' +
      '<textarea class="textarea" id="review" name="review" rows="5" maxlength="600" required ' +
      'placeholder="Share your perspective on this story…"></textarea></div>' +
      '<div id="review-error" class="alert alert--error" role="alert"></div>' +
      '<button type="submit" class="btn btn--primary btn--block" id="review-submit">Publish review</button>' +
      "</form></div>";

    var picker = document.getElementById("star-picker");
    var hidden = document.getElementById("rating");
    picker.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-star]");
      if (!btn) return;
      var value = Number(btn.getAttribute("data-star"));
      hidden.value = value;
      S.$$("[data-star]", picker).forEach(function (b) {
        b.classList.toggle("is-on", Number(b.getAttribute("data-star")) <= value);
      });
    });
    picker.addEventListener("mouseover", function (e) {
      var btn = e.target.closest("[data-star]");
      if (!btn) return;
      var value = Number(btn.getAttribute("data-star"));
      S.$$("[data-star]", picker).forEach(function (b) {
        b.style.color = Number(b.getAttribute("data-star")) <= value ? "#f59e0b" : "";
      });
    });
    picker.addEventListener("mouseout", function () {
      S.$$("[data-star]", picker).forEach(function (b) { b.style.color = ""; });
    });

    var textarea = document.getElementById("review");
    var counter = document.getElementById("review-count");
    textarea.addEventListener("input", function () {
      counter.textContent = textarea.value.length + " / 600";
    });

    document.getElementById("review-form").addEventListener("submit", submitReview);
  }

  function submitReview(event) {
    event.preventDefault();
    var articleId = S.param("id");
    var rating = document.getElementById("rating").value;
    var comment = document.getElementById("review").value.trim();
    var errorBox = document.getElementById("review-error");
    var button = document.getElementById("review-submit");

    if (comment.length < 3) {
      errorBox.textContent = "Please write at least a few words before publishing.";
      errorBox.className = "alert alert--error";
      return;
    }
    errorBox.textContent = "";
    S.setLoading(button, true);

    S.Api.addReview(articleId, {
      rating: Number(rating),
      comment: comment,
      article: articleId,
      user: S.Session.userId(),
    })
      .then(function () {
        S.toast("Thanks — your review is live.", "success");
        document.getElementById("review").value = "";
        document.getElementById("review-count").textContent = "0 / 600";
        return Promise.all([refreshRating(articleId), loadReviews(articleId)]);
      })
      .catch(function (err) {
        var msg = (err && err.data && (err.data.detail || err.data.error || (Array.isArray(err.data.comment) ? err.data.comment[0] : err.data.comment))) || err.message || "Could not publish your review.";
        errorBox.textContent = msg;
        errorBox.className = "alert alert--error";
      })
      .finally(function () {
        S.setLoading(button, false);
      });
  }

  function refreshRating(articleId) {
    return S.Api.article(articleId).then(function (article) {
      renderRatingBreakdown(article);
      var card = document.querySelector(".sticky-side .card");
      if (!card) return;
      var score = Number(article.average_rating || 0);
      var scoreEl = card.querySelector("span");
      if (scoreEl) scoreEl.textContent = score.toFixed(1);
      // Swap the star row in place; a reader may have just changed the score,
      // and the row may not have existed at all when the page first rendered.
      var stars = card.querySelector(".stars");
      if (stars) {
        stars.outerHTML = starRow(score, 4, true);
      } else {
        var holder = card.querySelector("div");
        if (holder) holder.insertAdjacentHTML("afterend", starRow(score, 4, true));
      }
      var countP = card.querySelector("p:last-of-type");
      if (countP) {
        countP.textContent =
          (article.total_ratings || 0) + ((article.total_ratings || 0) === 1 ? " rating" : " ratings");
      }
    });
  }

  function reviewCard(review) {
    var name = review.display_name || review.username || "Reader";
    var avatarHtml = review.avatar
      ? '<img src="' + S.esc(review.avatar) + '" class="avatar avatar--md" alt="' + S.esc(name) + '">'
      : '<span class="avatar avatar--md">' + S.esc(S.initials(name)) + "</span>";
    var commentText = review.comment || review.body || review.review || "";
    return (
      '<article class="card is-visible" style="padding:1.25rem">' +
      '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">' +
      avatarHtml +
      '<div style="flex:1;min-width:0"><p style="margin:0;font-weight:700;font-size:.92rem">' + S.esc(name) + "</p>" +
      '<p style="margin:.1rem 0 0;font-size:.75rem;color:rgb(var(--text-subtle))">' +
      S.esc(S.fmtRelative(review.created_at)) + "</p></div>" +
      starRow(Number(review.rating || 0), 4) +
      "</div>" +
      '<p style="margin:0;font-size:.92rem;line-height:1.7;color:rgb(var(--text-muted))">' +
      S.esc(commentText) + "</p></article>"
    );
  }

  function loadReviews(articleId, fallbackReviews) {
    var host = document.getElementById("commentContainer");
    if (!host) return Promise.resolve();

    function renderList(reviews) {
      reviews = (reviews || []).slice().sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      if (!reviews.length) {
        host.innerHTML = S.emptyState({
          title: "No reviews yet",
          text: "Be the first to share what you thought of this story.",
        });
        return;
      }
      host.innerHTML = reviews.map(reviewCard).join("");
    }

    return S.Api.reviews(articleId)
      .then(function (reviews) {
        var list = (reviews && reviews.length) ? reviews : (fallbackReviews || []);
        renderList(list);
      })
      .catch(function () {
        renderList(fallbackReviews || []);
      });
  }

  function loadRelated(articleId) {
    var host = document.getElementById("related_article");
    if (!host) return;
    S.Api.related(articleId)
      .then(function (list) {
        list = list || [];
        if (!list.length) {
          host.innerHTML =
            '<div class="grid-cards grid-cards--4">' +
            S.emptyState({ title: "No related stories", text: "This is the only story in its section so far." }) +
            "</div>";
          return;
        }
        host.innerHTML = '<div class="grid-cards grid-cards--4">' + list.slice(0, 4).map(card).join("") + "</div>";
        reveal();
      })
      .catch(function () {
        host.innerHTML = "";
      });
  }

  /* =========================================================
     Comments / discussion
     ========================================================= */
  var commentState = { article: null, parent: null, list: [] };

  function commentNode(c, article, isReply) {
    var name = c.display_name || c.username || "Reader";
    var pending = c.is_approved === false;
    var replies = !isReply && (c.replies || []).length
      ? '<div class="comment__replies" style="margin-top:.85rem;display:grid;gap:.7rem">' +
        c.replies.map(function (r) { return commentNode(r, article, true); }).join("") +
        "</div>"
      : "";
    var replyBtn = !isReply && article.allow_comments !== false && S.Session.isLoggedIn()
      ? '<button type="button" class="btn btn--ghost btn--sm" data-reply="' + c.id + '">Reply</button>'
      : "";
    return (
      '<article class="card' + (pending ? " is-pending" : "") + '" style="padding:1.1rem" data-comment="' + c.id + '">' +
      '<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.6rem">' +
      '<span class="avatar avatar--sm">' + S.esc(S.initials(name)) + "</span>" +
      '<div style="flex:1;min-width:0"><p style="margin:0;font-weight:700;font-size:.9rem">' + S.esc(name) + "</p>" +
      '<p style="margin:.1rem 0 0;font-size:.74rem;color:rgb(var(--text-subtle))">' +
      S.esc(S.fmtRelative(c.created_at)) + (c.is_edited ? " · edited" : "") + "</p></div>" +
      (pending ? '<span class="badge">Pending</span>' : "") +
      "</div>" +
      '<p style="margin:0;font-size:.92rem;line-height:1.7;color:rgb(var(--text-muted))">' + S.esc(c.body) + "</p>" +
      (c.moderation_note
        ? '<p style="margin:.5rem 0 0;font-size:.78rem;color:rgb(var(--text-subtle))">Moderator note: ' + S.esc(c.moderation_note) + "</p>"
        : "") +
      (replyBtn ? '<div style="margin-top:.7rem">' + replyBtn + "</div>" : "") +
      replies +
      "</article>"
    );
  }

  function findComment(id) {
    var list = commentState.list || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
      var reps = list[i].replies || [];
      for (var j = 0; j < reps.length; j++) if (reps[j].id === id) return reps[j];
    }
    return null;
  }

  function setReplyTarget(comment) {
    commentState.parent = comment ? comment.id : null;
    var ind = document.getElementById("reply-indicator");
    var cancel = document.getElementById("cancel-reply");
    var submit = document.getElementById("comment-submit");
    if (comment) {
      var name = comment.display_name || comment.username || "Reader";
      if (ind) { ind.hidden = false; ind.textContent = "Replying to " + name; }
      if (submit) submit.textContent = "Post reply";
    } else {
      if (ind) ind.hidden = true;
      if (submit) submit.textContent = "Post comment";
    }
    if (cancel) cancel.hidden = !comment;
  }

  function renderCommentForm(article) {
    var host = document.getElementById("comment-form-host");
    if (!host) return;
    if (article.allow_comments === false) {
      host.innerHTML =
        '<div class="card" style="padding:1.25rem;text-align:center">' +
        '<p style="margin:0;font-size:.9rem;color:rgb(var(--text-muted))">Comments are closed on this story.</p></div>';
      return;
    }
    if (!S.Session.isLoggedIn()) {
      host.innerHTML =
        '<div class="card" style="padding:1.4rem;text-align:center">' +
        '<h3 style="margin:0 0 .35rem;font-size:1.05rem">Join the discussion</h3>' +
        '<p style="margin:0 0 1rem;font-size:.85rem;color:rgb(var(--text-muted))">Sign in to leave a comment.</p>' +
        '<a class="btn btn--primary" href="login.html?next=' +
        encodeURIComponent("article_detail.html" + window.location.search) + '">Sign in to comment</a></div>';
      return;
    }
    host.innerHTML =
      '<div class="card" style="padding:1.4rem">' +
      '<h3 style="margin:0 0 .35rem;font-size:1.1rem">Leave a comment</h3>' +
      '<p id="reply-indicator" style="margin:0 0 .8rem;font-size:.8rem;color:rgb(var(--text-subtle))" hidden></p>' +
      '<form id="comment-form" novalidate>' +
      '<div class="field"><textarea class="textarea" id="comment-body" rows="4" maxlength="1000" required ' +
      'placeholder="Share your thoughts on this story…"></textarea></div>' +
      '<div id="comment-error" class="alert alert--error" role="alert"></div>' +
      '<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">' +
      '<button type="submit" class="btn btn--primary" id="comment-submit">Post comment</button>' +
      '<button type="button" class="btn btn--ghost btn--sm" id="cancel-reply" hidden>Cancel reply</button>' +
      "</div>" +
      '<p style="margin:.7rem 0 0;font-size:.75rem;color:rgb(var(--text-subtle))">' +
      "Reader comments are reviewed before they appear.</p>" +
      "</form></div>";

    document.getElementById("comment-form").addEventListener("submit", submitComment);
    var cancel = document.getElementById("cancel-reply");
    if (cancel) cancel.addEventListener("click", function () { setReplyTarget(null); });
  }

  function submitComment(event) {
    event.preventDefault();
    var bodyEl = document.getElementById("comment-body");
    var body = bodyEl.value.trim();
    var err = document.getElementById("comment-error");
    var btn = document.getElementById("comment-submit");
    if (body.length < 2) {
      err.textContent = "Please write something before posting.";
      return;
    }
    err.textContent = "";
    S.setLoading(btn, true);
    var payload = { article: Number(commentState.article.id), body: body };
    if (commentState.parent) payload.parent = commentState.parent;
    S.Api.addComment(payload)
      .then(function () {
        bodyEl.value = "";
        setReplyTarget(null);
        S.toast("Thanks — your comment will appear after review.", "success", 5000);
        return loadComments(commentState.article);
      })
      .catch(function (e) {
        err.textContent = e.message || "Could not post your comment.";
      })
      .then(function () {
        S.setLoading(btn, false);
      });
  }

  function loadComments(article) {
    commentState.article = article;
    var host = document.getElementById("comment-list");
    var countEl = document.getElementById("comment-count");
    if (!host) return Promise.resolve();
    host.innerHTML = '<div class="sk sk--line"></div><div class="sk sk--line" style="width:70%;margin-top:.5rem"></div>';
    return S.Api.comments({ article: article.id })
      .then(function (comments) {
        comments = comments || [];
        commentState.list = comments;
        var total = comments.reduce(function (n, c) { return n + 1 + ((c.replies || []).length); }, 0);
        if (countEl) countEl.textContent = total + (total === 1 ? " comment" : " comments");
        if (!comments.length) {
          host.innerHTML = S.emptyState({ title: "No comments yet", text: "Be the first to start the discussion." });
          return;
        }
        host.innerHTML = comments.map(function (c) { return commentNode(c, article, false); }).join("");
        S.$$("[data-reply]", host).forEach(function (btn) {
          btn.addEventListener("click", function () {
            var target = findComment(Number(btn.getAttribute("data-reply")));
            setReplyTarget(target);
            var formHost = document.getElementById("comment-form-host");
            if (formHost) formHost.scrollIntoView({ behavior: "smooth", block: "center" });
            var ta = document.getElementById("comment-body");
            if (ta) ta.focus();
          });
        });
      })
      .catch(function () {
        if (countEl) countEl.textContent = "";
        host.innerHTML = S.emptyState({ title: "Comments unavailable", text: "We could not load the discussion for this story." });
      });
  }

  /* =========================================================
     Article actions (bookmark, lifecycle, share, delete)
     ========================================================= */
  function rerenderDetail(article, admin) {
    var host = document.getElementById("detail_article");
    host.innerHTML = renderArticle(article, admin);
    renderRatingBreakdown(article);
    wireArticleActions(article, admin);
  }

  function runLifecycle(action, article, admin) {
    var p;
    if (action === "publish") p = S.Api.publish(article.id, {});
    else if (action === "archive") p = S.Api.archive(article.id, {});
    else if (action === "feature") p = S.Api.feature(article.id);
    else return;
    p.then(function () {
      S.toast("Story updated.", "success");
      return S.Api.article(article.id).then(function (fresh) {
        rerenderDetail(fresh, admin);
        renderCommentForm(fresh);
        loadComments(fresh);
      });
    }).catch(function (e) {
      S.toast(e.message || "Could not update the story.", "error");
    });
  }

  function wireArticleActions(article, admin) {
    var share = document.getElementById("share-btn");
    if (share) {
      share.addEventListener("click", function () {
        var url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: article.headline, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            S.toast("Link copied to clipboard.", "success");
          });
        }
      });
    }
    var print = document.getElementById("print-btn");
    if (print) print.addEventListener("click", function () { window.print(); });

    var bm = document.getElementById("bookmark-btn");
    if (bm) {
      bm.addEventListener("click", function () {
        if (!S.Session.requireLogin()) return;
        S.Api.toggleBookmark(article.id)
          .then(function (res) {
            var on = !!res.bookmarked;
            bm.classList.toggle("is-on", on);
            bm.setAttribute("data-on", on ? "1" : "0");
            bm.setAttribute("aria-pressed", on ? "true" : "false");
            var label = bm.querySelector("span");
            if (label) label.textContent = on ? "Saved" : "Save";
            S.toast(on ? "Saved to your reading list." : "Removed from your reading list.", "success", 2200);
          })
          .catch(function (e) { S.toast(e.message || "Could not update your saved stories.", "error"); });
      });
    }

    var ec = document.getElementById("editor-controls");
    if (ec) {
      ec.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-action]");
        if (btn) runLifecycle(btn.getAttribute("data-action"), article, admin);
      });
    }

    var del = document.getElementById("delete-article");
    if (del) {
      del.addEventListener("click", function () {
        S.confirm({
          title: "Delete this article?",
          text: "“" + S.excerpt(article.headline, 70) + "” will be permanently removed.",
          confirmText: "Delete",
          danger: true,
        }).then(function (ok) {
          if (!ok) return;
          S.Api.deleteArticle(article.id)
            .then(function () {
              S.toast("Article deleted.", "success");
              setTimeout(function () { window.location.href = "index.html"; }, 700);
            })
            .catch(function (err) {
              S.toast(err.message || "Could not delete the article.", "error");
            });
        });
      });
    }
  }

  function countViewOnce(articleId) {
    var KEY = "ss-viewed";
    var seen = {};
    try { seen = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { seen = {}; }
    if (seen[articleId]) return;
    seen[articleId] = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch (e) {}
    S.Api.registerView(articleId).catch(function () {});
  }

  function initDetail() {
    var host = document.getElementById("detail_article");
    if (!host) return;
    var articleId = S.param("id");
    if (!articleId) {
      host.innerHTML = '<div class="shell section">' +
        S.emptyState({ title: "Story not found", text: "This link is missing its article reference." }) + "</div>";
      return;
    }

    host.innerHTML = detailSkeleton();

    Promise.all([S.Api.article(articleId), S.Session.isAdmin()])
      .then(function (res) {
        var article = res[0];
        var admin = res[1];
        host.innerHTML = renderArticle(article, admin);
        renderRatingBreakdown(article);
        renderReviewForm();
        wireArticleActions(article, admin);
        renderCommentForm(article);
        countViewOnce(articleId);

        document.title = article.headline + " — Somoy Sondhan";
        return Promise.all([loadReviews(articleId, article.reviews), loadComments(article)]);
      })
      .catch(function (err) {
        console.error(err);
        host.innerHTML = '<div class="shell section">' +
          S.emptyState({
            title: "We could not load this story",
            text: err.message || "The newsroom service did not respond.",
            action: '<a class="btn btn--primary btn--sm" href="index.html" style="margin-top:.5rem">Back to home</a>',
          }) + "</div>";
      });

    loadRelated(articleId);
  }

  /* =========================================================
     Boot
     ========================================================= */
  function boot() {
    if (page === "article_detail.html") {
      window.SS_PAGE = { readTarget: "[data-read-target]" };
      initDetail();
      return;
    }
    if (page !== "index.html" && page !== "") return;
    var category = S.param("category");
    var tag = S.param("tag");
    if (category) initCategory(category.toLowerCase());
    else if (tag) initTag(tag.toLowerCase());
    else initHome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
