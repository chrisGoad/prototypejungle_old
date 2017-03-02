
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

item.__cloneable = true;
item.__adjustable = true;
item.__draggable = true;

item.__domMap =
  {transfers:svg.commonTransfers.concat(['width','height']),
   mapping:
     function (itm,element) {
       element.setAttribute('x',-0.5*itm.width);
       element.setAttribute('y',-0.5*itm.height);
    }
}

item.update = function () {}

// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  var path = pj.pathToString(this.__pathOf(pj.root));
  var event;
  this.width= extent.x;
  this.height = extent.y;
}

return item;
});

