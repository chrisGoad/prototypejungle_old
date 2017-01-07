// Square

'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');
var item = svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke-width="2" />');

item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;
item.__aspectRatio = 1;
item.dimension = 100;
item.fill = "blue";
item.stroke = "black";
item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({dimension:'N',fill:'S',stroke:'S','stroke-width':'N'}));


item.__domMap =
  {transfers:svg.commonTransfers,//['fill','stroke','stroke-width'],
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
item.setColor = function (color) {
  this.fill = color;
}


item.update = function () {}

// support for the resizer 
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
  } else if (nm === 'c12')  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
  this.update();
  this.extentEvent.node = this;
  //event = pj.Event.mk('extentChange',this);
  this.extentEvent.emit();
}
 

return item;
});

