/*
 * Textarea. Used only in the context of textbox - not directly visible in the UI
 */



core.require(function () {
let item = dom.SvgElement.mk('<g/>');
item.set('textP',dom.SvgElement.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black" visibility="hidden" stroke-width="0" text-anchor="middle"/>'));

/* adjustable parameters */
item.width = 50;
item.height = 20;
item.lineSep = 5;
item.numLines = 0;
item.addLineBreaks = true; // the false option for this is only partially implemented: as far as displayWords
item.textP['font-size'] = 10;
item.textP['font-family'] = 'Verdana';
/* end adjustable parameters */


let textProperties = ['font-size','font-style','font-family','font-weight','fill','text-anchor'];
item.resizable = true;
item.set("words",codeRoot.Spread.mk());
item.textP.unselectable = true;
item.words.unselectable = true;

item.words.generator = function (parent,name,data) {
  let rs = this.__parent.textP.instantiate().show();
  rs.setText(data);
  parent.set(name,rs);
  return rs;
}


item.computeWidths = function () {
  let widths = core.resetComputedArray(this,"widths");
  let texts = this.words;
  let thisHere = this;
  this.textHt = 0;
  texts.forEachMark(function (text) {
    text.center();
    let bnds = text.getBBox();
    widths.push(bnds.width);
    if (bnds.height) {
      thisHere.textHt = Math.max(thisHere.textHt,bnds.height);
    }
  })
}

 // puts the words of the text into the spread
const removeLf = function (ws) {
  let ln = ws.length;
  if (ln && (ws[ln-1]==='\n')) {
    ws.pop();
    return true;
  }
 }
item.displayWords = function (text) {
  let sp;
  let words = this.words;
  this.lastText = text;
  let lines=text.split("\n");
  if (this.addLineBreaks) {
    let ws = codeRoot.Array.mk();
    lines.forEach(function (line) {
      sp = line.split(" ");
      sp.forEach(function (w) {ws.push(w)});
      ws.push('\n');
    });
    while (removeLf(ws)) {
    }
    words.setData(codeRoot.Array.mk(ws));
  } else {
    words.setData(codeRoot.Array.mk(lines));
  }
}


/* this.rightSpace is the space left over after words are layed out from the left.
 * newLines is set if a new allocation of words to lines is to be computed.
 * Otherwise the original arrangment is kept, and so is the rightSpace, but the width might change.
 * 
 */

item.arrangeWords = function (text,constraint) { //,inewLines) {
  let extent;
  if (constraint === 'height') {
    let height = this.height;
    let textHt = this.textHt;
    let sep = this.lineSep;
    let numLines = Math.floor((height +sep)/(textHt + sep));
    extent = this.arrangeWords(text,'width');
    let actualLines = this.lines.length;
    let increaseWidth =  (actualLines > numLines);
    let cnt = 0;
    while (cnt < 10) {
      let lastWidth;
      if (actualLines === numLines) {
        return extent; // solved
      }
      if ((increaseWidth) && (actualLines < numLines)) {
        return extent; // works 
      }
      if ((!increaseWidth) && (actualLines >numLines)) {
        //overshot; go back
        this.width = lastWidth;
        return this.arrangeWords(text,'width');
      }
      let ratio = actualLines/numLines;
      lastWidth = this.width;
      this.width = ratio * lastWidth;
      extent = this.arrangeWords(text,'width');
      actualLines = this.lines.length;
      cnt++;
    }
    return extent;
  } 
  this.displayWords(text);
   let words = this.words;
   words.update();
  this.computeWidths();
  this.lineWidths = [];
  let lines = core.resetComputedArray(this,"lines");
  lines.push(0);
  let top = this.top; //might be undefined, meaning centralize
  let allocatedWidth = this.width;
  let {widths,textHt} = this;
  let wspacing =  0.3*textHt;
  let lineSpacing = textHt + this.lineSep;
  let cx = 0;
  let index = 0;
  let ln = words.length();
  let numLines = lines.length;
  let epsilon = 0.01;
  let ct,wordWd,hwwd,nxx,nextLine,newWd,hwd,newHt,cIndex,nxtIndex,cy,i,j,tr;
  let maxLineWidth = 0;
  let maxWordWd = Math.max.apply(undefined,widths);
  let minWidth = maxWordWd+wspacing+epsilon;
  this.minWidth = minWidth;
  if (allocatedWidth < minWidth) {
    allocatedWidth = minWidth;
    this.cannotBeNarrowed = true;
  } else {
    this.cannotBeNarrowed = false;
  }
  // get all the words at the right x position
  while (true) {
    ct = words.selectMark(index);
    let isNewLine = (ct.text === '\n');
    core.log('textarea','newLine',ct.text,isNewLine);
    wordWd = widths[index]; 
    hwwd = wordWd/2;
    nxx = cx + wordWd + wspacing;
    nextLine = (isNewLine || (nxx >= allocatedWidth));
    if (nextLine) {
      this.lineWidths.push(cx);
      lines.push(index);
      cx = 0;
      if (isNewLine) {
        index++;
      }
    } else {
      ct.moveto(cx+hwwd,0);
      cx = nxx;
      maxLineWidth = Math.max(cx,maxLineWidth);
      index++;
    }
   
    if (index >= ln) {
      // all the lines are formed, but starting from x = 0
      // now get the words in the right y position, and center them and adjust the height of the box
      if (lines.length === 1) {
        this.rightSpace = 0;
        newWd = maxLineWidth + 0.1;// 0.1 serves as epsilon
      } else {
        this.rightSpace = allocatedWidth - maxLineWidth;
        newWd = allocatedWidth;
      }
      hwd = 0.5*maxLineWidth;//newWd;
      numLines = this.numLines = lines.length;
      newHt = this.lineSep * (numLines-1) + 
                  textHt * numLines;
      cIndex = 0;
      if (top === undefined) {
        top = -0.5*newHt;
      }
      for (i=0;i<numLines;i++) {
        cIndex = lines[i];
        nxtIndex = (i+1===numLines)?ln:lines[i+1];
        cy =top + i*lineSpacing;// + 0.33*textHt;
        for (j=cIndex;j<nxtIndex;j++) {
          ct = words.selectMark(j);
          tr = ct.getTranslation();
          tr.x = tr.x - hwd;
          tr.y = cy;
          ct.draw();
        }
      }
      return Point.mk(newWd,newHt)     
    }    
  }
}

  
item.reset = function () {
  this.words.reset();
  this.lastText = undefined;
}

item.text = "Text";

item.textP.hide();
item.__getText = function () {
  return this.text;
}

item.__setText = function (txt,doUpdate=true) {
  this.text = txt;
  if (doUpdate) {
    this.update();
  }
}


item.computeMinWidth = function () {
  this.displayWords(this.text);
  this.words.update();
  this.computeWidths();
  let epsilon = 0.01;
  let maxWordWd = Math.max.apply(undefined,this.widths);
  return maxWordWd+epsilon;
}

item.update = function (constraint) {
  if (!this.__get('__element')) { //not in DOM yet
    return;
  }
  if (this.text === undefined) {
    return;
  }
  if (this.text != this.lastText) {
    this.reset();
  }
  this.words.show();
  this.lineSep = Math.max(0,this.lineSep);
  this.width = this.width;// bring up from proto
  this.height = this.height;
  // the breaking of words into lines is preserved unless the controlls have been dragged
  this.textP.__editPanelName = 'All words in this caption';
  core.setProperties(this.textP,this,textProperties);
  let stm = performance.now();
  let newExtent = this.arrangeWords(this.text,constraint);
  core.advanceTimer('arrabgeWords',performance.now() - stm);
  this.width = newExtent.x;
  this.height = newExtent.y;
  this.lastText = this.text;
  this.draw();
}


item.__setExtent = function (extent,nm) {
  if (nm === 'c12') {
    let numLines = this.lines.length;
    if (numLines > 1) {
      let delta = extent.y - this.height;
      this.lineSep = this.lineSep + delta/(numLines-1);
    }
  } else {
    this.width = extent.x;
  }
  this.update();
}

item.setWidth = function (x) {
  this.width = x;
  this.update('width');
}


item.setHeight = function (y) {
  this.height = y;
  this.update('height');
}

ui.hideExcept(item,['textP','lineSep']);
ui.hide(item.textP,['text-anchor','y']);
ui.freeze(item.textP,'text');
return item;
});