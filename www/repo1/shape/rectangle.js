
'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<rect/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 2;
/*end adjustable parameters*/

ui.setupAsVertex(item);
item.__cloneable = true;
item.__adjustable = true;
item.__draggable = true;
item.__defaultSize = geom.Point.mk(60,30);


item.__setDomAttributes =  function (element) {
  element.setAttribute('x',-0.5*this.width);
  element.setAttribute('y',-0.5*this.height);
}

item.update = function () {}

// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}


// support for graph operations
// in the coordinates of the parent
item.toGeomRectangle = function () {
  var center = this.__getTranslation();
  var corner = geom.Point.mk(center.x - 0.5*this.width,center.y - 0.5*this.height);
  var extent = this.__getExtent();
  return geom.Rectangle.mk(corner,extent);
}

item.periphery = function(direction)  {
  var rectangle = this.toGeomRectangle();
  return rectangle.peripheryPoint(direction);
}



return item;
});

