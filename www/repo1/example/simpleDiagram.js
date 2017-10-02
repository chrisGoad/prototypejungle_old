
pj.require('/shape/circle.js','/shape/arcArrow.js',function (circlePP,arrowPP) {
  var geom = pj.geom;
  var svg = pj.svg;
  var item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  var p1 = geom.Point.mk(-50,0);
  var p2 = geom.Point.mk(50,0);
  // the circle prototype
  var circleP = item.set('circleP',circlePP.instantiate()); 
  circleP.r = 12;
  circleP.fill = 'blue';
  // instantiate  it twice; items in the catalog
  // are initially hidden by convention, since they normally
  // serve as prototypes; hence __show().
  item.set('circle1',circleP.instantiate()).__show();
  item.set('circle2',circleP.instantiate()).__show();
  item.circle1.__moveto(p1);
  item.circle2.__moveto(p2);
  // now the arrows 
  var arrowP = item.set('arrowP',arrowPP.instantiate());
  // set some parameters of the arrow prototype
  arrowP.stroke = 'orange';
  arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  arrowP.tailGap = 18; // gap between tail of arrow and its designated start point
  arrowP.headGap = 18; // gap between head of arrow and its designated end
  arrowP.solidHead = false;
  // instantiate it twice
  item.set('arrow1',arrowP.instantiate()).__show();
  item.set('arrow2',arrowP.instantiate()).__show();
  item.arrow1.setEnds(p1,p2); //set start and end points of the arrow
  item.arrow2.setEnds(p2,p1);
  return item;
});
