
pj.require('chart/bar1.js','data/trade_balance.js',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
 // graph.xdata = item.data;
  item.graph.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar_categories.js
*/
