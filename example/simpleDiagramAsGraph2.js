//This is editable. Try replacing "blue" with "red" in "CircleP.fill = 'blue'", and re-running.


core.require('/shape/circle.js','/arrow/arcArrow.js',
function (circlePP,arrowPP) {
  let item = svg.Element.mk('<g/>');
  let circleP = item.set('circleP',circlePP.instantiate()).hide();
  let arrowP = item.set('arrowP',arrowPP.instantiate()).hide();
  circleP.r = 12;
  circleP.fill = 'blue';
  let circle1 = item.set('circle1',circleP.instantiate()).show();
  let circle2 = item.set('circle2',circleP.instantiate()).show();
  circle1.moveto(Point.mk(-50,0));
  circle2.moveto(Point.mk(50,0));
  // set the parameters of the edge prototype
  arrowP.stroke = 'orange';
  arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  arrowP.tailGap = 7; // gap between tail of arrow and its designated start point
  arrowP.headGap = 7; // gap between head of arrow and its designated end
  arrowP.solidHead = false;
  let arrow1 = item.set('arrow1',arrowP.instantiate()).show();
  let arrow2 = item.set('arrow2',arrowP.instantiate()).show();
  graph.connectVertices(arrow1,circle1,circle2);
  graph.connectVertices(arrow2,circle2,circle1);
  return item;
});
/*
Let's walk through the code.

    core.require('/diagram/graph.js','/shape/circle.js','/arrow/arcArrow.js',
      function (graphP,circlePP,arrowPP) {

This binds the variables graphP, circlePP and  arrowPP to the components defined in
'/diagram/graph.js', '/shape/circle.js', and '/shape/arcArrow.js', respectively.

  let item = svg.Element.mk('<g/>');
  
item is the root of the diagram we are assembling

  let graph = item.set('graph',graphP.instantiate());
  
Installs an instantiation of the graph component under the root.

  let circleP = graph.installAsVertexPrototype(circlePP);

This defines the prototype that will be used for vertices in this graph as a circle.
Note that installAsVertexPrototype is a method of  the graph component, defined
externally to the ProtoPedia platform.

  let circle1 = graph.addVertex();

instantiates the vertex prototype assigned by installAsVertexPrototype.

  circle1.moveto(Point.mk(-50,0));

moves the resulting circle to the given position. moveto and Point.mk are
operations defined by the platform. circle2 is created and moved analogously.

 graph.connectVertices(circle1,circle2);
 
instantiates the edge prototype (in this case an arrow), and connects its
ends to circle1 and circle2 respectively.

graph.connectVertices(circle2,circle1);

runs an arrow in the other direction.
  
 */