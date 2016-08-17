/*
 * Textarea
 */

'use strict';

(function () {
var svg = pj.svg,ui = pj.ui,geom = pj.geom;
var item = pj.svg.Element.mk('<g/>');
item.extentEvent = pj.Event.mk('extentChange');

item.__draggable = true;
item.width = 250;
item.height = 400;
item.lineSep = 5;
item.numLines = 0;
item.multiline = true;
item.beenControlled = true; // causes a layout on initial load

item.__draggable = true;
item.__adjustable = true;

item.set('textP', svg.Element.mk('<text font-size="18" fill="black" visibility="hidden" text-anchor="middle"/>'));
item.set("words",pj.Spread.mk(item.textP));
item.words.__unselectable = true;
item.words.binder = function (text,data,indexInSeries,lengthOfDataSeries) {
     text.__editPanelName = 'This word';
     text.__show();
     text.setText(data);
  }



item.computeWidths = function () {
  var widths = pj.resetComputedArray(this,"widths");
  var texts = this.words;
  var thisHere = this;
  texts.forEachMark(function (text) {
    text.center();
    var bnds = text.__getBBox();
    widths.push(bnds.width);
    thisHere.textHt = bnds.height;
  })
}

 // puts the words of the text into the spread
 
item.displayWords = function (text) {
  var words = this.words;
  if (words.marks && (this.lastText === text)) {
    return;
  } else {
    this.lastText = text;
  }
  words.setData(pj.Array.mk(text.split(" ")),1);
  return;
}


/* this.rightSpace is the space left over after words are layed out from the left.
 * newLines is set if a new allocation of words to lines is to be computed.
 * Otherwise the original arrangment is kept, and so is the rightSpace, but the width might change.
 * 
 */

item.arrangeWords = function (text) { //,inewLines) {
  var inewLines = true;
  this.displayWords(text);
   var words = this.words;
   var ins = words.inSync();
   if ((ins === 'nomarks') || !ins) {
    words.update();
  }
  this.computeWidths();
  this.lineWidths = [];
  var newLines = (this.lines)?inewLines:true;
  if (newLines) {
    var lines = pj.resetComputedArray(this,"lines");
    lines.push(0);
  } else {
    lines = this.lines;
  }
  var top = this.top; //might be undefined, meaning centralize
  var allocatedWidth = this.width;
  var widths = this.widths;
  var textHt = this.textHt;
  var wspacing =  0.5*textHt;
  var lineSpacing = textHt + this.lineSep;
  var cx = 0;
  var index = 0;
  var ln = words.marks.length;
  var cline = 1;
  var numLines = lines.length;
  var epsilon = 0.01;
  var ct,wordWd,hwwd,nxx,nextLine,indexBump,nwd,newWd,hwd,oht,newHt,cIndex,nxtIndex,cy,i,j,tr;
  var maxLineWidth = 0;
  var maxWordWd = Math.max.apply(undefined,widths);
  var minWidth = maxWordWd+wspacing+epsilon;
  if (allocatedWidth < minWidth) {
    allocatedWidth = minWidth;
    this.cannotBeNarrowed = true;
  } else {
    this.cannotBeNarrowed = false;
  }
  // get all the words at the right x position
  while (true) {
    ct = words.selectMark(index);
    wordWd = widths[index]; 
    hwwd = wordWd/2;
    nxx = cx + wordWd + wspacing;
    nextLine = (this.multiline) && (newLines?(nxx >= (allocatedWidth)):(cline < numLines) && (index === lines[cline]));
    if (nextLine) {
      if (newLines) {
        this.lineWidths.push(cx);
      }
      if (newLines) lines.push(index);
      cx = 0;
      //indexBump = 0;
      cline++;
    } else {
      ct.__moveto(cx+hwwd,0);
      cx = nxx;
      maxLineWidth = Math.max(cx,maxLineWidth);
      index++;
    }
   
    if (index >= ln) {
      // all the lines are formed, but starting from x = 0
      // now get the words in the right y position, and center them and adjust the height of the box
      if (newLines) {
        if (lines.length === 1) {
          this.rightSpace = 0;
          newWd = maxLineWidth + 0.1;// 0.1 serves as epsilon
        } else {
          this.rightSpace = allocatedWidth - maxLineWidth;
          newWd = allocatedWidth;
        }
      } else {
        newWd = maxLineWidth + this.rightSpace;
      }
      hwd = 0.5*newWd;
      numLines = this.numLines = lines.length;
      oht = this.height;
      newHt = this.lineSep * (numLines-1) + 
                  textHt * numLines;
      cIndex = 0;
      if (top === undefined) {
        top = -0.5*newHt;
      }
      for (i=0;i<numLines;i++) {
        cIndex = lines[i];
        nxtIndex = (i+1===numLines)?ln:lines[i+1];
        cy =top + i*lineSpacing + 0.33*textHt;
        for (j=cIndex;j<nxtIndex;j++) {
          ct = words.selectMark(j);
          tr = ct.__getTranslation();
          tr.x = tr.x - hwd;
          tr.y = cy;
          ct.__draw();
        }
      }
      return pj.geom.Point.mk(newWd,newHt)
     
    }
    
  }
  
}




item.text = "Text not yet set";
item.textP.__hide();
item.getText = function () {
  return this.text;
}

item.setText = function (txt) {
  this.text = txt;
  this.update();
}


item.computeWidth = function () {
  return layout.computeWidth(this.content);
}

// when the width is changed, the text should not jump
item.preserveLeft = function (oldWidth,newWidth) {
  return;
  var tr = this.__getTranslation();
  var oldLeft = tr.x - 0.5*oldWidth;
  var newCenter = oldLeft + 0.5 * newWidth;
  this.__moveto(newCenter,tr.y);
}

// if the top is defined, move the item so that its top is there
item.update = function (top) {
  console.log("TEXTWIDTH START",this.width);
  // disinherit
  if (this.forChart) {
    this.text = this.forChart.data.title;
  }
  this.lineSep = Math.max(0,this.lineSep);
  this.width = this.width;// bring up from proto
  this.height = this.height;
  var padFactor = (this.includeBox || this.showBox) ?2:0;
  var preserveTop = false;
  if (preserveTop) {
    var tr = this.__getTranslation();
    var oldHeight = this.height;
    var oldTop = tr.y - 0.5*oldHeight;
  }
  // the breaking of words into lines is preserved unless the controlls have been dragged
  this.textP.__editPanelName = 'All words in this caption';
  // beenControlled means that the text has been resized by the resizer box. meanning that the allocation of words to lines might change
  // if !beenControlled, then the lines keep their arrangement, and the width is adjusted accordingly (this happens, eg, when words are resized)
  var newExtent = this.arrangeWords(this.text,this.beenControlled);
 
  var newWidth = newExtent.x;//+ 2*this.sidePadding;
  var newHt = newExtent.y;
  var oldWidth = this.width;
  this.width = newWidth;
  if (!this.cannotBeNarrowed) {
     this.preserveLeft(oldWidth,newWidth);
  }
  this.beenControlled = false;
  this.height = newHt;// + 2*this.topPadding;
  if (preserveTop) {
    var newY = oldTop + 0.5 * this.height;
    this.__moveto(tr.x,newY);
  }
  this.__draw();
  this.extentEvent.node = this;
  this.extentEvent.emit();
  console.log("TEXTEXTENT END ",this.width);
}

item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}

item.__setExtent = function (extent,nm) {
  if (nm === 'c12') {
    //var numLines = this.content.lines.length;
    var numLines = this.lines.length;
    console.log('numLines',numLines);
    if (numLines > 1) {
      var delta = extent.y - this.height;
      console.log('delta',delta);
      this.lineSep = this.lineSep + delta/(numLines-1);
    }
  } else {
    this.width = extent.x;
    this.beenControlled = true;
  }
  this.update();
}


ui.hideExcept(item,['textP','lineSep']);
ui.hide(item.textP,['text-anchor','y']);
ui.freeze(item.textP,'text');

pj.returnValue(undefined,item);
})();