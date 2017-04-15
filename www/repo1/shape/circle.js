'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item =  svg.Element.mk('<circle/>');

/* adjustable parameters */
item.dimension = 50;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width']  = 2;
/* end adjustable parameters */

ui.setupAsVertex(item);

item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;
item.__aspectRatio = 1;  // keep this ratio when resizing

//item.__actions = [{title:'connect',action:'connectAction'}];

item.__setDomAttributes = function (element) {
  element.setAttribute('r',0.5*this.dimension); // set the circle's radius to half its dimension
};

item.update = function () {}; 

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

item.__getExtent = function () {
  var dim = this.dimension;
  return geom.Point.mk(dim,dim);
}

item.__setExtent = function (extent,nm) {
  var event,ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
}

/*
item.__dragStep = ui.vertexDragStep ;

item.__ddragStep = function (pos) {
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.dragVertex) {
    topActive.dragVertex(this,pos);
  }
}


item.__delete = ui.vertexDelete;
*/
/*
function () {
  var topActive = pj.ancestorWithProperty(this,'__activeTop');
  if (topActive && topActive.deleteVertex) {
    topActive.deleteVertex(this);
  } else {
    ui.standardDelete(this);
  }
}
*/


 
ui.hide(item,['__aspectRatio']);

return item;
});

