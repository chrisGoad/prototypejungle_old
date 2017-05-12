// Square

'use strict';

pj.require('/shape/rectangle.js',function (rectangleP) {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = rectangleP.instantiate(); 

/*adjustable parameters */
item.__dimension = 30;

item.fill = "transparent";
item.stroke = "black";
item['stroke-width'] = 2;
/* end adjustable */

item.__defaultSize = geom.Point.mk(30,30);

item.width = item.height = item.__dimension;

/*
// support for the resizer 
item.__getExtent = function () {
  var dim = this.__dimension;
  return geom.Point.mk(dim,dim);
}
*/

item.update = function () {
  var dim = pj.getval(this,'__dimension');
  if (dim !== undefined) {
    this.width = dim;
    this.height = dim;
  }
  var proto = Object.getPrototypeOf(this);
  proto.update();
}

item.__setExtent = function (extent,nm) {
  var ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if (nm === 'c12')  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.__dimension = ext;
  this.width = ext;
  this.height = ext;
  this.update();
}
 

ui.hide(item,['width','height','x','y']);
return item;
});

