
//(function () {
pj.require([['color_utils','lib/color_utils.js']],function (erm,item) {
  var ui=pj.ui,geom=pj.geom,svg=pj.svg;
item.dataSource = 'http://prototypejungle.org/sys/repo1/data/trade_balanceN.js';
item.width = 1000;
item.height = 500;
item.numericalDomain = 1;
item.markType = 'pointArray';// array of points with category
item.orientation = 'vertical'; // bars run horizontally, and are stacked vertically
ui.hide(item,['aGroupSep','dataMax','height','width']);
item.set("lineP",svg.Element.mk(
  '<polyline fill="none" points="0,0,40,50" stroke="blue" stroke-width="4"' +
    ' visibility="hidden"/>'));

/* When colors on the legend are changed, this is 
 * propagated to the bar prototypes.
 * This is implemented with change-listening machinery
 * item.colors is holds these colors at the top level, by category.
 */

item.setColorOfCategory = function (category,color) {
  var line = this.lineByCategory[category];
  if (line) {
    line.stroke = color;
  }
 }
 
// the scaling function should be set from the outside, usually from the axis
// a default is is included

item.rangeScaling = function (x) {
  var extent = this.height;
  return (1 - x/this.rangeMax) * extent;
}



item.domainScaling = function (x) {
  var extent = this.width;
  return ((x-this.domainMin)/(this.domainMax-this.domainMin))*extent;
}

item.planeMap = function (p) {
  debugger;
  var x = this.domainScaling(p.x);
  var y = this.rangeScaling(p.y);
  return pj.geom.Point.mk(x,y);
  
}

item.listenForUIchange = function (ev) {
  if (ev.id === "UIchange") {
    this.update();
    this.draw();
    pj.tree.refresh();
  }
}

item.addListener("UIchange","listenForUIchange");

item.update = function () {
  var svg = pj.svg;
  var thisHere = this;
  var lineP = this.lineP;
  var horizontal = this.orientation === 'horizontal';
  var categories,elements,cnt,max;
  if (!this.data) return;
  this.rangeMax = this.data.max('range');
  this.domainMin = this.data.min('domain');
  this.domainMax = this.data.max('domain');
  var domainValues = this.data.extractDomainValues();
  this.color_utils.initColors(this);
  categories = this.data.categories;
  elements  = this.data.elements;
  this.reset();
  elements.forEach(function (el) {
    var c = el.category;
    var pnts = el.points;
    var line = lineP.instantiate().show();
    var svgPoints = svg.toSvgPoints(el.points,
      function (p) {return thisHere.planeMap(p)});
    line.points = svgPoints;
    debugger;
    thisHere.lines.push(line);
    thisHere.lineByCategory[c] = line;
  });
      
  this.color_utils.setColors(this);
}

// document the meaning of fields
item.reset = function () {
  pj.resetComputedArray(this,"lines");
  pj.resetComputedObject(this,"lineByCategory");
}



/**
 * Set accessibility and notes for the UI
*/

ui.watch(item,['barSep','groupSep']);

ui.hide(item,['color_utils','colors','domainMax','domainMin',
  'lineByCategory','markType','numericalDomain','orientation',
  'rangeMax']);

pj.returnValue(undefined,item);
});
//})()

