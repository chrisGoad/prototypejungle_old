(function (__pj__) {
  var om = __pj__.om;
  var page = __pj__.page;
  page.genError = function (msg) {
    if (page.errorOccurred) return;
    // for inspect, make the main div like outerContainer on other pages
    if ($('#main')) {
      $('#main').css({'padding':'20px','margin-left':'auto','margin-right':'auto',
                     'position':'relative','width':'700px','background-color':'white'});
    }
    page.genTopbar($('#topbar'),{includeTitle:1,'toExclude':{'file':1}}); // regenerate top bar with all elements
    page.elementsToHideOnError.forEach(function (e) {e._hide()});
    page.errorOccurred = 1;
    $('#error')._show();
    $('#error').html(msg);
  }
   
})(prototypeJungle);

