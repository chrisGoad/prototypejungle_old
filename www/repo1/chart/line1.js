
pj.require('./component/axis1.js','./core/line1.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
debugger;
var ui=pj.ui;
var geom=pj.geom;
var dat=pj.dat;
  var item = pj.svg.Element.mk('<g/>');
item.requiresData = 1;
//var dataRoot = 'http://prototypejungle.org/sys/repo3|data/';
//item.defaultDataSource = dataRoot + 'trade_balanceN.js';
item.markType = 'pointArray';
item.set('extent',geom.Point.mk(500,400));

item.set("core",coreP.instantiate());
item.core.__unselectable = 1;
item.set("axisH",axisP.instantiate())
item.set("axisV",axisP.instantiate())


item.core.__show();
axisUtils.initAxes(item,'adjustable');
//item.axisV.orientation = 'vertical';
//item.axisH.orientation = 'horizontal';
item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;
//item.axisH.__show();
//item.axisV.__show();
item.core.orientation = 'vertical';
//item.axisV.orientation = 'vertical';
//tem.axisH.orientation = 'horizontal';
item.axisV.bigTickImageInterval = 10;
item.axisH.bigTickImageInterval = 10;

//item.axisV.set('scale',dat.LinearScale.mk());
//item.axisH.set('scale',dat.LinearScale.mk());
item.axisSep  = 0;
//item.set('colors', pj.Object.mk());//colors by category


item.__shiftable = 1;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}

/* When colors on the legend are changed, this is 
 * propagated to the mark prototypes.
 * This is implemented with change-listening machinery
 * item.colors is holds these colors at the top level, by category.
 */
/*
item.setColorOfCategory = function (category,color) {
  this.core.setColorOfCategory(category,color);
 }
 
 item.colorOfCategory = function (category) {
  return this.core.colorOfCategory(category);
 }
   

item.__getExtent = function () {
  return this.extent;
}   
item.__setExtent = function (extent) {
  this.extent.x = extent.x;
  this.extent.y = extent.y;
  this.update();
}
*/
item.__adjustable = 1;

item.update = function () {
  debugger;
  var svg = pj.svg;
  var geom = pj.geom;
  var thisHere = this;
  //var main = this.core;
  var categories,cnt,max;
  if (!this.data) return;
  var data = this.getData();
 // var main = this.core;
  axisUtils.updateAxes(this);
  this.core.setData(data,1);
  return;
  var axisV = this.axisV;
  var axisH = this.axisH;
  axisH.__show();
  main.domainScaling = function (x) {
    return  axisH.scale.eval(x);
  }
  main.rangeScaling = function (x) {
    return axisV.scale.eval(x);
    return  axisV.scale.extent.ub - axisV.scale.eval(x);
  }
  var mainHeight = this.extent.y;
  var gridlineLength = this.extent.x;
  var mainWidth = this.extent.x;
  axisV.scale.setExtent(mainHeight);
  axisH.scale.setExtent(mainWidth);
  // the chart is centered at 0,0 for adjustability
  var upperLeft = this.extent.times(-0.5);
  var lowerLeft = upperLeft.plus(geom.Point.mk(0,mainHeight));
  var max = data.max('range');
  this.axisV.set('dataBounds',prototypeJungle.geom.Interval.mk(0,max));
  this.axisV.gridLineLength = gridlineLength;//-this.minY;
  this.axisV.update();
  var maxD = data.max('domain');
  var minD = data.min('domain');
  axisH.set('dataBounds',prototypeJungle.geom.Interval.mk(minD,maxD));
  axisH.update();
  axisH.__moveto(lowerLeft);
  axisV.__moveto(upperLeft.plus(geom.Point.mk(0,0)));
  main.__moveto(upperLeft.plus(geom.Point.mk(0,0)));
  main.width = mainWidth;
  main.height = mainHeight;


}

item.reset = function () {
  this.core.reset();
}



/**
 * Set accessibility and notes for the UI
*/

ui.watch(item,['barSep','groupSep']);

ui.hide(item,['color_utils','colors','axisSep',
  'alternativeDataSources','extent','hPadding','markType']);

pj.returnValue(undefined,item);
});

