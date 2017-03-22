//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph.js','/shape/arcArrow.js','/data/cayley_d3.js',function (graphP,arrowPP,dataP) {

var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
item.graph.set('__data',Object.create(dataP));//.instantiate());
var arrowP = item.graph.set('arrowP',arrowPP.instantiate().__hide());
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = false;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 25;
arrowP.tailGap = 25;
var circleP = item.graph.circleP;
circleP.fill = 'red';
item.update = function () {
   item.graph.update();
}

return item;
});


 