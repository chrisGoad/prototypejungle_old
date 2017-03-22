pj.require('/shape/arc_arrow.js',function (arrowP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
item.set('arrow',arrowP.instantiate());
var e0 = geom.Point.mk(0,0);
var e1 = geom.Point.mk(100,0);
item.arrow.setEnds(e0,e1);
item.arrow.label = 'hoob';
item.update = function () {
  this.arrow.update();
}

return item;
});
