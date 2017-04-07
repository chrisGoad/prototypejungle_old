pj.require('/diagram/itree.js',function (treeP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');

item.set('tree',treeP.instantiate());
var circleP = item.tree.circleP;
circleP.fill = "black";
circleP.stroke = "transparent";
circleP.dimension = 8;
var arrowP = item.tree.arrowP;
arrowP.headGap = 5;
arrowP.tailGap = 7;
arrowP['stroke-width'] = 2;
arrowP.headWidth = 5;
arrowP.headLength = 7;
item.tree.buildSimpleTree();
return item;
});
