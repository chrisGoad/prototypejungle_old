
pj.require('chart/component/legend2.js','data/trade_balance.js',function (erm,legend,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("legend",legend.instantiate());
  item.legend.setData(data);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
