//pj.require([['labelsP','chart/component/labels1.js'],['color_utils','lib/color_utils.js']],function (erm,item) {
pj.require('../../shape/circle.js','../component/labels.js','../../lib/color_utils.js', function (erm,circlePP,labelsP,color_utils) {

var ui=pj.ui,geom=pj.geom,svg=pj.svg;
var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
item.width = 1000;
item.height = 500;
item.padding = 5; // percent to leave on either side in width
                   // only used for non-numerical domains
var labelC = item.set('labelC',labelsP.instantiate());
item.labelC.__show();
item.labelSep = 20;
item.set("circleP",circlePP.instantiate());
/*svg.Element.mk(
  '<circle fill="rgb(39, 49, 151)" stroke="black" stroke-width="1" \
       r="20" visibility="hidden"/>'));*/
item.circleP.__adjustable = true;
item.circleP.__draggable = false;
item.circleP.dimension = 20;
item.circleP.update();
item.circleP.__hide();
item.set('marks',pj.Spread.mk(item.circleP));



item.marks.replacements = function () {
    var rs =
    [
    
    {title:'Square',
     svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fscatter_square.svg?alt=media&token=5c6f9783-8c96-48d5-8b79-a88fc2c78883",
     url:'/repo1/shape/square.js'},
    {title:'Plus Sign',
      svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fscatter_plus_sign.svg?alt=media&token=f9ed2439-00e4-4091-b755-2e4312a807c1",
      url:'/repo1/shape/plus_sign.js'},
    {title:'Circle',
      svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fscatter_circle.svg?alt=media&token=2c5aef19-0685-4273-96e2-842ef5aa9209",
      url:'/repo1/shape/circle.js'}
    ];
  return rs;
}
/* When colors on the legend are changed, this is 
 * propagated to the bar prototypes.
 * This is implemented with change-listening machinery
 * item.colors is holds these colors at the top level, by category.
 */

 
 
 item.colorOfCategory = function (category) {
  return this.marks.colorOfCategory(category);
 }
 
item.setColorOfCategory = function (category,color) {
  this.marks.setColorOfCategory(category,color);
 }
 

/* the scaling functions should be set from the outside, usually from the axis
 * a default is is included
 */

item.rangeScaling = function (x) {
  var extent = this.height;
  return ( x/this.rangeMax) * extent;
}

item.domainScaling = function (x) {
  var extent = this.width;
  return ((x-this.domainMin)/(this.domainMax-this.domainMin))*extent;
}

item.marks.binder = function (circle,data,indexInSeries,lengthOfDataSeries) {
  var item = this.__parent,
    categoryCount,group,x,y;
  var numD = item.numericalDomain;
  circle.data = datum;
  categoryCount = item.categoryCount;
  group = Math.floor(indexInSeries/categoryCount);// which group of data, grouping by domain
  var categoryIndex = indexInSeries%categoryCount;// place the bar vertically
  var datum = item.rangeScaling(data.range);
  if (numD ) {
    var x = item.domainScaling(data.domain);
  } else {
    x = item.minX + group * item.aGroupSep;
  }
  y =  item.height - datum;
  circle.__moveto(x,y);
  circle.__show();
}


item.listenForUIchange = function (ev) {
  if (ev.id === "UIchange") {
    this.update();
    this.__draw();
    pj.tree.refresh();
  }
}

item.addListener("UIchange","listenForUIchange");

item.update = function () {
  var svg = pj.svg,
    thisHere = this,
    //horizontal = this.orientation === 'horizontal',
    categories,cnt,max;
  if (!this.data) return;
  this.numericalDomain = this.data.numericalDomain();

   this.rangeMax = this.data.max('range');
    this.domainMax = this.data.max('domain');
    this.domainMin = this.data.min('domain');
  var domainValues = this.data.extractDomainValues();
  //color_utils.initColors(this);
  if (this.data.categories) {
    this.categoryCount = this.data.categories.length;
  }
  var numD = this.numericalDomain;
  if (!numD) {
    var effectiveWidth = this.width * (1 - (1/50)*this.padding);
    this.minX = this.width * this.padding/100;//this.labelC.show();
    this.labelC.orientation = 'horizontal';
    this.labelC.width = effectiveWidth;//this.width;
    this.labelC.__moveto(this.minX,this.height+this.labelSep);
    var L = this.data.elements.length;
    var G = L/(this.categoryCount);
    this.aGroupSep = effectiveWidth/(G-1);
    this.labelC.setData(domainValues);
    
  }
  this.marks.scale = 1;
  this.marks.setData(this.data,true);
  color_utils.initColors(this);
}

// document the meaning of fields
item.reset = function () {
  if (this.marks) {
    this.marks.reset();
  }
  if (this.labels) {
    this.labels.reset();
  }
}
ui.hide(item,['colors','domainMax','domainMin',
  'height','labelSep','markType','minX','numericalDomain',
    'rangeMax','refd','width']);
 ui.watch(item,['padding']);

ui.hide(item.marks,['scale']);
pj.returnValue(undefined,item);

});
