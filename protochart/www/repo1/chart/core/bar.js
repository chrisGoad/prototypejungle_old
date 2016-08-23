// Component for a set  of bars - the core of bar graph, which includes axes and labels as well

'use strict';
/*

pj.Signature.mk({
  barSep:{type:'N',comment:'separation between bars'}
})

*/
pj.require('../component/labels.js','../../lib/color_utils.js','../../shape/rectangle.js',
           function (erm,labelsP,color_utils,barPP) {
var ui=pj.ui;
var geom=pj.geom;
var svg=pj.svg;

var item = pj.svg.Element.mk('<g/>');
var labelC = item.set('labelC',labelsP.instantiate());
labelC.labelP.__draggable = true;
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
//item.requiresData = 1;
item.markType = '[N|S],N';

item.barSep = 40; 
item.groupSep = 55;  // separation between a bar group (for one domain value)
item.barDim = 50; // height for horizontal, width for vertical
item.labelC.__show();
item.set('barP',barPP.instantiate());
item.barP.fill = 'blue';
item.barP.__update();
item.barP.__hide();

item.barP.__adjustable = false;
item.barP.__draggable = false;
item.set('bars',pj.Spread.mk(item.barP));
item.bars.randomizeColors = true;
item.bars.multiPrototype = true;
ui.hide(item.bars,['scale','byCategory']);
console.log("ZZZ");

item.bars.replacements = function () {
  if (this.__parent.orientation === 'horizontal') {
    var rs =
    [{title:'Smudged bar',svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fhorizontal_smudged_bar.svg?alt=media&token=6fe1ab71-903c-420a-a7c4-b371b8972f6e",url:'/repo1/smudge/bowedlines.js'},
     {title:'Rounded bar',svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fhorizontal_rounded_bar.svg?alt=media&token=822caf9c-6d53-4984-8d27-6eee79a1cedc",
     url:'/repo1/shape/rounded_rectangle.js',
     settings:{roundOneEnd:true}},
     {title:'Simple bar',svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fhorizontal_simple_bar.svg?alt=media&token=9164a463-7c93-4acf-bad0-8e7730ceeeb4",
     url:'/repo1/shape/rectangle.js'}
     ];
  } else {
    console.log("ROUNDTOP");
    rs =
    [{title:'Smudged bar',svg:"http://prototypejungle.org/repo1/svg/smudgedBar.svg",url:'/repo1/smudge/bowedlines.js',
     settings:{drawVertically:true}},
     {title:'Rounded bar',svg:'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fvertical_rounded_bar.svg?alt=media&token=dbd570f5-eaab-44ee-bd43-f1ea7647481e',
     url:'/repo1/shape/rounded_rectangle.js',
      settings:{roundTop:true}},
    {title:'Shiny bar',
    svg:'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fvertical_shiny_bar.svg?alt=media&token=d18903ad-6564-4eb1-915a-82359be39fab',
     url:'/repo1/shape/shaded_rectangle.js'},
     {title:'Simple bar',
     svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fvertical_simple_bar.svg?alt=media&token=dadfc707-00a3-422b-81a0-3215b883a2ab",
    url:'/repo1/shape/rectangle.js'}
    ];
  }
  return rs;
}
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
  var datum = item.rangeScaling(data.range);// this is the top of the bar, if vertical
  var barDim = item.barDim;
  var hbarDim = 0.5*barDim;
  bar.data = datum;
  bar.__editPanelName = 'This bar';
  if (horizontal) {
    bar.width = datum;
    bar.height = barDim;
  } else {
    bar.width = barDim;
    bar.height = item.height - datum;
  }
  categoryCount = item.categoryCount;
  group = Math.floor(indexInSeries/categoryCount);// which group of data, grouping by domain
  console.log('group',group,'idx',indexInSeries,'catCount',categoryCount);
  var categoryIndex = indexInSeries%categoryCount;// place the bar vertically
  if (horizontal) {
    x = 0.5*datum;
    y = indexInSeries * (item.aBarSep + barDim) + hbarDim;
    y = y + group * item.aGroupSep;
  } else {
    x =  (indexInSeries+0.5) * (item.aBarSep + barDim);
    x = x + group * item.aGroupSep;
    y =  datum;//item.height - datum;
    y =  item.height - 0.5*bar.height;
  }
  if (bar.update) {
    bar.update();
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
        var lga = pj.ancestorWithProperty(pr,'legend')
        if (lga) {
          lga.legend.setColorOfCategory(nd.name(),nd.fill,true);
        }
      }
     // return;
    }
    this.update();
    this.__draw();
    pj.tree.refresh();
  }
}

item.addListener("UIchange","listenForUIchange");

item.update = function () {
  debugger;
  var svg = pj.svg,
    thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max,data;
  
  if (!this.data) return;
  if (!this.bars.masterPrototype) { 
    this.bars.masterPrototype = this.barP;
  }
  data = this.getData();
  this.labelC.orientation = horizontal?'vertical':'horizontal';
  //this.labelC.orientation = this.orientation;
  this.barP.__editPanelName = 'Prototype for all bars';
  this.barP.orientation = this.orientation; // used in computing replacements
  color_utils.initColors(this);
  if (this.categorized) {
    this.minY=Infinity;
  } else {
    pj.ui.hide(this,['barSep']);
    this.barP.__setUIStatus('fill',undefined);
  }
  var L = data.elements.length;
  var G = L/(this.categoryCount);
 // var igroupSep = this.groupSep - this.barSep;
  var igroupSep = (this.categorized)?this.groupSep:0;
  var barDimAsFraction = (L + (L-1)*(this.barSep)*0.01)+((this.categorized)?(G-1)*igroupSep*0.01:0);
  this.barDim = horizontal?this.height/barDimAsFraction:this.width/barDimAsFraction;
  if (this.categorized) {
    this.aBarSep = 0.01 * this.barSep * this.barDim, // absolute barSep
    this.aGroupSep = (this.categorized)?0.01 * igroupSep * this.barDim:this.aBarSep; // absolute additional groupSep
  } else {
    this.aBarSep = 0;
    this.aGroupSep =  0.01 * this.barSep * this.barDim;
  }
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
  this.labelC.setData(domainValues,true);
  pj.declareComputed(this.labelC.data); // so it won't be saved
  if (horizontal) {
    this.labelC.__moveto(-20- this.labelC.maxLabelWidth,group0center);
  } 
  this.bars.scale = 1;
  this.bars.setData(data,true);
  if (data.categories) {  // so the legend colors can be updated
    // repeated since categorizedPrototypes might not have been around the first time
      color_utils.initColors(this);
      var categorizedPrototypes = this.bars.categorizedPrototypes;
      data.categories.forEach(function (category) {
        categorizedPrototypes[category].__editPanelName = 'Bars for '+category;
      });
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
ui.hide(item.barP,['height','width','orientation']);
ui.setNote(item,'barSep','The separation between bars, as a percentage of bar height');
ui.setNote(item,'groupSep','The separation between bars (or groups of bars if there are several categories) as a percentage of bar width');
//ui.freeze(item,['requiresData'])

pj.returnValue(undefined,item);
});
//})()

