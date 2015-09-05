/* */ 
!function($) {
  var ready = require("../ready");
  $.ender({domReady: ready});
  $.ender({ready: function(f) {
      ready(f);
      return this;
    }}, true);
}(ender);
