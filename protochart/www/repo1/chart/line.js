
pj.require('./component/axis.js','./core/line.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
debugger;
var ui=pj.ui;
var geom=pj.geom;

var item = pj.svg.Element.mk('<g/>');
item.markType = 'pointArray';
item.__adjustable = true;
item.__draggable = true;

item.set('extent',geom.Point.mk(500,400));

item.set("core",coreP.instantiate());
item.core.__unselectable = true;
item.core.__show();

item.set("axisH",axisP.instantiate());
item.set("axisV",axisP.instantiate());

item.axisSep  = 0;

axisUtils.initAxes(item,'adjustable');

item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;
item.axisV.bigTickImageInterval = item.axisH.bigTickImageInterval = 10;

item.core.orientation = 'vertical';

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}


item.update = function () {
  if (!this.data) return;
  axisUtils.updateAxes(this);
  this.core.setData(this.getData(),true);
}

item.reset = function () {
  this.core.reset();
}



/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['color_utils','colors','axisSep',
  'alternativeDataSources','extent','hPadding','markType']);

pj.returnValue(undefined,item);
});

