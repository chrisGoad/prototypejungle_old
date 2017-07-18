

'use strict';

pj.require('/shape/edgeOps.js',function (edgeOps) {
var geom = pj.geom;
var item = pj.Object.mk();
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
//item.solidHead = true;
item.stroke = "black";
item['stroke-width'] = 2;
item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears

/* end adjustable parameters */



item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;


item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(50,-15));
ui.setTransferredProperties(item,['stroke','stroke-width']);

ui.setupAsEdge(item);
item.__connectionType = 'EastWest'; //  only makes east/west connections
item.elbowWidth = 10;
item.elbowPlacement = 0.5; // fraction of along the way where the elbow appears

//item.set('direction',geom.Point.mk(1,0));

item.update = function () {
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  var e0 = this.end0;
  var e1 = this.end1;
   if (e0.x > e1.x) { //switch ends
    e0 = this.end1;
    e1 = this.end0;
  }
  var x0 = e0.x;
  var x1 = e1.x;
  var y0 = e0.y;
  var y1 = e1.y;
  var yOrder = (y1 > y0)?1:-1;
  var yDelta = Math.abs(y1-y0);
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
  path += p2str('L',e1,' ');
//  console.log('path',path);
  this.d = path;
  
}



item.__controlPoints = function () {
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
  var rs = [this.end0,middlePoint,this.end1];
  return rs;
}
item.__updateControlPoint = function (idx,pos) {
  console.log('IDX',idx);
  switch (idx) {
    case 0:
      this.end0.copyto( pos);
      break;
    case 1:
      var x = pos.x;
      var x0 = this.end0.x;
      var x1 = this.end1.x;
      this.elbowPlacement = Math.max(0,Math.min(1,(x - x0)/(x1 - x0)));
      break;
    case 2:
      this.end1.copyto(pos);
      break;
  }
  this.update();
  this.__draw();
}


// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.setExtent = function (extent,ordered) {
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.end0.copyto(end0);
  this.end1.copyto(end1);
}



item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}
edgeOps.installOps(item);


ui.hide(item,['fill','shaft','end0','end1','direction']);

return item;

});

