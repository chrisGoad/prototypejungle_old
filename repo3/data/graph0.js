
(function () {
pj.require([['graphLib','graph/def.js']],function (erm,top) {
  var graphLib = top.graphLib;
  var vv = graphLib.mkVertices({a:[0,0],b:[100,100],c:[300,100]});
  var ee = graphLib.mkEdges([['a','b'],['a','c'],['b','c']]);
  var g = graphLib.mkGraph(vv,ee);
  //top.set('data',g); 
  pj.returnValue(undefined,g);
});
})()
 

