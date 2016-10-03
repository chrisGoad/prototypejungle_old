/* An evenly spaced set of labels.
*/

'use strict';

(function () {
var ui=pj.ui;
var geom=pj.geom;
var svg=pj.svg;

var item = svg.Element.mk('<g/>');

item.width = 1000;
item.height = 500;
item.centerLabels = true;
// possible orientation values: 'horizontal' and 'vertical'
item.orientation = 'horizontal'; 
//label prototype
//var labelP = svg.Element.mk('<text font-size="25" fill="black" text-anchor="middle"/>');
item.set('labelP', svg.Element.mk('<text font-size="20" font-family="Arial" fill="black" text-anchor="middle"/>'));
//item.labelP.__setExtent = item.labelP.__adjustExtent;
item.__adjustable = true;
item.labelGap = 10;// along the direction of the item(horizontal or vertical)
item.labelSep = pj.geom.Point.mk(0,0); // the whole label set is displaced by this much;


item.set("labels",pj.Spread.mk());
item.labels.__unselectable = true;
item.__unselectable = true;


item.labels.binder = function (label,data,indexInSeries,lengthOfDataSeries) {
  label.__editPanelName = 'This label';
  var item = this.__parent;
  var gap = item.labelGap;
  var  labelHeight,labelWidth,labelBBox,x,y;
  label.__show();
  label.__data = data;
  label.setText(data);
  labelBBox = label.__getBBox();
  labelWidth= labelBBox.width;
  item.maxLabelWidth = Math.max(item.maxLabelWidth,labelWidth);
  labelHeight = label["font-size"];
  if (item.orientation === 'vertical') { // label's left is at zero in the vertical case
    x = labelWidth/2;
    y = indexInSeries * gap;
  }  else {
    x = indexInSeries * gap;
    y =0;
  }
  label.__moveto(x,y);
  label.__show();
}



item.update = function () {
  var svg = pj.svg,
    thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max;
  if (!this.__data) return;
  // this is something that should not be inherited
  if (!this.hasOwnProperty('labelSep')) {
    this.set("labelSep",this.labelSep.copy());
  }
  var L = this.__data.elements.length;
  this.maxLabelWidth = 0;
  if (horizontal) {
    this.labelGap = this.width/(L-1);
  } else {
    this.labelGap = this.height/(L-1);
  }
  this.labelP.center();
  this.labels.masterPrototype = this.labelP;
  this.labels.__moveto(this.labelSep);
  this.labelP.__editPanelName = 'Prototype for all labels on this axis'
  this.labels.__setData(this.__data);
  if (horizontal) {  // prevent labels from crowding
    var crowding =this.maxLabelWidth/this.labelGap;
    if (crowding > 0.9) {
      var   fontSize = this.labelP['font-size'];
      this.labelP['font-size'] = Math.floor(fontSize * 0.9/crowding);
      this.update();
    }
  }
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
ui.hide(item.labelP,['text','text-anchor','y']);
ui.hide(item.labels,['byCategory']);
pj.returnValue(undefined,item);

})();

