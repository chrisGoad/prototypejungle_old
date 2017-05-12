pj.require('/diagram/tree.js','/data/instantiateDiagram2.js',function (treeP,dataP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');

item.set('tree',treeP.instantiate());
item.tree.set('__data',Object.create(dataP));
var circleP = item.tree.graph.circleP;
circleP.fill = "black";
circleP.stroke = "transparent";
circleP.__dimension = 10;
var arrowP = item.tree.graph.arrowP;
arrowP.headGap = 5;
arrowP.tailGap = 7;

return item;
});
