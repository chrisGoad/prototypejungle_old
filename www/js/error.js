(function (__pj__) {
  var om = __pj__.om;
  var page = __pj__.page;
  page.genError = function (msg) {
    if (page.errorOccurred) return;
    page.genTopbar($('#topbar'),{includeTitle:1}); // regenerate top bar with all elements
    page.elementsToHideOnError.forEach(function (e) {e.hide()});
    page.errorOccurred = 1;
    $('#error').show();
    $('#error').html(msg);
  }
   
})(__pj__);

