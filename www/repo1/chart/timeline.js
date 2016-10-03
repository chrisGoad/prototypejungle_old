//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
pj.require('./component/axis.js','./core/timeline.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
var ui=pj.ui;
var geom=pj.geom;
//var data=pj.data;

var item = pj.svg.Element.mk('<g/>');

item.__adjustable = true;
item.__draggable = true;

item.set("extent",geom.Point.mk(1000,500));

item.set("core",coreP.instantiate());
item.core.__unselectable = true;
item.core.__show();

item.set("axis",axisP.instantiate());
item.axis.orientation = 'horizontal';
item.hPadding = 5; // percentage padding on either side
item.axisSep  = 0;

debugger;
axisUtils.initAxes(item);
item.axis.showTicks = true;
item.axis.showLine = true;
item.axis.bigTickImageInterval = 30;


item.update = function () {
  debugger;
  if (!this.__data) return;
  //pj.dat.throwDataError('bad data');
  var idata = this.__getData();
  /*
  if (!pj.data.Sequence.isPrototypeOf(idata)) {
    pj.data.throwDataError('Data has the wrong form; data sequence expected');
  }
  if (!idata.numericalDomain()) {
    pj.data.throwDataError('Data has the wrong form: numerical domain expected');
  }
  */
  debugger;
  this.core.__setData(idata,'noUpdate'); // needed for core.dataBounds, which is called in updateAxis
  axisUtils.updateAxis(this);
  this.core.update();

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