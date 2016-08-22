/* These are utilities for dealing with axes. A standard naming convention is assumed. The main item should have chidren core,
 * and axisH, and axisV for the two axis config, and axis for the one axis config. main.core is the "core" of the chart, in which the marks
 * (bars, scatter points, or whatever) are displayed. The positioning of the axes, but also other standard matters are handled:
 * If categories are involed,  the colors of main must be coordinated with those of the core.  If the graph is to be adjustable,
 * __setExtent and __getExtent must be defined. */

(function () {
var geom = pj.geom;
var dat = pj.dat;
var item = pj.Object.mk();

item.initAxes = function (main) {
  debugger;
var axis = main.axisH;
var axisV = main.axisV;
if (axisV) {
  debugger;
  axisV.__show();
  axisV.orientation = 'vertical';
  axisV.set('scale',dat.LinearScale.mk());
}  else {
  axis = main.axis;
  //axis.orientation = 'horizontal';
}
axis.set('scale',dat.LinearScale.mk());
axis.__show();
axis.set('scale',dat.LinearScale.mk());

main.colorOfCategory = function (category) {
  return this.core.colorOfCategory(category);
}
   
main.setColorOfCategory = function (category,color) {
  this.core.setColorOfCategory(category,color);
 }
if (main.__adjustable) {
  
  main.__getExtent = function () {
    return this.extent;
  }   
  main.__setExtent = function (extent) {
    this.extent.x = extent.x;
    this.extent.y = extent.y;
    this.update();
  }
}
}

item.updateAxes = function (main,flip) {
  debugger;
  var categories,cnt,max;
  var core = main.core;
  var axisH = main.axisH;
  var axisV = main.axisV;
  if (!axisV) {
    item.updateAxis(main);
    return;
  }
  if (!main.data) return;
  var data = main.getData();
  core.orientation = main.orientation;
  var numericalDomain = data.numericalDomain();
  core.numericalDomain = numericalDomain;
  if (numericalDomain) {
    axisH.__show();
    core.domainScaling = function (x) {
      return  axisH.scale.eval(x);
    }
  }
  core.rangeScaling = function (x) {
    if (flip) {
      return axisV.scale.extent.ub - axisV.scale.eval(x);
    } else {
      return axisV.scale.eval(x);
    }
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


item.updateAxis = function (main) {
  debugger;
  var core = main.core;
  var axis = main.axis;
  core.rangeScaling = function (x) {
    return axis.scale.eval(x);
  }
  axis.orientation = main.orientation;
  var horizontal = axis.orientation === 'horizontal';
  var data = main.getData();
  var mainHeight = main.extent.y - main.axisSep;
  var gridlineLength = horizontal?main.extent.y:main.extent.x;//  - eyy;
  var mainWidth = main.extent.x;
  axis.scale.setExtent(horizontal?mainWidth:mainHeight);
  var upperLeft = main.extent.times(-0.5);
  //upperLeft = geom.Point.mk();
  var max = data.max('range');
  axis.set('dataBounds',prototypeJungle.geom.Interval.mk(0,max));
  axis.gridLineLength = gridlineLength;//-this.minY;
  axis.update();
  axis.__moveto(horizontal?(upperLeft.plus(geom.Point.mk(0,mainHeight + main.axisSep))):upperLeft);
  core.__moveto(upperLeft);
  core.width = mainWidth;
  core.height = mainHeight;
  //core.setData(data,1);
 // core.marks.__unselectable = 1;

}
pj.returnValue(undefined,item);
})();
