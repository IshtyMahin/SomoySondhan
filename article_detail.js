/**
 * BACKWARD-COMPATIBILITY SHIM — /article_detail.js
 * ---------------------------------------------------------------
 * The article detail page is now rendered by assets/js/articles.js,
 * which detects this page from the URL. This shim keeps the legacy
 * reference working and preserves the original script order.
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
