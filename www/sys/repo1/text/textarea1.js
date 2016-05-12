/*
 * Textarea
 */

'use strict';

//pj.require('lib/text_layout.js',function (erm,layout) {
(function () {
var svg = pj.svg,ui = pj.ui,geom = pj.geom;
var item = pj.svg.Element.mk('<g/>');
item.extentEvent = pj.Event.mk('extentChange');

item.__draggable = 1;
item.width = 250;
item.height = 400;
item.lineSep = 5;
//item.topPadding = 0;
//item.sidePadding = 0;
//item.includeBox = 0; //item.showBox is turned on temporarily in any case when adjusting
item.beenControlled = 1; // causes a layout on initial load
//item.showBox = 0;
//item.set("content",svg.Element.mk('<g/>'));
//item.content.__unselectable = 1;
item.set('textP', svg.Element.mk('<text font-size="25" fill="black" visibility="hidden" text-anchor="middle"/>'));
//item.textP.__setExtent = item.textP.__adjustExtent;
item.set("words",pj.Spread.mk(item.textP));
item.words.__unselectable = 1;
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
  var inewLines = 1;
  this.displayWords(text);
   var words = this.words;
  if (words.inSync() !== 1) {
    words.update();
  }
  this.computeWidths();
  this.lineWidths = [];
  var newLines = (this.lines)?inewLines:1;
  //pj.log('textLayout','Arranging words newLines = ',newLines,'left = ',params.left);
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
    this.cannotBeNarrowed = 1;
  } else {
    this.cannotBeNarrowed = 0;
  }
  // get all the words at the right x position
  while (1) {
    ct = words.selectMark(index);
    wordWd = widths[index]; 
    hwwd = wordWd/2;
    nxx = cx + wordWd + wspacing;
    //indexBump = 1;
    nextLine = newLines?(nxx >= (allocatedWidth)):(cline < numLines) && (index === lines[cline]);
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
      numLines = lines.length;
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


item.firstUpdate = 1;

item.text = "Text not yet set";
item.textP.__hide();
//item.set("box",svg.Element.mk('<rect pointer-events="visibleStroke" stroke="black" fill="transparent" stroke-width="2" x="-5" y="-5" width="50" height="50"/>'));
item.getText = function () {
  return this.text;
}

item.setText = function (txt) {
  this.text = txt;
  this.update();
}

/*
item.shifterPlacement = function () {
  var hht = 0.5 * this.height;//-(this.includeBox?0:this.sidePadding);
  return geom.Point.mk(0,-hht);
}
*/
//item.__customControlsOnly = 1;

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
/*
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

*/
/*
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
*/

// if the top is defined, move the item so that its top is there
item.update = function (top) {
  // disinherit
  if (this.forChart) {
    this.text = this.forChart.data.title;
  }
  this.lineSep = Math.max(0,this.lineSep);
  this.width = this.width;// bring up from proto
  this.height = this.height;
  var padFactor = (this.includeBox || this.showBox) ?2:0;
 // params.width = this.width - 2.0*this.sidePadding;
 // params.height = this.height - 2.0*this.topPadding;
//  params.left = -0.5*params.width;
//  params.lineSep = this.lineSep;
  var preserveTop = 0;
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
  this.beenControlled = 0;
  this.height = newHt;// + 2*this.topPadding;
  //this.updateBox();
  if (preserveTop) {
    var newY = oldTop + 0.5 * this.height;
    this.__moveto(tr.x,newY);
  }
  this.__draw();
  this.extentEvent.node = this;
  this.extentEvent.emit();
  //var event = pj.Event.mk('extentChange',this);
  //event.emit();
  //var listener = pj.ancestorWithMethod(this,'listenToTextarea');
  //  if (listener) {
  //    listener.listenToTextarea(this);
  // }
  return;
}

//item.__scalable = 1;
//item.__adjustable = 1;
item.__draggable = 1;
item.__adjustable = 1;
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
    this.beenControlled = 1;
  }
  this.update();
}
/*
item.__showBox = function (nm) {
  if (nm === 'c12') {
     return this.content.lines.length > 1;
  }
  if ((nm ==='c01') || (nm === 'c21')||(nm == 'c02')||(nm === 'c22')) {
    return 0;
  }
}
*/

ui.hideExcept(item,['textP','lineSep']);
ui.hide(item.textP,['text-anchor','y']);
ui.freeze(item.textP,'text');

pj.returnValue(undefined,item);
})();