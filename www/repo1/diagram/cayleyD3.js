//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph2.js','/shape/arcArrow.js','/data/cayley_d3.js',function (graphP,arrowPP,data) {

var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
//item.graph.set('__data',Object.create(dataP));//.instantiate());
var arrowP = ui.installPrototype('arcArrow',arrowPP);
//var arrowP = item.graph.set('edgeP',arrowPP.instantiate().__hide());
item.graph.edgeP = arrowP;
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


 