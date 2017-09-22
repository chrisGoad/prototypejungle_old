// Component for a set  of bars - the core of bar graph, which includes axes and labels as well

'use strict';
/*

pj.Signature.mk({
  barSep:{type:'N',comment:'separation between bars'}
})

*/
pj.require('../component/labels.js','../../lib/color_utils.js','../../shape/rectangle.js',
           function (erm,labelsP,color_utils,intervalPP) {
var ui=pj.ui;
var geom=pj.geom;
var svg=pj.svg;

var item = pj.svg.Element.mk('<g/>');
var labelC = item.set('labelC',labelsP.instantiate());
labelC.labelP.__draggable = true;
item.width = 1000;
item.height = 500;

item.set("rect",svg.Element.mk(
   '<rect x="0" y="0" fill="transparent" width="1000" height="500" stroke="black" '+
   ' stroke-width="2" />'));
item.orientation = 'horizontal'; // bars run horizontally, and are stacked vertically

/* The basic layout params are barSep, barDim, groupSep.
 * barSep and groupSep are both percentages of barDim. igroupSep is the
 * incrementaal group sep: groupSep-barSep. If V is the vertical.
 * Let L be the number of elements, and G the number of groups.
 * then the total vertical is 
 * V = barDim *(L + (L-1)*barSep*0.01 + (G-1)*igroupSep*0.01)
 
*/
//item.requiresData = 1;
//item.markType = 'N';

//item.barSep = 40; 
//item.groupSep = 55;  // separation between a bar group (for one domain value)
//item.barDim = 50; // height for horizontal, width for vertical
item.labelC.__show();
item.set('intervalP',intervalPP.instantiate());
item.intervalP.fill = 'blue';
item.intervalP.__update();
item.intervalP.__hide();

item.intervalP.__adjustable = false;
item.intervalP.__draggable = false;
item.set('intervals',pj.Spread.mk(item.intervalP));


item.intervals.replacements = function () {
   return
    [{title:'Smudged bar',svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fhorizontal_smudged_bar.svg?alt=media&token=6fe1ab71-903c-420a-a7c4-b371b8972f6e",url:'/repo1/smudge/bowedlines.js'},
     {title:'Rounded bar',svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fhorizontal_rounded_bar.svg?alt=media&token=822caf9c-6d53-4984-8d27-6eee79a1cedc",
     url:'/repo1/shape/rounded_rectangle.js',
     settings:{roundOneEnd:true}},
     {title:'Simple bar',svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fhorizontal_simple_bar.svg?alt=media&token=9164a463-7c93-4acf-bad0-8e7730ceeeb4",
     url:'/repo1/shape/rectangle.js'}
     ];
}


/* the scaling function should be set from the outside, usually from the axis
 * a default is is included
 */

item.scaling = function (x) {
  var extent = this.width;
  return ( (x - this.minTime)/(this.maxTime - this.minTime)  ) * extent;
}

item.intervals.bind = function () {
  var timeline = this.__parent;
  var intervals = this.__data;
  var n = intervals.length;
  var y = 0;
  for (var i=0;i<n;i++) {
    var interval = intervals[i];
    var mark =  this.selectMark(i);
    var left = timeline.rangeScaling(interval.lb);
    var right = timeline.rangeScaling(interval.ub);
    var center = (right + left)/2;
    mark.width = right - left;
    
   // mark.width = timeline.scaling * (interval.ub - interval.lb);
   // var x = timeline.scaling * (0.5*(interval.ub + interval.lb) - timeline.minTime);
    mark.update();
    mark.__moveto(center,y);
    y = y-200;
    mark.__show();
  }

}


var dataExtreme = function (data,which) {
  var intervals = data.intervals;
  var rs = (which==='max')?-Infinity:Infinity;
  intervals.forEach(function (interval) {
    if (which==='max') {
      rs = Math.max(rs,interval.ub);
    } else {
      rs = Math.min(rs,interval.lb);
    }
  });
  return rs;
}

// called from axis utils
item.findDataBounds = function () {
  if (typeof this.minTime === 'number') {
    return;

  }
  var data = this.__getData();
  //this.labelC.orientation = this.orientation;
  this.intervalP.__editPanelName = 'Prototype for all intervals';
//  color_utils.initColors(this);
  var L = data.intervals.length;
  this.dataMax = dataExtreme(data,'max');
  this.dataMin= dataExtreme(data,'min');
  this.minTime = this.dataMin;
  this.maxTime = this.dataMax;
}

item.dataBounds = function () {
  this.findDataBounds();
  return geom.Interval.mk(this.minTime,this.maxTime);
}

  

item.update = function () {
  debugger;
  var svg = pj.svg,
    thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max,data;
  
  if (!this.__data) return;
  var data = this.__getData();
 
  //this.scaling =  this.width/ (this.maxTime - this.minTime);
  this.intervals.__setData(data.intervals);
 
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
ui.hide(item.intervalP,['height','width','orientation']);
//ui.setNote(item,'barSep','The separation between bars, as a percentage of bar height');
//ui.setNote(item,'groupSep','The separation between bars (or groups of bars if there are several categories) as a percentage of bar width');
//ui.freeze(item,['requiresData'])

pj.returnValue(undefined,item);
});
//})()

