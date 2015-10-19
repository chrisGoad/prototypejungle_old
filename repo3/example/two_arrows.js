
//pj.require([['arrowPP','shape/arrow1.js']],function (errorMessage,externals) {
pj.require('shape/arrow1.js',function (errorMessage,arrowPP) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("arrowP",arrowPP.instantiate()).hide(); 
  item.set("arrow1",item.arrowP.instantiate()).show(); 
  item.set("arrow2",item.arrowP.instantiate()).show();
  item.arrow2.set("end0",pj.geom.Point.mk(100,50));
  item.arrow2.set("end1",pj.geom.Point.mk(0,50));
  item.update = function () {
    this.arrow1.update();
    this.arrow2.update();
  }
  debugger;
  pj.returnValue(undefined,item);
});
/*
 *
http://prototypejungle.org/ui?source=http://prototypejungle.org/sys/repo3|example/two_arrows.js
*/
