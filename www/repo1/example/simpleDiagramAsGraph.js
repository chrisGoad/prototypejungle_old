
pj.require('/diagram/graph.js','/shape/circle.js','/shape/arcArrow.js',function (graphP,circlePP,arrowPP) {
  var geom = pj.geom,svg = pj.svg,ui = pj.ui;
  var item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  var graph = item.set('graph',graphP.instantiate());
  var circleP = graph.installAsVertexPrototype(circlePP);
  var arrowP = graph.installAsEdgePrototype(arrowPP);
  circleP.r = 12;
  circleP.fill = 'blue';
  var circle1 = graph.addVertex();
  var circle2 = graph.addVertex();
  circle1.__moveto(geom.Point.mk(-50,0));
  circle2.__moveto(geom.Point.mk(50,0));
  // set the parameters of the edge prototype
  arrowP.stroke = 'orange';
  arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  arrowP.tailGap = 7; // gap between tail of arrow and its designated start point
  arrowP.headGap = 7; // gap between head of arrow and its designated end
  arrowP.solidHead = false;
  graph.connectVertices(circle1,circle2);
  graph.connectVertices(circle2,circle1);
  return item;
});
