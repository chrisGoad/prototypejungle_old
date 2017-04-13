// Square

'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');
var item = svg.Element.mk('<rect/>');

/*adjustable parameters */
item.dimension = 50;
item.fill = "transparent";
item.stroke = "black";
item['stroke-width'] = 2;
/* end adjustable */

item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;
ui.setupAsVertex(item);
item.__transferredProperties = ['fill','stroke'];

item.__setDomAttributes =   function (element) {
  var dim = this.dimension;
  var mhdim = -0.5*dim;
   element.setAttribute('width',dim);
   element.setAttribute('height',dim);
   element.setAttribute('x',mhdim);
   element.setAttribute('y',mhdim);
}
/*
//item.__domMap =
  {transfers:svg.commonTransfers,
   mapping:
     function (itm,element) {
      var dim = itm.dimension;
      var mhdim = -0.5*dim;
       element.setAttribute('width',dim);
       element.setAttribute('height',dim);
       element.setAttribute('x',mhdim);
       element.setAttribute('y',mhdim);
    }
}
*/
item.update = function () {}

// support for the resizer 
item.__getExtent = function () {
  var dim = this.dimension;
  return geom.Point.mk(dim,dim);
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
  this.dimension = ext;
  this.update();
}
 
 
item.periphery = function (direction) {
  var center = this.__getTranslation();
  return center.plus(direction.times(0.5 * this.dimension));
}


item.cardinalPoint = function (which) {
  var r = 0.5 * this.dimension;
  var center = this.__getTranslation();
  var vec;
  switch (which) {
    case 'East':
      vec = geom.Point.mk(-r,0);
      break;
   case 'North':
      vec = geom.Point.mk(0,-r);
      break;
   case 'West':
      vec = geom.Point.mk(r,0);
      break;
   case 'South':
      vec = geom.Point.mk(0,r);
  }
  return center.plus(vec);
}
ui.hide(item,['width','height','x','y']);
return item;
});

