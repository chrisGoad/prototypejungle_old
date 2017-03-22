
pj.require('/shape/arcArrow.js',function (arrowPP) {
  var geom = pj.geom;
  var svg = pj.svg;
  var item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  item.p1 = geom.Point.mk(-50,0);
  item.p2 = geom.Point.mk(50,0);
  // the circle prototype
  item.set('circleP',svg.Element.mk(
   '<circle fill="rgb(39, 49, 151)" stroke="black" stroke-width="2" \ r="5" />').__hide());
  // instantiate it twice
  item.set('circle1',item.circleP.instantiate()).__show();
  item.set('circle2',item.circleP.instantiate()).__show();
  //item.circle1.__moveto(p1);
  //item.circle2.__moveto(p2);
  // now the arrows 
  item.set('arrowP',arrowPP.instantiate()).__hide();
  // set some parameters of the arrow prototype
  item.arrowP.stroke = 'orange';
  item.arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  item.arrowP.headGap = 8;
  item.arrowP.tailGap = 8;
  item.arrowP.solidHead = false;
  // instantiate it twice
  item.set('arrow1',item.arrowP.instantiate()).__show();
  item.set('arrow2',item.arrowP.instantiate()).__show();
  //item.arrow1.setEnds(p1,p2);
  //item.arrow2.setEnds(p2,p1);
  item.update = function () {
    var p1=this.p1,p2 = this.p2;
    this.circle1.__moveto(p1);
    this.circle2.__moveto(p2);
    this.arrow1.setEnds(p1,p2);
    this.arrow2.setEnds(p2,p1);
    this.arrow1.update();
    this.arrow2.update();
  }
  item.circleP.__draggable = true;
  item.circleP.__dragStep = function (pos) {
    var diagram = this.__parent;
    var p = (this.__name === 'circle1')?diagram.p1:diagram.p2;
    p.copyto(pos);
    diagram.update();
    diagram.__draw();
  }
  return item;
});
