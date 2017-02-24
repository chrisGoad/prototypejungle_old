// Arrow

'use strict';
pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item = svg.Element.mk('<rect/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.cornerRadius = 25;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 2;
/*end  adjustable parameters */

item.__cloneable = true;
item.__cloneResizable = false;
item.__adjustable = true;
item.__draggable = true;


var sqrt2 = Math.sqrt(2);


item.setColor = function (color) {
  this.fill = color;
  this.__contents.fill = color;
}


item.__domMap =
  {transfers:svg.commonTransfers.concat(['width','height']),
   mapping:
     function (itm,element) {
       element.setAttribute('x',-0.5*itm.width);
       element.setAttribute('y',-0.5*itm.height);
       element.setAttribute('rx',itm.cornerRadius);
       element.setAttribute('ry',itm.cornerRadius);

    }
}

// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  var event;
  this.width= extent.x;
  this.height = extent.y;
}
 
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
  
return item;
});
