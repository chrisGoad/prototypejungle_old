


pj.require('chart/core/bar1.js','http://openchart.net/sys/repo1/data/metal_densities2.js',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/core_bar.js
*/
