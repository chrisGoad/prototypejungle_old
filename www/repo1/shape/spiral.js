
'use strict';

pj.require('/shape/circlePeripheryOps.js',function (peripheryOps) {

var geom = pj.geom,svg = pj.svg,ui = pj.ui;

var item = svg.Element.mk('<g/>');

/* adjustable parameter */
item.__dimension = 50;
item.numTurns = 0.75;
item.numSpokes = 3;
item.stroke = 'transparent';
item.fill = "black";
item.widthAtEndFactor = 0.02;
item.widthAtStartFactor = 0.04;// as factor of dimension
/* end adjustable parameters */



item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;
item.__aspectRatio = 1;  // keep this ratio when resizing


var radianToDegree = 180/Math.PI;

item.generateSpoke = function (iAngle,numSpokes) {
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  var spoke =   svg.Element.mk('<path />');
  spoke.fill= this.fill;
  spoke.__unselectable = true;
  var ipoint = geom.Point.mk(0,0);
  var lpoints = [];
  var rpoints = [];
  var hwidthAtEnd = this.radius * this.widthAtEndFactor * 8/(numSpokes*this.numTurns);
  var rotations = 1.5;
  var npoints = 20*rotations;// Math.ceil(angleDelta/(2*Math.PI));
  var angleDelta = this.numTurns * 2*Math.PI/20;
  var rdelta = this.radius/npoints;
  var i;
  var lastCpoint = geom.Point.mk(0,0);
  var iFactor = 0.15;// a way of getting sample points closer together at outset
  var factorDelta = (1-iFactor)/npoints;
  for (var cnt = 1;cnt<=npoints+1;cnt++) {
    var factor = iFactor + cnt*factorDelta;
    var i = factor*cnt;
    var cRadius = rdelta * i;
    var rangle = angleDelta * i;
    var cangle = iAngle + rangle;//angleDelta * (i-1);
    if (rangle < 2*Math.PI) {
        var chWidth =  this.widthAtStart * (2*Math.PI - rangle)/(2*Math.PI) + hwidthAtEnd * (rangle/(2*Math.PI));
    } 
    var ccos = Math.cos(cangle);
    var csin = Math.sin(cangle);
    var cPoint = geom.Point.mk(cRadius*Math.cos(cangle),cRadius*Math.sin(cangle));
    var cvec = cPoint.difference(lastCpoint).normalize();
    var normal = cvec.normal();
    var lPoint = cPoint.plus(normal.times(-chWidth));
    var rPoint = cPoint.plus(normal.times(chWidth));
    lpoints.push(lPoint);
    rpoints.push(rPoint);
    lastCpoint= cPoint;
  }
  var d = 'M 0 0 ';
  for (i=0;i<npoints;i++) {
   var cRadius = rdelta * (i<2?i+1:i);
    d += 'A '+cRadius+' '+cRadius+" 0 0 1 ";
    d += p2str('',lpoints[i],' ');
  }
  d += p2str('L',rpoints[npoints-1],' ');
 for (i=npoints-2;i>=0;i--) {
    cRadius = rdelta * (i<2?i+3:i);
    d += 'A '+cRadius+' '+cRadius+" 0 0 0 ";
    d += p2str('',rpoints[i],' ');

  }
  d += 'A '+rdelta+' '+rdelta+' 0 0 0 0 0';
  spoke.d = d;
  return spoke;
}

item.update = function () {
  if (this.spokes) {
    this.spokes.remove();
  }
  this.set('spokes',pj.declareComputed(pj.Array.mk()));
  this.spokes.__unselectable = true;
  var angleDelta = 2*Math.PI/this.numSpokes;
  this.radius = 0.5 * this.__dimension;
  this.widthAtStart = this.widthAtStartFactor * this.radius;
  for (var i=0;i<this.numSpokes;i++) {
    this.spokes.push(this.generateSpoke(i*angleDelta,this.numSpokes))
  }
}

// used to compute where connections (eg arrows) terminate on this shape's periphery
peripheryOps.installOps(item);
ui.setTransferredProperties(item,ui.stdTransferredProperties);

item.__setExtent = function (extent,nm) {
  var ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.__dimension = ext;
  this.update();
  this.__draw();
}

ui.hide(item,['d','end0','end1','spokes','widthAtStart','__aspectRatio','radius']);

return item;
});

