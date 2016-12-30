//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
//pj.require('./component/axis.js','./core/timeline.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
pj.require('/chart/component/axis.js','/shape/rectangle.js',function (axisP,boxP) {
var ui=pj.ui;
var geom=pj.geom;
//var data=pj.data;

var item = pj.svg.Element.mk('<g/>');

item.__adjustable = true;
item.__draggable = true;

item.set("extent",geom.Point.mk(1000,500));
item.set("box",boxP.instantiate());
item.box.fill = 'transparent';
item.box.__hide();

//item.set("core",coreP.instantiate());
//item.core.__unselectable = true;
//item.core.__show();

item.set("axis",axisP.instantiate());
item.__thisIsTimelineAxis = true; //
item.axis.orientation = 'horizontal';
item.axis.at10s = true;
item.hPadding = 5; // percentage padding on either side
item.axisSep  = 0;
item.firstDate = 1000;
item.lastDate = 2000;
item.width = 1000;
item.height = 200;
debugger;
//axisUtils.initAxes(item);
item.axis.showTicks = true;
item.axis.showLine = true;
item.axis.bigTickImageInterval = 30;
// each timeline component inludes this axis code as requirement, and can use this function to find the axis
// no needed of course for axes themselves

item.findAxis = function () {
  var rs;
  var thisHere = this;
  pj.forEachTreeProperty(pj.root,function (child) {
    if (!rs && thisHere.isPrototypeOf(child) && child.__visible()) {
      rs = child;
    }
  });
  return rs;
}

item.toAxisCoords = function (date) {
  var frp = (date-this.firstDate)/(this.lastDate - this.firstDate);
  return this.width * (frp - 0.5);
}

// x is relative to the left end of the axis
item.axisCoordsToDate = function (x) {
  var fd = Number(this.firstDate);
  var ld = Number(this.lastDate);
  var duration = ld - fd;
  console.log('duration ',duration,x/this.width);
  return fd + duration * (x/this.width);
}

item.update = function () {
  //if (!this.__data) return;
  //pj.dat.throwDataError('bad data');
  //var idata = this.__getData();
  /*
  if (!pj.data.Sequence.isPrototypeOf(idata)) {
    pj.data.throwDataError('Data has the wrong form; data sequence expected');
  }
  if (!idata.numericalDomain()) {
    pj.data.throwDataError('Data has the wrong form: numerical domain expected');

  */
  this.box.__setExtent(geom.Point.mk(this.width,this.height));
  this.axis.scale.setExtent(this.width);
  this.axis.gridLineLength = this.height;
  this.axis.set('dataBounds',pj.geom.mkInterval(this.firstDate,this.lastDate));
  this.axis.__moveto(geom.Point.mk(-0.5*this.width,0.5 * this.height));
  this.axis.update();
  //this.core.__setData(idata,'noUpdate'); // needed for core.dataBounds, which is called in updateAxis
  //axisUtils.updateAxis(this);
  //this.core.update();

}



item.__setExtent = function (extent) {
  this.width = extent.x;
  this.height = extent.y;
  this.__update();
  this.__draw();
}
  

/**
 * Set accessibility and notes for the UI
*/

ui.watch(item,['barSep','groupSep']);

ui.hide(item,['color_utils','colors','axisSep',
  'alternativeDataSources','extent','hPadding','markType']);
return item;
});