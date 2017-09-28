'use strict';
pj.require('/diagram/verticalTree.js','/shape/arrow.js','/text/textPlain.js','/diagram/navajoData.js',function (treeP,arrowPP,textPP,data) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
var tree =  item.set('tree',treeP.instantiate());



var vertexP = tree.graph.installAsVertexPrototype(textPP);

vertexP.vPadding = 0;
vertexP.multiline = true;

vertexP.fill = "black";
vertexP.stroke = "transparent";
var edgeP = tree.graph.installAsEdgePrototype(arrowPP);

edgeP.headGap = 5;
edgeP.tailGap = 7;
edgeP['stroke-width'] = 2;
edgeP.headWidth = 5;
edgeP.headLength = 7;


item.update = function () {
   if (!this.initialized)  {
    this.tree.buildFromData(data);
    this.initialized = true;
  }
  this.tree.update();
}
return item;
});
