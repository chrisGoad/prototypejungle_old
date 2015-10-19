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
    var bnds = text.getBBox();
    widths.push(bnds.width);
    target.textHt = bnds.height;
  })
}

item.displayWords = function (textP,params,target,text) {
  debugger;
  if (0 && target.words && (target.lastText === text)) {
    return;
  } else {
    target.lastText = text;
  }
  var words = text.split(" ");
  //var texts = target.set("words",pj.Marks.mk(params.textP));
  var texts = target.set("words",pj.Spread.mk(textP));
  texts.__unselectable = 1;
  texts.binder = function (text,data,indexInSeries,lengthOfDataSeries) {
     text.show();
     text.setText(data);
  }
 // var texts = pj.resetComputedArray(target,"words");
  var widths = pj.resetComputedArray(target,"widths");
  debugger;
  texts.setData(pj.Array.mk(words),1);
  return;
  //texts.__allowBaking = 1;
   var thisHere = this;
  words.forEach(function (word) {
    var text = textP.instantiate();
    text.show();
    text.setText(word);
    texts.push(text);
     });
}


item.arrangeWords = function (textP,params,target,text) {
  this.displayWords(textP,params,target,text);
  this.computeWidths(target);
  // lines = word indices of beginnings of lines
  var lines = pj.resetComputedArray(target,"lines");
  lines.push(0);
  var left = params.left;
  var top = params.top; //might be undefined, meaning centralize
  var twd = params.width;
  var widths = target.widths;
  var textHt = target.textHt;
  var wspacing = 0.5*textHt;
  var lineSpacing = textHt + params.lineSep;
  //var maxx = twd/2;
  //var minx = -maxx;
  var minx = left;
  var maxx = left + params.width;
  var cx = minx;
  var index = 0;
  var texts = target.words;
  var ln = texts.marks.length;
  while (1) {
    var ct = texts.selectMark(index);
    var wd = widths[index]; 
    var hwd = wd/2;
    var nxx = cx + wd + wspacing;
    var bumpy = 0;
    if (nxx <= maxx) {
      ct.moveto(cx+hwd,0);
      cx = nxx;
      index++;
    } else {
      bumpy = 1;
      lines.push(index);
      if (cx === minx) {  // word wider than line
        ct.moveto(cx+hwd,0);
        index++;
        lines.push(index);
      } else {
        cx = minx;
      }
    }
    if (index >= ln) {
   
        // adjust the height of the box
      var oht = params.height;
      var numLines = lines.length;
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
          var tr = ct.getTranslation();
          tr.y = cy;
          ct.draw();
        }
      }
      return newHt;
      var adj = 0.5*(oht - newHt); 
       texts.forEach(function (txt) {
        var tr = txt.getTranslation();
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
