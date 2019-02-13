
core.require('/shape/arcArrow.js',function (arrowPP) {
  var geom = core.geom;
  var svg = core.svg;
  var item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  item.p1 = geom.Point.mk(-50,0);
  item.p2 = geom.Point.mk(50,0);
  // the circle prototype
  item.set('circleP',svg.Element.mk(
   '<circle fill="rgb(39, 49, 151)" stroke="black" stroke-width="1" \ r="5" />').__hide());
  // instantiate it twice
  item.set('circle1',item.circleP.instantiate()).__show();
  item.set('circle2',item.circleP.instantiate()).__show();
  item.circle1.__moveto(item.p1);
  item.circle2.__moveto(item.p2);
  item.__actionPanelUrl =  '(sys)/action/a1.svg';
  item.__actions = {a:function () {alert(222333)},b:function () {alert(333222)}};
  return item;
});
