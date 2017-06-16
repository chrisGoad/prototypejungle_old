pj.require('/axes/axis.js',function (axisP) {
  debugger;
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var axis =  item.set('axis1',axisP.instantiate());
var dataBounds = axis.dataBounds;
dataBounds.lb = 100;
dataBounds.ub = 300;
axis.width = 100;
axis.update();
return item;
});
