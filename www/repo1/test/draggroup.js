pj.require('/shape/circle.js',function (circleP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
item.set('g', pj.svg.Element.mk('<g/>'));
item.g.set('g1', pj.svg.Element.mk('<g/>'));
item.set('c',circleP.instantiate().__show());
item.g.g1.__moveto(geom.Point.mk(0,100));
item.g.g1.set('c0',circleP.instantiate().__show());
item.g.g1.c0.__moveto(geom.Point.mk(100,0))


return item;
});
