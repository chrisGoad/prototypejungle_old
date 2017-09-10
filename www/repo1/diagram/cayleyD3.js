// The Cayley graph for dihedral group D3

pj.require('/diagram/graph.js','/shape/circle.js','/shape/arcArrow.js','/data/cayley_d3.js',function (graphP,circlePP,arrowPP,data) {
var ui = pj.ui;
var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
var circleP = ui.installAsVertexPrototype(circlePP);
var arrowP = ui.installAsEdgePrototype(arrowPP);
circleP.fill = 'red';;
item.graph.edgeP = arrowP;
item.graph.vertexP = circleP;
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = false;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 5;
arrowP.tailGap = 5;
item.graph.buildFromData(data);
return item;
});


 