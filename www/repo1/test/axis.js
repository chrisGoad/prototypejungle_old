
(function () {
//pj.require([['axisP','chart/component/axis1.js']],function (erm,item) {
pj.require('chart/component/axis1.js',function (erm,axisP) {
  var item = pj.svg.Element.mk('<g/>');
  var axis = item.set("axis",axisP.instantiate());
  axis.set('scale',pj.dat.LinearScale.mk(pj.lift({lb:0,ub:100}),1000));
  //axis.scale.setExtent();
  axis.orientation = 'vertical';
  //axis.orientation = 'horizontal';
  axis.bigTickImageInterval = 200;
  axis.at10s = 1;
  axis.showTicks = 0;
  axis.showLine = 1;
  axis.gridLineLength = 400;
  item.update = function () {
    this.axis.update();
  }
  pj.returnValue(undefined,item);
});
})()
/*
http://openchart.net/uid?source=http://openchart.net/sys/repo1|test/axis.js
*/
