
pj.require('./component/axis1.js','./core/line1.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
debugger;
var ui=pj.ui;
var geom=pj.geom;
var dat=pj.dat;

var item = pj.svg.Element.mk('<g/>');
item.markType = 'pointArray';
item.set('extent',geom.Point.mk(500,400));

item.set("core",coreP.instantiate());
item.core.__unselectable = 1;
item.set("axisH",axisP.instantiate())
item.set("axisV",axisP.instantiate())

item.core.__show();
axisUtils.initAxes(item,'adjustable');

item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;

item.core.orientation = 'vertical';

item.axisV.bigTickImageInterval = 10;
item.axisH.bigTickImageInterval = 10;

item.axisSep  = 0;


item.__shiftable = 1;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}

item.__adjustable = 1;

item.update = function () {
  axisUtils.updateAxes(this);
  this.core.setData(this.getData(),1);
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

