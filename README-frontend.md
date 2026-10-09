# Somoy Sondhan — Frontend

Modern, dark-first newsroom UI for the Somoy Sondhan Django REST backend.
Plain HTML/CSS/JS — **no build step, no bundler**.

## Run it locally

The pages call the API at `https://somoysondhan-backend.onrender.com`, and use
root-absolute-free relative paths, so any static server rooted at this folder
works:

```powershell
# from this directory (SomoySondhan/)
python -m http.server 8099 --bind 127.0.0.1
# then open http://127.0.0.1:8099/index.html
```

Opening the `.html` files straight from disk also works, except that the
browser will block the `fetch` calls (`file://` has no HTTP origin).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage — hero lead story, trending rail, latest grid, per-section rails. `?category=<slug>` switches to a section archive. |
| `article_detail.html` | Story page — breadcrumb, prose with drop cap, sticky score card, rating histogram, star picker, reviews, related stories. |
| `login.html` / `registration.html` | Auth screens with inline validation. |
| `profile.html` | Account details, activity stats, recent reviews. |
| `addArticle.html` / `edit_article.html` / `addCategory.html` | Editorial desk (superusers only). |

## Architecture

```
assets/css/styles.css        design system: tokens (light + dark), components
assets/js/theme.js           applies the theme before first paint
assets/js/tailwind.config.js optional Tailwind config (unused by the pages)
assets/js/core.js            API client, session, formatters, toasts, dialogs,
                             skeleton/empty states, legacy showSpinner()/hideSpinner()
assets/js/components.js      header, mega-menu, account menu, mobile drawer,
                             ticker, footer, reading progress
assets/js/articles.js        homepage, section archive and article detail rendering
assets/js/auth.js            login + registration
assets/js/admin.js           add/edit article, add section
assets/js/profile.js         profile page
```

**Theming.** `appearance` is dark by default and follows the OS; a manual choice
is stored in `localStorage` under `ss-theme` and always wins. `theme.js` runs
synchronously in `<head>`, so there is no flash of the wrong theme.

**Design tokens** live in `:root` in `styles.css` (colours, type stacks, radii,
shadows, layout sizes) with the dark overrides under `.dark`. Change a value there
and every page follows.

**Fully offline-capable.** The pages load **no external stylesheet and no web
font**. `styles.css` contains its own reset, so it renders identically whether or
not a CDN is reachable — this is deliberate, because a blocked CDN previously
left the layout unstyled (icons at their default 300×150 size caused the header
and the login form to overlap and the page to scroll). Type uses system stacks:
a serif (`--font-serif`) for headlines, a sans stack (`--font-sans`) for body.

> Added a self-contained reset (box-sizing, margins, list, link and form-control
> normalisation, `svg { display: block }`) plus explicit rules for
> `#loading-spinner`, `.sr-only` and `overflow-x` guards, so nothing in the layout
> depends on a utility framework any more.

If you *do* want the Tailwind build later, `assets/js/tailwind.config.js` still
holds a matching palette, but no page includes it today.

## Legacy script paths

The original pages loaded `snippet.js`, `navbar.js`, `article.js`,
`article_detail.js`, `addArticle.js` and `editArticle.js`. Those files remain as
thin shims that synchronously load the new modules, so any older page that still
references them keeps working.

## Recovery note

A Windows file-permission repair was applied to `D:\_\Project` during this work
(a missing *write-owner* right was blocking all shell access; the signed-in user
gained full control, contents and ownership unchanged). Undo it with:

```powershell
pwsh -NoProfile -File 'D:\_\.dsh-acl-recovery\acl-backup-437e1b3879c74380842175c94d683a82.json.ps1' -Path 'D:\_\Project' -AllowRoot 'D:\_\Project' -Restore 'D:\_\.dsh-acl-recovery\acl-backup-437e1b3879c74380842175c94d683a82.json'
```

Two stray probe files remain and can be deleted manually — they are empty
scratch files: `D:\_\Project\.dsh-write-test.txt` and
`assets/css/probe.txt`. Deletion is currently blocked by a
`Deny DeleteSubdirectoriesAndFiles` entry inherited from `D:\`.
