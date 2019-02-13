core.require('/shape/circle.js',
function (circlePP) {
  let item = svg.Element.mk('<g/>');
  let circleP = core.installPrototype(circlePP); 
  // set the parameters of the circle prototype
  circleP.r = 12;
  circleP.fill = 'blue';
  let circle1 = item.add(circleP.instantiate()).show();
  let circle2 = item.add(circleP.instantiate()).show();
  circle1.moveto(Point.mk(-50,0));
  circle2.moveto(Point.mk(50,0));
  return item;
  });