'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item =  svg.Element.mk('<circle/>');

/* adjustable parameters */
item.dimension = 50;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width']  = 2;
/* end adjustable parameters */

item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;
item.__aspectRatio = 1;

item.__domMap =
  {transfers:svg.commonTransfers,//['fill','stroke','stroke-width'],
   mapping:
     function (itm,element) {
       element.setAttribute('r',0.5*itm.dimension);
    }
}

item.update = function () {}


item.__getExtent = function () {
  var dim = this.dimension;
  return geom.Point.mk(dim,dim);
}

item.__ownsExtent = function () {
  return this.hasOwnProperty('dimension')
}

item.__setExtent = function (extent,nm) {
  var event,ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
}
 
ui.hide(item,['__aspectRatio']);

return item;
});

