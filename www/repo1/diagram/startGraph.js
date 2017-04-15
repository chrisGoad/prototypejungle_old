pj.require('/diagram/graph2.js',function (graphP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item =  svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());


var buildSimpleGraph = function (graph) {
var i;
for (i=0;i<3;i++) {
  graph.addVertex();
}
for (i=0;i<3;i++) {
  graph.addEdge();
}

graph.vertices.V1.__moveto(-50,50);
graph.vertices.V2.__moveto(50,50);

graph.connect('E0',0,'V0');
graph.connect('E0',1,'V1');

graph.connect('E1',0,'V1');
graph.connect('E1',1,'V2');

graph.connect('E2',0,'V2');
graph.connect('E2',1,'V0');

graph.update();
}
buildSimpleGraph(item.graph);

return item;
});
