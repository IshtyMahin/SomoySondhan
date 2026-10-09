/**
 * BACKWARD-COMPATIBILITY SHIM — /article.js
 * ---------------------------------------------------------------
 * Homepage and category rendering now lives in assets/js/articles.js
 * (with the shared runtime in core.js and the layout in
 * components.js). This shim keeps the legacy reference working and
 * preserves the original script order.
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
  document.write('<script src="' + BASE + 'js/articles.js"><\/script>');
})();
