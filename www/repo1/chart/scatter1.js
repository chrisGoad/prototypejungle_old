//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
pj.require('./component/axis1.js','./core/scatter1.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
var ui=pj.ui;
var geom=pj.geom;
var  dat=pj.dat;
var item = pj.svg.Element.mk('<g/>');
item.axisSep  = 0;
item.markType = '[N|S],N';
item.__adjustable = true;

item.set("core",coreP.instantiate());
item.core.__unselectable = true;
item.core.__show();

item.set("axisH",axisP.instantiate());
item.set("axisV",axisP.instantiate());

item.set("extent",geom.Point.mk(500,400));
item.hPadding = 5; // percentage padding on either side
axisUtils.initAxes(item,'adjustable');

item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;
item.__shiftable = true;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}


item.update = function () {
  var svg = pj.svg;
  var geom = pj.geom;
  var thisHere = this;
  var main = this.core;
  var categories,cnt,max;
  if (!this.data) return;
  var data = this.getData();
  axisUtils.updateAxes(this,'flip');
  this.core.setData(data,true);
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