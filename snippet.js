/**
 * BACKWARD-COMPATIBILITY SHIM — /snippet.js
 * ---------------------------------------------------------------
 * The frontend now lives in assets/js and assets/css. This file
 * keeps the legacy `/snippet.js` reference working by loading the
 * shared runtime (and the design system) in place, synchronously,
 * so the original script order is preserved.
 */
(function () {
  var BASE = "assets/";
  // Resolve relative to this script so the shim works from any depth.
  var self = document.currentScript || (function () {
    var all = document.getElementsByTagName("script");
    return all[all.length - 1];
  })();
  if (self && self.src) {
    BASE = self.src.replace(/[^/]*$/, "");
  }
  document.write('<link rel="stylesheet" href="' + BASE + 'css/styles.css">');
  document.write('<script src="' + BASE + 'js/theme.js"><\/script>');
  document.write('<script src="' + BASE + 'js/core.js"><\/script>');
})();
