// Arrow

'use strict';
//pj.require('/shape/arrowhelper.js',function (headH) {

pj.require('/shape/elbow.js','/shape/arrowHead.js',function (elbowP,arrowHeadP) {
//pj.require('/shape/arrowHeadHelper.js',function (headH) {
debugger;
var geom = pj.geom;
var item = pj.Object.mk();
  //debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.solidHead = true;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 15;
item.headWidth = 10;
item.elbowWidth = 40;
item.joinX = 20; // distance from join to end1
item.set('end1',geom.Point.mk(50,0));
/* end adjustable parameters */


item.set('head',arrowHeadP.instantiate());
item.head.__unselectable = true;

item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;

//item.set("shaft", svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>'));

//item.shaft.__unselectable = true;
item.set("inEnds",pj.Array.mk());
item.set("shafts",pj.Array.mk());
item.inEnds.push(geom.Point.mk(0,-20));
item.inEnds.push(geom.Point.mk(0,20));
item.inCount = item.inEnds.length;


item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears

item.set('direction',geom.Point.mk(1,0));

item.buildShafts = function () {
  var ln = this.inEnds.length;
  var lns = this.shafts.length;
  var i;
  for (i=lns;i<ln;i++) {
    var shaft = elbowP.instantiate();
    shaft.__unselectable = true;
    this.shafts.push(shaft);
  }
}

//initializeEnds = function ()
// new ends are always placed between the last two ends
item.initializeNewEnds = function () {
  var currentLength = this.inEnds.length;
  var numNew = this.inCount - currentLength;
  if (numNew <= 0) {
    this.inCount = currentLength; // removing ends not allowed
    return;
  }
  var inEnds = this.inEnds;
  
  var eTop = inEnds[currentLength-2];
  var eBottom = inEnds[currentLength-1];
  inEnds.pop();
  var minX = Math.min(eTop.x,eBottom.x);
  var topY = eTop.y;
  var obottomY = eBottom.y;
  var interval = (obottomY - topY)/(numNew+1);
  var cy = topY+interval;
  for (var i=currentLength;i<this.inCount;i++) {
    inEnds.push(geom.Point.mk(minX,cy));
    cy += interval;
  }
  inEnds.push(eBottom);
}

item.update = function () {
  debugger;
  var i;
  this.head.switchHeadsIfNeeded();
  this.initializeNewEnds();
  this.buildShafts();
  var end1 = this.end1;
  var inEnds = this.inEnds;
  var shafts = this.shafts;
  var ln = inEnds.length;
  var shaftEnd = this.solidHead ?this.head.computeEnd1(-0.5*this.headLength):end1;
  for (i=0;i<ln;i++) {
    var end0 = inEnds[i];
    var shaft = shafts[i]
    shaft.end0.copyto(end0);
    shaft.end1.copyto(shaftEnd);
    pj.setProperties(shaft,this,['stroke-width','stroke','elbowWidth']);//,'elbowPlacement']);
    var elbowPlacement = 1 - (this.joinX)/(end1.x - end0.x);
    shaft.elbowPlacement = elbowPlacement;
    shaft.update();
  }
  this.head.headPoint.copyto(end1);
  this.head.direction.copyto(this.direction);
  pj.setProperties(this.head,this,['solidHead','stroke','stroke-width','headLength','headWidth']);
  this.head.update();

  debugger;
 // this.head.update(this.direction,this.end1);
}


item.__controlPoints = function () {
  debugger;
  var e1 = this.end1;
  var joinPoint = geom.Point.mk(e1.x-this.joinX,e1.y);
  /*var x0 = e0.x;
  var x1 = e1.x;
  var y0 = e0.y;
  var y1 = e1.y
  //var controlPoint = 
  var elbowWidth = this.elbowWidth;
  var elbows  = [];
  var elbowX = x0 + (x1 - x0) * this.elbowPlacement;
  var middlePoint = geom.Point.mk(elbowX,(y1+y0)/2);
  var elbowPoint0 = geom.Point.mk(elbowX-elbowWidth,y0);
  */
  var headControlPoint = this.head.controlPoint();
  
  var rs = [joinPoint,e1,headControlPoint];
  this.inEnds.forEach(function (inEnd) {rs.push(inEnd)});
  //var rs = this.inEnds.concat([this.end1]);//,middlePoint,this.end1,headControlPoint];
  return rs;
}
item.__updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.joinX = this.end1.x - pos.x;
    this.end1.y = pos.y;
  } else if (idx === 1) {
    this.end1 = pos;
  } else if (idx == 2) {
    this.head.updateControlPoint(pos);
    ui.adjustInheritors.forEach(function (x) {
      x.__update();
      x.__draw();
    });
    return;
  } else {
    this.inEnds[idx-3] = pos;
  }
  this.update();
  this.__draw();
}


item.__setExtent = function (extent) {
  var inEnd0 = this.inEnds[0];
  var inEnd1 = this.inEnds[1];
  var endOut = this.end1;
  inEnd0.x = inEnd1.x =  -extent.x/2;
  inEnd0.y = -extent.y/2;
  inEnd1.y = extent.y/2;
  endOut.x =extent.x/2;
  endOut.y = 0;
  this.joinX = extent.x/2;
}

ui.hide(item,['helper','head','shaft','end0','end1','direction']);
item.__setFieldType('solidHead','boolean');

return item;

});

