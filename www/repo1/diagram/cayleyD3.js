//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph2.js','/shape/circle.js','/shape/arcArrow.js','/data/cayley_d3.js',function (graphP,circlePP,arrowPP,data) {
debugger;
var ui = pj.ui;
var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
//item.graph.set('__data',Object.create(dataP));//.instantiate());
var arrowP = pj.ui.installPrototype('arcArrow',arrowPP);
var vertexP = pj.ui.installPrototype('circle',circlePP);
ui.setupAsVertex(vertexP);
ui.setupAsEdge(arrowP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.edgeP = arrowP;
item.graph.vertexP = vertexP;
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = false;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 5;
arrowP.tailGap = 5;
var vertexP = item.graph.vertexP;
vertexP.fill = 'red';
item.update = function () {
   item.graph.update();
}
item.graph.buildFromData(data);

return item;
});


 