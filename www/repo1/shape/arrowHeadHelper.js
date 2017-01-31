// Arrow

'use strict';
  
pj.require(function () {
var geom = pj.geom;
var item = pj.Object.mk();
  //debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = pj.Object.mk();//svg.Element.mk('<g/>');
item.__adjustable = true;
item.__cloneable = true;

//item.set("shaft",
//  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
//    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
//item.__cloneResizable = true;
//item.shaft.__unselectable = true;
//item.shaft.__show();
item.stroke = "blue";
item.headLength = 5;
item.headWidth = 10;
item.headGap = 2; // arrow head falls short of e1 by this amount
item.includeEndControls = true;
//item.headInMiddle = true;

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
//item.set("end0",pj.geom.Point.mk(0,0));
//item.set("end1",pj.geom.Point.mk(50,0));
item.set('headBase0',pj.geom.Point.mk(0,0));
item.set('headBase1',pj.geom.Point.mk(0,0));
item.set('headPoint',pj.geom.Point.mk(0,0));
item.set('direction',pj.geom.Point.mk(0,0));
item.solidHead = false;
item.__customControlsOnly = true;


item.buildLineHead = function () {
  var arrow = this.__parent;
  this.set("headP",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
arrow.set("head0",this.headP.instantiate());
arrow.set("head1",this.headP.instantiate());
arrow.head0.__show();
arrow.head1.__show();
arrow.head0.__unselectable = true;
arrow.head1.__unselectable = true;
this.solidHead = false;
  ui.hide(arrow,['headP','head0','head1']);

}

item.buildSolidHead = function () {
  var arrow = this.__parent;
  arrow.set('head',
    svg.Element.mk('<path stroke-width = "0"/>'));
  arrow.head.__unselectable = true;
  this.solidHead = true;
}

item.hideLineHeadInUI = function () {
  var arrow = this.__parent;
  ui.hide(arrow,['headP','head0','head1']);
}

var normal,direction;//,headBase0,headBase1,headPoint;

item.drawSolidHead = function () {
  //debugger;
  var arrow = this.__parent;
  var p2str = function (letter,point) {
    return letter+' '+point.x+' '+point.y+' ';;
  }
  
  var d = p2str('M',this.headBase0);
  d += p2str('L',this.headBase1);
  var deviation = arrow['stroke-width'];
  var adjustedPoint  = this.headPoint.plus(this.direction.times(deviation));

  d += p2str('L',adjustedPoint);
 //             this.computeEnd1(4*this['stroke-width']));//this.headPoint);
  d += p2str('L',this.headBase0);
  console.log('d',d);
  arrow.head.d = d;
  arrow.head.fill = arrow.stroke;
}

item.drawLineHead = function () {
  var arrow = this.__parent;
  arrow.head0.setEnds(this.headBase0,this.headPoint);
  arrow.head1.setEnds(this.headBase1,this.headPoint);
  this.headP.stroke = arrow.stroke;
  this.headP['stroke-width'] = arrow['stroke-width'];
 
}

item.update = function (direction,point) {
  //debugger;
  var arrow = this.__parent;  
   // this.headPoint = this.headInMiddle?
  //    (e0.plus(e1p).times(0.5)).plus(direction.times(this.headLength*0.5)):e1p;
  this.headPoint.copyto(point);
  this.direction.copyto(direction);
  var n,sh,h0,h1;
 // this.shaft.setEnds(e0,shaftEnd);
  //this.__draw();
  //return;
 // n = d.normal().times(0.5*this.headWidth);
  var normal = direction.normal();

  n = normal.times(0.5*this.headWidth);
  sh = this.headPoint.difference(direction.times(this.headLength)); //  point on shaft where head projects
  h0 = sh.plus(n);
  this.headBase0.copyto(h0);
  //headBase0 = h0;
  h1 = sh.difference(n);
  this.headBase1.copyto(h1);
  if (this.solidHead) {
    this.drawSolidHead(arrow);
  } else {
    this.drawLineHead(arrow);
  }
  //headBase1 = h1;
 // this.headPoint.copyto(headPoint);
  //this.shaft['stroke-width'] = this['stroke-width'];
  //this.shaft.stroke = this.stroke;
}


item.controlPoint = function () {
  return this.headBase0;
 
}

item.updateControlPoint = function (pos) {
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  var arrow = this.__parent;
  toAdjust = ui.whatToAdjust?ui.whatToAdjust:arrow;// we might be adjusting the prototype
  toAdjust = arrow;
  var normal = this.direction.normal();
  h2shaft = pos.difference(this.headPoint);
  cHeadWidth = h2shaft.dotp(normal) * 2.0;
  cHeadLength = -h2shaft.dotp(this.direction);
  console.log('HEADWIDTH',cHeadWidth);
 
  toAdjust.headHelper.headWidth = Math.max(0,cHeadWidth);
  toAdjust.headHelper.headLength = Math.max(0,cHeadLength); 
  return this.headBase0;
}

 
//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);
ui.hide(item,['headBase0','headBase1','headPoint','shaft','end0','end1',
              'filledHead','headInMiddle','includeEndControls']);

return item;
});

