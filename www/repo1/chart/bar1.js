
pj.require('./component/axis1.js','./core/bar1.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
var ui=pj.ui;
var geom=pj.geom;
var dat=pj.dat;
var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';


item.groupSep = 50;
item.barSep = 100;
item.axisSep  = 20;
item.__adjustable = true;
item.__draggable = true;

item.set('extent',geom.Point.mk(1000,300));
item.set("core",coreP.instantiate());
item.set("axis",axisP.instantiate());

item.core.__unselectable = 1;
item.core.__show();
axisUtils.initAxes(item);

item.axis.showTicks = false;
item.axis.bigTickImageInterval = 100;


item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}

item.update = function () {
  var svg = pj.svg,
    geom = pj.geom,
    thisHere = this,
    cnt,max,
    axis = this.axis,
    core = this.core;
 
  if (!this.data) return;
  var data = this.getData();
  if (data.categories)   {
    if (this.__newData) {
      this.barSep = 10;
    }
    pj.ui.hide(this,['barSep']);
    pj.ui.show(this,['groupSep']);
  } else {
    pj.ui.show(this,['barSep']);
    pj.ui.hide(this,['groupSep']);    
  }
  core.barSep = this.barSep;
  core.groupSep = this.groupSep;
  this.axis.orientation = this.core.orientation = this.orientation;
  
  axisUtils.updateAxes(this);
  core.setData(data,1);
  core.bars.__unselectable = 1; 
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

