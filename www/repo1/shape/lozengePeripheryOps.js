'use strict';

pj.require(function () {

var geom =  pj.geom;

var item = pj.Object.mk();

item.sides = function () {
  var hwidth = 0.5*this.width;
  var hheight = 0.5*this.height;
  var left = geom.Point.mk(-hwidth,0);
  var top = geom.Point.mk(0,-hheight);
  var right = geom.Point.mk(hwidth,0);
  var bottom = geom.Point.mk(0,hheight);
  var rs = [];
  rs.push(geom.LineSegment.mk(right,top));
  rs.push(geom.LineSegment.mk(top,left));
  rs.push(geom.LineSegment.mk(left,bottom));
  rs.push(geom.LineSegment.mk(bottom,right));
  return rs;
}
  
item.peripheryAtDirection = function(direction) {
  debugger;
  
  var sides = this.sides();
  var dim = 2*Math.max(this.width,this.height);
  var center = geom.Point.mk(0,0);//this.__getTranslation();
  var line = geom.LineSegment.mk(center,center.plus(direction.times(dim)));
  for (var i=0;i<4;i++) {
    var side = sides[i];
    var intersection = line.intersect(sides[i]);
    if (intersection) {
      //return intersection;
      var fractionAlong =  ((intersection.difference(side.end0)).length())/(side.length());
      intersection = (fractionAlong > 0.5)?side.end1:side.end0;
      return {intersection:intersection.plus(this.__getTranslation()),side:i,sideFraction:Math.round(fractionAlong)};
    }
  }
}



item.alongPeriphery = function (edge,fraction) {
  console.log('edge',edge,'fraction',fraction);
  var sides = this.sides();
  var side = sides[edge];
  return side.pointAlong(fraction).plus(this.__getTranslation());
}

item.installOps = function(where) {
  where.sides = this.sides;
  where.peripheryAtDirection = this.peripheryAtDirection;
  where.alongPeriphery  = this.alongPeriphery;
}
return item;
geom.Rectangle.alongPeriphery = function (edge,fraction) {
  console.log('edge',edge,'fraction',fraction);
  var sides = this.sides();
  var side = sides[edge];
  return side.pointAlong(fraction);
}
  var segment0 = geom.LineSegment.mk(right,top);
  var ln = segment0.length();
  var fractionFromCorner = 0.5*this.cornerCurviness;
  debugger;
  var segment1 = geom.LineSegment.mk(top,left);
  var segment2 = geom.LineSegment.mk(left,bottom);
  var segment3 = geom.LineSegment.mk(bottom,right);

 var width = 0.5*this.width;
  var height = 0.5*this.height;

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