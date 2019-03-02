// The Cayley graph for dihedral group D3

core.require('/shape/circle.js','/arrow/arcArrow.js','/data/cayley_d3.json',function (circlePP,arrowPP,data) {
let item = svg.Element.mk('<g/>');
let circleP = core.installPrototype('circle',circlePP);
let arrowP = core.installPrototype('arrow',arrowPP);
circleP.dimension = 40;
circleP.fill = 'red';
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = false;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 5;
arrowP.tailGap = 5;
item.vertexP = circleP;
item.edgeP = arrowP;
item.initialize = function () {
  graph.buildFromData(this,data);
}
return item;
});


 