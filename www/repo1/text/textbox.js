
'use strict';

pj.require('/text/textarea.js','/shape/rectangle.js',function (textareaP,rectangleP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */

/* adjustable parameters */
var item = pj.svg.Element.mk('<g/>');
item.bold = true;
item.boxFill = '#f5f5ff';
item.boxStroke = 'black';
item.boxStrokeWidth = 3;
item['font-size'] =10;
item.lineSep = 10;
item.multiline = false;
item.minHorizontalPadding = 10;
item.stroke  = 'black';
/*  end adjustable parameters */



item.__defaultSize = geom.Point.mk(100,50);

item.__cloneResizable = false;
item.__donotResizeOnInsert = true;
item.__isTextBox = true;
item.__updateLast = true; // after the charts
item.width = 100;
item.height = 50;
item.vPadding = 20;

item.__cloneable = true;
item.__adjustable = true;
item.__replacementRole = 'rectangle';
item.__data = 'Text not yet set';
//item.__data = 'aa \u0398';

item.initText = function () {
  if (!this.text) {
    this.set('text',
         svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black"  stroke-width="0" text-anchor="middle"/>'));
    this.text.__unselectable = true;
    pj.declareComputed(this.text);
  }

}
//item.initText();
//item.text.text = 'Text not yet set';

/* not in use 
item.__replacer = function (replacement) {
  pj.dom.removeDom(this.textarea);
  this.set('box',replacement);
  this.box.__unselectable = 1;
  this.box.__setIndex = this.textarea.__setIndex + 1;
  this.textarea.__draw();
  this.update();
  this.__draw();
}

item.set('__signature',pj.Signature.mk({width:'N',height:'N',data:'S'}));
*/
item.__draggable = true;
item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}

item.__setExtent = function (extent,nm) {
  pj.log('textbox','setExtent',extent.x,extent.y,nm,this.width);
  this.width = extent.x;
  this.height = extent.y;
  this.__forVisibleInheritors(function (inh) {inh.update(true);});
}

item.firstUpdate = true;
item.update = function (fromSetExtent) {
  debugger;
   if (this.forChart) {
    this.__data = this.forChart.__getData().title;
  }
  var box = this.box;
  if (this.box) {
    box.__show();
  } 
  //var bnds = this.text.__getBBox();
  if (!this.multiline) {
    
    if (this.textarea) {
      //this.initText();
     // this.set('text',
     //    svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black"  stroke-width="0" text-anchor="middle"/>'));
     // this.textarea.__unselectable = true;
      //this.text.text = this.__data;
      //this.textarea.__getText();
      this.textarea.remove();
    }
    this.initText();
    this.text['font-size'] = this['font-size'];
    this.text['stroke-width'] =  this.bold?1:0;
    this.text.text = this.__data;

  } else {
    var textarea = this.textarea;
    if (!textarea) {
      textarea = this.set('textarea',textareaP.instantiate());
      pj.declareComputed(textarea,true);
      textarea.textP['font-size'] = this['font-size'];

      textarea.__unselectable = true;
      textarea.textHt = 10;
      textarea.width = this.width - 2*this.minHorizontalPadding;
      //textarea.reset();
     // textarea.__setText(this.text.text);
      textarea.__setText(this.__data);
      if (this.text) {
        this.text.remove();
      }
      fromSetExtent = true;
    }
    
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
      if (!this.box) {
        this.height = textareaHeight + 2*this.vPadding;
      }
      var numLines = textarea.numLines;
      console.log('NUMLINES',numLines);
      //var minWd = textarea.width + 2*this.hPadding;
      //var minHt = textarea.height + 2*this.vPadding;
     // this.width = Math.max(this.width,this.minWd);//Math.textarea.width + 2*this.hPadding;
     // this.height = textarea.height + 2*this.vPadding;
    
  //  } else if (this.__newData) {
    } else if (this.firstUpdate|| (this.__data !== textarea.__getText())) {
      textarea.width = this.width - 2*this.minHorizontalPadding;
      //textarea.reset();
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
    box.width = this.width;
    box.height = this.height;
          console.log('ht 3',this.width,this.height);
    box.update();
  }
  this.firstUpdate = false;
}

item.uiShowForBox = function () {
   ui.show(this,['boxFill','boxStroke','boxStrokeWidth','minHorizontalPadding']);
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
  this.__data = txt;
  if (this.multiline) {
    this.textarea.__setText(txt);
  } else {
    this.text.text = txt;
  }
}

/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['vPadding','width','textarea','text','height','box','textareaa','firstUpdate']);
ui.hide(item,['boxFill','boxStroke','boxStrokeWidth','minHorizontalPadding']);

item.__setFieldType('bold','boolean');
item.__setFieldType('boxFill','svg.Rgb');
item.__setFieldType('boxStroke','svg.Rgb');
item.__setFieldType('multiline','boolean');

return item;
});


