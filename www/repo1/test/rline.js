
pj.require('../smudge/rline1.js',function (erm,rlineP) {
  var geom = pj.geom;
  var item = pj.svg.Element.mk('<g/>');
  item.set("main",rlineP.instantiate());
  debugger;
  var points = [[0,0],[200,100],[400,0]];
  item.main.set("points",pj.Array.mk(points.map(function (p) {return geom.Point.mk(p[0],p[1])})));
  item.main.update();
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
