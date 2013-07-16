/* generates common elements of the html pages */
if (typeof __pj__ == "undefined") {
  var __pj__ = {};
}
(function () {
  __pj__.genTopbar  = function (container,includeTitle,toExclude) {
    container.append(
      $('<div id="topbarOuter" style="padding-bottom:30px">'+
        '<div id = "topbarInner" style="float:right;">' +
           '<div class="button" id="GitHub">GitHub</div>' +
      '</div>'));
    var inr = $('#topbarInner');
    if (includeTitle) __pj__.genMainTitle($('#topbarOuter'),'Prototype Jungle');
    function addButton(text,url) {
      var rs = $('<div class="button">'+text+'</div>');
      inr.append(rs);
      rs.click(function () {location.href = url});
    }
    if (toExclude != 'tech') addButton('Tech Docs','/tech.html');
    if (toExclude != 'about') addButton('About','/about.html');
  }
  __pj__.genMainTitle = function (container,text) {
    var rs = $('<span class="mainTitle">'+text+'</span>');
    rs.css({'cursor':'pointer'});
    container.append(rs);
    rs.click(function () {location.href = "/"})
  }
})();

