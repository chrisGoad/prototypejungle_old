//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
pj.require('./component/axis.js','./core/scatter.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
var ui=pj.ui;
var geom=pj.geom;

var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
item.__adjustable = true;
item.__draggable = true;

item.set("extent",geom.Point.mk(500,400));

item.set("core",coreP.instantiate());
item.core.__unselectable = true;
item.core.__show();

item.set("axisH",axisP.instantiate());
item.set("axisV",axisP.instantiate());

item.hPadding = 5; // percentage padding on either side
item.axisSep  = 0;

axisUtils.initAxes(item);
item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;
item.axisV.bigTickImageInterval = item.axisH.bigTickImageInterval = 10;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}


item.update = function () {
  if (!this.data) return;
  axisUtils.updateAxes(this,'flip');
  this.core.setData(this.getData(),true);
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