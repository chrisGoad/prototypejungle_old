'use strict';

pj.require(function () {

var geom =  pj.geom;
var  item = pj.Object.mk();


// support for graph operations
// in the coordinates of the parent
item.toGeomRectangle = function () {
  var center = this.__getTranslation();
  var corner = geom.Point.mk(center.x - 0.5*this.width,center.y - 0.5*this.height);
  var extent = this.__getExtent();
  return geom.Rectangle.mk(corner,extent);
}

item.peripheryAtDirection = function(direction)  {
  var rectangle = this.toGeomRectangle();
  return rectangle.peripheryAtDirection(direction);
}


item.alongPeriphery = function (edge,fraction) {
  var rectangle = this.toGeomRectangle();
  return rectangle.alongPeriphery(edge,fraction);
}

item.installOps = function(where) {
  where.toGeomRectangle = this.toGeomRectangle;
  where.peripheryAtDirection = this.peripheryAtDirection;
  where.alongPeriphery  = this.alongPeriphery;
}
return item;
});