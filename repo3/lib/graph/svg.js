//realization of graphs in svg

pj.require('shape/arrow1.js','graph/def.js',function (erm,arrowPP,graphLib) {
var geom = pj.geom;
var svg = pj.svg;
var dat = pj.dat;
var item = pj.svg.Element.mk('<g/>');

item.set('arrowP',arrowPP.instantiate()).__hide();
var arrowP = item.arrowP;
arrowP.headGap = 0;
arrowP.includeEndControls = 0;
var graph = graphLib.graph;
var svgGraph = item;
// an svgGraph has an abstract graph as its graph property
// it has markSets arrows, vertices, vertexLabels, and edgeLabels


svgGraph.set("CircleP",
   svg.Element.mk('<circle  visibility="hidden" r="20" cx="0" cy="0"  fill="black"/>'));
svgGraph.CircleP.__customControlsOnly = 1;
svgGraph.CircleP.__controlPoints = function () {
  return [geom.Point.mk(this.cx,this.cy)];
}
svgGraph.CircleP.__updateControlPoint = function (idx,pos) {
  var graph = pj.ancestorWithName(this,'theGraph');
  var vertices = graph.data.vertices.elements;
  var vertex = vertices[this.__name];
  vertex.set('point',pos);
  graph.update();
  graph.__draw();
}


svgGraph.set("arrows",pj.Spread.mk(arrowP));
svgGraph.set("circles",pj.Spread.mk(svgGraph.CircleP));


svgGraph.arrows.binder = function (arrow,edge,indexInSeries,lengthOfDataSeries) {
  var graph = this.__parent.data;
  var vertices = graph.vertices.elements;
  var e0 = vertices[edge.e0];
  var e1 = vertices[edge.e1];
  var p0 = e0.point;
  var p1 = e1.point;
  var k = edge.kind;
  var color;
  arrow.__editPanelName = 'This arrow';
  arrow.setEnds(p0,p1);
  color = this.__parent.edgeKindsToColors[k];
  if (color) {
    arrow.stroke = color;
  }
  arrow.update();
  arrow.forEdge = edge.__name;

}

svgGraph.circles.binder = function (circle,vertex,name) {
  circle.__editPanelName = 'This vertex';
  var p = vertex.point;
  circle.cx = p.x;
  circle.cy = p.y;
  circle.forVertex = name;
}

svgGraph.update = function () {
  var d = this.data;
  if (d) {
    this.arrows.masterPrototype.__hideInEditPanel = 1;
    this.circles.masterPrototype.__hideInEditPanel = 1;
    this.arrows.setData(d.edges,1);
    this.circles.setData(d.vertices,1);
    pj.forEachTreeProperty(this.arrows.categorizedPrototypes,function (p) {
      p.__editPanelName = 'This kind of arrow';
    });
    pj.forEachTreeProperty(this.circles.categorizedPrototypes,function (v) {
      v.__editPanelName = 'This kind of vertex';
    });
  }
}

pj.ui.hide(item.CircleP,['cx','cy']);

pj.returnValue(undefined,svgGraph);

});


