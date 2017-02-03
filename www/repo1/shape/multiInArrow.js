// Arrow

'use strict';
//pj.require('/shape/arrowhelper.js',function (headH) {

pj.require('/shape/arrowHelper.js',function (arrowHelper) {
//pj.require('/shape/arrowHeadHelper.js',function (headH) {
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
item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears

/* end adjustable parameters */


item.set('helper',arrowHelper.instantiate());

item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;

item.set("shaft", svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>'));

item.shaft.__unselectable = true;
item.set("inEnds",pj.Array.mk());
item.set("shafts",pj.Array.mk());
item.inEnds.push(geom.Point.mk(0,-20));
item.inEnds.push(geom.Point.mk(0,20));
item.inCount = item.inEnds.length;


item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears

item.set('direction',geom.Point.mk(1,0));

item.buildShafts = function () {
  
}
item.updatePath = function (e0,e1,shaft) {
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  //var e0 = this.inEnds[n];
  //var e1 = this.end1;
  var x0 = e0.x;
  var x1 = e1.x;
  var y0 = e0.y;
  var y1 = e1.y;
  var yOrder = (y1 > y0)?1:-1;
  var yDelta = Math.abs(y1-y0);
  debugger;
  //var shaftEnd = this.solidHead ?this.computeEnd1(-2*this['stroke-width']):e1;
  var shaftEnd = this.solidHead ?this.helper.computeEnd1(-0.5*this.headLength):e1;

  var elbowWidth = this.elbowWidth;
  var elbowX = x0 + (x1 - x0) * this.elbowPlacement;
  var elbowWidth0 = Math.min(elbowWidth,elbowX - x0,yDelta/2);
  var elbowWidth1 = Math.min(elbowWidth,x1-elbowX,yDelta/2);
  var elbowPoint0 = geom.Point.mk(elbowX-elbowWidth0,y0);
  var elbowPoint1 = geom.Point.mk(elbowX,y0+yOrder*elbowWidth0);
  var controlPoint0 = elbowPoint0.plus(geom.Point.mk(elbowWidth0,0));
  var controlPoint1 = elbowPoint1.difference(geom.Point.mk(0,yOrder*elbowWidth0));
  var elbowPoint2 = geom.Point.mk(elbowX,y1-yOrder*elbowWidth1);
  var elbowPoint3 = geom.Point.mk(Math.min(x1,elbowX+elbowWidth1),y1);
  var controlPoint2 = elbowPoint2.plus(geom.Point.mk(0,yOrder*elbowWidth1));
  var controlPoint3 = elbowPoint3.difference(geom.Point.mk(elbowWidth1,0));
  var path = p2str('M',e0,' ');
  path += p2str('L',elbowPoint0,' ');
  path += p2str('C',controlPoint0,',');
  path += p2str('',controlPoint1,',');
  path += p2str('',elbowPoint1,' ');
  
  //path += p2str('L',elbowPoint1,' ');
  path += p2str('L',elbowPoint2,' ');
  path += p2str('C',controlPoint2,',');
  path += p2str('',controlPoint3,',');
  path += p2str('',elbowPoint3,' ');
 // path += p2str('L',elbowPoint3,' ');
  path += p2str('L',shaftEnd,' ');
//  console.log('path',path);
  shaft.d = path;
  
}

item.update = function () {
  var i;
  this.helper.switchHeadsIfNeeded();
  var e1 = this.end1;
  var inEnds = this.inEnds;
  inEnds.forEach(function (inEnd) {
    this.updatePath(inEnd,e1);
  });
  pj.setProperties(this.shaft,this,['stroke-width','stroke']);
  this.helper.updateHead(this.direction,this.end1);
}


item.__controlPoints = function () {
  //debugger;
  var e1 = this.end1;
  var x0 = e0.x;
  var x1 = e1.x;
  var y0 = e0.y;
  var y1 = e1.y
  //var controlPoint = 
  var elbowWidth = this.elbowWidth;
  var elbows  = [];
  var 
  var elbowX = x0 + (x1 - x0) * this.elbowPlacement;
  var middlePoint = geom.Point.mk(elbowX,(y1+y0)/2);
  var elbowPoint0 = geom.Point.mk(elbowX-elbowWidth,y0);
  var headControlPoint = this.helper.controlPoint();
  var rs = this.inEnds.concat([this.end0,middlePoint,this.end1,headControlPoint];
  return rs;
}
item.__updateControlPoint = function (idx,pos) {
  console.log('IDX',idx);
  if (idx === 2) {
    debugger;
  }
  switch (idx) {
    case 0:
      this.end0 = pos;
      break;
    case 1:
      var x = pos.x;
      var x0 = this.end0.x;
      var x1 = this.end1.x;
      this.elbowPlacement = Math.max(0,Math.min(1,(x - x0)/(x1 - x0)));
      break;
    case 2:
      this.end1 = pos;
      break;
    case 3:
      this.helper.updateControlPoint(pos);
      ui.adjustInheritors.forEach(function (x) {
        x.__update();
        x.__draw();
      });
      return;
  }
  this.update();
  this.__draw();
}

// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  this.helper.setExtent(extent,ordered);
}


ui.hide(item,['helper','head','shaft','end0','end1','direction']);
item.__setFieldType('solidHead','boolean');

return item;

});

