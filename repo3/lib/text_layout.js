(function () {
/* assumes that params has the parameters of the layout,
 * target is where the text is to be placed
 * text, is the text,  
 */
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

item.computeWidth = function (target) {
  item.computeWidths(target);
  target.computedLineWidths = [];
  var lines = target.lines;
  var widths = target.widths;
  var numLines = lines.length;
  var numWords = widths.length;
  var cline = 0;
  var lineStart = lines[cline];
  var cwd = 0;
  var maxwd = 0;
  var wspacing =  0.5*target.textHt;
  var i;
  for (i = 0;i<numWords;i++) {
    if (i === lineStart) {
      target.computedLineWidths.push(cwd);
      maxwd = Math.max(cwd,maxwd);
      cwd = 0;
      cline++;
      lineStart = (cline === numLines)?Infinity:lines[cline];
    }
    cwd += widths[i] + wspacing;
  }
  return maxwd;
}

item.displayWords = function (textP,params,target,text) {
  if (target.words && target.words.marks && (target.lastText === text)) {
    return;
  } else {
    target.lastText = text;
  }
  var words = text.split(" ");
  //var texts = target.set("words",pj.Marks.mk(params.textP));
  var texts = target.words;
  if (!texts) {
    texts = target.set("words",pj.Spread.mk(textP));
    texts.__unselectable = 1;
    texts.binder = function (text,data,indexInSeries,lengthOfDataSeries) {
       text.__editPanelName = 'This word';
       text.__show();
       text.setText(data);
    }
  } else {
    //texts = target.words;
    //target.words.update();
  }
 // var texts = pj.resetComputedArray(target,"words");
  var widths = pj.resetComputedArray(target,"widths");
  texts.setData(pj.Array.mk(words),1);
  return;
  //texts.__allowBaking = 1;
   var thisHere = this;
  words.forEach(function (word) {
    var text = textP.instantiate();
    text.__show();
    text.setText(word);
    texts.push(text);
     });
}


item.arrangeWords = function (textP,params,target,text,inewLines) {
  this.displayWords(textP,params,target,text);
  this.computeWidths(target);
  target.lineWidths = [];
  var maxwd = 0; // maximum width of lines;
  var newLines = (target.lines)?inewLines:1;
  // lines = word indices of beginnings of lines
  if (newLines) {
    var lines = pj.resetComputedArray(target,"lines");
    lines.push(0);
  } else {
    lines = target.lines;
  }
  var left = params.left;
  var top = params.top; //might be undefined, meaning centralize
  var twd = params.width;
  var widths = target.widths;
  var textHt = target.textHt;
  var wspacing =  0.5*textHt;
  var lineSpacing = textHt + params.lineSep;
  //var maxx = twd/2;
  //var minx = -maxx;
  var minx = left;
  var maxx = left + params.width;
  var cx = minx;
  var index = 0;
  var texts = target.words;
  var ln = texts.marks.length;
  var cline = 1;
  var numLines = lines.length;
  var epsilon = 0.01;// computed widths are exact; this avoids breaking a line due  to arithmetic error
  // get all the words at the right x position
  while (1) {
    var ct = texts.selectMark(index);
    var wd = widths[index]; 
    var hwd = wd/2;
    var nxx = cx + wd + wspacing;
    var bumpy = 0;
    var nextLine = newLines?indexBump && (nxx > (maxx+epsilon)):indexBump && (cline < numLines) && (index === lines[cline]);
  //  if (nxx <= maxx) {
    var indexBump = 1;
    if (nextLine) {
      bumpy = 1;
      if (newLines) {
        target.lineWidths.push(cx-minx);
      }
      if (newLines) lines.push(index);
      if (cx === minx) {  // word wider than line
        ct.__moveto(cx+hwd,0);
        index++;
        if (newLines) {
          lines.push(index);
        } 
      } else {
        cx = minx;
        indexBump = 0;
      }
      cline++;
    } else {
      ct.__moveto(cx+hwd,0);
      cx = nxx;
      index++;
    }
    
    if (index >= ln) {
      // now get the words in the right y position,, and adjust the height of the box
      numLines = lines.length;
      var oht = params.height;
      //var numLines = lines.length;
      var newHt = params.lineSep * (numLines-1) + 
                  textHt * numLines;// + 2*params.vPadding;
      var cIndex = 0;
      if (top === undefined) {
        top = -0.5*newHt;
      }
      for (var i=0;i<numLines;i++) {
        var cIndex = lines[i];
        var nxtIndex = (i+1===numLines)?ln:lines[i+1];
        var cy =top + i*lineSpacing + 0.33*textHt;
        for (var j=cIndex;j<nxtIndex;j++) {
          ct = texts.selectMark(j);
          var tr = ct.__getTranslation();
          tr.y = cy;
          ct.draw();
        }
      }
      return newHt;
      var adj = 0.5*(oht - newHt); 
       texts.forEach(function (txt) {
        var tr = txt.__getTranslation();
        tr.y = adj + tr.y;
        txt.draw();
      });
      return newHt;
    }
    
  }
  
}

item.whichLine = function (target,wordIndex) {
  var lines = target.lines;
  var numlines = lines.length;
  for (var i=1;i<numlines;i++) {
    if (wordIndex < lines[i]) return i-1;
  }
  return numlines-1;
}
 pj.returnValue(undefined,item);
})();
