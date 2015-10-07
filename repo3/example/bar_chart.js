
pj.require('chart/bar1.js','text/textarea1.js','data/metal_densities.js',function (erm,graphP,text,data) {
  debugger;
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|example/bar_chart.js
*/
