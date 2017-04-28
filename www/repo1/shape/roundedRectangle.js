
'use strict';
pj.require('/shape/rectanglePeripheryOps.js',function (peripheryOps) {

var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item = svg.Element.mk('<rect/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.cornerRadius = 15;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 2;
/*end  adjustable parameters */

ui.setupAsVertex(item);
item.__cloneable = true;
item.__cloneResizable = false;
item.__adjustable = true;
item.__draggable = true;
item.__defaultSize = geom.Point.mk(60,30);

item.__setDomAttributes =  function (element) {
  element.setAttribute('x',-0.5*this.width);
  element.setAttribute('y',-0.5*this.height);
  element.setAttribute('rx',this.cornerRadius);
  element.setAttribute('ry',this.cornerRadius);
}
/*
//item.__domMap =
  {transfers:svg.commonTransfers.concat(['width','height']),
   mapping:
     function (itm,element) {
       element.setAttribute('x',-0.5*itm.width);
       element.setAttribute('y',-0.5*itm.height);
       element.setAttribute('rx',itm.cornerRadius);
       element.setAttribute('ry',itm.cornerRadius);

    }
}
*/
item.update = function () {}

// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  var event;
  this.width= extent.x;
  this.height = extent.y;
}

var sqrt2 = Math.sqrt(2);

item.__controlPoints = function () {
  var hw = this.width/2;
  var mhh = -this.height/2;
  var cr = this.cornerRadius;
  var cext = cr/sqrt2;
  return [pj.geom.Point.mk(-hw+cext,mhh)]
}

item.__updateControlPoint = function (idx,pos) {
  var hw = this.width/2;
  if (this.roundOneEnd) {
    ext = hw - pos.x;
  } else {
    var ext = pos.x + hw;
  }
  var toAdjust = ui.whatToAdjust?ui.whatToAdjust:this;// we might be adjusting the prototype
  toAdjust.cornerRadius  = ext * sqrt2;
  this.__draw();
}

peripheryOps.installOps(item);
/*
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
/*
item.periphery = function(direction)  {
  var rectangle = this.toGeomRectangle();
  return rectangle.peripheryPoint(direction);
}
*/
  
return item;
});
