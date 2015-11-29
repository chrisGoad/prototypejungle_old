/* this file assembles all the components needed for the basic bar_chart (the canonical example referenced from the
 * home page). This was assembled by hand. In future, automation of this assembly will be implemented.
 */

(function () {
  var data = {"title":"Density in grams per cubic centimeter","fields":[{"id":"metal","type":"string"},{"id":"density","type":"number"}],
         "elements":[["Lithium",0.53],["Copper",9],["Silver",10.5],["Gold",19.3]]};
  pj.returnData(data,'example/data/metal_densities.js');

})();

(function () {
  /* utilities for laying out text */

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
    texts.__unselectable = 1;
    texts.binder = function (text,data,indexInSeries,lengthOfDataSeries) {
       text.__editPanelName = 'This word';
       text.__show();
       text.setText(data);
    }
  } 
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
          ct.__draw();
        }
      }
      return newHt;
      var adj = 0.5*(oht - newHt); 
       texts.forEach(function (txt) {
        var tr = txt.__getTranslation();
        tr.y = adj + tr.y;
        txt.__draw();
      });
      return newHt;
    }
    
  }
  
}


 pj.returnValue(undefined,item,'lib/text_layout.js');
})();

/* Section
 textarea
*/
pj.require('lib/text_layout.js',function (erm,layout) {

var svg = pj.svg,ui = pj.ui,geom = pj.geom;
var item = pj.svg.Element.mk('<g/>');

item.__shiftable = 1;
item.width = 250;
item.height = 400;
item.lineSep = 5;
item.topPadding = 20;
item.sidePadding = 20;
item.includeBox = 0; //item.showBox is turned on temporarily in any case when adjusting
item.beenControlled = 1; // causes a layout on initial load
item.showBox = 0;
item.set("content",svg.Element.mk('<g/>'));
item.content.__unselectable = 1;
item.set('textP', svg.Element.mk('<text font-size="25" fill="black" text-anchor="middle"/>'));
item.textP.__setExtent = item.textP.__adjustExtent;


item.text = "Text not yet set";
item.textP.__hide();
item.set("box",svg.Element.mk('<rect pointer-events="visibleStroke" stroke="black" fill="transparent" stroke-width="2" x="-5" y="-5" width="50" height="50"/>'));
item.getText = function () {
  return this.text;
}
item.setText = function (txt) {
  this.text = txt;
  this.update();
}


item.shifterPlacement = function () {
  var hht = 0.5 * this.height;//-(this.includeBox?0:this.sidePadding);
  return geom.Point.mk(0,-hht);
}

item.__customControlsOnly = 1;

item.computeWidth = function () {
  return layout.computeWidth(this.content);
}

item.__controlPoints = function (firstCall) {//first call in this dragging
  this.showBox = 1;
  debugger;
  if (firstCall) {
    var tr = this.__getTranslation();
    var prevLeft = tr.x - 0.5*this.width;
    this.width = this.computeWidth() + 2*this.sidePadding;//layout.computeWidth(this.content);
  }
  var hwd = 0.5 * this.width-this.sidePadding;
  var hht = 0.5 * this.height-this.sidePadding;
  if (firstCall) {
    var newX = prevLeft + 0.5 * this.width;
    this.__moveto(newX,tr.y);
  } 
  this.update();
  this.__draw();
  return [geom.Point.mk(-hwd,-hht),geom.Point.mk(hwd,-hht)];
}

item.__whenUnselected = function () {
  this.showBox = 0;
  this.updateBox();
}

item.__updateControlPoint = function (idx,pos) {
  var nwd = 2 * (Math.abs(pos.x)+(this.showBox?0:this.sidePadding));
  this.width = nwd;
  this.update();
  var points = this.__controlPoints();
  ui.updateCustomBoxes(points);
  this.beenControlled = 1;
}


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
// if the top is defined, move the item so that its top is there
item.update = function (top) {
  // disinherit
  if (this.forChart) {
    this.text = this.forChart.data.title;
  }
  this.width = this.width;// bring up from proto
  this.height = this.height;
  var params = {};
  var padFactor = (this.includeBox || this.showBox) ?2:0;
  params.width = this.width - 2.0*this.sidePadding;
  params.height = this.height - 2.0*this.topPadding;
  params.left = -0.5*params.width;
  params.lineSep = this.lineSep;
  var target = this.content;    
  var preserveTop = 1;//!!target.words;
  if (preserveTop) {
    var tr = this.__getTranslation();
    var oldHeight = this.height;
    var oldTop = tr.y - 0.5*oldHeight;
  }
  // the breaking of words into lines is preserved unless the controlls have been dragged
  this.textP.__editPanelName = 'All words in this caption';
  var newHt = layout.arrangeWords(this.textP,params,target,this.text,this.beenControlled);
  if (!this.beenControlled) { 
    var tr = this.__getTranslation();
    var prevLeft = tr.x - 0.5*this.width;
    console.log('width before ',this.width);
    this.width = this.computeWidth() + 2*this.sidePadding;
        console.log('width after ',this.width);

    var newX = prevLeft + 0.5 * this.width;
    this.__moveto(newX,tr.y);
  }
  this.beenControlled = 0;
  this.height = newHt + 2*this.topPadding;
  this.updateBox();
  if (preserveTop) {
    var newY = oldTop + 0.5 * this.height;
    this.__moveto(tr.x,newY);
  } 
  return;
}

item.__scalable = 1;

item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}   
item.__setExtent = function (extent) {
  this.width = extent.x;
  this.update();
}


ui.hideExcept(item,['textP','lineSep']);
ui.hide(item.textP,['text-anchor','y']);
ui.freeze(item.textP,'text');

pj.returnValue(undefined,item,'text/textarea1.js');
});
/* An evenly spaced set of labels.
*/

