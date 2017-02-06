
'use strict';

pj.require('/text/textarea.js','/shape/rectangle.js',function (textareaP,rectangleP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */
var item = pj.svg.Element.mk('<g/>');
item.__cloneResizable = false;
item.__donotResizeOnInsert = true;
item.__isTextBox = true;
item.__updateLast = true; // after the charts
item.bold = true;
item.width = 100;
item.height = 50;
//item.minVpadding = 20;
//item.minHpadding = 20;
item.lineSep = 10;
item.vPadding = 20;
item.minHorizontalPadding = 10;
item['font-size'] =10;
item.showBox = true;
item.multiline = true;
item.__cloneable = true;
item.__adjustable = true;
item.__replacementRole = 'rectangle';
item.__data = 'Text not yet set';
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.boxFill = '#f5f5ff';
//item.boxFill = 'none'
item.stroke  = 'black';
item.boxStroke = 'black';
item.boxStrokeWidth = 3;
item.box.__affixedChild = true; // dragging the box, drags this item
item.set('textarea',textareaP.instantiate());
item.textarea.__unselectable = true;

item.__replacer = function (replacement) {
  pj.dom.removeDom(this.textarea);
  this.set('box',replacement);
  this.box.__unselectable = 1;
  this.box.__setIndex = this.textarea.__setIndex + 1;
  this.textarea.__draw();
  this.update();
  this.__draw();
}
item.textarea.textHt = 10;

item.set('__signature',pj.Signature.mk({width:'N',height:'N',data:'S'}));

item.__draggable = true;
item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}

var debugOn = false;
item.__setExtent = function (extent,nm) {
  console.log('setExtent',extent.x,extent.y,nm,this.width);
  if (extent.x < this.width) {
    debugger;
    debugOn = true;
  }
  this.width = extent.x;
  this.height = extent.y;
  debugger;
  this.__forVisibleInheritors(function (inh) {inh.update(true);});
}

item.uiHidesDone = false; // on the first update, box-related properties are hidden in the UI if showBox is off
item.update = function (fromSetExtent) {
     debugger;
   if (this.forChart) {
    this.__data = this.forChart.__getData().title;
  }
  var box = this.box;
  if (this.showBox) {
    box.__show();
  } else {
    box.__hide();
    if (!this.uiHidesDone) {
      ui.hide(this,['boxFill','boxStroke','boxStrokeWidth','minHorizontalPadding']);
      this.uiHidesDone = true;
    }
  }
  var textarea = this.textarea;
  textarea.textP['font-size'] = this['font-size'];
  debugger;
  textarea.textP['stroke-width'] =  this.bold?1:0;

  textarea.multiline = this.multiline;
  textarea.lineSep  = this.lineSep;
  if (fromSetExtent) {
    console.log('wd ht ',this.width,textarea.width,this.height,textarea.height);
    if (this.width > textarea.width) {
      debugger;
    }
    textarea.__setExtent(geom.Point.mk(this.width+2-2 * this.minHorizontalPadding,
                                      this.height-2 * this.vPadding),fromSetExtent);
   var textareaHeight = textarea.height;
    var textareaWidth = textarea.width;
    if (!this.showBox) {
      this.height = textareaHeight + 2*this.vPadding;
    }
    var numLines = textarea.numLines;
    console.log('NUMLINES',numLines);
    //var minWd = textarea.width + 2*this.hPadding;
    //var minHt = textarea.height + 2*this.vPadding;
   // this.width = Math.max(this.width,this.minWd);//Math.textarea.width + 2*this.hPadding;
   // this.height = textarea.height + 2*this.vPadding;
  
  } else if (this.__newData) {
    textarea.width = this.width - 2*this.minHorizontalPadding;
    //textarea.reset();
    textarea.setText(this.__data);
  } else {
    textarea.update();
  }
  var minWd = textarea.width + 2*this.minHorizontalPadding;
  var minHt = textarea.height + 2*this.vPadding
  //if (this.width> minWd) {
  //  debugger;
  //}
  //if (this.showBox) {
    //this.width = Math.max(this.width,minWd);
    //this.height = Math.max(this.height,minHt);
 // } else {
  //  this.width = minWd;
  //  this.height = minHt;
  //}
  box.fill = this.boxFill;
  box.stroke = this.boxStroke;
  box['stroke-width'] = this['boxStrokeWidth'];
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

ui.hide(item,['vPadding','width','textarea','height','showBox','box','textareaa','uiHidesDone']);

item.__setFieldType('bold','boolean');
item.__setFieldType('boxFill','svg.Rgb');
item.__setFieldType('boxStroke','svg.Rgb');
item.__setFieldType('multiline','boolean');

return item;
});


