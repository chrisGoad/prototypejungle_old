
'use strict';

pj.require('/shape/rectanglePeripheryOps.js','/text/textarea.js',function (peripheryOps,textareaP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */
var item = pj.svg.Element.mk('<g/>');

/* adjustable parameters */
//item.bold = true; //putBack when bold is fixed for exporting svg
item.boxFill = '#f5f5ff';
item.boxStroke = 'black';
item.boxStrokeWidth = 3;
item['font-size'] =14;
item.lineSep = 5;
item.multiline = false;
item.minHorizontalPadding = 10;
item.textColor  = 'black';
item.width = 50;
item.height = 20;
item.dimension = item.width; // only used if item.box.dimension is present, as in eg textcircle.js
item.vPadding = 20;
//Use item.__setText method
/*  end adjustable parameters */


ui.setupAsVertex(item);
item.__cloneable = true;
item.__adjustable = true;
item.__data = 'Text';
item.__draggable = true;
item.__defaultSize = geom.Point.mk(40,20);
item.__cloneResizable = false;
item.__donotResizeOnInsert = true;
item.__isTextBox = true;
item.__updateLast = true; // after the charts
item.__disableRevertToPrototype = true;


item.initText = function () {
  if (!this.text) {
    this.set('text',
         svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black"  stroke-width="0" text-anchor="middle"/>'));
    this.text.__unselectable = true;
    this.text.center();
    pj.declareComputed(this.text);
  }

}


item.firstUpdate = true;
item.update = function (fromSetExtent) {
  console.log('Text Update');
  debugger;
  var box = this.box;
  if (this.box) { // get the drawing order right
    box.__setIndex = 1;
    if (this.text) {
      this.text.__setIndex = 2;
    }
    if (box.dimension) {
      this.height = this.width = box.dimension;
      //code
    }
   // box.__show();
  } 
  if (!this.multiline) {
    if (this.textarea) {
      this.textarea.remove();
    }
    this.initText();
    this.text.fill = this.textColor;
    this.text['font-size'] = this['font-size'];
    this.text['stroke-width'] = 0;// this.bold?1:0; //putBack when bold is fixed for exporting svg
    this.text.text = this.__data;
    this.text.__setIndex = 2;

  } else {
    var textarea = this.textarea;
    if (!textarea) {
      textarea = this.set('textarea',textareaP.instantiate());
      pj.declareComputed(textarea,true);
      textarea.textP['font-size'] = this['font-size'];
      textarea.__unselectable = true;
      textarea.textHt = 10;
      textarea.width = this.width - 2*this.minHorizontalPadding;
      textarea.__setText(this.__data);
      if (this.text) {
        this.text.remove();
      }
      fromSetExtent = true;
    }
    textarea.fill = this.textColor;
    textarea.textP['font-size'] = this['font-size'];
    textarea.textP['stroke-width'] = 0;// this.bold?1:0; //putBack when bold is fixed for exporting svg
  
    textarea.multiline = this.multiline;
    textarea.lineSep  = this.lineSep;
    if (fromSetExtent) {
      textarea.__setExtent(geom.Point.mk(this.width+2-2 * this.minHorizontalPadding,
                                        this.height-2 * this.vPadding),fromSetExtent);
     var textareaHeight = textarea.height;
      var textareaWidth = textarea.width;
      if (!this.box) {
        this.height = textareaHeight + 2*this.vPadding;
      }
      var numLines = textarea.numLines;
    } else if (this.firstUpdate|| (this.__data !== textarea.__getText())) {
      textarea.width = this.width - 2*this.minHorizontalPadding;
      textarea.__setText(this.__data);
    } else {
      textarea.update();
    }
    var minWd = textarea.width + 2*this.minHorizontalPadding;
    var minHt = textarea.height + 2*this.vPadding;
  }
  if (box) {
    box.fill = this.boxFill;
    box.stroke = this.boxStroke;
    box['stroke-width'] = this['boxStrokeWidth'];
    if (box.dimension) {
      box.dimension = this.dimension;
    } else {
      box.width = this.width;
      box.height = this.height;
      console.log('ht 3',this.width,this.height);
    }
    box.update();
  }
  this.firstUpdate = false;
}

item.uiShowForBox = function () {
   ui.show(this,['boxFill','boxStroke','boxStrokeWidth','minHorizontalPadding']);
}


item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}


item.setDimensionFromExtent = function (extent,nm) {
  var event,ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
  this.width = ext;
  this.height = ext;
}


item.__setExtent = function (extent,nm) {
  pj.log('textbox','setExtent',extent.x,extent.y,nm,this.width);
  if (this.box && this.box.dimension) {
    this.setDimensionFromExtent(extent,nm);
  } else {
    this.width = extent.x;
    this.height = extent.y;
  }
  this.__forVisibleInheritors(function (inh) {inh.update(true);});
}
// needed for cloned text boxes
item.__reset = function () {
  var ota = this.textarea;
  this.set('textarea',textareaP.instantiate());
   this.textarea.__unselectable = true;
   this.textarea.linesep = ota.linesep;
   
}

item.__getText = function () {
  return this.__data;
  if (this.multiline) {
    return this.textarea.__getText();
  } else {
    return this.text.text;
  }
}


item.__setText = function (txt) {
  debugger;
  this.__data = txt;
  if (this.multiline) {
    this.textarea.__setText(txt);
  } else {
    this.text.text = txt;
  }
}


peripheryOps.installOps(item);

/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['vPadding','width','textarea','text','height','box','textareaa','firstUpdate']);
ui.hide(item,['boxFill','boxStroke','boxStrokeWidth','minHorizontalPadding']);

//item.__setFieldType('bold','boolean'); //putBack when bold is fixed for exporting svg
item.__setFieldType('textColor','svg.Rgb');
item.__setFieldType('boxFill','svg.Rgb');
item.__setFieldType('boxStroke','svg.Rgb');
item.__setFieldType('multiline','boolean');

return item;
});


