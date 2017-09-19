'use strict';
pj.require('/diagram/itree2.js','/text/textPlain.js','/diagram/navajoData.js',function (treeP,textPP,data) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('tree',treeP.instantiate());



var vertexP = pj.ui.installPrototype('text',textPP);
ui.setupAsVertex(vertexP);
tree.graph.vertexP = vertexP;
vertexP.vPadding = 0;
vertexP.multiline = true;
//tree.graph.vertexP.__dimension = 15;

/*
var vertexP = tree.graph.vertexP;
*/
vertexP.fill = "black";
vertexP.stroke = "transparent";
//vertexP.__dimension = 15;
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
let dataa = {text:'root',d:[
  {text:'child1'},
  {text:'child2'}
  ]
}

item.update = function () {
   debugger;
   if (!this.initialized)  {
    this.tree.buildFromData(data.vdata);
    //this.tree.buildSimpleTree();
    this.initialized = true;
  }
  debugger;
  this.tree.update();
}
return item;
});
