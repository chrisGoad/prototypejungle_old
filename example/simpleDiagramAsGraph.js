//This is editable. Try replacing "blue" with "red" in "circleP.fill = 'blue'", and re-running.

core.require('/shape/circle.js','/arrow/arcArrow.js',
function (circlePP,arrowPP) {
  let item = svg.Element.mk('<g/>');
  let circleP = core.installPrototype(circlePP); 
  let arrowP = core.installPrototype(arrowPP);
  // set the parameters of the circle prototype
  circleP.r = 12;
  circleP.fill = 'blue';
  let circle1 = item.add(circleP.instantiate()).show();
  let circle2 = item.add(circleP.instantiate()).show();
  circle1.moveto(Point.mk(-50,0));
  circle2.moveto(Point.mk(50,0));
  // set the parameters of the edge prototype
  arrowP.stroke = 'orange';
  arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  arrowP.tailGap = 7; // gap between tail of arrow and its designated start point
  arrowP.headGap = 7; // gap between head of arrow and its designated end
  arrowP.solidHead = false;
  let arrow1 = item.add(arrowP.instantiate()).show();
  let arrow2 = item.add(arrowP.instantiate()).show();
  graph.connectVertices(arrow1,circle1,circle2);
  graph.connectVertices(arrow2,circle2,circle1);
  return item;
});
/*
Let's walk through the code.

    core.require('/shape/circle.js','/arrow/arcArrow.js',
      function (circlePP,arrowPP) {

This binds the variables circlePP and  arrowPP to the components defined in
 '/shape/circle.js', and '/shape/arcArrow.js', respectively.

  let item = svg.Element.mk('<g/>');
  
item is the root of the diagram we are assembling

  let circleP = core.installPrototype(circlePP); 

circlePP is an external component. This instantiates the component, and adds that
instantiation in an appropriate place- thereby giving us an internal version circleP of
the external component circlePP. It is equivalent to:

  let circleP = core.root.prototypes.add(circlePP.instantiate().hide());
  
This little maneuver is needed so that
circleP's parameters can be set and saved with the item.

  let circle1 = item.add(circleP.instantiate()).show();
  let circle2 = item.add(circleP.instantiate()).show();

We have twice instantiated our internal circle prototype to
create the visible circles.

  circle1.moveto(Point.mk(-50,0));
  circle2.moveto(Point.mk(50,0));

and moved them to their destinations.

  graph.connectVertices(arrow1,circle1,circle2);

 Now circle1 and circle2 are connected by arrow1. Note
 that if you drag the circles around, the arrow follows.

  graph.connectVertices(arrow2,circle2,circle1);

runs an arrow in the other direction.
  
 */