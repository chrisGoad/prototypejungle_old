// sample code - a randomly chosen snippet

 core.require('/coreExamples/circle.js',function (circlePP) {
  let item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  // the circle prototype
  let circleP = item.set('circleP',circlePP.instantiate()).hide();
  circleP.fill = 'blue';
  circleP.stroke = 'red';
  // instantiate it twice
  item.set('circle1',circleP.instantiate()).show();
  item.set('circle2',circleP.instantiate()).show();
  item.circle1.moveto(geom.Point.mk(-20,0));
  item.circle2.moveto(geom.Point.mk(20,0));
  item.circle2.fill = 'green';
  return item;
})