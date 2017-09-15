
pj.require('/shape/circlePeripheryOps.js',function (peripheryOps) {

var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.__dimension = 100;
item.shadeStart = 60;
item.shadeOpacity = 0.5;
item.outerFill = 'black';
item.innerFill = 'red';
/* end adjustable parameters */

item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;
//item.__svgClickable = true;

var  gradient = svg.Element.mk('<radialGradient/>');
var stop1,stop2,stop3;

gradient.set('stop0',svg.Element.mk('<stop offset="0%" stop-opacity="0" />'));
gradient.set('stop1',svg.Element.mk('<stop offset="80%" stop-opacity="0" />'));
gradient.set('stop2',svg.Element.mk(' <stop offset="100%"   stop-opacity="0.5" />'));

var defs = svg.Element.mk('<defs/>');
item.set('defs',defs);
item.defs.set('gradient',gradient);//

item.set("__contents",svg.Element.mk('<circle/>'));
item.__contents.__unselectable = true;

var count = 0;
item.update = function () {
  debugger;
  var circle = this.__contents;
  var gradient = this.defs.gradient;
  var id = 'g'+(count++);
  gradient.id = id;
  gradient.stop1['stop-color'] =this.innerFill;
  gradient.stop1.offset = this.shadeStart + "%"
  gradient.stop2['stop-color'] = this.outerFill;
  gradient.stop2['stop-opacity'] = String(this.shadeOpacity);
  circle.fill = 'url(#'+id+')'
  circle.r = 0.5 * this.__dimension;
}

// support for the resizer 


item.__getExtent = function () {
  var dim = this.__dimension;
  return geom.Point.mk(dim,dim);
}

item.__setExtent = function (extent,nm) {
  var ext;
  console.log('nm',nm);
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.__dimension = ext;
  this.update();
}
 
 peripheryOps.installOps(item);

 
item.__setFieldType('outerFill','svg.Rgb');
item.__setFieldType('innerFill','svg.Rgb');

ui.hide(item,['__contents','defs']);

return item;
});
