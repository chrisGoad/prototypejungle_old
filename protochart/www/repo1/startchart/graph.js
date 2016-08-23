


pj.require('../diagram/graph.js','[TcYg4ep5s5TrvfxG5CWr11vjZZu1]/data/cayley_d3.json',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.circleP.dimension = 30;
  item.graph.circleP.fill = 'rgb(200,50,50)';
  item.graph.arrowP.stroke = 'black';
    item.graph.arrowP.headGap = 20;
    item.graph.arrowP.tailGap = 20;

  item.graph.arrowP.update();
  item.graph.circleP.update();
  item.graph.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/core_bar.js
*/
