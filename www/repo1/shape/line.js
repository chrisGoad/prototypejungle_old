
'use strict';

pj.require('/shape/edgeOps.js',function (edgeOps) {
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
item.__draggable = false;
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

item.__controlPoints = function () {
  return [this.end0,this.end1];
}


item.__updateControlPoint = function (idx,pos) {
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  var graph = ui.containingDiagram(this);

  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,0,pos);
      } else {
        this.end0.copyto(pos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,1,pos);
      } else {
        this.end1.copyto(pos);
      }
      break;
  }
  this.__draw();
}

item.__updateControlPointtt = function (idx,pos) {
  if (idx === 0) {
    this.end0.copyto(pos);
  } else {
    this.end1.copyto(pos);
  }
  this.__draw();
}

item.update = () => undefined;
ui.hide(item,['end0','end1']);

edgeOps.installOps(item);
item.setupAsEdge(item);

return item;
});

