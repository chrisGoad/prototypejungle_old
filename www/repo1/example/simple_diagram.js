
//pj.require([['arrowPP','shape/arrow1.js']],function (errorMessage,externals) {
pj.require('../shape/arrow2.js','../shape/circle.js',function (errorMessage,arrowPP,circlePP) {
  var geom = pj.geom;
  var item = pj.svg.Element.mk('<g/>');
  item.set("arrowP",arrowPP.instantiate()).__hide();
  var p0 = geom.Point.mk(0,0);
  var p1 = geom.Point.mk(100,0);
  item.set("arrow1",item.arrowP.instantiate()).__show();
  item.set("arrow2",item.arrowP.instantiate()).__show();
  item.set("circleP",circlePP.instantiate()).__hide();
  item.circleP.dimension = 10;
  item.set("circle1",item.circleP.instantiate()).__show();
  item.set("circle2",item.circleP.instantiate()).__show();
  item.circle2.__moveto(p1);
  item.arrow1.set("end0",p0);
  item.arrow1.set("end1",p1);
  item.arrow2.set("end0",p1);
  item.arrow2.set("end1",p0);
  item.updatee = function () {
    this.arrow1.update();
    this.arrow2.update();
    this.circle1.update();
    this.circel2.update();
  }
  pj.returnValue(undefined,item);
});
/*
 *
http://prototypejungle.org/ui?source=http://prototypejungle.org/sys/repo3|example/two_arrows.js
*/
