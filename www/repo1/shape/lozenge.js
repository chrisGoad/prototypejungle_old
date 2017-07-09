

'use strict';

pj.require('/shape/lozengePeripheryOps.js',function (peripheryOps) {
var geom = pj.geom;
var item = pj.Object.mk();
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.height = 50;
item.width = 50;
item.cornerCurviness = 0;
item.stroke = "black";
item.fill = "transparent";
item['stroke-width'] = 2;

/* end adjustable parameters */


ui.setupAsVertex(item);
item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__draggable = true;
item.__setComputedProperties(['d']);


item.update = function () {
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  var width = 0.5*this.width;
  var height = 0.5*this.height;
  var left = geom.Point.mk(-width,0);
  var top = geom.Point.mk(0,-height);
  var right = geom.Point.mk(width,0);
  var bottom = geom.Point.mk(0,height);
  if (this.cornerCurviness === 0) { // special case: no curves
    var path = p2str('M',right,' ');
    path += p2str('L',top,' ');
    path += p2str('L',right,' ');
    path += p2str('L',bottom,' ');
    path += p2str('L',left,' ');
    this.d = path;

  }
  // right hand rule, starting with right
  var segment0 = geom.LineSegment.mk(right,top);
  var ln = segment0.length();
  var fractionFromCorner = 0.5*this.cornerCurviness;
  debugger;
  var segment1 = geom.LineSegment.mk(top,left);
  var segment2 = geom.LineSegment.mk(left,bottom);
  var segment3 = geom.LineSegment.mk(bottom,right);
  var seg0end0 = segment0.pointAlong(fractionFromCorner);
  var seg0end1 = segment0.pointAlong(1 - fractionFromCorner);
  var seg1end0 = segment1.pointAlong(fractionFromCorner);
  var seg1end1 = segment1.pointAlong(1 - fractionFromCorner);
  var seg2end0 = segment2.pointAlong(fractionFromCorner);
  var seg2end1 = segment2.pointAlong(1 - fractionFromCorner);
  var seg3end0 = segment3.pointAlong(fractionFromCorner);
  var seg3end1 = segment3.pointAlong(1 - fractionFromCorner);
 
  var path = p2str('M',seg0end0,' ');
  path += p2str('L',seg0end1,' ');
  //path += p2str('L',seg1end0,' ');
  path += p2str('C ',top,',');
  path += p2str('',top,',');
  path += p2str('',seg1end0,' ');
  path += p2str('L',seg1end1,' ');
  path += p2str('C ',left,',');
  path += p2str('',left,',');
  path += p2str('',seg2end0,' ');
  path += p2str('L',seg2end1,' ');
  path += p2str('C ',bottom,',');
  path += p2str('',bottom,',');
  path += p2str('',seg3end0,' ');  
  path += p2str('L',seg3end1,' ');
  path += p2str('C ',right,',');
  path += p2str('',right,',');
  path += p2str('',seg0end0,' ');  
  this.d = path;
  
}

// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  this.width= extent.x;
  this.height = extent.y;
}

/*
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
      this.copyto('end0', pos);
      break;
    case 1:
      var x = pos.x;
      var x0 = this.end0.x;
      var x1 = this.end1.x;
      this.elbowPlacement = Math.max(0,Math.min(1,(x - x0)/(x1 - x0)));
      break;
    case 2:
      this.copyto('end1', pos);
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

*/
//ui.hide(item,['helper','head','shaft','end0','end1','direction']);
//item.__setFieldType('solidHead','boolean');
peripheryOps.installOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);

return item;

});

