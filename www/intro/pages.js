var pages = {
  index:"/draw.html?intro=tutorial_index&source=(sys)/forMainPage/spiralLogo7.item&fit=0.7",
 basic_ops:"/draw.html?intro=basic_ops&fit=1.2",
  properties:"/draw.html?source=(sys)/forMainPage/three_circles.item&intro=properties&fit=0.7",
  prototypes:"/draw.html?source=(sys)/intro/prototypes.item&intro=prototypes&fit=0.75",
  swap:"/draw.html?source=(sys)/forMainPage/swap4.item&intro=swap&fit=0.5",
  image:"/draw.html?source=(sys)/intro/van_gogh.item&intro=image&fit=0.9",
  swapPart:"/draw.html?source=(sys)/forMainPage/three_circles.item&intro=swapPart&fit=0.7",
 files:"/draw.html?intro=files",
  //catalog:"/draw.html?intro=catalog",
 separate:"/draw.html?source=(sys)/intro/separate.item&intro=separate&fit=0.8",
  connections:"/draw.html?source=(sys)/intro/connections3.item&intro=network",
  multi_connect:"/draw.html?source=(sys)/intro/multiConnect.item&intro=details",
  clone:"/draw.html?source=(sys)/intro/copy.item&intro=copy",
  kit:"/draw.html?source=(sys)/intro/tree3.item&fit=0.8&intro=kit",
  data:"/draw.html?source=(sys)/intro/graph.item&fit=0.8&intro=data",
  catalog:"/draw.html?intro=catalog",
   variant:"/draw.html?source=(sys)/intro/decoArrow.item&fit=0.5&intro=variant",
   wrap:"/draw.html?source=(sys)/intro/wrap.item&fit=0.5&intro=wrap",
   share:"/draw.html?intro=share",
tree:"/draw.html?source=(sys)/intro/tree.item&fit=0.5&intro=tree",
  exercise:"/draw.html?source=(sys)/intro/exercise0.item&intro=exercise",
  beta:"/doc/beta.html"
}

//var pageOrder  = ['properties','basic_ops','network','swap','prototypes','clone','files','tree','data','separate','exercise'];
var pageOrder  = ['index','properties','basic_ops','connections','swap','image','clone','files','kit','data','catalog','wrap','variant','separate'];

const Aanimate = function (id,startFramesToOmit,endFramesToOmit) {
  debugger;
  parent.playHistory(id,startFramesToOmit,endFramesToOmit);
}

const showConnectionText = function () {
  let el = document.getElementById('connectionDetails');
  el.style.display = 'block';
  el = document.getElementById('openConnectionDetails');
  el.style.display = 'none';
}
const gotoPage = function (id) {
  debugger;
  let page = pages[id]?pages[id]:id;
  window.parent.location.href = page;
}

const gotoNextPage = function (myId) {
  debugger;
  let n = pageOrder.indexOf(myId);
  gotoPage(pageOrder[n+1]);
}


const gotoPrevPage = function (myId) {
  let n = pageOrder.indexOf(myId);
  gotoPage(pageOrder[n-1]);
}

