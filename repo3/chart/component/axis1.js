/**
 * General purpose axis component. 
*/
pj.require('chart/component/labels1.js',function (erm,labelsP) {

//(function () {
var ui = pj.ui;
var geom = pj.geom;
var svg = pj.svg;
var item = pj.svg.Element.mk('<g/>');

//var item = svg.Element.mk('<g/>');
item.gridLineLength = 0; // 0 for no grid lines
item.tickImageInterval = 10; 
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
item.set('TextP', svg.Element.mk(
  '<text visibility="hidden" font-size="30" fill="black" text-anchor="middle"/>'));
item.set('Line',
  svg.Element.mk('<line x1="0" y1="0" x2="0" y2="0" stroke="black" stroke-width="2"/>'));
item.set('gridLineP',
  svg.Element.mk('<line x1="0" y1="0" x2="0" y2="0" stroke="black" stroke-width="1"/>'));
//item.set("labelsContainer",svg.Element.mk('<g/>'));


item.listenForUIchange = function (ev) {
  if (ev.id === 'UIchange') {
    this.update();
    this.draw();
    pj.tree.refresh();
  }
}
item.addListener('UIchange','listenForUIchange');

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
    TickP,TextP,gridLineP,halfTickWidth,ticks,labels,gridLines,bigTick,BigTickP,
    currentTick,tick,label,gridLine,numTicks,labelString,horizontal,firstLabelPos,lastLabelPos,
    textHt,ip;
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
  var maxTextWidth = 0;
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
  TextP = this.TextP;
  gridLineP = this.gridLineP;
  halfTickWidth = 0.5*TickP['stroke-width'];
  if (this.showTicks) {
     this.Line.show();
  } else {
    this.Line.hide();
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
  gridLines = pj.resetComputedArray(this,'gridLines');
  currentTick = firstTick;//  in data space
  textHt = TextP['font-size'];
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
  this.maxTextWidth = maxTextWidth;
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
    this.theLabels.moveto(firstLabelPos,this.textOffset);//+this.maxLabelWidth);
    gridLineP.y1 = -this.gridLineLength;
  } else {
    gridLineP.x2 = this.gridLineLength;
    this.theLabels.moveto(this.textOffset-this.maxLabelWidth,firstLabelPos);
   console.log("FIRST LABEL",firstLabelPos,"maXXLabelWidth",this.maxLabelWidth,'textOffset',this.textOffset);
  }
}

item.theLabels.labelP.startDrag = function (refPoint) {
    var itm = this.__parent.__parent.__parent.__parent;
    var horizontal = itm.orientation == 'horizontal';
    console.log('horizontal = ',horizontal);
    if (horizontal) {
      itm.dragStartY = refPoint.y;
    } else {
      itm.dragStartX = refPoint.x
    }
    itm.dragStartTextoffset = itm.textOffset;
}


item.theLabels.labelP.dragStep = function (pos) {
  debugger;
  var itm = this.__parent.__parent.__parent.__parent;
  var horizontal = itm.orientation == 'horizontal';
  if (horizontal) {
    var ydiff = pos.y - itm.dragStartY;
    itm.textOffset =  itm.dragStartTextoffset + ydiff;
    itm.theLabels.moveto(itm.firstLabelPos,itm.textOffset);
  } else {
    var xdiff = pos.x - itm.dragStartX;
    itm.textOffset =  itm.dragStartTextoffset + xdiff;
    itm.theLabels.moveto(itm.textOffset-itm.maxLabelWidth,itm.firstLabelPos);
  }
  itm.theLabels.draw();
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
ui.freeze(item,'orientation');
ui.watch(item,['textOffset','tickImageInterval','gridLineLength']);
ui.hide(item,['dataBounds','dragStartTextoffset',
  'dragStartY','gridLineLength','scale','maxTextWidth']);
ui.watch(item.TextP,['font-size']);
ui.hide(item.TextP,['text-anchor','text','x','y']);
ui.hide(item.gridLineP,['x1','y1','x2','y2']);
ui.watch(item,'showTicks');
item.__setFieldType('showTicks','boolean')
ui.watch(item.TickP,['length']);
ui.hideInInstance(item.TickP,['length','stroke','stroke-width']);
ui.hide(item.TickP,['x1','x2','y1','y2']);
ui.hideInInstance(item.TextP,['fill','font-size']);
ui.watch(item.BigTickP,['length']);
ui.hide(item.BigTickP,['x1','x2','y1','y2']);
ui.freeze(item,'adjustScaling');
pj.returnValue(undefined,item);
});

 