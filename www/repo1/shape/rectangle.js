'use strict';

pj.require('/shape/rectanglePeripheryOps.js',function (peripheryOps) {
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
item.__defaultSize = geom.Point.mk(60,30);

item.update = function () {}

// support for the resizer 
item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}

item.__setDomAttributes =  function (element) {
  element.setAttribute('x',-0.5*this.width);
  element.setAttribute('y',-0.5*this.height);
}

peripheryOps.installOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);


return item;
});

