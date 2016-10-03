
//(function () {
pj.require('../../shape/polyline.js','../../lib/color_utils.js',function (erm,lineP,color_utils) {
//pj.require('../../smudge/rlines1.js','../../lib/color_utils.js',function (erm,lineP,color_utils) {
  var ui=pj.ui,geom=pj.geom,svg=pj.svg;
  var item = pj.svg.Element.mk('<g/>');
//item.dataSource = 'http://prototypejungle.org/sys/repo1/data/trade_balanceN.js';
item.width = 1000;
item.height = 500;
item.numericalDomain = true;
item.markType = 'pointArray';// array of points with category
item.orientation = 'vertical'; // bars run horizontally, and are stacked vertically
ui.hide(item,['aGroupSep','dataMax','height','width']);
item['stroke-opacity'] = 0.5;
item['stroke-width'] = 4;

item.set('__signature',pj.Signature.mk({'stroke-opacity':'N','stroke-width':'N'}));

item.set('lineP',lineP.instantiate());
ui.hide(item.lineP,['fill','width']);
item.lineP.__hide();
item.set('lines', pj.Spread.mk(item.lineP));

/*
item.lines.replacements = function () {
  var rs = [{svg:"http://prototypejungle.org/sys/repo1/svg/smudgedBar.svg",url:'/sys/repo1/smudge/rlines1.js'}];
  return rs;
}
*/
/*item.set("lineP",svg.Element.mk(
  '<polyline fill="none" points="0,0,40,50" stroke="blue" stroke-width="4"' +
    ' visibility="hidden"/>'));
*/
/* When colors on the legend are changed, this is 
 * propagated to the bar prototypes.
 * This is implemented with change-listening machinery
 * item.colors is holds these colors at the top level, by category.
 */

item.setColorOfCategory = function (category,color) {
  var line = this.lineByCategory[category];
  if (line) {
    line.setColor(color);
  }
 }
 
 
item.colorOfCategory = function (category) {
  var line = this.lineByCategory[category];
  if (line) {
    return line.stroke;
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
  var x = this.domainScaling(p.x);
  var y = this.rangeScaling(p.y);
  return pj.geom.Point.mk(x,y);
  
}



// propagate changes in colors to the bars over to the legend

item.listenForUIchange = function (ev) {
  if (ev.id === "UIchange") {
    if (ev.property === 'stroke') {
      var nd = ev.node;
      var pr = nd.__parent.__parent;
      debugger;
      if (pr.__name === 'lines') {
        var ndindex = Number(nd.__name.substr(1));
        var catName = pr.categories[ndindex];
        var lga = pj.ancestorWithProperty(pr,'legend')
        if (lga) {
          lga.legend.setColorOfCategory(catName,nd.stroke,true);
        }
      }
     // return;
    }
    this.update();
    this.__draw();
    pj.tree.refresh();
  }
}


item.__addListener("UIchange","listenForUIchange");

item.lines.bind = function () {
  debugger;
  var categories = this.__data.categories;
  var elements  = this.__data.elements;
  var n = categories?categories.length:1;
  var i;
  var top = this.__parent;
  for (i=0;i<n;i++) {
    var line = this.selectMark(i);
    var element = elements[i];
    var c = element.category;
    //pj.transferState(line,top);
    debugger;
    var points = element.points.map(function (p) {return top.planeMap(p)});
    line.set('points',pj.Array.mk(points));
    line.update();
    top.lineByCategory[c] = line;
  }
}
  
item.update = function () {
  debugger;
  var svg = pj.svg;
  var thisHere = this;
  //var lineP = this.lineP;
  var horizontal = this.orientation === 'horizontal';
  var categories,elements,cnt,max;
  //if (!(this.__data && this.__newData)) return;
  if (!this.__data) return;
  this.rangeMax = this.__data.max('range');
  this.domainMin = this.__data.min('domain');
  this.domainMax = this.__data.max('domain');
  //var domainValues = this.__data.extractDomainValues();
  this.categories = this.__data.categories;
  //elements  = this.__data.elements;
  var dt = this.__getData();
  if (this.__newData) {
    pj.resetComputedObject(this,"lineByCategory");
  }
  this.lines.__setData(this.__getData());
  //} else {
  //  this.lines.refresh();
 // }
  color_utils.initColors(this);

  //color_utils.setColors(this);
}

item.uupdate = function () {
  var svg = pj.svg;
  var thisHere = this;
  var horizontal = this.orientation === 'horizontal';
  var categories,elements,cnt,max;
  if (!this.__data) return;
  this.rangeMax = this.__data.max('range');
  this.domainMin = this.__data.min('domain');
  this.domainMax = this.__data.max('domain');
  var domainValues = this.__data.extractDomainValues();
  categories = this.__data.categories;
  elements  = this.__data.elements;
  if (this.__newData) {
    this.reset();
    elements.forEach(function (el) {
      var c = el.category;
      var pnts = el.points;
      var line = lineP.instantiate().__show();
      pj.transferState(line,thisHere);

      var points = el.points.map(function (p) {return thisHere.planeMap(p)});
      line.set('points',pj.Array.mk(points));
      thisHere.lines.push(line);
      line.update();
      thisHere.lineByCategory[c] = line;
    });
  }
  debugger;
  color_utils.initColors(this);

  //color_utils.setColors(this);
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

ui.hide(item,['colors','domainMax','domainMin',
  'lineByCategory','markType','numericalDomain','orientation',
  'rangeMax']);

pj.returnValue(undefined,item);
});
//})()

