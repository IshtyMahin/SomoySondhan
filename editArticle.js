/**
 * BACKWARD-COMPATIBILITY SHIM — /editArticle.js
 * ---------------------------------------------------------------
 * The editorial forms are now handled by assets/js/admin.js.
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
  document.write('<script src="' + BASE + 'js/admin.js"><\/script>');
})();
