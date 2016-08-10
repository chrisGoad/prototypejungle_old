//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
(function () {
var geom = pj.geom;
var item = pj.Object.mk();

item.initAxes = function (core,axisH,axisV) {
  
core.__show();
axisH.__show();
axisV.__show();
axisV.orientation = 'vertical';
axisH.orientation = 'horizontal';
axisV.showTicks = true;
axisH.showTicks = true;
axisH.showLine = true;
axisV.showLine = true;
axisV.set('scale',dat.LinearScale.mk());
axisH.set('scale',dat.LinearScale.mk());

}

item.updateAxes = function (main,core,axisH,axisV) {
  var categories,cnt,max;
  if (!main.data) return;
  var data = main.getData();
  var numericalDomain = data.numericalDomain();
  core.numericalDomain = numericalDomain;
  if (numericalDomain) {
    axisH.__show();
    core.domainScaling = function (x) {
      return  axisH.scale.eval(x);
    }
  }
  core.rangeScaling = function (x) {
    return  axisV.scale.extent.ub - axisV.scale.eval(x);
  }
  var mainHeight = main.extent.y - main.axisSep;
  var gridlineLength = main.extent.x;
  var mainWidth = main.extent.x;
  axisV.scale.setExtent(mainHeight);
  if (numericalDomain) {
    axisH.scale.setExtent(mainWidth);
  }
  // the chart is centered at 0,0 for adjustability
  var upperLeft = main.extent.times(-0.5);
  var lowerLeft = upperLeft.plus(geom.Point.mk(0,mainHeight + main.axisSep));
  var max = data.max('range');
  axisV.set('dataBounds',prototypeJungle.geom.Interval.mk(0,max));
  axisV.gridLineLength = gridlineLength;//-this.minY;
  axisV.update();
  if (numericalDomain) {
    var maxD = data.max('domain');
    var minD = data.min('domain');
    if (main.hPadding) {
      var pd = 0.01 * main.hPadding * (maxD - minD);
      maxD = maxD + pd;
      minD = minD - pd;
    }
    axisH.set('dataBounds',prototypeJungle.geom.Interval.mk(minD,maxD));
    axisH.update();
    axisH.__moveto(lowerLeft);
  }
  axisV.__moveto(upperLeft.plus(geom.Point.mk(0,0)));
  core.__moveto(upperLeft.plus(geom.Point.mk(0,0)));
  core.width = mainWidth;
  core.height = mainHeight;
  //core.setData(data,1);
 // core.marks.__unselectable = 1;

}
pj.returnValue(undefined,item);
})();
