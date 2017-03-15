// Arrow
++OBSOLETE++

'use strict';

pj.require('/shape/arrowHeadHelper.js',function (headH) {


var geom = pj.geom;
var item = pj.Object.mk();
  debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');
item.__adjustable = true;
item.__cloneable = true;
item.solidHead = false;
item.set('headHelper',headH.instantiate());


item.set("shaft",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.__cloneResizable = true;
item.shaft.__unselectable = true;
item.shaft.__show();
item.stroke = "blue";
item.headLength = 15;
item.headWidth = 10;
item.headGap = 2; // arrow head falls short of e1 by this amount
item.includeEndControls = true;
item.headInMiddle = true;

item['stroke-width'] = 2;
//item.set("head",
//  svg.Element.mk('<path fill="black"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>'));

  //svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
  //  stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
//item.set("head0",item.HeadP.instantiate());
//tem.set("head1",item.HeadP.instantiate());
//item.head0.__show();
//item.head1.__show();
//item.head0.__unselectable = true;
//item.head1.__unselectable = true;
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,0));
item.set('headBase0',pj.geom.Point.mk(0,0));
item.set('headBase1',pj.geom.Point.mk(0,0));
item.set('headPoint',pj.geom.Point.mk(0,0));
item.filledHead = false;
item.__customControlsOnly = true;


item.buildLineHead = function () {
  this.set("HeadP",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
this.set("head0",this.HeadP.instantiate());
this.set("head1",this.HeadP.instantiate());
this.head0.__show();
this.head1.__show();
this.head0.__unselectable = true;
this.head1.__unselectable = true;
}

item.hideLineHeadInUI = function () {
  ui.hide(this,['HeadP','head0','head1']);
}

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}
var normal,direction;//,headBase0,headBase1,headPoint;

item.computeParams = function () {
  var e0 = this.end0,e1 = this.end1;
  direction = e1.difference(e0).normalize();
  normal = direction.normal();
  console.log(direction.x,direction.y);

}
item.computeEnd1 = function (deviation) {
  //var e0 = this.end0e1 = this.end1;
  //var d = e1.difference(e0).normalize();
  //return e1.plus(d.times(deviation));
 return this.end1.plus(direction.times(deviation));
  //return e1.plus(d.times(this.headGap));
}

item.drawSolidHead = function () {
  var p2str = function (letter,point) {
    return letter+' '+point.x+' '+point.y+' ';;
  }
  
  var d = p2str('M',this.headBase0);
  d += p2str('L',this.headBase1);
  d += p2str('L',this.headInMiddle?this.headPoint:
              this.computeEnd1(4*this['stroke-width']));//this.headPoint);
  d += p2str('L',this.headBase0);
  console.log('d',d);
  this.head.d = d;
  this.head.fill = this.stroke;
}

item.drawLineHead = function () {
  this.head0.setEnds(this.headBase0,this.headPoint);
  this.head1.setEnds(this.headBase1,this.headPoint);
  this.HeadP.stroke = this.stroke;
  this.HeadP['stroke-width'] = this['stroke-width'];
 
}

item.updateCommon = function () {
   if (!this.head) {
    this.solidHead?this.headHelper.buildSolidHead():this.headHelper.buildLineHead();
  }
  this.computeParams();
  var e0 = this.end0,e1 = this.end1;
  //var d = e1.difference(e0).normalize();
  var e1p = this.computeEnd1(-this.headGap);
  var shaftEnd = this.filledHead?this.computeEnd1(-2*this['stroke-width']-this.headGap):e1p;
  this.headPoint = this.headInMiddle?
      (e0.plus(e1p).times(0.5)).plus(direction.times(this.headLength*0.5)):e1p;
  var n,sh,e1he,h0,h1;
  this.shaft.setEnds(e0,shaftEnd);
  //this.__draw();
  //return;
 // n = d.normal().times(0.5*this.headWidth);
  n = normal.times(0.5*this.headWidth);
  sh = this.headPoint.difference(direction.times(this.headLength)); //  point on shaft where head projects
  h0 = sh.plus(n);
  this.headBase0.copyto(h0);
  //headBase0 = h0;
  h1 = sh.difference(n);
  this.headBase1.copyto(h1);
  //headBase1 = h1;
 // this.headPoint.copyto(headPoint);
  this.shaft['stroke-width'] = this['stroke-width'];
  this.shaft.stroke = this.stroke;
  this.headHelper.update(direction,shaftEnd);

}
 
item.__controlPoints = function () {
  this.computeParams();
  var headControlPoint = this.headHelper.controlPoint();
  var rs =  [headControlPoint];
  if (this.includeEndControls) {
    rs.push(this.end0);
    rs.push(this.computeEnd1(0));
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
  console.log('HHCONTROL');
  this.headHelper.updateControlPoint(pos);
  this.update();
  this.__draw();
}


// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  debugger;
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);

 // this.setEnds(center.difference(hex),center.plus(hex));
 // this.end1.copyto(this.end0.plus(extent));
}
 
//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);
ui.hide(item,['headBase0','headBase1','headPoint','shaft','end0','end1',
              'filledHead','headInMiddle','includeEndControls']);

return item;
});

