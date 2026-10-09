/**
 * SOMOY SONDHAN — layout probe
 * ---------------------------------------------------------------
 * Silent unless something is genuinely wrong. When an element sits at a
 * NEGATIVE horizontal position (content running off the left edge — the
 * cause of a right-to-left scrollbar) it prints the culprits to the
 * console and shows a small banner.
 *
 * Nothing is uploaded. Remove the <script> tag that loads this file when
 * the layout is confirmed good.
 */
(function () {
  "use strict";

  var TOLERANCE = 1;

  function label(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    var cls = typeof el.className === "string" ? el.className.trim() : "";
    if (cls) s += "." + cls.split(/\s+/).slice(0, 3).join(".");
    return s;
  }

  function detect() {
    var vw = window.innerWidth;
    var leftmost = null;
    var negatives = [];
    var all = document.querySelectorAll("body *");

    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (leftmost === null || r.left < leftmost.r.left) leftmost = { el: el, r: r };
      if (r.left < -TOLERANCE) {
        negatives.push(label(el) + " left=" + Math.round(r.left) + " width=" + Math.round(r.width));
        if (negatives.length >= 8) break;
      }
    }

    var doc = document.documentElement;
    return {
      viewport: vw,
      docWidth: doc.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      scrollX: window.scrollX,
      leftmost: leftmost
        ? label(leftmost.el) + " left=" + Math.round(leftmost.r.left) + " width=" + Math.round(leftmost.r.width)
        : "none",
      negatives: negatives,
      shell: (function () {
        var s = document.querySelector(".shell");
        if (!s) return "no .shell found";
        var r = s.getBoundingClientRect();
        var cs = window.getComputedStyle(s);
        return "left=" + Math.round(r.left) + " width=" + Math.round(r.width) +
          " marginLeft=" + cs.marginLeft + " marginRight=" + cs.marginRight +
          " maxWidth=" + cs.maxWidth;
      })(),
    };
  }

  function show(rep) {
    var wrap = document.createElement("div");
    wrap.id = "ss-layout-probe";
    wrap.style.cssText =
      "position:fixed;z-index:2147483000;left:0;right:0;bottom:0;max-height:45vh;overflow:auto;" +
      "font:12px/1.5 Consolas,monospace;background:#7f1d1d;color:#fff;padding:10px 14px;" +
      "box-shadow:0 -6px 24px rgba(0,0,0,.45)";

    var text = [
      "CONTENT IS OFF THE LEFT EDGE (causes a right-to-left scrollbar)",
      "viewport=" + rep.viewport + "  document=" + rep.docWidth + "  body=" + rep.bodyWidth + "  scrollX=" + rep.scrollX,
      ".shell: " + rep.shell,
      "leftmost element: " + rep.leftmost,
    ];
    if (rep.negatives.length) {
      text.push("NEGATIVE-POSITION ELEMENTS:");
      rep.negatives.forEach(function (n) { text.push("  - " + n); });
    }

    wrap.innerHTML =
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:6px">' +
      "<strong>layout probe — please send me this text</strong>" +
      '<button id="ss-layout-probe-close" style="font:inherit;background:rgba(255,255,255,.18);color:#fff;border:0;border-radius:5px;padding:3px 9px;cursor:pointer">hide</button>' +
      "</div><pre style='margin:0;white-space:pre-wrap;font:inherit'>" +
      text.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;") +
      "</pre>";
    document.body.appendChild(wrap);
    document.getElementById("ss-layout-probe-close").addEventListener("click", function () { wrap.remove(); });

    console.log("[layout-probe] " + text.join("\n[layout-probe] "));
  }

  function run() {
    setTimeout(function () {
      try {
        var rep = detect();
        // Only speak up when content genuinely sits off the left edge or the
        // document is wider than the window.
        if (rep.negatives.length || rep.docWidth > rep.viewport + 1) show(rep);
        else console.log("[layout-probe] healthy: document=" + rep.docWidth + " viewport=" + rep.viewport +
          " | .shell " + rep.shell + " | leftmost " + rep.leftmost);
      } catch (e) {
        console.log("[layout-probe] failed: " + e.message);
      }
    }, 1000);
  }

  if (document.readyState === "complete") run();
  else window.addEventListener("load", run);
})();
