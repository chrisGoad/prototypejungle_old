/**
 * General purpose axis component. 
*/
/*
 * Inputs:
 *   scale:LinearScale
 *   showTicks:boolean
 *   showLine:boolean
 *   showGridLines:boolean
 *   gridLineLength:number (0 means no gridlines)
*   at10s:boolean  ; if at10s, then the tick pattern is big ticks at multiples of 10,
 *                    smaller at 5s, and smallest at 1s. Otherwise the big ticks are at 5s
 *   bigTickImageInterval:number
 *
 *   Outputs:
 *     The coverage of the scale is modified, if necessary, to cause the lower bound to lie at a tick, and
 *     the upper at a big tick.
 */

'use strict';
pj.require('./labels.js',function (erm,labelsP) {
var item = pj.svg.Element.mk('<g/>');
item.set('__signature',pj.Signature.mk({
  showLine:'boolean',
  showTicks:'boolean',
  showGridLines:'boolean',
  at01s:'boolean', /* if at10s, then the tick pattern is big ticks at multiples of 10,
                     smaller at 5s, and smallest at 1s. Otherwise the big ticks are at 5s */
  scale:{type:pj.dat.LinearScale,required:true}
  
}));


var ui = pj.ui;
var geom = pj.geom;
var svg = pj.svg;
item.gridLineLength = 0; // 0 for no grid lines
item.tickImageInterval = 10;
item.dragStartTextoffset = 0; // initialize so that ui.freezeExcept will work
item.dragStartY = 0;
item.orientation = 'horizontal';
/**
 * dataBounds should be reset from the outside
*/
item.set("theLabels",labelsP.instantiate());
item.theLabels.__unselectable = true;
item.theLabels.set("data",Object.create(pj.dat.Series));
item.theLabels.data.set("elements",pj.Array.mk());

item.set('dataBounds',pj.geom.mkInterval(100,300));

item.bigTickImageInterval = 10;

item.set('TickP',svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-width="2"/>'));
item.TickP.length = 10;
item.set('MediumTickP',svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-width="3"/>'));
item.MediumTickP.length = 15;
item.set('BigTickP',
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-width="3"/>'));
item.BigTickP.length = 20;
item.showTicks = false;
item.showLine = false;
item.showGridLines = true;
item.set('Line',
  svg.Element.mk('<line x1="0" y1="0" x2="0" y2="0" stroke="black" stroke-width="2"/>'));
item.set('gridLineP',
  svg.Element.mk('<line x1="0" y1="0" x2="0" y2="0" stroke="black" stroke-width="1"/>'));

item.maxLabelWidth = undefined; // defined later; mentioned here so it can be frozen by ui.freeze
item.firstLabelPos = undefined; // defined later; mentioned here so it can be frozen by ui.freeze


item.update = function () {
  var ui = pj.ui;
  var geom = pj.geom;
  var dat = pj.dat;
  

  var svg = pj.svg;
  var thisHere = this;

   
/* Preliminaries:
 * Computes where ticks should be. It generates three arrays. this.tickPositons, this.mediumTickPositions, and  this.bigTickPositions.
 * These are positions in data  space.
 */

 

  var computeTickPositions = function (firstTick,lastTick,interval,at10s) {
    var tickPositions = [];
    var mediumTickPositions = [];
    var bigTickPositions = [];
    var currentTick = firstTick;//  in data space
    var ip,numTicks,mediumTick,bigTick;
    while (currentTick <= lastTick) {
      numTicks = Math.floor(currentTick/interval);
      bigTick = numTicks%(at10s?10:5) === 0;
      mediumTick = at10s?numTicks%5 === 0:false;
      if (bigTick) {
        bigTickPositions.push(currentTick);
      } else if (mediumTick) {
        mediumTickPositions.push(currentTick);
      } else {
         tickPositions.push(currentTick);
      }
      currentTick += interval;
    }
    return [tickPositions,mediumTickPositions,bigTickPositions];
  }
  
  
  
  var placeTick = function (tick,position,horizontal) {
    tick.__mark = true;//treat like a mark in the ui
    tick.__show();
    var  ip = thisHere.scale.eval(position);  /* tick in image space, rather than data space */
    if (horizontal) {
      tick.set('x1',ip);
      tick.set('y1',0);
      tick.set('x2',ip);
      tick.set('y2',tick.length);
   } else {
      tick.set('x1',-tick.length);
      tick.set('y1',ip);
      tick.set('x2',0);
      tick.set('y2',ip);
    }
  }
  

  var
    datalb,dataub,extentub,isDate,dataBounds,scale,extentub,dataToImageScale,interval,firstTick,lastTick,
    TickP,gridLineP,halfTickWidth,ticks,labels,gridLines,bigTick,MediumTickP,BigTickP,tickPositionArray,tickPositions,
    mediumTickPositions,bigTickPositions,labelElements,axisExtent,bigInterval,//bigTicks,
    currentTick,tick,label,gridLine,numTicks,labelString,horizontal,firstLabelPos,lastLabelPos,ip;

 /**
  * The user expresses a desired distance between ticks. n is what
  * the data interval which would correspond to this. This needs to be
  * rounded up to a power of 10
*/
  scale = this.scale;
  scale.coverage.lb = this.dataBounds.lb;
  scale.coverage.ub = this.dataBounds.ub;
  if ( !scale) return; // data not ready
  var tickInterval = this.bigTickImageInterval/(this.at10s?10:5);
  var roundUpToGoodTickInterval = function (n) {
    var lg10 = Math.floor(Math.log(n)/Math.log(10)),
      b10 = Math.pow(10,lg10);
    if (n <= b10) {
      return b10;
    }
    return b10*10;
  }
  datalb = scale.coverage.lb; 
  dataub = scale.coverage.ub;
  /* scale.extent.lb is assumed to be 0 */
  extentub = scale.extent.ub;
  dataToImageScale = scale.dtToImScale();
  /**
   * interval is the interval between ticks in data space
   * bigInteval is the interval between big ticks in data space
  */
  interval= roundUpToGoodTickInterval(tickInterval/dataToImageScale);
  bigInterval = (this.at10a?10:5)*interval;
  firstTick = Math.floor(datalb/interval)*interval;
  /**
  * adjust the coverage to exactly even number of big ticks, ending at a big tick
  * record the scaling involved in the adjustment
  */
 // lastTick = (Math.ceil(dataub/this.bigTickImageInterval))*this.bigTickImageInterval; // new upperbound at even bigtick count
  lastTick = (Math.ceil(dataub/bigInterval))*bigInterval; // new upperbound at even bigtick count
  tickPositionArray= computeTickPositions(firstTick,lastTick,interval,this.at10s);
  tickPositions = tickPositionArray[0];
  mediumTickPositions = tickPositionArray[1];
  bigTickPositions = tickPositionArray[2]
  scale.coverage.lb = firstTick;
  scale.coverage.ub = lastTick;
  
  horizontal = this.orientation == 'horizontal';
  TickP = this.TickP;
  MediumTickP = this.MediumTickP;
  BigTickP = this.BigTickP;

  /* ADD THE TICKS */
  ticks = pj.resetComputedArray(this,'ticks');
  if (this.showTicks) {
    //bigTicks = pj.resetComputedArray(this,'bigTicks');
    tickPositions.forEach(function (p) {
      tick = TickP.instantiate();
      ticks.push(tick);
      placeTick(tick,p,horizontal);
    });
    if (this.at10s) {
      mediumTickPositions.forEach(function (p) {
        tick = MediumTickP.instantiate();
        ticks.push(tick);
        placeTick(tick,p,horizontal);
      });
    }
    bigTickPositions.forEach(function (p) {
      tick = BigTickP.instantiate();
      ticks.push(tick);
      placeTick(tick,p,horizontal);
    });
  }

  /* ADD THE LINE */
  halfTickWidth = 0.5*TickP['stroke-width'];
  scale.isY = !horizontal;
  if (this.showLine) {
    this.Line.__show();
    /* make sure the ending ticks line up exactly with the end of the line */

    if (horizontal) {
      //scale.isY = 0;
      this.Line.x1=-halfTickWidth;
      this.Line.y1=0;
      this.Line.x2=extentub+halfTickWidth;
      this.Line.y2=0;
      ui.freeze(this.Line,['x1','x2','y1','y2']);
    
    } else {
      //scale.isY = 1;
      this.Line.x1=0;
      this.Line.y1=extentub+halfTickWidth;
      this.Line.y2=-halfTickWidth;
      //TickP.x1 = - TickP.length;
    
    }
  } else {
    this.Line.__hide();
  }

  ui.freeze(scale,'isY');
  
  /* GENERATE AND ADD THE GRIDLINES */
  gridLines = pj.resetComputedArray(this,'gridLines');
  if (this.showGridLines) {
    gridLineP = this.gridLineP;
    gridLineP.__show();
    if (horizontal) {
      gridLineP.y1 = -this.gridLineLength;
      gridLineP.y2 = 0;
    } else {
      gridLineP.x1 = 0;
      gridLineP.x2 = this.gridLineLength;
    }
    bigTickPositions.forEach(function (position) {
      gridLine = gridLineP.instantiate();
      gridLines.push(gridLine);
      ip = scale.eval(position);
      if (horizontal) {
        gridLine.x1 = ip;
        gridLine.x2 = ip;
      } else {
        gridLine.y1 = ip;
        gridLine.y2 = ip;
      }
    });
  } else {
    this.gridLineP.__hide();
  }
  
  /* GENERATE AND PLACE THE LABELS */
  if (this.textOffset === undefined) {
    this.textOffset = horizontal?40:-30;
  }
  labelElements = this.theLabels.data.elements;
  labelElements.length = 0;
  this.theLabels.orientation = this.orientation;
  bigTickPositions.forEach(function (p) {
    labelElements.push(scale.label(p));
  });
  this.firstLabelPos = firstLabelPos = scale.eval(bigTickPositions[0]);
  lastLabelPos = scale.eval(bigTickPositions[bigTickPositions.length - 1]);
  axisExtent = lastLabelPos - firstLabelPos; //scale.extent.ub - scale.extent.lb;
  if (horizontal) {
    this.theLabels.width = axisExtent;
  } else {
    this.theLabels.height = axisExtent;
  }
  this.theLabels.update();
  this.maxLabelWidth = this.theLabels.maxLabelWidth;
   if (horizontal) {
    this.theLabels.__moveto(firstLabelPos,this.textOffset);//+this.maxLabelWidth);
  } else {
    this.theLabels.__moveto(this.textOffset-this.maxLabelWidth,firstLabelPos);
  }
}
item.theLabels.labelP.__draggable = true;

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
 * Set accessibility and notes for the UI
 */

ui.setNote(item,'bigTickImageInterval','Distance in image coordinates between major ticks');
ui.setNote(item,'textOffset','Distance to place labels below the axis');
ui.freezeExcept(item,['showTicks','showLine','showGridLines','bigTickImageInterval','textOffset']);
ui.hide(item,['dataBounds','dragStartTextoffset','dragStartY','firstLabelPos','maxLabelWidth','scale']);
ui.hideExcept(item.gridLineP,['stroke','stroke-width']);
item.__setFieldType('showTicks','boolean');
item.__setFieldType('showLine','boolean');
item.__setFieldType('showGridLines','boolean');

ui.hideInInstance(item.TickP,['length','stroke','stroke-width']);
ui.hide(item.TickP,['x1','x2','y1','y2']);
ui.hide(item.BigTickP,['x1','x2','y1','y2']);
ui.freeze(item,'adjustScaling');
pj.returnValue(undefined,item);
});

 