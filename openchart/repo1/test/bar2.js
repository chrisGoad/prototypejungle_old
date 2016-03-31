
pj.require('chart/bar1.js','text/textarea1.js',['data/metal_densities2.js'],function (erm,graphP,text,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  debugger;
  item.graph.setData(data);
  item.set('title',text.instantiate());
  item.title.text = 'Hoom';
 // barGraph.xdata = barGraph.setData(data);
 // item.update = function () {
 //   this.barGraph.outerUpdate();
 // }
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
