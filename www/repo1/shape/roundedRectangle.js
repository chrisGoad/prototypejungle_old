
'use strict';
pj.require('/shape/rectanglePeripheryOps.js',function (peripheryOps) {

var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item = svg.Element.mk('<rect/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.cornerRadiusFraction = 0.3;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 2;
/*end  adjustable parameters */

item.__cloneable = true;
item.__adjustable = true;
item.__draggable = true;
item.__defaultSize = geom.Point.mk(60,30);

item.__setDomAttributes =  function (element) {
  var wd = this.width;
  var ht = this.height;
  var radius = this.cornerRadiusFraction * Math.min(wd,ht);
  element.setAttribute('x',-0.5*wd);
  element.setAttribute('y',-0.5*ht);
  element.setAttribute('rx',radius);
  element.setAttribute('ry',radius);
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


item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}

var sqrt2 = Math.sqrt(2);

item.__controlPoints = function () {
  var hw = this.width/2;
  var mhh = -this.height/2;
  var crf = this.cornerRadiusFraction;
  var cr = crf * Math.min(this.width,this.height);
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
  var cr = ext * sqrt2;
  toAdjust.cornerRadiusFraction  = cr/Math.min(this.width,this.height);
  this.__draw();
}

peripheryOps.installOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);

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
