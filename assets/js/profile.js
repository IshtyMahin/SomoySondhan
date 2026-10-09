/**
 * SOMOY SONDHAN — profile page
 * ---------------------------------------------------------------
 * Shows account details, activity stats and the reader's recent
 * reviews. Editors additionally get newsroom shortcuts.
 */
(function () {
  "use strict";

  var S = window.SS;

  function infoRow(label, value, icon) {
    return (
      '<div class="info-row">' +
      '<span class="info-row__label">' +
      (icon ? window.SSComponents.icon(icon, 15) : "") +
      S.esc(label) + "</span>" +
      '<span class="info-row__value">' + (value ? S.esc(value) : "<em style='color:rgb(var(--text-subtle))'>Not set</em>") + "</span>" +
      "</div>"
    );
  }

  function statCard(value, label, icon) {
    return (
      '<div class="stat">' +
      '<span class="stat__icon">' + window.SSComponents.icon(icon, 18) + "</span>" +
      '<span class="stat__value">' + S.esc(value) + "</span>" +
      '<span class="stat__label">' + S.esc(label) + "</span>" +
      "</div>"
    );
  }

  function render(user, admin, reviews) {
    var host = document.getElementById("profile-host");
    var name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Reader";
    var uniqueArticles = {};
    var average = 0;
    if (reviews.length) {
      reviews.forEach(function (r) { uniqueArticles[r.article] = true; });
      average = reviews.reduce(function (sum, r) { return sum + Number(r.rating || 0); }, 0) / reviews.length;
    }

    host.innerHTML =
      '<div class="profile-grid">' +
      // Identity card
      '<aside style="display:grid;gap:1.25rem;align-content:start">' +
      '<div class="card" style="padding:1.5rem;text-align:center">' +
      '<span class="avatar avatar--lg" style="margin:0 auto .9rem">' + S.esc(S.initials(name)) + "</span>" +
      '<h2 style="margin:0 0 .25rem;font-size:1.3rem">' + S.esc(name) + "</h2>" +
      '<p style="margin:0 0 .9rem;font-size:.85rem;color:rgb(var(--text-subtle))">@' + S.esc(user.username || "reader") + "</p>" +
      '<span class="badge ' + (admin ? "badge--brand" : "badge--outline-brand") + '">' +
      (admin ? "Editor" : "Reader") + "</span>" +
      '<div style="display:grid;gap:.6rem;margin-top:1.4rem">' +
      '<a class="btn btn--soft btn--block" href="index.html">Browse stories</a>' +
      '<button type="button" class="btn btn--ghost btn--block" data-logout>Sign out</button>' +
      "</div></div>" +
      (admin
        ? '<div class="card" style="padding:1.25rem">' +
          '<p class="section-head__eyebrow">Newsroom</p>' +
          '<div style="display:grid;gap:.5rem">' +
          '<a class="btn btn--primary btn--sm btn--block" href="addArticle.html">Write an article</a>' +
          '<a class="btn btn--soft btn--sm btn--block" href="addCategory.html">Create a section</a>' +
          "</div></div>"
        : "") +
      "</aside>" +
      // Details
      '<div style="display:grid;gap:1.25rem">' +
      '<div class="card" style="padding:clamp(1.25rem,3vw,1.75rem)">' +
      '<p class="section-head__eyebrow">Account details</p>' +
      '<div style="margin-top:1rem">' +
      infoRow("Username", user.username, "user") +
      infoRow("First name", user.first_name) +
      infoRow("Last name", user.last_name) +
      infoRow("Email", user.email, "mail") +
      "</div></div>" +
      '<div class="stats-grid">' +
      statCard(reviews.length, reviews.length === 1 ? "Review written" : "Reviews written", "spark") +
      statCard(Object.keys(uniqueArticles).length, "Stories rated", "bookmark") +
      statCard(reviews.length ? average.toFixed(1) + " / 4" : "—", "Average rating given", "trending") +
      "</div>" +
      '<div>' +
      '<div class="section-head" style="margin-bottom:1rem">' +
      '<div><p class="section-head__eyebrow">Activity</p>' +
      '<h2 style="font-size:1.25rem;margin:0">Your recent reviews</h2></div>' +
      "</div>" +
      '<div id="reviews-host"></div>' +
      "</div></div></div>";

    renderReviews(reviews);
  }

  function renderReviews(reviews) {
    var host = document.getElementById("reviews-host");
    if (!host) return;
    if (!reviews.length) {
      host.innerHTML = S.emptyState({
        title: "No reviews yet",
        text: "Open any story and share your perspective — your reviews will appear here.",
        action: '<a class="btn btn--primary btn--sm" href="index.html" style="margin-top:.5rem">Find a story</a>',
      });
      return;
    }
    host.innerHTML =
      '<div class="review-grid">' +
      reviews
        .slice(0, 6)
        .map(function (review) {
          return (
            '<article class="card" style="padding:1.25rem">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.6rem">' +
            '<a class="link-underline" style="font-size:.85rem" href="article_detail.html?id=' + review.article + '">Open story</a>' +
            '<span style="font-size:.75rem;color:rgb(var(--text-subtle))">' + S.esc(S.fmtRelative(review.created_at)) + "</span>" +
            "</div>" +
            '<p style="margin:0 0 .6rem">' + starRow(review.rating) + "</p>" +
            '<p style="margin:0;font-size:.9rem;line-height:1.7;color:rgb(var(--text-muted))">' + S.esc(review.comment) + "</p>" +
            "</article>"
          );
        })
        .join("") +
      "</div>";
  }

  function starRow(rating) {
    var out = '<span class="stars" aria-label="' + rating + ' out of 4">';
    for (var i = 1; i <= 4; i++) {
      out +=
        '<svg viewBox="0 0 22 20" fill="currentColor" class="' + (Number(rating) >= i ? "" : "stars__empty") + '" aria-hidden="true">' +
        '<path d="M20.9 7.6a1.5 1.5 0 0 0-1.2-1L14.6 5.8 12.4 1.2a1.5 1.5 0 0 0-2.8 0L7.4 5.8l-5.1.7A1.5 1.5 0 0 0 1.5 9.2l3.6 3.6-.8 5a1.5 1.5 0 0 0 2.2 1.6L11 17l4.5 2.4a1.5 1.5 0 0 0 2.2-1.6l-.8-5 3.6-3.6a1.5 1.5 0 0 0 .4-1.6Z"/></svg>';
    }
    return out + "</span>";
  }

  function skeleton() {
    return (
      '<div class="profile-grid">' +
      '<div class="card" style="padding:1.5rem"><div class="sk" style="width:5.5rem;height:5.5rem;border-radius:999px;margin:0 auto 1rem"></div>' +
      '<div class="sk sk--title" style="width:60%;margin:0 auto .5rem"></div>' +
      '<div class="sk sk--line" style="width:40%;margin:0 auto"></div></div>' +
      '<div class="card" style="padding:1.5rem">' +
      '<div class="sk sk--line" style="width:30%;margin-bottom:1rem"></div>' +
      '<div class="sk sk--line" style="margin-bottom:.6rem"></div>' +
      '<div class="sk sk--line" style="width:80%;margin-bottom:.6rem"></div>' +
      '<div class="sk sk--line" style="width:65%"></div></div></div>'
    );
  }

  function boot() {
    var host = document.getElementById("profile-host");
    if (!host) return;
    if (!S.Session.requireLogin()) return;

    host.innerHTML = skeleton();

    var uid = S.Session.userId();
    Promise.all([
      S.Api.user(uid),
      S.Session.isAdmin(),
      S.Api.articles().catch(function () { return []; }),
    ])
      .then(function (res) {
        var user = res[0] || {};
        var admin = res[1];
        var articles = res[2] || [];

        // Reviews live on each article resource, so filter the ones we wrote.
        var mine = [];
        articles.forEach(function (article) {
          (article.reviews || []).forEach(function (review) {
            if (String(review.user) === String(uid)) {
              mine.push({
                article: article.id,
                rating: review.rating,
                comment: review.comment,
                created_at: review.created_at,
              });
            }
          });
        });
        mine.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });

        render(user, admin, mine);
        host.addEventListener("click", function (e) {
          if (e.target.closest("[data-logout]")) {
            e.preventDefault();
            S.logout();
          }
        });
      })
      .catch(function (err) {
        console.error(err);
        host.innerHTML = S.errorState({
          title: "Could not load your profile",
          text: err.message || "The newsroom service did not respond.",
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
