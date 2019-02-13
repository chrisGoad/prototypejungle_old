
core.require('/shape/arcArrow.js',function (arrowPP) {
  var geom = core.geom;
  var svg = core.svg;
  var item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  item.p1 = geom.Point.mk(-40,0);
  item.p2 = geom.Point.mk(40,0);
  // the circle prototype
  item.set('circleP',svg.Element.mk(
   '<circle fill="rgb(39, 49, 151)" stroke="black" stroke-width="5" \ r="25" />').__hide());
  // instantiate it twice
  item.set('circle1',item.circleP.instantiate()).__show();
  item.set('circle2',item.circleP.instantiate()).__show();
  item.circle1.__moveto(item.p1);
  item.circle2.__moveto(item.p2);
  // now the arrows 
  item.set('arrowP',arrowPP.instantiate()).__hide();
  // set some parameters of the arrow prototype
  item.arrowP.stroke = 'orange';
  item.arrowP['stroke-width'] = 5;

  item.arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  item.arrowP.headGap = 28;
  item.arrowP.tailGap = 28;
  item.arrowP.solidHead = false;
  // instantiate it twice
  item.set('arrow1',item.arrowP.instantiate()).__show();
  item.set('arrow2',item.arrowP.instantiate()).__show();
  item.arrow1.setEnds(item.p1,item.p2);
  item.arrow2.setEnds(item.p2,item.p1);
  return item;
});
