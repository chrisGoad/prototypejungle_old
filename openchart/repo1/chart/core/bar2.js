// Component for a set  of bars - the core of bar graph, which includes axes and labels as well

'use strict';

pj.require('chart/component/labels1.js','lib/color_utils.js','doodle/bowedlines1.js',function (erm,labelsP,color_utils,bowedLines) {
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

item.set('barP',bowedLines.instantiate());;
//item.set('barP',svg.Element.mk(
//  '<rect  fill="rgb(39, 49, 151)" stroke="black" stroke-width="3" \
//        x="0" y="0" height="50" visibility="hidden"/>'));
//ui.hide(item.barP,['x','y','width','height','visibility']);
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
  bar.update();
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

pj.returnValue(undefined,item);
});
//})()

