pj.require('/diagram/itree2.js','/shape/arrow.js','/shape/circle.js',function (treeP,arrowPP,circlePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('tree',treeP.instantiate());


debugger;
var vertexP = pj.ui.installPrototype('circle',circlePP);
tree.graph.setupAsVertex(vertexP);
//ui.setupAsVertex(vertexP);
tree.graph.vertexP = vertexP;
tree.graph.vertexP.__dimension = 15;

/*
var vertexP = tree.graph.vertexP;
*/
vertexP.fill = "transparent";
vertexP.stroke = "black";
vertexP.__dimension = 15;
var edgeP = tree.graph.edgeP;
/*var leafP = tree.leafVertexP;
leafP.fill = "green";
leafP.stroke = "black";
leafP.dimension = 18;
*/
edgeP.headGap = 5;
edgeP.tailGap = 7;
edgeP['stroke-width'] = 2;
edgeP.headWidth = 5;
edgeP.headLength = 7;

let data = {d:[{},{}]}

item.update = function () {
   debugger;
   if (!this.initialized)  {
    this.tree.buildFromData(data);
    this.initialized = true;
  }
  this.tree.update();
}
return item;
});
