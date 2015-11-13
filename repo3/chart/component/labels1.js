/* This is for an evenly spaced set of labels.
*/

(function () {
var ui=pj.ui;
var geom=pj.geom;
var svg=pj.svg;

var item = svg.Element.mk('<g/>');

item.dataSource = 'http://prototypejungle.org/sys/repo1/data/labels.js';
item.width = 1000;
item.height = 500;
item.centerLabels = 1;
// possible orientation values: 'horizontal' and 'vertical'
item.orientation = 'horizontal'; 
//label prototype
item.set('labelP', svg.Element.mk('<text font-size="25" fill="black" text-anchor="middle"/>'));
item.labelP.__setExtent = item.labelP.__adjustExtent;
item.labelGap = 10;// along the direction of the item(horizontal or vertical)
item.labelSep = pj.geom.Point.mk(0,0); // the whole label set is displaced by this much;


item.set("labels",pj.Spread.mk(item.labelP));
item.labels.__unselectable = 1;
item.__unselectable = 1;
item.labels.binder = function (label,data,indexInSeries,lengthOfDataSeries) {
  label.__editPanelName = 'This Label';
  var item = this.__parent;
  var gap = item.labelGap;
  var  categoryCount,group,labelHeight,labelWidth,labelBBox,x,y;
  label.__show();
  label.data = data;
  label.setText(data);
  labelBBox = label.__getBBox();
  labelWidth= labelBBox.width;
  item.maxLabelWidth = Math.max(item.maxLabelWidth,labelWidth);
  labelHeight = label["font-size"];
  if (item.orientation === 'vertical') { // label's left is at zero in the vertical case
    x = labelWidth/2;//-item.maxLabelWidth;
    y = indexInSeries * gap;
  }  else {
    x = indexInSeries * gap;
    y =0;
  }
  label.__moveto(x,y);
  label.__show();
}

/**
 * determine how much extra space is required to the left
*/
/*
item.computeMaxLabelWidth = function () {
  var data = this.data;
  var els = data.elements;
  var sf = {};
  var rs = 0;
  var label = this.__forMeasurement;
  if (label) {
    label.show();
  } else {
    label = this.labelP.instantiate();
    this.set("__forMeasurment",label);
  }
  els.forEach(function (el) {
    var dm = el.domain;
    if (!sf[dm]) {
      label.setText(el.domain);
      var wd = label.getBBox().width;
      rs = Math.max(rs,wd);
      sf[dm] = 1;
    }
  });
  label.hide();
  return rs;
}
*/
item.getLabelSep = function () {
  if (this.labelSep) {
    return this.labelSep.copy();
  } else if (this.orientation === 'horizontal') {
    return pj.geom.Point.mk(0,0);
  } else {
    return pj.geom.Point.mk(0,0);
  }
}

item.listenForUIchange = function (ev) {
  if (ev.id === "UIchange") {
    this.update();
    this.draw();
    pj.tree.refresh();
  }
}

item.addListener("UIchange","listenForUIchange");

item.update = function () {
 // this.theLabels.moveto(this.textOffset-this.maxLabelWidth,firstLabelPos);
  var svg = pj.svg,
    thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max;
  if (!this.data) return;
  // this is something that should not be inherited
  if (!this.hasOwnProperty('labelSep')) {
    this.set("labelSep",this.getLabelSep());
  }
  var L = this.data.elements.length;
  if (horizontal) {
    this.labelGap = this.width/(L-1);
  } else {
    this.labelGap = this.height/(L-1);
    this.maxLabelWidth = 0;//this.computeMaxLabelWidth();
  }
  this.labelP.center();
  this.labels.__moveto(this.labelSep);
  this.labelP.__editPanelName = 'Prototype for All Labels On This Axis'
  this.labels.setData(this.data,1);
 
}


item.labelP.startDrag = function (refPoint) {
  var itm = this.__parent.__parent.__parent;
  itm.dragStart = refPoint.copy();
  itm.startLabelSep = itm.labelSep.copy();
}


item.labelP.dragStep = function (pos) {
  var itm = this.__parent.__parent.__parent;
  var diff = pos.difference(itm.dragStart);
  itm.labelSep.copyto(itm.startLabelSep.plus(diff));
  itm.labels.__moveto(itm.labelSep);
}

item.reset = function () {
  this.labels.reset();
}

/**
 * Set accessibility and notes for the UI
*/
 
ui.hide(item,['width','height','orientation',
  'labelGap','labelSep','maxLabelWidth']);
//ui.hideInInstance(item.labelP,['font-size','fill']);
ui.hide(item.labelP,['text','text-anchor','y']);
ui.watch(item.labelP,['font-size']);//,'labelSep']);// run update when these change
ui.hide(item.labels,['byCategory']);
pj.returnValue(undefined,item);

})();

