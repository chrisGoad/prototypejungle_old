pj.require('/shape/circle.js',function (circleP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
item.set('g', pj.svg.Element.mk('<g/>'));
item.set('c',circleP.instantiate().__show());
item.set('text', svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black" stroke-width="0" text-anchor="middle"/>'));
item.text.setText('0000');
item.g.set('descendants',pj.Array.mk());
item.g.__moveto(geom.Point.mk(0,100));
item.g.descendants.push(pj.svg.Element.mk('<g/>'));
item.g.descendants[0].set('c',circleP.instantiate().__show());
item.g.descendants[0].__moveto(geom.Point.mk(100,0))
item.g.descendants[0].c.__moveto(geom.Point.mk(100,0))


return item;
});
