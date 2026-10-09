/**
 * BACKWARD-COMPATIBILITY SHIM — /navbar.js
 * ---------------------------------------------------------------
 * The site header, mobile drawer, ticker and footer are now built by
 * assets/js/components.js. This shim keeps the legacy reference
 * working, loading that component layer synchronously so the header
 * exists before the page's own scripts run.
 */
(function () {
  var BASE = "assets/";
  var self = document.currentScript || (function () {
    var all = document.getElementsByTagName("script");
    return all[all.length - 1];
  })();
  if (self && self.src) {
    BASE = self.src.replace(/[^/]*$/, "");
  }
  document.write('<script src="' + BASE + 'js/core.js"><\/script>');
  document.write('<script src="' + BASE + 'js/components.js"><\/script>');
})();
