var pages = {
  intro:"/draw.html?source=(sys)/forMainPage/intro_tree.item&intro=intro&fit=0.5",
  network:"/draw.html?source=/diagram/backGraph.js&intro=network&intro=network",
  details:"/draw.html?source=(sys)/intro/details.item&intro=details",
  textbox:"/draw.html?source=(sys)/forDocs/textbox.item&fit=0.3&intro=textbox",
  clone:"/draw.html?source=(sys)/intro/clone.item&intro=clone",
  cohorts:"/draw.html?source=(sys)/intro/cohorts.item&intro=cohorts"
}

var gotoPage = function (id) {
  var page = pages[id];
  window.parent.location.href = page;
}

