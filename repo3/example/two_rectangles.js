(function () {
var item = pj.svg.Element.mk('<g/>');
// the prototype for the two rectangles, r1, and r2
item.set("rectP", pj.svg.Element.mk(
  '<rect  fill="blue" stroke="black" stroke-width="5" x="0" y="0" width="100" height="100"/>'
).hide());
item.set("r1",item.rectP.instantiate()).show();
item.r1.fill="green";
item.set("r2",item.rectP.instantiate()).show();
item.r2.x = 120;
pj.returnValue(undefined,item);
})();
/*
http://prototypejungle.org/chartsd?source=http://prototypejungle.org/sys/repo3|example/two_rectangles.js
*/