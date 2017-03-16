// Arrow

'use strict';
  
pj.require(function () {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');
/*adjustable parameters */
item.headWidth = 10;
item.headLength = 20;
item.stroke = "blue";
item['stroke-width'] = 2;
item.solidHead = true;
/*end adjustable parameters */

item.__adjustable = true;
item.__cloneable = true;
item.__customControlsOnly = true;


item.set('headBase0',pj.geom.Point.mk(0,-10));
item.set('headBase1',pj.geom.Point.mk(0,10));
item.set('headPoint',pj.geom.Point.mk(10,0));
item.set('direction',pj.geom.Point.mk(1,0));

item.nowSolidHead = undefined;//item.solidHead;

item.buildLineHead = function () {
  if (!this.headP) {
    this.set("headP",
      svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
        stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
  }
  var head = this.set('head',svg.Element.mk('<g/>'));

  head.set("head0",this.headP.instantiate());
  head.set("head1",this.headP.instantiate());
  head.head0.__show();
  head.head1.__show();
  head.__unselectable = true;
  head.head0.__unselectable = true;
  head.head1.__unselectable = true;
  this.nowSolidHead = false;
}

item.buildSolidHead = function () {
  this.set('head',
    svg.Element.mk('<path stroke-width = "0"/>'));
  this.head.__unselectable = true;
  this.nowSolidHead = true;
}

item.hideLineHeadInUI = function () {
  ui.hide(arrow,['headP','head0','head1']);
}

var normal,direction;

item.drawSolidHead = function () {
  var p2str = function (letter,point) {
    return letter+' '+point.x+' '+point.y+' ';;
  }
  
  var d = p2str('M',this.headBase0);
  d += p2str('L',this.headBase1);
  d += p2str('L',this.headPoint);
  d += p2str('L',this.headBase0);
  this.head.d = d;
  this.head.fill = this.stroke;
  this.head.__draw();
}

item.drawLineHead = function () {
  this.head.head0.setEnds(this.headBase0,this.headPoint);
  this.head.head1.setEnds(this.headBase1,this.headPoint);
  this.headP.stroke = this.stroke;
  this.headP['stroke-width'] = this['stroke-width'];
 
}

item.update= function () {
  this.switchHeadsIfNeeded();
  var n,sh,h0,h1;
  var normal = this.direction.normal();
  n = normal.times(0.5*this.headWidth);
  sh = this.headPoint.difference(this.direction.times(this.headLength)); //  point on shaft where head projects
  h0 = sh.plus(n);
  this.headBase0.copyto(h0);
  h1 = sh.difference(n);
  this.headBase1.copyto(h1);
  if (this.solidHead) {
    this.drawSolidHead();
  } else {
    this.drawLineHead();
  }
}


item.switchHeadsIfNeeded = function () {
 if (this.head) {
    if (this.solidHead !== this.nowSolidHead) { // head type has changed
      this.head.remove();
      this.head = undefined;
    }
  }
  if (!this.head) {
    this.solidHead?this.buildSolidHead():this.buildLineHead();
  }
}


item.controlPoint = function () {
  return this.headBase0;
 
}

item.updateControlPoint = function (pos) {
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  var arrow = this.__parent;
  // if arrow owns headWidth, then it  should be adjusted regardless of ui.whatToAdjust
  if (arrow.hasOwnProperty('headWidth')) {
    toAdjust = arrow;
  } else {
    toAdjust = ui.whatToAdjust?ui.whatToAdjust:arrow;// we might be adjusting the prototype
  }
  var normal = this.direction.normal();
  h2shaft = pos.difference(this.headPoint);
  cHeadWidth = h2shaft.dotp(normal) * 2.0;
  cHeadLength = -h2shaft.dotp(this.direction); 
  toAdjust.headWidth = Math.max(0,cHeadWidth);
  toAdjust.headLength = Math.max(0,cHeadLength); 
  return this.headBase0;
}


item.setEnds = function (p0,p1) {
  var arrow = this.__parent;
  arrow.end0.copyto(p0);
  arrow.end1.copyto(p1);
}

item.computeEnd1 = function (deviation) {
 var arrow = this.__parent;
 return arrow.end1.plus(arrow.direction.times(deviation));
}

// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.setExtent = function (extent,ordered) {
  var arrow = this.__parent;
  var center = arrow.end1.plus(arrow.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}

return item;
});

