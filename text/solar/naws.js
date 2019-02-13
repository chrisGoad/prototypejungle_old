

core.require('/diagram/graph.js',function (graphP) {

let graph = graphP.instantiate();

core.setFunction('computeMessage', function (graph) {
  if (graph.zub === undefined) {
    graph.zub = 0;
  } 
  return "Count "+graph.zub++;
});


graph.computeMessage =  function () {
  if (this.zum === undefined) {
    this.zum = 0;
  } 
  return "Count "+this.zum++;
}

graph.computeMessage.serializeMe = true;
graph.catalogUrl = '(sys)/catalog/solar.catalog';
return graph;
});