(function () {
var ui=pj.ui;
var geom=pj.geom;
var svg=pj.svg;

var item = svg.Element.mk('<g/>');

item.width = 1000;
item.height = 500;
item.centerLabels = 1;
// possible orientation values: 'horizontal' and 'vertical'
item.orientation = 'horizontal'; 
//label prototype
item.set('labelP', svg.Element.mk('<text font-size="25" fill="black" text-anchor="middle"/>'));
item.labelP.__setExtent = item.labelP.__adjustExtent;
item.labelGap = 10;// along the direction of the item(horizontal or vertical)
item.labelSep = pj.geom.Point.mk(0,0); // the whole label set is displaced by this much;


item.set("labels",pj.Spread.mk(item.labelP));
item.labels.__unselectable = 1;
item.__unselectable = 1;
item.labels.binder = function (label,data,indexInSeries,lengthOfDataSeries) {
  label.__editPanelName = 'This label';
  var item = this.__parent;
  var gap = item.labelGap;
  var  labelHeight,labelWidth,labelBBox,x,y;
  label.__show();
  label.data = data;
  label.setText(data);
  labelBBox = label.__getBBox();
  labelWidth= labelBBox.width;
  item.maxLabelWidth = Math.max(item.maxLabelWidth,labelWidth);
  labelHeight = label["font-size"];
  if (item.orientation === 'vertical') { // label's left is at zero in the vertical case
    x = labelWidth/2;
    y = indexInSeries * gap;
  }  else {
    x = indexInSeries * gap;
    y =0;
  }
  label.__moveto(x,y);
  label.__show();
}



item.update = function () {
  var svg = pj.svg,
    thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max;
  if (!this.data) return;
  // this is something that should not be inherited
  if (!this.hasOwnProperty('labelSep')) {
    this.set("labelSep",this.labelSep.copy());
  }
  var L = this.data.elements.length;
  if (horizontal) {
    this.labelGap = this.width/(L-1);
  } else {
    this.labelGap = this.height/(L-1);
    this.maxLabelWidth = 0;
  }
  this.labelP.center();
  this.labels.__moveto(this.labelSep);
  this.labelP.__editPanelName = 'Prototype for all labels on this axis'
  this.labels.setData(this.data,1);
 
}


item.labelP.startDrag = function (refPoint) {
  var itm = this.__parent.__parent.__parent;
  itm.dragStart = refPoint.copy();
  itm.startLabelSep = itm.labelSep.copy();
}


item.labelP.dragStep = function (pos) {
  var itm = this.__parent.__parent.__parent;
  var diff = pos.difference(itm.dragStart);
  itm.labelSep.copyto(itm.startLabelSep.plus(diff));
  itm.labels.__moveto(itm.labelSep);
}

item.reset = function () {
  this.labels.reset();
}

/**
 * Set accessibility and notes for the UI
*/
 
ui.hide(item,['width','height','orientation',
  'labelGap','labelSep','maxLabelWidth']);
ui.hide(item.labelP,['text','text-anchor','y']);
ui.hide(item.labels,['byCategory']);
pj.returnValue(undefined,item,'chart/component/labels1.js');

})();

