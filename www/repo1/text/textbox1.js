
'use strict';

pj.require('../text/textarea1.js','../shape/rectangle1.js',function (erm,textareaP,rectangleP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */
var item = pj.svg.Element.mk('<g/>');
item.__updateLast = true; // after the charts
item.set({width:600,height:50});
item.vPadding = 20;
item.hPadding = 20;
item.showBox = false;
item.multiline = false;
item.data = 'A quick brown fox jumped over the lazy dog';
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.box.fill = '#f5f5ff';
item.box.__affixedChild = true; // dragging the box, drags this item
item.set('textarea',textareaP.instantiate());
item.textarea.__unselectable = true;

item.textarea.textHt = 10;
item.textarea.textP.__draggable = true;

item.textarea.textP.startDrag = function (refPoint) {
  var itm = pj.ancestorWithPrototype(this,item);;
  itm.dragStartTr= itm.__getTranslation().copy();
  itm.dragStart = refPoint.copy();
}


item.textarea.textP.dragStep = function (pos) {
  var itm = pj.ancestorWithPrototype(this,item);;
  var relpos = pos.difference(itm.dragStart);
  var newtr = itm.dragStartTr.plus(relpos);
  itm.__moveto(newtr);
}
item.set('__signature',pj.Signature.mk({width:'N',height:'N',data:'S'}));

item.__draggable = true;
item.__adjustable = true;
item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}

item.__setExtent = function (extent,nm) {
  console.log('setExtent',extent.x,extent.y,nm,this.width);
  this.width = extent.x;
  this.height = extent.y;
  this.update(nm);
}


item.update = function (fromSetExtent) {
   if (this.forChart) {
    this.data = this.forChart.getData().title;
  }
  var box = this.box;
  if (this.showBox) {
    box.__show();
  } else {
    box.__hide();
  }
  var textarea = this.textarea;
  textarea.multiline = this.multiline;
  this.__adjustable = this.multiline;
  var minWd = textarea.width + 2*this.hPadding;
  console.log('updateCount',this.__updateCount)
  if (fromSetExtent) {
    console.log('wd ht 1',this.width,this.height);
    textarea.__setExtent(geom.Point.mk(this.width+2-2 * this.hPadding,
                                       this.height-2 * this.vPadding),fromSetExtent);
    var textareaHeight = textarea.height;
    var textareaWidth = textarea.width;
    var numLines = textarea.numLines;
    console.log('NUMLINES',numLines);
    this.width = textarea.width + 2*this.hPadding;
    this.height = textarea.height + 2*this.vPadding;
  
  } else if (this.__newData) {
    textarea.width = this.width - 2*this.hPadding;
    textarea.setText(this.data);
  } else {
    textarea.update();
  }
  this.width = textarea.width + 2*this.hPadding;
  this.height = textarea.height + 2*this.vPadding;
  box.width = this.width;
  box.height = this.height;
        console.log('ht 3',this.width,this.height);
  box.update();
  return;
}


/**
 * Set accessibility and notes for the UI
*/

item.__setFieldType('showBox','boolean');
item.__setFieldType('multiline','boolean');

pj.returnValue(undefined,item);

});


