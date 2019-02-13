
core.require('/shape/circle.js','/shape/arcArrow.js',function (circlePP,arrowPP) {
  var geom = core.geom;
  var svg = core.svg;
  var item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
  item.p1 = geom.Point.mk(-50,0);
  item.p2 = geom.Point.mk(50,0);
  // the circle prototype
  var circleP = item.set('circleP',circlePP.instantiate()).__hide();
  circleP.r = 12;
  circleP.fill = 'blue';
  // instantiate it twice
  item.set('circle1',circleP.instantiate()).__show();
  item.set('circle2',circleP.instantiate()).__show();
  var arrowP = item.set('arrowP',arrowPP.instantiate()).__hide();
  // set some parameters of the arrow prototype
  arrowP.stroke = 'orange';
  arrowP.radius = 1; // radius of the arc as a multiple of arrow length
  arrowP.tailGap = 18; // gap between tail of arrow and its designated start point
  arrowP.headGap = 18; // gap between head of arrow and its designated end
  arrowP.solidHead = false;
  // instantiate it twice
  item.set('arrow1',arrowP.instantiate()).__show();
  item.set('arrow2',arrowP.instantiate()).__show();
 
  item.update = function () {
    var p1=this.p1,p2 = this.p2;
    this.circle1.__moveto(p1);
    this.circle2.__moveto(p2);
    this.arrow1.setEnds(p1,p2);
    this.arrow2.setEnds(p2,p1);
    this.arrow1.update();
    this.arrow2.update();
  }
  item.__diagram = true;
  
  item.__dragStart = function () {
    // not needed for this example, but included for illustration
  }

  item.__dragStep = function (node,pos) {
    var p = (node.__name === 'circle1')?this.p1:this.p2;
    p.copyto(pos);
    this.update();
    this.__draw();
  }
  
  item.circle1.__draggableInKit = true;
  item.circle2.__draggableInKit = true;
  
  return item;
});
