


pj.require('chart/core/bar1.js','doodle/bowedlines1.js','data/metal_densities.js',function (erm,graphP,smudgedRect,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.set('barP',smudgedRect.instantiate());
  debugger;
  item.graph.barP.__hide();
  item.graph.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/core_bar.js
*/
