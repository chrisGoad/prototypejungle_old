
'use strict';

pj.require('/text/textarea.js','/shape/rectangle.js',function (textareaP,rectangleP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */
var item = pj.svg.Element.mk('<g/>');
item.__isTextBox = true;
item.__updateLast = true; // after the charts
item.set({width:600,height:50});
item.minVpadding = 20;
item.minHpadding = 20;
item.vPadding = 20;
item.hPadding = 20;
item.showBox = false;
item.multiline = true;
item.__cloneable = true;
item.__adjustable = true;
item.__replacementRole = 'rectangle';
//item.__cloneable = true;
item.__data = 'Text not yet set';
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.fill = '#f5f5ff';
item.stroke  = 'black';
item['stroke-width'] = 3;
item.box.__affixedChild = true; // dragging the box, drags this item
item.set('textarea',textareaP.instantiate());
item.textarea.__unselectable = true;

item.__replacer = function (replacement) {
  pj.dom.removeDom(this.textarea);
 // this.set('textarea',this.textarea);// need to keep the display order
  this.set('box',replacement);
  this.box.__unselectable = 1;
  this.box.__setIndex = this.textarea.__setIndex + 1;
  this.textarea.__draw();
  this.update();
  this.__draw();
}
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
//item.__donotResizeOnInsert = true;
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
    this.__data = this.forChart.__getData().title;
  }
  var box = this.box;
  if (this.showBox) {
    box.__show();
  } else {
    box.__hide();
  }
  var textarea = this.textarea;
  textarea.multiline = this.multiline;
  //this.__adjustable = this.multiline;
  //var minWd = textarea.width + 2*this.hPadding;
  //var minHt = textarea.width + 2*this.hPadding;
  //var minWd = textarea.width + 2*this.minHpadding;
  console.log('updateCount',this.__updateCount)
  if (fromSetExtent) {
    console.log('wd ht 1',this.width,this.height);
    textarea.__setExtent(geom.Point.mk(this.width+2-2 * this.hPadding,
                                      this.height-2 * this.vPadding),fromSetExtent);
   var textareaHeight = textarea.height;
    var textareaWidth = textarea.width;
    var numLines = textarea.numLines;
    console.log('NUMLINES',numLines);
    //var minWd = textarea.width + 2*this.hPadding;
    //var minHt = textarea.height + 2*this.vPadding;
   // this.width = Math.max(this.width,this.minWd);//Math.textarea.width + 2*this.hPadding;
   // this.height = textarea.height + 2*this.vPadding;
  
  } else if (this.__newData) {
    textarea.width = this.width - 2*this.hPadding;
    //textarea.reset();
    textarea.setText(this.__data);
  } else {
    textarea.update();
  }
  var minWd = textarea.width + 2*this.hPadding;
  var minHt = textarea.height + 2*this.vPadding
  if (this.width> minWd) {
    debugger;
  }
  if (this.showBox) {
    this.width = Math.max(this.width,minWd);
    this.height = Math.max(this.height,minHt);
  } else {
    this.width = minWd;
    this.height = minHt;
  }
  box.fill = this.fill;
  box.stroke = this.stroke;
  box['stroke-width'] = this['stroke-width'];
  box.width = this.width;
  box.height = this.height;
        console.log('ht 3',this.width,this.height);
  box.update();
  return;
}

// needed for cloned text boxes
item.__reset = function () {
  var ota = this.textarea;
  this.set('textarea',textareaP.instantiate());
   this.textarea.__unselectable = true;
   this.textarea.linesep = ota.linesep;
   
}

/**
 * Set accessibility and notes for the UI
*/

item.__setFieldType('showBox','boolean');
item.__setFieldType('multiline','boolean');

return item;
});


