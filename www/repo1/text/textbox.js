
'use strict';

//pj.require('/shape/rectanglePeripheryOps.js','/text/textarea.js',function (peripheryOps,textareaP) {
pj.require('/text/textarea.js',function (textareaP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */
var item = pj.svg.Element.mk('<g/>');

/* adjustable parameters */
//item.bold = true; //putBack when bold is fixed for exporting svg
item.fill = 'white';
item.stroke = 'black';
item.strokeWidth = 3;
item['font-size'] =14;
item['font-family'] = 'arial';
item.lineSep = 5;
item.multiline = false;
item.minHorizontalPadding = 5;// 10;
item.textColor  = 'black';
item.width = 100;
item.height = 40;
item.vPadding = 5;//20;
//Use item.__setText method
/*  end adjustable parameters */


item.set('__transferredProperties',pj.lift(['__data','multiline','font-size','font-family','lineSep','fill','stroke','textColor']));
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
    pj.declareComputed(this.text);
  }

}


item.firstUpdate = true;
item.update = function (fromSetExtent) { 
  if (this.__dimension) {
    this.width = this.height = this.__dimension;
  }
  var box = this.box;
  if (this.box) { // get the drawing order right
    box.__setIndex = 1;
    if (this.text) {
      this.text.__setIndex = 2;
    }
    if (this.boxProperties) {
      pj.setProperties(box,this,this.boxProperties);
    }
    box.fill = this.fill;
    box.stroke = this.stroke;
    box['stroke-width'] = this['stroke-width'];
    box.__show();
  } 
  if (!this.multiline) {
    if (this.textarea) {
      this.textarea.remove();
    }
    this.initText();
    this.text.fill = this.textColor;
    this.text['font-size'] = this['font-size'];
    this.text['stroke-width'] = 0;// this.bold?1:0; //putBack when bold is fixed for exporting svg
    this.text['font-family']= this['font-family'];
    this.text.text = this.__data;
    this.text.__setIndex = 2;
    this.text.center();
    this.text.__draw();
    var textBnds = this.text.__getBBox();
    if (textBnds) {
      var textWd = textBnds.width;
      var textHt = textBnds.height;
    }

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
    textarea.textP['font-family'] = this['font-family'];

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
    textWd = textarea.width;
    textHt = textarea.height;
   
  }
  if (textWd) {
    var minWd = textWd + 2*this.minHorizontalPadding;
    var minHt = textHt + 2*this.vPadding;
    // this is done with an if rather than max to keep things in the prototype if possible
    if (minWd > this.width) {
      this.width = minWd;
      this.height = this.height; // moves height up from prototype if needed
    }
    if (minHt > this.height) {
      this.height = minHt;
      this.width = this.width; // moves width up from prototype if needed

    }
  }
  if (box) {
  if (this.__get('__dimension')) {
    box.__dimension = this.__dimension;
    return;
   } else if (this.__dimension) {
     Object.getPrototypeOf(box).__dimension = this.__dimension;
   }
   if (this.__get('width')) {
    box.width = this.width;
   } else {
    Object.getPrototypeOf(box).width = this.width;
   }
   if (this.__get('height')) {
    box.height = this.height;
   } else {
     Object.getPrototypeOf(box).height = this.height;
   }
   box.update();
   box.__draw();
  }
  this.firstUpdate = false;
}

item.uiShowForBox = function () {
   ui.show(this,['fill','stroke','stroke-width','minHorizontalPadding']);
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
  this.__dimension = ext;
}


item.__setExtent = function (extent,nm) {
  pj.log('textbox','setExtent',extent.x,extent.y,nm,this.width);
  if (this.box && this.box.__dimension) {
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
}


item.__setText = function (txt) {
  this.__data = txt;
}


/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['vPadding','width','textarea','text','height','box','textareaa','firstUpdate']);

item.__setFieldType('textColor','svg.Rgb');
item.__setFieldType('fill','svg.Rgb');
item.__setFieldType('stroke','svg.Rgb');
item.__setFieldType('multiline','boolean');

return item;
});


