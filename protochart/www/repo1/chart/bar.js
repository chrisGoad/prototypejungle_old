
pj.require('./component/axis.js','./core/bar.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
var ui=pj.ui;
var geom=pj.geom;

var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
item.__adjustable = true;
item.__draggable = true;

item.set('extent',geom.Point.mk(1000,300));

item.set("core",coreP.instantiate());
item.core.__unselectable = true;
item.core.__show();

item.set("axis",axisP.instantiate());

item.groupSep = 50;
item.barSep = 100;
item.axisSep  = 20;

axisUtils.initAxes(item);
item.axis.showTicks = false;
item.axis.bigTickImageInterval = 100;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}

item.update = function () {
  var core = this.core;
  if (!this.data) return;
  var data = this.getData();
  if (data.categories)   { // the UI should be a bit different for the categorized case
    if (this.__newData) {
      this.barSep = 10;
    }
    ui.hide(this,['barSep']);
    ui.show(this,['groupSep']);
  } else {
    ui.show(this,['barSep']);
    ui.hide(this,['groupSep']);    
  }
  core.barSep = this.barSep;
  core.groupSep = this.groupSep;
  this.axis.orientation = this.core.orientation = this.orientation;
  axisUtils.updateAxes(this);
  core.setData(data,true);
  core.bars.__unselectable = true; 
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

