// A sample graph for the catalog

pj.require('/diagram/graph.js','/shape/arrow.js','/data/sampleGraph.js',function (graphP,arrowPP,dataP) {

var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
item.graph.set('__data',Object.create(dataP));//.instantiate());
var arrowP = item.graph.set('arrowP',arrowPP.instantiate().__hide());
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


 