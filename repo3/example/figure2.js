
(function () {
pj.require('graph/def.js','graph/svg.js','example/data/figure2.js',function (erm,graphLib,svgGraph,data) {
  var item = pj.svg.Element.mk('<g/>');
  var theGraph = item.set('theGraph',svgGraph.instantiate());
  theGraph.arrowP['stroke-width'] = 0.6;
  theGraph.arrowP.headLength = 4;
  theGraph.arrowP.headWidth = 4;
  theGraph.CircleP.r = 1.5;
  theGraph.arrowP.headGap = 2;

  /*item.protoEdgeColor = 'red';
  item.propEdgeColor = 'black';
  item.__setFieldType("protoEdgeColor","svg.Rgb");
  item.__setFieldType("propEdgeColor","svg.Rgb");
  pj.ui.watch(item,['protoEdgeColor','propEdgeColor']);
*/
  /*var vv = graphLib.mkVertices({a:[0,0],b:[100,100],c:[300,100]});
  var ee = graphLib.mkEdges([['a','b'],['a','c'],['b','c']]);
  var g = graphLib.mkGraph(vv,ee);
  top.theGraph.data = g;
  */
  //svgGraph.set('__requires',top.__requires);
  //item.update = function () {
  //  console.log('WWWWWHHHEEEE')
  theGraph.setData(data);
  theGraph.data.__importComponent();// when saved, the data goes with this graph
  item.update = function () {
    this.theGraph.set('edgeKindsToColors',pj.lift({'proto':this.protoEdgeColor,'prop':'black'}));
    this.theGraph.update();
    this.theGraph.draw();

  }
 //   theGraph.update();
 // }
  pj.returnValue(undefined,item);
});
})()
 
/*
http://prototypejungle.org/ui?source=http://prototypejungle.org/sys/repo3|example/figure2.js
 */