/**
 * General purpose axis component. 
*/
pj.require('chart/component/labels1.js',function (erm,labelsP) {

var ui = pj.ui;
var geom = pj.geom;
var svg = pj.svg;
var item = pj.svg.Element.mk('<g/>');
item.gridLineLength = 0; // 0 for no grid lines
item.tickImageInterval = 10;
item.dragStartTextoffset = 0; // initialize so that ui.freezeExcept will work
item.dragStartY = 0;
item.orientation = 'horizontal';
/**
 * dataBounds should be reset from the outside
*/
item.set("theLabels",labelsP.instantiate());
item.theLabels.__unselectable = 1;
item.theLabels.set("data",Object.create(pj.dat.Series));
item.theLabels.data.set("elements",pj.Array.mk());

item.set('dataBounds',pj.geom.mkInterval(100,300));
item.showTicks = false;
item.set('TickP',svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-width="2"/>'));
item.TickP.length = 10;
item.set('BigTickP',
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-width="3"/>'));
item.BigTickP.length = 20;

item.set('Line',
  svg.Element.mk('<line x1="0" y1="0" x2="0" y2="0" stroke="black" stroke-width="2"/>'));
item.set('gridLineP',
  svg.Element.mk('<line x1="0" y1="0" x2="0" y2="0" stroke="black" stroke-width="1"/>'));

item.maxLabelWidth = undefined; // defined later; mentioned here so it can be frozen by ui.freeze
item.firstLabelPos = undefined; // defined later; mentioned here so it can be frozen by ui.freeze
item.initializeTextOffset = function () {
  var horizontal = this.orientation == 'horizontal';
  if (this.textOffset === undefined) {
    this.textOffset = horizontal?40:-20;
  }
  return this.textOffset;
}

item.update = function () {
  var ui = pj.ui;
  var geom = pj.geom;
  var dat = pj.dat;
  var svg = pj.svg;
  var
    datalb,dataub,isDate,dataBounds,scale,extentub,dataToImageScale,interval,firstTick,
    TickP,gridLineP,halfTickWidth,ticks,labels,gridLines,bigTick,BigTickP,
    currentTick,tick,label,gridLine,numTicks,labelString,horizontal,firstLabelPos,lastLabelPos,ip;
/**
 * for date axes, the values will be given in terms of day ordinal (days since 1/1/1970) 
 * but the tickDataInterval will be in years
 * the user expresses a desired distance between ticks. 
 */
 
 /**
  * The user expresses a desired distance between ticks. n is what
  * the data interval which would correspond to this. This needs to be
  * rounded up to a power of 10
*/
  var roundUpToGoodTickInterval = function (n) {
    var lg10 = Math.floor(Math.log(n)/Math.log(10)),
      b10 = Math.pow(10,lg10);
    if (n <= b10) {
      return b10;
    }
    return b10*10;
  }
  this.initializeTextOffset();
  //var maxTextWidth = 0;
  isDate = this.isDate;
  dataBounds = this.dataBounds;
  scale = this.scale;
  if ( !scale) return; // data not ready
  ui.freeze(scale);
  extentub = scale.extent.ub; // the extent is in image space, and coverage in data space
  if (!dataBounds) return; // bounds not ready
  /**
   * dat.internalizeData, applied incoming data, puts dates in dayOrdinals
   * change this to years 
  */
  datalb = isDate?dat.dayOrdinalToYear(dataBounds.lb):dataBounds.lb;
  dataub = isDate?dat.dayOrdinalToYear(dataBounds.ub):dataBounds.ub;
  scale.coverage.lb = datalb;
  scale.coverage.ub = dataub;
  dataToImageScale = scale.dtToImScale();
  /**
   * interval is the interval between ticks in data space
  */
  interval= roundUpToGoodTickInterval(this.tickImageInterval/dataToImageScale);
  firstTick = Math.floor(datalb/interval)*interval;
  /**
  * adjust the coverage to exactly match the modification of the extent
  * to be an even number of ticks
  * record the scaling involved in the adjustment
  */
  dataub = (Math.ceil(dataub/(5*interval)))*5*interval; // new upperbound at even bigtick count
  scale.coverage.lb = firstTick;
  scale.coverage.ub = dataub;
  horizontal = this.orientation == 'horizontal';
  this.initializeTextOffset();
  // prototypes for ticks and labels
  TickP = this.TickP;
  BigTickP = this.BigTickP;
  //TextP = this.TextP;
  gridLineP = this.gridLineP;
  halfTickWidth = 0.5*TickP['stroke-width'];
  if (this.showTicks) {
     this.Line.__show();
  } else {
    this.Line.__hide();
  }
  if (horizontal) {
    scale.isY = 0;
    this.Line.x1=-halfTickWidth;
    this.Line.y1=0;
    this.Line.x2=extentub+halfTickWidth;
    this.Line.y2=0;
    ui.freeze(this.Line,['x1','x2','y1','y2']);
    gridLineP.y1 = 0;//-this.gridLineLength;
    gridLineP.y2 = 0;
  } else {
    scale.isY = 1;
    this.Line.x1=0;
    this.Line.y1=extentub+halfTickWidth;
    this.Line.y2=-halfTickWidth;
    TickP.x1 = - TickP.length;
    gridLineP.x1 = 0;
    gridLineP.x2 = 0;//this.gridLineLength;
  }
  ui.freeze(scale,'isY');
  ticks = pj.resetComputedArray(this,'ticks');
  var labelElements = this.theLabels.data.elements;
  labelElements.length = 0;
  this.theLabels.orientation = this.orientation;
  if (this.gridLines) {
    this.gridLines.forEach(pj.dom.removeElement);
  }
  gridLines = pj.resetComputedArray(this,'gridLines');
  currentTick = firstTick;//  in data space
  //textHt = TextP['font-size'];
  while (currentTick <= dataub) {
    numTicks = Math.floor(currentTick/interval);
    bigTick = numTicks%5 === 0;
    labelString = scale.label(currentTick);
    ip = scale.eval(currentTick);  /* tick in image space, rather than data space */
    if (this.showTicks) {
      tick = (bigTick?BigTickP:TickP).instantiate();
      tick.__mark = 1;//treat like a mark in the ui
      tick.show();
      ticks.push(tick);
    }
    if (bigTick) {
      labelElements.push(labelString);
      if (firstLabelPos === undefined) {
        firstLabelPos = ip;
      }
      lastLabelPos = ip;
      gridLine = gridLineP.instantiate();
      if (this.gridLineLength > 0) {
        gridLines.push(gridLine);
      }
      if (horizontal) {
        gridLine.x1 = ip;
        gridLine.x2 = ip;
      } else {
        gridLine.y1 = ip;
        gridLine.y2 = ip;
      }
    }
     
    if (horizontal) {
      if (this.showTicks) {
        tick.set('x1',ip);
        tick.set('x2',ip);
        tick.set('y2',tick.length);
      }
    } else {
      if (this.showTicks) {
        tick.set('y1',ip);
        tick.set('y2',ip);
        tick.set('x1',-tick.length);
      }
    }
    currentTick += interval;
  }
  /**
   * now set the coverage back to the original units if a date
   */
  if (isDate) {
    scale.coverage.lb  = dat.toDayOrdinal(scale.coverage.lb);
    scale.coverage.ub  = dat.toDayOrdinal(scale.coverage.ub);
  }
  /**
   * reset the extent, so that it doesn't keep getting bumped by adjustScaling
   */
  scale.extent.ub = extentub;
  //this.set('__bounds',this.bounds().toOwnCoords(this));
  //this.maxTextWidth = maxTextWidth;
  var axisExtent = lastLabelPos - firstLabelPos; //scale.extent.ub - scale.extent.lb;
  if (horizontal) {
    this.theLabels.width = axisExtent;
  } else {
    this.theLabels.height = axisExtent;
  }
  this.firstLabelPos = firstLabelPos;
  this.theLabels.update();
  this.maxLabelWidth = this.theLabels.maxLabelWidth;
   if (horizontal) {
    this.theLabels.__moveto(firstLabelPos,this.textOffset);//+this.maxLabelWidth);
    gridLineP.y1 = -this.gridLineLength;
  } else {
    gridLineP.x2 = this.gridLineLength;
    this.theLabels.__moveto(this.textOffset-this.maxLabelWidth,firstLabelPos);
  }
}

item.theLabels.labelP.startDrag = function (refPoint) {
    var itm = this.__parent.__parent.__parent.__parent;
    var horizontal = itm.orientation == 'horizontal';
    if (horizontal) {
      itm.dragStartY = refPoint.y;
    } else {
      itm.dragStartX = refPoint.x
    }
    itm.dragStartTextoffset = itm.textOffset;
}


item.theLabels.labelP.dragStep = function (pos) {
  var itm = this.__parent.__parent.__parent.__parent;
  var horizontal = itm.orientation == 'horizontal';
  if (horizontal) {
    var ydiff = pos.y - itm.dragStartY;
    itm.textOffset =  itm.dragStartTextoffset + ydiff;
    itm.theLabels.__moveto(itm.firstLabelPos,itm.textOffset);
  } else {
    var xdiff = pos.x - itm.dragStartX;
    itm.textOffset =  itm.dragStartTextoffset + xdiff;
    itm.theLabels.__moveto(itm.textOffset-itm.maxLabelWidth,itm.firstLabelPos);
  }
  itm.theLabels.__draw();
}
/**
 * run when this is the top level item, rather than used as a component
 */
 
item.soloInit = function () {
  var pj = prototypeJungle;
  this.set('scale',pj.dat.LinearScale.mk());
  this.scale.setExtent(1000);
  this.orientation = 'vertical';
}


/**
 * Set accessibility and notes for the UI
 */

ui.setNote(item,'tickImageInterval','Distance in image coordinates between minor ticks');
ui.setNote(item,'textOffset','Distance to place labels below the axis');
ui.freezeExcept(item,['tickImageInterval','textOffset']);
ui.hide(item,['dragStartTextoffset','dragStartY','firstLabelPos','maxLabelWidth','scale']);
ui.hideExcept(item.gridLineP,['stroke','stroke-width']);
item.__setFieldType('showTicks','boolean')
ui.hideInInstance(item.TickP,['length','stroke','stroke-width']);
ui.hide(item.TickP,['x1','x2','y1','y2']);
ui.hide(item.BigTickP,['x1','x2','y1','y2']);
ui.freeze(item,'adjustScaling');
pj.returnValue(undefined,item,'chart/component/axis1.js');
});

 
 (function () {
 
/** 
 * Common code used to initialize colors by category from the pj.svg.stdColor dictionary
*/ 
var item = pj.Object.mk();

item.initColors = function (target) {
  var categories = target.data.categories;
  var cnt = 0;
  if (categories && !target.colorsInitialized) {
    target.categorized = 1;
    target.categoryCount = categories.length;
    categories.forEach(function (category) {
      target.setColorOfCategory(category, pj.svg.stdColor(cnt++));
    target.colorsInitialized = 1;
    });
  } else {
    target.categorized = 0;
    target.categoryCount = 1;
  }
}
pj.returnValue(undefined,item,'lib/color_utils.js');
})();

// Component for a set  of bars - the core of bar graph, which includes axes and labels as well
pj.require('chart/component/labels1.js','lib/color_utils.js',function (erm,labelsP,color_utils) {
var ui=pj.ui;
var geom=pj.geom;
var svg=pj.svg;

var item = pj.svg.Element.mk('<g/>');
var labelC = item.set('labelC',labelsP.instantiate());
item.width = 1000;
item.height = 500;

item.orientation = 'horizontal'; // bars run horizontally, and are stacked vertically

/* The basic layout params are barSep, barDim, groupSep.
 * barSep and groupSep are both percentages of barDim. igroupSep is the
 * incrementaal group sep: groupSep-barSep. If V is the vertical.
 * Let L be the number of elements, and G the number of groups.
 * then the total vertical is 
 * V = barDim *(L + (L-1)*barSep*0.01 + (G-1)*igroupSep*0.01)
 
*/
item.requiresData = 1;
item.markType = '[N|S],N';

item.barSep = 10; 
item.groupSep = 55;  // separation between a bar group (for one domain value)
item.barDim = 50; // height for horizontal, width for vertical
item.labelC.__show();

item.set('barP',svg.Element.mk(
  '<rect  fill="rgb(39, 49, 151)" stroke="black" stroke-width="3" \
        x="0" y="0" height="50" visibility="hidden"/>'));
ui.hide(item.barP,['x','y','width','height','visibility']);
item.barP.__undraggable = 1;
item.set('bars',pj.Spread.mk(item.barP));
item.bars.randomizeColors = 1;
item.bars.multiPrototype = 1;
ui.hide(item.bars,['scale','byCategory']);
item.set('colors', pj.Object.mk());//colors by category

/* When colors on the legend are changed, this is 
 * propagated to the bar prototypes.
 * This is implemented with change-listening machinery
 * item.colors is holds these colors at the top level, by category.
 */

item.setColorOfCategory = function (category,color) {
  this.bars.setColorOfCategory(category,color);
 }
 
 item.colorOfCategory = function (category) {
  return this.bars.colorOfCategory(category);
 }
 

/* the scaling function should be set from the outside, usually from the axis
 * a default is is included
 */

item.rangeScaling = function (x) {
  var extent = (this.orientation === 'horizontal')?this.width:this.height;
  return ( x/this.dataMax) * extent;
}

item.bars.binder = function (bar,data,indexInSeries,lengthOfDataSeries) {
  var item = this.__parent,
    categoryCount,group,x,y;
  var horizontal = item.orientation === 'horizontal';
  var datum = item.rangeScaling(data.range);
  var barDim = item.barDim;
  bar.data = datum;
  bar.__editPanelName = 'This bar';
  if (horizontal) {
    bar.width = datum;
    bar.height = barDim;
  } else {
    bar.width = barDim;
    bar.height = datum;
  }
  categoryCount = item.categoryCount;
  group = Math.floor(indexInSeries/categoryCount);// which group of data, grouping by domain
  var categoryIndex = indexInSeries%categoryCount;// place the bar vertically
  if (horizontal) {
    x = 0;
    y = indexInSeries * (item.aBarSep + barDim);
    y = y + group * item.aGroupSep;
  } else {
    x = indexInSeries * (item.aBarSep + barDim);
    x = x + group * item.aGroupSep;
    y =  item.height - datum;
  } 
  bar.__moveto(x,y);
  bar.__show();
}


// propagate changes in colors to the bars over to the legend

item.listenForUIchange = function (ev) {
  if (ev.id === "UIchange") {
    if (ev.property === 'fill') {
      var nd = ev.node;
      var pr = nd.parent(); 
      if (pr.name() === 'categorizedPrototypes') {
        var legend = pr.__nthParent(2).legend;
        if (legend) {
          legend.setColorOfCategory(nd.name(),nd.fill,1);
        }
      }
      return;
    }
    this.update();
    this.__draw();
    pj.tree.refresh();
  }
}

item.addListener("UIchange","listenForUIchange");

item.update = function () {
  var svg = pj.svg,
    thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max,data;
  if (!this.data) return;
  data = this.__dataInInternalForm();
  this.labelC.orientation = horizontal?'vertical':'horizontal';
  this.barP.__editPanelName = 'Prototype for all bars';

  color_utils.initColors(this);
  if (this.categorized) {
    this.minY=Infinity;
  } else {
    pj.ui.hide(this,['barSep']);
    this.barP.__setUIStatus('fill',undefined);
  }
  var L = data.elements.length;
  var G = L/(this.categoryCount);
  var igroupSep = this.groupSep - this.barSep;
  var bhf = (L + (L-1)*(this.barSep)*0.01)+(G-1)*igroupSep*0.01;
  this.barDim = horizontal?this.height/bhf:this.width/bhf;
  this.aBarSep = 0.01 * this.barSep * this.barDim, // absolute barSep
  this.aGroupSep = 0.01 * igroupSep * this.barDim; // absolute additional groupSep
  this.groupDim = (this.barDim+this.aBarSep) * (this.categoryCount);//+this.aGroupSep;
  this.dataMax = data.max('range');
  var domainValues = data.extractDomainValues();
  if (horizontal) {
    var groupHeight = (this.height - this.aGroupSep*(G-1))/G;
    var group0center = groupHeight/2;
    this.labelC.height = this.height - groupHeight;
   } else {
    var groupWidth = (this.width - this.aGroupSep*(G-1))/G;
    var group0center = groupWidth/2;
    this.labelC.width = this.width - groupWidth;
    this.labelC.__moveto(group0center ,this.height+20);
  }
  this.labelC.setData(domainValues,1);
  if (horizontal) {
    this.labelC.__moveto(-20- this.labelC.maxLabelWidth,group0center);
  } 
  this.bars.scale = 1;
  this.bars.setData(data,1);
  if (data.categories) {  // so the legend colors can be updated
    // repeated since categorizedPrototypes might not have been around the first time
      color_utils.initColors(this);

    var cp = this.bars.categorizedPrototypes;
    // @remove pj.forEachTreeProperty(cp,function (p) {
    //  ui.watch(p,'fill');
    //});
  }
}

item.reset = function () {
  if (this.bars) {
    this.bars.reset();
  }
  if (this.labelC) {
    this.labelC.reset();
  }
}


/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['aBarSep','aGroupSep','barDim','markType',
  'dataMax','groupDim','height','maxLabelWidth',
  'orientation','width','colors','color_utils']);

ui.setNote(item,'barSep','The separation between bars, as a percentage of bar height');
ui.setNote(item,'groupSep','The separation between bars (or groups of bars if there are several categories) as a percentage of bar width');
ui.freeze(item,['requiresData'])

pj.returnValue(undefined,item,'chart/core/bar1.js');
});
//})()



pj.require('chart/component/axis1.js','chart/core/bar1.js',function (erm,axisP,coreP) {
var ui=pj.ui;
var geom=pj.geom;
var dat=pj.dat;
var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
item.requiresData = 1;
item.set("core",coreP.instantiate());
item.set("axis",axisP.instantiate());
item.core.__unselectable = 1; 
item.core.__show();
item.axis.__show();
item.set('extent',geom.Point.mk(1000,300));
item.axis.orientation = 'horizontal';
item.core.orientation = 'horizontal';
item.axis.set('scale',dat.LinearScale.mk());
item.axisSep  = 20;

// support for the resizer 
item.__getExtent = function () {
  return this.extent;
}

item.__setExtent = function (extent) {
  this.extent.x = extent.x;
  this.extent.y = extent.y;
  this.update();
}

item.__shiftable = 1;

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}

/* When colors on the legend are changed, this is 
 * propagated to the bar prototypes.
 * This is implemented with change-listening machinery
 */

item.setColorOfCategory = function (category,color) {
  this.core.setColorOfCategory(category,color);
 }
 
 
item.colorOfCategory = function (category,color) {
  return this.core.colorOfCategory(category,color);
 }

item.groupSep = 50;

item.update = function () {
  var svg = pj.svg,
    geom = pj.geom,
    thisHere = this,
    categories,cnt,max,
    main = this.core;
  main.groupSep = this.groupSep;
  if (!this.data) return;
  var data = this.__dataInInternalForm();
  var axis = this.axis;
  main.rangeScaling = function (x) {
    return axis.scale.eval(x);
  }
  categories = data.categories;

  var mainHeight = this.extent.y - this.axisSep;
  var gridlineLength = this.extent.y;//  - eyy;
  var mainWidth = this.extent.x;
  axis.scale.setExtent(mainWidth);
  var upperLeft = this.extent.times(-0.5);
  var max = data.max('range');
  this.axis.set('dataBounds',prototypeJungle.geom.Interval.mk(0,max));
  this.axis.gridLineLength = gridlineLength;//-this.minY;
  this.axis.update();
  axis.__moveto(upperLeft.plus(geom.Point.mk(0,mainHeight + this.axisSep)));
  main.__moveto(upperLeft);
  var axisBnds = this.axis.__bounds();
  main.width = mainWidth;
  main.height = mainHeight;
  main.setData(data,1);
  main.bars.__unselectable = 1;
}

item.reset = function () {
  this.core.reset();
}



/**
 * Set accessibility, watches, and notes for the UI
 */

ui.hide(item,['axisSep','markType','colors','extent']);
ui.freeze(item,['requiresData']);
ui.setNote(item,'groupSep','The separation between bars (or groups of bars if there are several categories) as a percentage of bar width');
pj.returnValue(undefined,item,'chart/bar1.js');
});


/* the assembled example */

pj.require('chart/bar1.js','text/textarea1.js','example/data/metal_densities.js',function (erm,graphP,textareaP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.setData(data);
  var gExtent = item.graph.extent;
  item.set("legend",textareaP.instantiate());
  // these layout operations would normally be done interactively,
  // but I wished this particular example to be easily inspectable at the code level.
  item.legend.forChart = item.graph;
  item.legend.width = 700;
  item.legend.height = 30;
  item.legend.textP['font-size'] = 40;
  item.legend.__moveto((item.legend.width-gExtent.x)/2-30,-gExtent.y/2-180);
  pj.returnValue(undefined,item);
});
