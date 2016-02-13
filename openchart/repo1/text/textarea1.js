/*
 * Textarea
 */

'use strict';

pj.require('lib/text_layout.js',function (erm,layout) {
"use strict";
var svg = pj.svg,ui = pj.ui,geom = pj.geom;
var item = pj.svg.Element.mk('<g/>');

item.__shiftable = 1;
item.width = 250;
item.height = 400;
item.lineSep = 5;
item.topPadding = 20;
item.sidePadding = 40;
item.includeBox = 0; //item.showBox is turned on temporarily in any case when adjusting
item.beenControlled = 1; // causes a layout on initial load
item.showBox = 0;
item.set("content",svg.Element.mk('<g/>'));
item.content.__unselectable = 1;
item.set('textP', svg.Element.mk('<text font-size="25" fill="black" text-anchor="middle"/>'));
item.textP.__setExtent = item.textP.__adjustExtent;

item.firstUpdate = 1;

item.text = "Text not yet set";
item.textP.__hide();
item.set("box",svg.Element.mk('<rect pointer-events="visibleStroke" stroke="black" fill="transparent" stroke-width="2" x="-5" y="-5" width="50" height="50"/>'));
item.getText = function () {
  return this.text;
}

item.setText = function (txt) {
  this.text = txt;
  this.update();
}


item.shifterPlacement = function () {
  var hht = 0.5 * this.height;//-(this.includeBox?0:this.sidePadding);
  return geom.Point.mk(0,-hht);
}

item.__customControlsOnly = 1;

item.computeWidth = function () {
  return layout.computeWidth(this.content);
}

// when the width is changed, the text should not jump
item.preserveLeft = function (oldWidth,newWidth) {
  var tr = this.__getTranslation();
  var oldLeft = tr.x - 0.5*oldWidth;
  var newCenter = oldLeft + 0.5 * newWidth;
  this.__moveto(newCenter,tr.y);
}

item.__controlPoints = function (firstCall) {//first call in this dragging
  this.showBox = 1;
  var oldWidth = this.width;
  this.updateBox();
  var hwd = 0.5 * this.width;//-this.sidePadding;
  var hht = 0.5 * this.height;//-this.sidePadding;
  return [geom.Point.mk(-hwd,-hht),geom.Point.mk(hwd,-hht)];
}

item.__whenUnselected = function () {
  this.showBox = 0;
  this.updateBox();
}

item.__updateControlPoint = function (idx,pos) {
  
  var nwd = 2 * (Math.abs(pos.x)+(this.showBox?0:this.sidePadding));
  if ((nwd < this.width) && this.content.cannotBeNarrowed) {
    return;
  }
  this.width = nwd;
  var points = this.__controlPoints();
  this.beenControlled = 1;
  this.update();
  ui.updateCustomBoxes(points);
}


item.textP.startDrag = function (refPoint) {
   var cn = pj.ancestorWithName(this,'content');
   var itm = cn.__parent;
   itm.dragStartTr= itm.__getTranslation().copy();
   itm.dragStart = refPoint.copy();
}


item.textP.dragStep = function (pos) {
  var cn = pj.ancestorWithName(this,'content');
  var itm = cn.__parent;
  var relpos = pos.difference(itm.dragStart);
  var newtr = itm.dragStartTr.plus(relpos);
  itm.__moveto(newtr);
}

item.updateBox = function () {
  var bx = this.box;
  if (!(this.includeBox || this.showBox)) {
    bx.__hide();
    bx.__draw();
    return;
  }
  bx.width = this.width;
  bx.height = this.height;
  bx.x = -0.5*this.width;
  bx.y = -0.5*this.height;
  bx.__show();
  bx.__draw();
}

// if the top is defined, move the item so that its top is there
item.update = function (top) {
  // disinherit
  if (this.forChart) {
    this.text = this.forChart.data.title;
  }
  this.width = this.width;// bring up from proto
  this.height = this.height;
  var params = {};
  var padFactor = (this.includeBox || this.showBox) ?2:0;
  params.width = this.width - 2.0*this.sidePadding;
  params.height = this.height - 2.0*this.topPadding;
  params.left = -0.5*params.width;
  params.lineSep = this.lineSep;
  var target = this.content;    
  var preserveTop = 1;
  if (preserveTop) {
    var tr = this.__getTranslation();
    var oldHeight = this.height;
    var oldTop = tr.y - 0.5*oldHeight;
  }
  // the breaking of words into lines is preserved unless the controlls have been dragged
  this.textP.__editPanelName = 'All words in this caption';
  // beenControlled means that the text has been resized by the resizer box. meanning that the allocation of words to lines might change
  // if !beenControlled, then the lines keep their arrangement, and the width is adjusted accordingly (this happens, eg, when words are resized)
  var newExtent = layout.arrangeWords(this.textP,params,target,this.text,this.beenControlled);
  var newWidth = newExtent.x + 2*this.sidePadding;
  var newHt = newExtent.y;
  var oldWidth = this.width;
  this.width = newWidth;
  this.preserveLeft(oldWidth,newWidth);
  this.beenControlled = 0;
  this.height = newHt + 2*this.topPadding;
  this.updateBox();
  if (preserveTop) {
    var newY = oldTop + 0.5 * this.height;
    this.__moveto(tr.x,newY);
  }
  this.__draw();
  return;
}

item.__scalable = 1;

item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}   
item.__setExtent = function (extent) {
  this.width = extent.x;
  this.update();
}


ui.hideExcept(item,['textP','lineSep']);
ui.hide(item.textP,['text-anchor','y']);
ui.freeze(item.textP,'text');

pj.returnValue(undefined,item);
});