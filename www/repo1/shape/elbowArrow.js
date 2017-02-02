// Arrow

'use strict';
  
pj.require('/shape/arrowHeadHelper.js',function (headH) {
var geom = pj.geom;
var item = pj.Object.mk();
  //debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');
item.set('headHelper',headH.instantiate());
item.solidHead = true;
//item.headHelper.buildSolidHead();
item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;
item['stroke-width'] = 2;
item['stroke'] = 'black';
item.headLength = 15;
item.headWidth = 10;
//item['shaft-width']=2
item.set("shaft", svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>'));

item.shaft.__unselectable = true;
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,-50));


item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears

var arrowDirection = geom.Point.mk(1,0);

item.computeEnd1 = function (deviation) {
 return this.end1.plus(arrowDirection.times(deviation));
}

item.updatePath = function () {
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
 // debugger;
  var e0 = this.end0;
  var e1 = this.end1;
  var x0 = e0.x;
  var x1 = e1.x;
  var y0 = e0.y;
  var y1 = e1.y;
  var yOrder = (y1 > y0)?1:-1;
  var yDelta = Math.abs(y1-y0);
  debugger;
  //var shaftEnd = this.solidHead ?this.computeEnd1(-2*this['stroke-width']):e1;
  var shaftEnd = this.solidHead ?this.computeEnd1(-0.5*this.headLength):e1;

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
  this.shaft.d = path;
  
}

item.update = function () {
  this.updatePath();
  pj.setProperties(this.shaft,this,['stroke-width','stroke']);
  if (!this.head) {
    this.solidHead?this.headHelper.buildSolidHead():this.headHelper.buildLineHead();
  }
  //this.shaft['stroke-width']
   this.headHelper.update(arrowDirection,this.end1);
}


item.__controlPoints = function () {
  //debugger;
  var e0 = this.end0;
  var e1 = this.end1;
  var x0 = e0.x;
  var x1 = e1.x;
  var y0 = e0.y;
  var y1 = e1.y
  //var controlPoint = 
  var elbowWidth = this.elbowWidth;
  var elbowX = x0 + (x1 - x0) * this.elbowPlacement;
  var middlePoint = geom.Point.mk(elbowX,(y1+y0)/2);
  var elbowPoint0 = geom.Point.mk(elbowX-elbowWidth,y0);
  var headControlPoint = this.headHelper.controlPoint();
  var rs = [this.end0,middlePoint,this.end1,headControlPoint];
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
      this.headHelper.updateControlPoint(pos);
      ui.adjustInheritors.forEach(function (x) {
        x.__update();
        x.__draw();
      });
      return;
  }
  this.update();
  this.__draw();
}


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}
item.__setExtent = function (extent,ordered) {
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}

ui.hide(item,['shaft','end0','end1',
              'solidHead']);

return item;

});

