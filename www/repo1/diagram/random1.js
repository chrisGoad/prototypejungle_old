// Arrow

'use strict';
//pj.require('/shape/arrowhelper.js',function (headH) {

pj.require('/shape/circle.js','/shape/radiant.js','/shape/grid.js',function (circlePP,radiantPP,gridP) {
//pj.require('/shape/arrowHeadHelper.js',function (headH) {

var geom = pj.geom;
var svg = pj.svg;
var item =  svg.Element.mk('<g/>');
//item.set('elbows',svg.Element.mk('<g/>'));
item.set('grid',gridP.instantiate());
item.grid.set('occupantP',circlePP.instantiate().__hide());
//item.grid.set('occupantP',radiantPP.instantiate().__hide());

  //debugger;
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

item.spacing = 50;
item.grid.occupantP.dimension = 0.6*item.spacing;
item.grid.spacing = item.spacing;
item.grid.rows = item.grid.cols = item.dimension = 3;

var lengthLimit = item.spacing * item.dimension;

item.set('LineP',
  svg.Element.mk('<line stroke="black" stroke-width="2"/>'));

item.LineP.set('end0',geom.Point.mk(0,0));
item.LineP.set('end1',geom.Point.mk(0,0));

item.LineP.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}
  
item.LineP.__domMap =
  {transfers:svg.commonTransfers,
   mapping:
     function (itm,element) {
       var e0 = itm.end0;
       var e1 = itm.end1;
       element.setAttribute('x1',e0.x);
       element.setAttribute('y1',e0.y);
       element.setAttribute('x2',e1.x);
       element.setAttribute('y2',e1.y);

    }
}

item.LineP.length = function () {
  return this.end1.difference(this.end0).length();
}
item.set('lines',pj.Array.mk());
item.set('ilines',pj.Array.mk());

item.addLine = function (e0,e1) {
  var line = this.LineP.instantiate();
  line.setEnds(e0,e1);
  this.lines.push(line);
}

/*

let x0,y0 be end0 of line0, and nx,ny be the normal to line0
Express line1 parametrically as 
(x1,y1) + t * (dx,dy)  [d being the direction of line1]
Then dotp((x1,y1) + t*(dx,dy) - (x0,y0),(nx,ny)) = 0

(t*dx + x1-x0)*nx + (t*dy + y1-y0)*ny = 0
t*(dx*nx + dy*ny) = -((y1 - y0)*ny + (x1 - x0)*nx)
t = -((y1 - y0)*ny + (x1 - x0)*nx)/(dx*nx + dy*ny)
the lines intersect if t >0 and t < length of lin1
*/
var intersects = function (line0,line1) {
  debugger;
  var maxX0 = Math.max(line0.end0.x,line0.end1.x);
  var minX0 = Math.min(line0.end0.x,line0.end1.x);
  var maxX1 = Math.max(line1.end0.x,line1.end1.x);
  var minX1 = Math.min(line1.end0.x,line1.end1.x);
  if ((minX1 > maxX0)||(minX0 > maxX1)) {
    return false;
  }
  var maxY0 = Math.max(line0.end0.y,line0.end1.y);
  var minY0 = Math.min(line0.end0.y,line0.end1.y);
  var maxY1 = Math.max(line1.end0.y,line1.end1.y);
  var minY1 = Math.min(line1.end0.y,line1.end1.y);
  if ((minY1 > maxY0)||(minY0 > maxY1)) {
    return false;
  }
  var e0 = line0.end0;
  var e1 = line0.end1;
  var x0 = line0.end0.x;
  var y0 = line0.end0.y;
  var x1 = line1.end0.x;
  var y1 = line1.end0.y;
  var n = line0.end1.difference(line0.end0).normalize().normal();
  //var v0 = line0.end1.difference(line0.end0);
  //var length  = v0.length();
  //var n = v0.times(1/length).normal();
  //var n = d0.normal();
  var nx = n.x;
  var ny = n.y;
  var v1 = line1.end1.difference(line1.end0);
  var length = v1.length();
  var d = v1.times(1/length);//e1.end1.difference(line1.end0).normalize();
  var dx = d.x;
  var dy = d.y;
  var den = (dx*nx + dy*ny);
  if (Math.abs(den) < 0.001) { // lines are parallel
    return false;
  }
  var t = -((y1-y0)*ny + (x1-x0)*nx)/den;
  if ((t<0) || (t > length+0)) {// line1 terminates before it meets line0
    return false;
  }
  var ip = line1.end0.plus(d.times(t));// intersection point
  return ip.difference(line0.end0).dotp(ip.difference(line0.end1))<=0;
  
}

var line0 = item.LineP.instantiate();
var line1 = item.LineP.instantiate();
line0.end0 = geom.Point.mk(10,0);
line0.end1 = geom.Point.mk(10,5);
line1.end0 = geom.Point.mk(0,10);
line1.end1 = geom.Point.mk(20,10);

line0.end0 = geom.Point.mk(0,0);
line0.end1 = geom.Point.mk(10,10);
line1.end0 = geom.Point.mk(10,0);
line1.end1 = geom.Point.mk(0,10);
/*
line0.end0 = geom.Point.mk(56,12);
line0.end1 = geom.Point.mk(28,40);
line1.end0 = geom.Point.mk(52,48);
line1.end1 = geom.Point.mk(36,44);//,10);
*/

line0.end0 = geom.Point.mk(44,12);
line0.end1 = geom.Point.mk(56,44);
line1.end0 = geom.Point.mk(36,40);
line1.end1 = geom.Point.mk(56,40);

line0.end0 = geom.Point.mk(8,36);//,12);
line0.end1 = geom.Point.mk(16,16);
line1.end0 = geom.Point.mk(48,28);
line1.end1 = geom.Point.mk(0,36);


line0.end0 = geom.Point.mk(45,35);//,12);
line0.end1 = geom.Point.mk(10,5);
line1.end0 = geom.Point.mk(30,70);
line1.end1 = geom.Point.mk(65,50);

var aa = intersects(line0,line1);
debugger;
var updateDone = false;
item.uupdate = function () {
  var i;
  if (!updateDone) {
    this.lines.push(line0);
    line1.stroke = 'red';
    this.lines.push(line1);
    
    updateDone = true;
  }
}
//return item;
item.intersectsAny = function (line) {
  var ln = this.lines.length;
  for (var i=0;i<ln;i++) {
    if (intersects(line,this.lines[i])) {
      return i;
    }
  }
  return false;
}

item.LineP.shorten = function (tln) {
  var ln = this.length();
  if (ln < tln) {
    return this;
  }
  var v=(this.end1.difference(this.end0)).times(1/ln);
  this.end1.copyto(this.end0.plus(v.times(tln)));
  return this;
}
item.randomLine = function (length) {
  var line = this.LineP.instantiate();
  var dimension = this.dimension;
  var spacing = this.spacing;
  var randomCoord = function () {
    var r = Math.random();
    return spacing*Math.floor(r*dimension);
  }
  var e0 = geom.Point.mk(randomCoord(),randomCoord());
  var e1 = geom.Point.mk(randomCoord(),randomCoord());
  line.setEnds(e0,e1);
 return line.shorten(length);
}

var updateDone = false;
item.update = function () {
  var i;
  var count = 0;
  if (!updateDone) {
    this.grid.update();
    for (i=0;i<10000;i++) {
      if (this.lines.length >= 3) {
        var ll = lengthLimit/5;
      } else if (this.lines.length > 20) {
        ll = lengthLimit/30;
      } else {
        ll = lengthLimit;
      }
      var line = this.randomLine(ll);

      console.log(ll);
     
      //if (line.length() >ll) {
      //  continue;
     // }
     var ia = this.intersectsAny(line);
     if (typeof ia === 'number') {
      //if (this.intersectsAny(line)) {
        line.stroke = 'red';
       // this.ilines.push(line);
        debugger;
      } else {
        line['stroke-width'] = 5;
        this.lines.push(line);
        if (this.lines.length > 400) {
          return;
        }
        //debugger;
      }
      //if (!this.intersectsAny(line)) {
      //  this.lines.push(line);
      //}
    }
    
    updateDone = true;
  }

}
return item;

});

