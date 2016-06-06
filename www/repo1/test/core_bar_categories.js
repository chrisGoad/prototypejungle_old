
pj.require('chart/core/bar1.js','data/trade_balance.js',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/chartsd?source=http://prototypejungle.org/sys/repo3|test/core_bar_categories.js
*/
