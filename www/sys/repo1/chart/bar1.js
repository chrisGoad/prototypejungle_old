

pj.require('./component/axis1.js','./core/bar1.js',function (erm,axisP,coreP) {
var ui=pj.ui;
var geom=pj.geom;
var dat=pj.dat;
var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
//item.requiresData = 1;
item.set("core",coreP.instantiate());
item.set("axis",axisP.instantiate());
item.core.__unselectable = 1; 
item.core.__show();
item.axis.__show();
item.set('extent',geom.Point.mk(1000,300));
item.orientation = 'horizontal';
item.axis.orientation = item.orientation;
item.core.orientation = item.orientation
item.axis.set('scale',dat.LinearScale.mk());
item.axis.bigTickImageInterval = 100;
item.axisSep  = 20;

// support for the resizer 
item.__getExtent = function () {
  return this.extent;
}

item.__setExtent = function (extent) {
  this.extent.x = extent.x;
  this.extent.y = extent.y;
  this.update();
}

item.__draggable = 1;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}

/* When colors on the legend are changed, this is 
 * propagated to the bar prototypes.
 * This is implemented with change-listening machinery
 */

item.setColorOfCategory = function (category,color) {
  this.core.setColorOfCategory(category,color);
 }
 
 
item.colorOfCategory = function (category,color) {
  return this.core.colorOfCategory(category,color);
 }

item.groupSep = 50;

item.update = function () {
  var svg = pj.svg,
    geom = pj.geom,
    thisHere = this,
    categories,cnt,max,
    axis = this.axis,
    main = this.core,
    horizontal = this.orientation === 'horizontal';
  main.groupSep = this.groupSep;
  if (!this.data) return;
  axis.orientation = this.orientation;
  main.orientation = this.orientation;
  var data = this.getData();
  main.rangeScaling = function (x) {
    return axis.scale.eval(x);
  }
  categories = data.categories;

  var mainHeight = this.extent.y - this.axisSep;
  var gridlineLength = horizontal?this.extent.y:this.extent.x;//  - eyy;
  var mainWidth = this.extent.x;
  axis.scale.setExtent(horizontal?mainWidth:mainHeight);
  var upperLeft = this.extent.times(-0.5);
  //upperLeft = geom.Point.mk();
  var max = data.max('range');
  this.axis.set('dataBounds',prototypeJungle.geom.Interval.mk(0,max));
  this.axis.gridLineLength = gridlineLength;//-this.minY;
  this.axis.update();
  axis.__moveto(horizontal?(upperLeft.plus(geom.Point.mk(0,mainHeight + this.axisSep))):upperLeft);
  main.__moveto(upperLeft);
  var axisBnds = this.axis.__bounds();
  main.width = mainWidth;
  main.height = mainHeight;
  main.setData(data,1);
  main.bars.__unselectable = 1;
}

item.reset = function () {
  this.core.reset();
}



/**
 * Set accessibility, watches, and notes for the UI
 */

ui.hide(item,['axisSep','markType','colors','extent','orientation']);
//ui.freeze(item,['requiresData']);
ui.setNote(item,'groupSep','The separation between bars (or groups of bars if there are several categories) as a percentage of bar width');
pj.returnValue(undefined,item);
});

