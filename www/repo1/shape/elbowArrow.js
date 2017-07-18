
'use strict';

pj.require('/shape/elbow.js','/shape/arrowHead.js','/shape/edgeOps.js',function (elbowP,arrowHeadP,edgeOps) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.solidHead = true;
item.stroke = "black";
item['stroke-width'] = 4;
item.headLength = 20;
item.headWidth = 16;
item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,-15));

/* end adjustable parameters */
ui.setTransferredProperties(item,['stroke','stroke-width','headLength','headWidth','solidHead']);

ui.setupAsEdge(item);

item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;
item.__draggable = false;
item.__defaultSize = geom.Point.mk(50,15);
item.__connectEnd0EW = true;// connect end0 to one of the cardinal points east, west. Same for end1
item.__connectEnd1EW = true;// connect end0 to one of the cardinal points east, west. Same for end1

item.set('head',arrowHeadP.instantiate());
item.set('shaft',elbowP.instantiate());

item.shaft.__unselectable = true;
item.head.__unselectable = true;

item.set('direction',geom.Point.mk(1,0));

item.update = function () {
  this.head.switchHeadsIfNeeded();
  var e0 = this.end0;
  var e1 = this.end1;
  var flip = e1.x < e0.x;
  var shaftEnd = this.solidHead ?this.head.computeEnd1((flip?0.5:-0.5)*this.headLength):e1;
  this.shaft.end0.copyto(e0);
  this.shaft.end1.copyto(shaftEnd);
  pj.setProperties(this.shaft,this,['stroke-width','stroke','elbowPlacement','elbowWidth']);
  this.shaft.update();
  this.head.headPoint.copyto(e1);
  this.head.direction.copyto(this.direction.times(flip?-1:1));
  pj.setProperties(this.head,this,['solidHead','stroke','stroke-width','headLength','headWidth']);
  this.head.update();
}


item.__controlPoints = function () {
  var shaftControlPoints = this.shaft.__controlPoints();
  var headControlPoint = this.head.controlPoint();
  return [this.end0,shaftControlPoints[1],this.end1,headControlPoint];
}


item.__updateControlPoint = function (idx,pos) {
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        ui.graph.mapEndToPeriphery(this,0,pos);
      } else {
        this.end0.copyto(pos);
      }
      break;
    case 1:
      this.shaft.__updateControlPoint(1,pos);
      this.elbowPlacement = this.shaft.elbowPlacement;
      break;
    case 2:
      if (this.end1vertex) {
        ui.graph.mapEndToPeriphery(this,1,pos);
      } else {
        this.end1.copyto(pos);
      }
      break;
    case 3:
      this.head.updateControlPoint(pos);
      ui.adjustInheritors.forEach(function (x) {
        x.update();
        x.__draw();
      });
      return;
  }
  this.update();
  this.__draw();
}

// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}


item.__setExtent = function (extent) {
  var center = this.end1.plus(this.end0).times(0.5);
  var end1  = geom.Point.mk(0.5 *  extent.x,0.5 *  extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}

edgeOps.installOps(item);
item.__connectionType = 'EastWest'; //  only makes east/west connections

ui.hide(item,['head','shaft','end0','end1','direction','elbowPlacement']);
item.__setFieldType('solidHead','boolean');

return item;

});

