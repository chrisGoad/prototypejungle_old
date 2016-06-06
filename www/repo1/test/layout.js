
pj.require('lib/grid_layout.js',function (erm,layout) {
  var item = pj.svg.Element.mk('<g/>');
  debugger;
  layout.bump();
  item.set('v',layout.abcv());
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
