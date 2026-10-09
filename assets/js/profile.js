/**
 * SOMOY SONDHAN — user profile & account management
 * ---------------------------------------------------------------
 * Full user handling:
 *   - Account overview (stats, information, recent reviews)
 *   - Edit profile (first/last name, email, bio, location, website, avatar)
 *   - Change password (secure token update)
 *   - Admin / staff user management (user directory, role promotion, suspend/restore)
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

  function starRow(rating) {
    var out = '<span class="stars" aria-label="' + rating + ' out of 4">';
    for (var i = 1; i <= 4; i++) {
      out +=
        '<svg viewBox="0 0 22 20" fill="currentColor" class="' + (Number(rating) >= i ? "" : "stars__empty") + '" aria-hidden="true">' +
        '<path d="M20.9 7.6a1.5 1.5 0 0 0-1.2-1L14.6 5.8 12.4 1.2a1.5 1.5 0 0 0-2.8 0L7.4 5.8l-5.1.7A1.5 1.5 0 0 0 1.5 9.2l3.6 3.6-.8 5a1.5 1.5 0 0 0 2.2 1.6L11 17l4.5 2.4a1.5 1.5 0 0 0 2.2-1.6l-.8-5 3.6-3.6a1.5 1.5 0 0 0 .4-1.6Z"/></svg>';
    }
    return out + "</span>";
  }

  function render(user, admin, reviews) {
    var host = document.getElementById("profile-host");
    if (!host) return;

    var profile = user.profile || {};
    var name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Reader";
    var avatarHtml = profile.avatar
      ? '<img src="' + S.esc(profile.avatar) + '" class="avatar avatar--lg" style="margin:0 auto .9rem;object-fit:cover" alt="' + S.esc(name) + '">'
      : '<span class="avatar avatar--lg" style="margin:0 auto .9rem">' + S.esc(S.initials(name)) + "</span>";

    var uniqueArticles = {};
    var average = 0;
    if (reviews.length) {
      reviews.forEach(function (r) { uniqueArticles[r.article] = true; });
      average = reviews.reduce(function (sum, r) { return sum + Number(r.rating || 0); }, 0) / reviews.length;
    }

    host.innerHTML =
      '<div class="profile-grid">' +
      // Sidebar identity card
      '<aside style="display:grid;gap:1.25rem;align-content:start">' +
      '<div class="card" style="padding:1.5rem;text-align:center">' +
      avatarHtml +
      '<h2 style="margin:0 0 .25rem;font-size:1.3rem">' + S.esc(name) + "</h2>" +
      '<p style="margin:0 0 .6rem;font-size:.85rem;color:rgb(var(--text-subtle))">@' + S.esc(user.username || "reader") + "</p>" +
      '<span class="badge ' + (admin ? "badge--brand" : "badge--outline-brand") + '">' +
      (admin ? (user.is_superuser ? "Superuser" : "Editor") : "Reader") + "</span>" +
      (profile.bio ? '<p style="margin:.85rem 0 0;font-size:.85rem;line-height:1.5;color:rgb(var(--text-muted))">' + S.esc(profile.bio) + "</p>" : "") +
      '<div style="display:grid;gap:.6rem;margin-top:1.4rem">' +
      '<a class="btn btn--soft btn--block" href="index.html">Browse stories</a>' +
      '<button type="button" class="btn btn--ghost btn--block" data-logout>Sign out</button>' +
      "</div></div>" +
      (admin
        ? '<div class="card" style="padding:1.25rem">' +
          '<p class="section-head__eyebrow">Newsroom shortcuts</p>' +
          '<div style="display:grid;gap:.5rem">' +
          '<a class="btn btn--primary btn--sm btn--block" href="addArticle.html">Write an article</a>' +
          '<a class="btn btn--soft btn--sm btn--block" href="addCategory.html">Manage sections</a>' +
          "</div></div>"
        : "") +
      "</aside>" +

      // Main content tabs
      '<div style="display:grid;gap:1.25rem">' +
      '<div class="card" style="padding:.75rem 1rem">' +
      '<nav class="tabs-nav" style="display:flex;gap:.5rem;flex-wrap:wrap">' +
      '<button type="button" class="btn btn--soft btn--sm is-active" data-tab="overview">Overview</button>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-tab="edit-profile">Edit Profile</button>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-tab="change-password">Change Password</button>' +
      (admin ? '<button type="button" class="btn btn--ghost btn--sm" data-tab="manage-users">Manage Users</button>' : "") +
      "</nav></div>" +

      // Tab 1: Overview
      '<div class="tab-pane" id="tab-overview">' +
      '<div class="card" style="padding:clamp(1.25rem,3vw,1.75rem);margin-bottom:1.25rem">' +
      '<p class="section-head__eyebrow">Account details</p>' +
      '<div style="margin-top:1rem">' +
      infoRow("Username", user.username, "user") +
      infoRow("Full name", [user.first_name, user.last_name].filter(Boolean).join(" ")) +
      infoRow("Email", user.email, "mail") +
      infoRow("Bio", profile.bio) +
      infoRow("Location", profile.location) +
      infoRow("Website", profile.website) +
      "</div></div>" +
      '<div class="stats-grid" style="margin-bottom:1.25rem">' +
      statCard(reviews.length, reviews.length === 1 ? "Review written" : "Reviews written", "spark") +
      statCard(Object.keys(uniqueArticles).length, "Stories rated", "bookmark") +
      statCard(reviews.length ? average.toFixed(1) + " / 4" : "—", "Average rating given", "trending") +
      "</div>" +
      '<div class="card" style="padding:clamp(1.25rem,3vw,1.75rem)">' +
      '<div class="section-head" style="margin-bottom:1rem">' +
      '<div><p class="section-head__eyebrow">Activity</p>' +
      '<h2 style="font-size:1.25rem;margin:0">Your recent reviews</h2></div>' +
      "</div>" +
      '<div id="reviews-host"></div>' +
      "</div></div>" +

      // Tab 2: Edit Profile
      '<div class="tab-pane" id="tab-edit-profile" style="display:none">' +
      '<div class="card" style="padding:clamp(1.25rem,3vw,1.75rem)">' +
      '<h3 style="margin:0 0 .35rem;font-size:1.25rem">Edit Profile</h3>' +
      '<p style="margin:0 0 1.25rem;font-size:.85rem;color:rgb(var(--text-muted))">Update your account name, bio, and profile details.</p>' +
      '<form id="profile-edit-form" novalidate>' +
      '<div class="form-grid form-grid--2">' +
      '<div class="field"><label class="field__label" for="edit-first-name">First name</label>' +
      '<input class="input" type="text" id="edit-first-name" value="' + S.esc(user.first_name || "") + '"></div>' +
      '<div class="field"><label class="field__label" for="edit-last-name">Last name</label>' +
      '<input class="input" type="text" id="edit-last-name" value="' + S.esc(user.last_name || "") + '"></div>' +
      '<div class="field"><label class="field__label" for="edit-email">Email</label>' +
      '<input class="input" type="email" id="edit-email" value="' + S.esc(user.email || "") + '" required></div>' +
      '<div class="field"><label class="field__label" for="edit-location">Location</label>' +
      '<input class="input" type="text" id="edit-location" value="' + S.esc(profile.location || "") + '" placeholder="e.g. Dhaka, Bangladesh"></div>' +
      "</div>" +
      '<div class="field"><label class="field__label" for="edit-website">Website</label>' +
      '<input class="input" type="url" id="edit-website" value="' + S.esc(profile.website || "") + '" placeholder="https://..."></div>' +
      '<div class="field"><label class="field__label" for="edit-bio">Bio</label>' +
      '<textarea class="textarea" id="edit-bio" rows="3" placeholder="Tell other readers about yourself...">' + S.esc(profile.bio || "") + "</textarea></div>" +
      '<div class="field"><label class="field__label" for="edit-avatar">Profile Avatar</label>' +
      '<input class="input" type="file" id="edit-avatar" accept="image/*">' +
      '<span class="field__hint">Upload a JPG, PNG or WEBP avatar image.</span></div>' +
      '<div id="profile-edit-error" class="alert alert--error" style="display:none;margin-bottom:1rem"></div>' +
      '<div style="display:flex;gap:.75rem">' +
      '<button type="submit" class="btn btn--primary" id="save-profile-btn">Save Changes</button>' +
      '<button type="button" class="btn btn--soft" data-cancel-edit>Cancel</button>' +
      "</div></form></div></div>" +

      // Tab 3: Change Password
      '<div class="tab-pane" id="tab-change-password" style="display:none">' +
      '<div class="card" style="padding:clamp(1.25rem,3vw,1.75rem);max-width:36rem">' +
      '<h3 style="margin:0 0 .35rem;font-size:1.25rem">Change Password</h3>' +
      '<p style="margin:0 0 1.25rem;font-size:.85rem;color:rgb(var(--text-muted))">Choose a strong password with at least 8 characters.</p>' +
      '<form id="password-change-form" novalidate>' +
      '<div class="field"><label class="field__label" for="pwd-current">Current password</label>' +
      '<input class="input" type="password" id="pwd-current" required autocomplete="current-password"></div>' +
      '<div class="field"><label class="field__label" for="pwd-new">New password</label>' +
      '<input class="input" type="password" id="pwd-new" required autocomplete="new-password"></div>' +
      '<div class="field"><label class="field__label" for="pwd-confirm">Confirm new password</label>' +
      '<input class="input" type="password" id="pwd-confirm" required autocomplete="new-password"></div>' +
      '<div id="password-change-error" class="alert alert--error" style="display:none;margin-bottom:1rem"></div>' +
      '<button type="submit" class="btn btn--primary" id="change-pwd-btn">Update Password</button>' +
      "</form></div></div>" +

      // Tab 4: User Management (Staff only)
      (admin
        ? '<div class="tab-pane" id="tab-manage-users" style="display:none">' +
          '<div class="card" style="padding:clamp(1.25rem,3vw,1.75rem)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem">' +
          '<div><h3 style="margin:0 0 .25rem;font-size:1.25rem">Reader &amp; Staff Directory</h3>' +
          '<p style="margin:0;font-size:.85rem;color:rgb(var(--text-muted))">Manage roles, permissions, and account statuses.</p></div>' +
          '<div style="display:flex;gap:.5rem">' +
          '<input type="search" class="input" id="user-search" placeholder="Search by name, email, username..." style="min-width:16rem">' +
          "</div></div>" +
          '<div id="user-table-host"><p style="color:rgb(var(--text-muted))">Loading user directory...</p></div>' +
          "</div></div>"
        : "") +

      "</div></div>";

    renderReviews(reviews);
    bindTabs();
    bindProfileForm(user);
    bindPasswordForm();
    if (admin) bindUserManagement();
  }

  function bindTabs() {
    var nav = document.querySelector(".tabs-nav");
    if (!nav) return;
    nav.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-tab]");
      if (!btn) return;
      var target = btn.getAttribute("data-tab");

      nav.querySelectorAll("[data-tab]").forEach(function (b) {
        b.classList.remove("is-active", "btn--soft");
        b.classList.add("btn--ghost");
      });
      btn.classList.add("is-active", "btn--soft");
      btn.classList.remove("btn--ghost");

      document.querySelectorAll(".tab-pane").forEach(function (pane) {
        pane.style.display = pane.id === "tab-" + target ? "block" : "none";
      });
    });

    var cancelBtn = document.querySelector("[data-cancel-edit]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        var overviewBtn = nav.querySelector('[data-tab="overview"]');
        if (overviewBtn) overviewBtn.click();
      });
    }
  }

  function bindProfileForm(user) {
    var form = document.getElementById("profile-edit-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errEl = document.getElementById("profile-edit-error");
      var btn = document.getElementById("save-profile-btn");
      errEl.style.display = "none";
      errEl.textContent = "";

      var payload = {
        first_name: document.getElementById("edit-first-name").value.trim(),
        last_name: document.getElementById("edit-last-name").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        profile: {
          bio: document.getElementById("edit-bio").value.trim(),
          location: document.getElementById("edit-location").value.trim(),
          website: document.getElementById("edit-website").value.trim(),
        },
      };

      var avatarInput = document.getElementById("edit-avatar");
      var avatarFile = avatarInput && avatarInput.files && avatarInput.files[0];

      S.setLoading(btn, true);

      var updatePromise = S.Api.updateMe(payload);
      if (avatarFile) {
        updatePromise = updatePromise.then(function () {
          return S.Api.setAvatar(avatarFile);
        });
      }

      updatePromise
        .then(function () {
          S.toast("Profile updated successfully!", "success");
          setTimeout(function () { window.location.reload(); }, 800);
        })
        .catch(function (err) {
          errEl.style.display = "block";
          errEl.textContent = (err && err.data && (err.data.error || err.data.detail || err.data.email)) || err.message || "Failed to update profile.";
        })
        .finally(function () {
          S.setLoading(btn, false);
        });
    });
  }

  function bindPasswordForm() {
    var form = document.getElementById("password-change-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errEl = document.getElementById("password-change-error");
      var btn = document.getElementById("change-pwd-btn");
      errEl.style.display = "none";

      var current = document.getElementById("pwd-current").value;
      var newPwd = document.getElementById("pwd-new").value;
      var confirmPwd = document.getElementById("pwd-confirm").value;

      if (!current || !newPwd) {
        errEl.textContent = "Please fill in all password fields.";
        errEl.style.display = "block";
        return;
      }
      if (newPwd !== confirmPwd) {
        errEl.textContent = "New passwords do not match.";
        errEl.style.display = "block";
        return;
      }
      if (newPwd.length < 8) {
        errEl.textContent = "New password must be at least 8 characters.";
        errEl.style.display = "block";
        return;
      }

      S.setLoading(btn, true);
      S.Api.changePassword({
        current_password: current,
        new_password: newPwd,
        confirm_password: confirmPwd,
      })
        .then(function (res) {
          if (res && res.token) {
            S.Session.save(res.token, S.Session.userId());
          }
          S.toast("Password updated successfully!", "success");
          form.reset();
        })
        .catch(function (err) {
          errEl.textContent = (err && err.data && (err.data.error || err.data.detail || (err.data.new_password && err.data.new_password[0]))) || err.message || "Could not change password.";
          errEl.style.display = "block";
        })
        .finally(function () {
          S.setLoading(btn, false);
        });
    });
  }

  function bindUserManagement() {
    var host = document.getElementById("user-table-host");
    var searchInput = document.getElementById("user-search");
    if (!host) return;

    function loadUsers(query) {
      host.innerHTML = '<p style="color:rgb(var(--text-muted))">Loading user directory...</p>';
      S.Api.users(query)
        .then(function (users) {
          if (!users || !users.length) {
            host.innerHTML = S.emptyState({
              title: "No users found",
              text: "Try adjusting your search query.",
            });
            return;
          }

          var rows = users.map(function (u) {
            var fullName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
            var currentRole = u.role || (u.is_staff ? "editor" : "reader");
            var isBlocked = !!u.is_blocked;

            return (
              '<tr style="border-bottom:1px solid rgb(var(--border))">' +
              '<td style="padding:.75rem .5rem;font-weight:600">' + S.esc(fullName) +
              '<br><span style="font-weight:normal;font-size:.78rem;color:rgb(var(--text-subtle))">@' + S.esc(u.username) + "</span></td>" +
              '<td style="padding:.75rem .5rem;font-size:.85rem">' + S.esc(u.email || "—") + "</td>" +
              '<td style="padding:.75rem .5rem">' +
              '<select class="input input--sm" data-role-user="' + u.id + '" style="font-size:.82rem;padding:.3rem .5rem">' +
              '<option value="reader"' + (currentRole === "reader" ? " selected" : "") + '>Reader</option>' +
              '<option value="editor"' + (currentRole === "editor" ? " selected" : "") + '>Editor</option>' +
              '<option value="admin"' + (currentRole === "admin" ? " selected" : "") + '>Admin</option>' +
              "</select></td>" +
              '<td style="padding:.75rem .5rem">' +
              (isBlocked
                ? '<span class="badge badge--error">Suspended</span>'
                : '<span class="badge badge--live">Active</span>') +
              "</td>" +
              '<td style="padding:.75rem .5rem;text-align:right">' +
              (isBlocked
                ? '<button type="button" class="btn btn--outline btn--sm" data-unblock="' + u.id + '">Restore</button>'
                : '<button type="button" class="btn btn--danger btn--sm" data-block="' + u.id + '">Suspend</button>') +
              "</td>" +
              "</tr>"
            );
          }).join("");

          host.innerHTML =
            '<div style="overflow-x:auto">' +
            '<table style="width:100%;border-collapse:collapse;text-align:left;font-size:.875rem">' +
            '<thead><tr style="border-bottom:2px solid rgb(var(--border));color:rgb(var(--text-subtle));font-size:.8rem;text-transform:uppercase">' +
            '<th style="padding:.5rem">User</th>' +
            '<th style="padding:.5rem">Email</th>' +
            '<th style="padding:.5rem">Role</th>' +
            '<th style="padding:.5rem">Status</th>' +
            '<th style="padding:.5rem;text-align:right">Actions</th>' +
            "</tr></thead>" +
            "<tbody>" + rows + "</tbody></table></div>";

          // Wire role changes
          host.querySelectorAll("[data-role-user]").forEach(function (select) {
            select.addEventListener("change", function () {
              var uid = select.getAttribute("data-role-user");
              var role = select.value;
              S.Api.setUserRole(uid, role)
                .then(function () {
                  S.toast("Updated user role to " + role, "success");
                })
                .catch(function (err) {
                  S.toast(err.message || "Could not change role.", "error");
                  loadUsers(searchInput ? searchInput.value : "");
                });
            });
          });

          // Wire block / unblock
          host.querySelectorAll("[data-block]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var uid = btn.getAttribute("data-block");
              S.confirm({
                title: "Suspend this user?",
                text: "The user will not be able to sign in or leave reviews.",
                danger: true,
                confirmText: "Suspend",
              }).then(function (ok) {
                if (!ok) return;
                S.Api.blockUser(uid)
                  .then(function () {
                    S.toast("User account suspended.", "success");
                    loadUsers(searchInput ? searchInput.value : "");
                  })
                  .catch(function (err) {
                    S.toast(err.message || "Could not suspend user.", "error");
                  });
              });
            });
          });

          host.querySelectorAll("[data-unblock]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var uid = btn.getAttribute("data-unblock");
              S.Api.unblockUser(uid)
                .then(function () {
                  S.toast("User account restored.", "success");
                  loadUsers(searchInput ? searchInput.value : "");
                })
                .catch(function (err) {
                  S.toast(err.message || "Could not restore user.", "error");
                });
            });
          });
        })
        .catch(function (err) {
          host.innerHTML = S.errorState({
            title: "Directory unavailable",
            text: err.message || "Could not load the users list.",
          });
        });
    }

    loadUsers("");

    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener("input", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          loadUsers(searchInput.value.trim());
        }, 350);
      });
    }
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
        .map(function (review) {
          return (
            '<article class="card is-visible" style="padding:1.25rem">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.6rem">' +
            '<a class="link-underline" style="font-size:.85rem" href="article_detail.html?id=' + review.article + '">Open story</a>' +
            '<span style="font-size:.75rem;color:rgb(var(--text-subtle))">' + S.esc(S.fmtRelative(review.created_at)) + "</span>" +
            "</div>" +
            '<p style="margin:0 0 .6rem">' + starRow(review.rating) + "</p>" +
            '<p style="margin:0;font-size:.9rem;line-height:1.7;color:rgb(var(--text-muted))">' + S.esc(review.comment || review.body || "") + "</p>" +
            "</article>"
          );
        })
        .join("") +
      "</div>";
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
      S.Api.me().catch(function () { return S.Api.user(uid); }),
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
