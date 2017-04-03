
'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<line/>');

/*adjustable parameters  */
item.set('end0',geom.Point.mk(-50,0));
item.set('end1', geom.Point.mk(50,0));
item.stroke = 'black';
item['stroke-width'] = 4;
/* end adjustable parameters */

item.__customControlsOnly = true;
item.__cloneable = true;
item.__adjustable = true;
item.__draggable = true;
item.__cloneResizable = true;
item.__defaultSize = geom.Point.mk(50,0);

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

item.__setDomAttributes  =  function (element) {
  var e0 = this.end0;
  var e1 = this.end1;
  element.setAttribute('x1',e0.x);
  element.setAttribute('y1',e0.y);
  element.setAttribute('x2',e1.x);
  element.setAttribute('y2',e1.y);
}



item.__getExtent = function () {
  var xdim = Math.abs(this.end1.x - this.end0.x);
  var ydim = Math.abs(this.end1.y - this.end0.y);
  return geom.Point.mk(xdim,ydim);
}



item.__setExtent = function (extent) {
  var center = this.end1.plus(this.end0).times(0.5);
  var end1  = geom.Point.mk(0.5 *  extent.x,0.5 *  extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}


item.__controlPoints = function () {
  return [this.end0,this.end1];
}

item.__updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.end0.copyto(pos);
  } else {
    this.end1.copyto(pos);
  }
  this.__draw();
}

ui.hide(item,['end0','end1']);

return item;
});

