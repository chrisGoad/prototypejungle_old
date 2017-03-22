//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
pj.require('/chart/component/axis.js','/chart/core/scatter.js','/lib/axis_utils.js',function (axisP,coreP,axisUtils) {
var ui=pj.ui;
var geom=pj.geom;
//var data=pj.data;

var item = pj.svg.Element.mk('<g/>');
item.markType = 'N';
item.__adjustable = true;
item.__draggable = true;

//item.set("extent",geom.Point.mk(500,400));
item.width = 500;
item.height = 400;

item.set("axisH",axisP.instantiate());
item.set("axisV",axisP.instantiate());

item.hPadding = 5; // percentage padding on either side
item.axisSep  = 0;

item.set("core",coreP.instantiate());
item.core.__unselectable = true;
item.core.__show();

axisUtils.initAxes(item);
item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;
item.axisV.bigTickImageInterval = item.axisH.bigTickImageInterval = 30;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}


item.update = function () {
  debugger;
  if (!this.__data) return;
  //pj.dat.throwDataError('bad data');
  var idata = this.__getData();
  if (!pj.data.Sequence.isPrototypeOf(idata)) {
    pj.data.throwDataError('Data has the wrong form; data sequence expected');
  }
  if (!idata.numericalDomain()) {
    pj.data.throwDataError('Data has the wrong form: numerical domain expected');
  }
  debugger;
  this.set('extent',geom.Point.mk(this.width,this.height));
  axisUtils.updateAxes(this,'flip');
  this.core.__setData(idata);
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
return item;
});