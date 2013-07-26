(function () {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var page = __pj__.page;
 
 
  page.genError = function (msg) {
    page.elementsToHideOnError.forEach(function (e) {e.hide()});
    $('#error').html(msg);
   
  }
   
})();

