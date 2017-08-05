 pj.require(function () {
  let item = pj.Object.mk();
  pj.ui.customInsert  = function (proto) {
     var rs;
     if (proto.__roles.indexOf('vertex') > -1) {
       rs = pj.root.diagram.addVertex(proto);
     } else if (proto.__roles.indexOf('edge') > -1) {
       rs = pj.root.diagram.addEdge(proto);
     }
     return rs;
   }
   return item;
 });
/*
pj.ui. var isVertex = proto.__role === 'vertex';
  var isEdge = proto.__role === 'edge';
  var isMultiIn = proto.__role === 'multiIn';
  var isMultiOut = proto.__role === 'multiOut';
  addToGraph = isVertex || isEdge || isMultiIn || isMultiOut;
  if (addToGraph) {
    if (isVertex) {
      rs = ui.graph.addVertex(proto);
    } else if (isMultiIn) {
      rs = ui.graph.addMultiIn(proto);
    } else if (isMultiOut) {
      rs = ui.graph.addMultiOut(proto);
    } else {
      rs = ui.graph.addEdge(proto);
    }*/