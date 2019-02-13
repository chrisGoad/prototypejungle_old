
core.require('/coreExamples/circle.js','/coreExamples/arcArrow.js',function (circlePP,arrowPP) {
let item = svg.Element.mk('<g/>');// the root of the diagram we are assembling
let circleP = core.installPrototype(circlePP); 
let arrowP = core.installPrototype(arrowPP);
item.p1 = Point.mk(-50,0);
item.p2 = Point.mk(50,0);
circleP.r = 12;
circleP.fill = 'blue';
// instantiate  it twice; items in the catalog
// are initially hidden by convention, since they normally
// serve as prototypes; hence __show().
item.set('circle1',circleP.instantiate()).show();
item.set('circle2',circleP.instantiate()).show();
// now the arrows 
// set some parameters of the arrow prototype
arrowP.stroke = 'orange';
arrowP.radius = 1; // radius of the arc as a multiple of arrow length
arrowP.tailGap = 18; // gap between tail of arrow and its designated start point
arrowP.headGap = 18; // gap between head of arrow and its designated end
arrowP.solidHead = false;
// instantiate it twice
item.set('arrow1',arrowP.instantiate()).show();
item.set('arrow2',arrowP.instantiate()).show();


item.update = function () {
  let p1=this.p1,p2 = this.p2;
  this.circle1.moveto(p1);
  this.circle2.moveto(p2);
  this.arrow1.setEnds(p1,p2);
  this.arrow2.setEnds(p2,p1);
  this.arrow1.update();
  this.arrow2.update();
}

item.isKit = true;


item.dragStart = function (startPos) {
  // not needed for this example, but included for illustration
}

item.dragStep = function (node,pos) {
  let p = (node.__name === 'circle1')?this.p1:this.p2;
  p.copyto(pos);
  this.update();
  this.draw();
}


circleP.draggableInKit = true;

return item;

});
