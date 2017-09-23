'use strict';
pj.require('/shape/shaded_circle.js',function (circlePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
var circleP = item.set("circleP",circlePP.instantiate());
circleP.__hide();

item.set("circle1",circleP.instantiate());
item.set("circle2",circleP.instantiate());
item.set("circle3",circleP.instantiate());
item.circle1.__show();
item.circle2.__show();
item.circle3.__show();

item.centerDistance = 30;

   
item.update = function () {
  var cd = this.centerDistance;
  var cos60 = 0.866;
  var c1 = geom.Point.mk(-cos60 * cd,-0.5*cd);
  var c2 = geom.Point.mk(cos60 * cd,-0.5*cd);
  var c3 = geom.Point.mk(0,cd);
  this.circle1.__moveto(c1);
  this.circle2.__moveto(c2);
  this.circle3.__moveto(c3);
  this.circle1.update();
  this.circle2.update();
  this.circle3.update();
  pj.root.__draw();
}
  
return item;


});
