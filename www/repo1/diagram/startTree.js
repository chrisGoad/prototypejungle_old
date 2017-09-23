'use strict';
pj.require('/diagram/verticalTree.js','/shape/arrow.js','/shape/circle.js',function (treeP,arrowPP,circlePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
var tree =  item.set('tree',treeP.instantiate());
var vertexP = tree.graph.installAsVertexPrototype(circlePP);
var edgeP = tree.graph.installAsEdgePrototype(arrowPP);
vertexP.__dimension = 15;
vertexP.fill = "transparent";
vertexP.stroke = "black";
vertexP.__dimension = 15;
edgeP.headGap = 5;
edgeP.tailGap = 7;
edgeP['stroke-width'] = 2;
edgeP.headWidth = 5;
edgeP.headLength = 7;

let data = {d:[{},{}]}

item.update = function () {
   if (!this.initialized)  {
    this.tree.buildFromData(data);
    this.initialized = true;
  }
  this.tree.update();
}
return item;
});
