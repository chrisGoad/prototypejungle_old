 /* utilities for laying out text */
 
'use strict';

(function () {
var item = pj.Object.mk(); 

item.computeWidths = function (target) {
  var widths = pj.resetComputedArray(target,"widths");
  var texts = target.words;
  texts.forEachMark(function (text) {
    text.center();
    var bnds = text.__getBBox();
    widths.push(bnds.width);
    target.textHt = bnds.height;
  })
}


/* assumes that params has the parameters of the layout,
 * target is where the text is to be placed
 * text, is the text,  
 */

item.displayWords = function (textP,params,target,text) {
  if (target.words && target.words.marks && (target.lastText === text)) {
    return;
  } else {
    target.lastText = text;
  }
  var words = text.split(" ");
  var texts = target.words;
  if (!texts) {
    texts = target.set("words",pj.Spread.mk(textP));
    texts.__unselectable = true;
    texts.binder = function (text,data,indexInSeries,lengthOfDataSeries) {
       text.__editPanelName = 'This word';
       text.__show();
       text.setText(data);
    }
  } 
  var widths = pj.resetComputedArray(target,"widths");
  texts.setData(pj.Array.mk(words),true);
  return;
}

/* target.rightSpace is the space left over after words are layed out from the left.
 * newLines is set if a new allocation of words to lines is to be computed.
 * Otherwise the original arrangment is kept, and so is the rightSpace, but the width might change.
 * 
 */

item.arrangeWords = function (textP,params,target,text,inewLines) {
  this.displayWords(textP,params,target,text);
   var texts = target.words;
  if (!texts.inSync()) {
    texts.update();
  }
  this.computeWidths(target);
  target.lineWidths = [];
  var newLines = (target.lines)?inewLines:true;
  pj.log('textLayout','Arranging words newLines = ',newLines,'left = ',params.left);
  if (newLines) {
    var lines = pj.resetComputedArray(target,"lines");
    lines.push(0);
  } else {
    lines = target.lines;
  }
  var top = params.top; //might be undefined, meaning centralize
  var allocatedWidth = params.width;
  var widths = target.widths;
  var textHt = target.textHt;
  var wspacing =  0.5*textHt;
  var lineSpacing = textHt + params.lineSep;
  var cx = 0;
  var index = 0;
  var ln = texts.marks.length;
  var cline = 1;
  var numLines = lines.length;
  var epsilon = 0.01;
  var ct,wordWd,hwwd,nxx,nextLine,indexBump,nwd,newWd,hwd,oht,newHt,cIndex,nxtIndex,cy,i,j,tr;
  var maxLineWidth = 0;
  var maxWordWd = Math.max.apply(undefined,widths);
  var minWidth = maxWordWd+wspacing+epsilon;
  if (allocatedWidth < minWidth) {
    allocatedWidth = minWidth;
    target.cannotBeNarrowed = true;
  } else {
    target.cannotBeNarrowed = false;
  }
  // get all the words at the right x position
  while (true) {
    ct = texts.selectMark(index);
    wordWd = widths[index]; 
    hwwd = wordWd/2;
    nxx = cx + wordWd + wspacing;
    indexBump = 1;
    nextLine = newLines?indexBump && (nxx >= (allocatedWidth)):indexBump && (cline < numLines) && (index === lines[cline]);
    if (nextLine) {
      if (newLines) {
        target.lineWidths.push(cx);
      }
      if (newLines) lines.push(index);
      cx = 0;
      indexBump = 0;
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
        target.rightSpace = allocatedWidth - maxLineWidth;
        newWd = allocatedWidth;
      } else {
        newWd = maxLineWidth + target.rightSpace;
      }
      hwd = 0.5*newWd;
      numLines = lines.length;
      oht = params.height;
      newHt = params.lineSep * (numLines-1) + 
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
          ct = texts.selectMark(j);
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


 pj.returnValue(undefined,item);
})();
