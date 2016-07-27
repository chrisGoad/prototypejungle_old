
pj.require('../chart/bar1.js','[twitter:14822695]/data/metal_densities.json',function (erm,graphP,data) {
//pj.require('../chart/bar1.js','../data/trade_balance.js',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.orientation = 'vertical';
  item.graph.axis.bigTickImageInterval = 10;
  item.graph.set('extent',pj.geom.Point.mk(500,300));

  debugger;
  item.graph.setData(data);
  //item.set('title',text.instantiate());
  //item.title.text = 'A simple simple bar chart';
 // barGraph.xdata = barGraph.setData(data);
 // item.update = function () {
 //   this.barGraph.outerUpdate();
 // }
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
