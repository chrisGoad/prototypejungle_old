// Arrow

'use strict';

pj.require('/shape/arrowHead.js',function (arrowHeadP) {


var geom = pj.geom,svg = pj.svg,ui = pj.ui;

var item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.solidHead = true;
item.headInMiddle = false;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 13;
item.headWidth = 9;
item.headGap = 0; // arrow  falls short of end1 by this amount
item.includeEndControls = true;
/* end adjustable parameters */

item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;

item.set('head',arrowHeadP.instantiate());

item.set("shaft",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.shaft.__unselectable = true;
item.shaft.__show();



item.set("end0",geom.Point.mk(0,0));
item.set("end1",geom.Point.mk(50,0));
item.set("direction",geom.Point.mk(0,0)); // direction at end1


var normal;

item.computeParams = function () {
  var e0 = this.end0,e1 = this.end1;
  this.direction = e1.difference(e0).normalize();
  normal = this.direction.normal();
}
item.computeEnd1 = function (deviation) {
 return this.end1.plus(direction.times(deviation));
}

item.update = function () {
  this.head.switchHeadsIfNeeded();
  this.computeParams();
  var e0 = this.end0,e1 = this.end1;
  var e1p = this.head.computeEnd1(-this.headGap);
  var shaftEnd = (this.solidHead  && !this.headInMiddle)?this.head.computeEnd1(-0.5*this.headLength-this.headGap):e1p;
  var headPoint = this.headInMiddle?
      (e0.plus(e1p).times(0.5)).plus(this.direction.times(this.headLength*0.5)):e1p;
  var n,sh,e1he,h0,h1;
  this.shaft.setEnds(e0,shaftEnd);
  sh = headPoint.difference(this.direction.times(this.headLength)); //  point on shaft where head projects
  this.shaft['stroke-width'] = this['stroke-width'];
  this.shaft.stroke = this.stroke;
  this.head.headPoint.copyto(headPoint);
  this.head.direction.copyto(this.direction);
  pj.setProperties(this.head,this,['solidHead','stroke','stroke-width','headLength','headWidth']);
  this.head.update();
}
 
item.__controlPoints = function () {
  debugger;
  this.computeParams();
  var headControlPoint = this.head.controlPoint();
  var rs =  [headControlPoint];
  if (this.includeEndControls) {
    rs.push(this.end0);
    rs.push(this.end1);
  }
  return rs;
}

item.__holdsControlPoint = function (idx,headOfChain) {
  if (idx === 0) {
    return this.hasOwnProperty('headWidth')
  }
  return headOfChain;
}


item.__updateControlPoint = function (idx,pos) {
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  if (idx > 0) {
    if (idx === 1) {
      end = this.end0;
    } else {
      end = this.end1;
    }
    end.copyto(pos);
    event = pj.Event.mk('moveArrowEnd',end);
    event.emit();
    this.update();
    this.__draw();
    return;
  }
  this.head.updateControlPoint(pos);
  ui.adjustInheritors.forEach(function (x) {
    x.__update();
    x.__draw();
  });
}


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}
 
ui.hide(item,['helper','head','shaft','end0','end1',
              'headInMiddle','includeEndControls']);

item.__setFieldType('solidHead','boolean');

return item;
});

