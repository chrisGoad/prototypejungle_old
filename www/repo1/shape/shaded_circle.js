
'use strict';
pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

var  gradient = svg.Element.mk('<radialGradient/>');
var stop1,stop2,stop3;
//item.set('gradient',linearGradient);
gradient.id = "G0";
gradient.set('stop0',svg.Element.mk('<stop offset="0%" stop-color="blue" stop-opacity="0" />'));
gradient.set('stop1',svg.Element.mk('<stop offset="80%" stop-opacity="0" />'));
gradient.set('stop2',svg.Element.mk(' <stop offset="100%"  stop-color="blue"  stop-opacity="0.5" />'));

var defs = svg.Element.mk('<defs/>');
item.set('defs',defs);
item.defs.set('gradient',gradient);//

item.fill = "black";
item.set("__contents",svg.Element.mk(
   '<circle fill="rgb(39, 49, 151)" stroke="black" stroke-width="2" \ r="100" />'));

   
item.__contents.__unselectable = true;
item.dimension = 100;
item.shadeStart = 70;
item.shadeOpacity = 0.5;

/*
item.shinyness = 200;
var shine = function (color,shinyness) {
  var rgb = svg.parseColor(color);
  var bump = function (c) {
    return Math.min(255,c+shinyness);
  }
  return 'rgb('+bump(rgb.r)+','+bump(rgb.g)+','+bump(rgb.b)+')';
}
*/
/*stop1['stop-color'] = item.fill;
stop2['stop-color'] = shine(item.fill,item.shinyness);

stop3['stop-color'] = item.fill;
item.stroke = 'green';
item.extentEvent = pj.Event.mk('extentChange');
*/
item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.fill = color;
  this.update();
}

var count = 0;
item.update = function () {
   var circle = this.__contents; 
  if (1 || this.hasOwnProperty('fill')) {
    var gradient = this.defs.gradient;
    var id = 'g'+(count++);
    gradient.id = id;
   // gradient.stop1['stop-color'] =this.fill;
  //  gradient.stop2['stop-color'] = shine(this.fill,this.shinyness);
    gradient.stop1.offset = this.shadeStart + "%"
    gradient.stop2['stop-color'] = this.fill;
    gradient.stop2['stop-opacity'] = String(this.shadeOpacity);
   circle.fill = 'url(#'+id+')'
  }
  if (1 || this.hasOwnProperty('dimension')) {
    circle.r = 0.5 * this.dimension;
  }
}

item.__adjustable = true;
item.__draggable = true;
// support for the resizer 


item.__getExtent = function () {
  var dim = this.dimension;
  return geom.Point.mk(dim,dim);
}

item.__setExtent = function (extent,nm) {
  var event,ext;
  console.log('nm',nm);
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
  this.update();
  //this.extentEvent.node = this;
  //event = pj.Event.mk('extentChange',this);
 // this.extentEvent.emit();
}
 
 

item.__updateControlPoint = function (idx,pos) {
 
}

ui.hide(item,['__contents']);

return item;
});
