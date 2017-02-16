// Arrow

'use strict';

pj.require('/shape/arrowHead.js',function (arrowHeadP) {


var geom = pj.geom,svg = pj.svg,ui = pj.ui;

var item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.solidHead = true;
item.headInMiddle = false;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 13;
item.headWidth = 9;
item.headGap = 0; // arrow  falls short of end1 by this amount
item.includeEndControls = true;
/* end adjustable parameters */

item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;

item.set('spokes',pj.Array.mk());
item.radius = 50;

var radianToDegree = 180/Math.PI;

item.generateSpoke = function (iAngle,numSpokes) {
  debugger;
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  var spoke =   svg.Element.mk('<path fill="black" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width=".1"/>');
  var ipoint = geom.Point.mk(0,0);
  var lpoints = [];
  var rpoints = [];
  var hwidthAtEnd = 8/numSpokes;
  var rotations = 1.5;
  var npoints = 20*rotations;// Math.ceil(angleDelta/(2*Math.PI));
  var angleDelta = 2*Math.PI/20;
  var rdelta = this.radius/npoints;
  var i;
  //var widthDelta = hwidthAtEnd/npoints;
//  var width = hwidthAtEnd/(20*numSpokes);
  var lastCpoint = geom.Point.mk(0,0);
  //lpoints.push(lastCpoint);
  var iFactor = 0.15;// a way of getting sample points closer together at outset
  var factorDelta = (1-iFactor)/npoints;
  for (var cnt = 1;cnt<=npoints+1;cnt++) {
    var factor = iFactor + cnt*factorDelta;
    var i = factor*cnt;
    //i = cnt;
    //var chWidth = i*widthDelta;
    var cRadius = rdelta * i;
    //var chWidth =  2+widthDelta * i;
    var rangle = angleDelta * i;
    var cangle = iAngle + rangle;//angleDelta * (i-1);
    if (rangle < 2*Math.PI) {
        var chWidth =  hwidthAtEnd * (rangle/(2*Math.PI));
    } 
    console.log('i',i,'W',chWidth,'A',cangle*radianToDegree);

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
   // var cRadius = rdelta * (i+1.0);
    d += 'A '+cRadius+' '+cRadius+" 0 0 1 ";
    d += p2str('',lpoints[i],' ');
  }
  //d = '';
  d += p2str('L',rpoints[npoints-1],' ');
  
  //  spoke.d = d;
 // return spoke;
 for (i=npoints-2;i>=0;i--) {
    cRadius = rdelta * (i<2?i+3:i);
    d += 'A '+cRadius+' '+cRadius+" 0 0 0 ";
    d += p2str('',rpoints[i],' ');

  }
  
    d += 'A '+rdelta+' '+rdelta+' 0 0 0 0 0';

    spoke.d = d;
  return spoke;
  d += 'M 0 0 ';
  for (i=0;i<npoints-1;i++) {
 
    d += p2str('L',lpoints[i],' ');
   
  }
  for (i=npoints-1;i>0;i--) {
    d += p2str('L',rpoints[i],' ');
  }
  d += 'L 0 0';
  spoke.d = d;
  return spoke;
}

item.numSpokes = 1;
item.update = function () {
  var angleDelta = 2*Math.PI/this.numSpokes;
  for (var i=0;i<this.numSpokes;i++) {
    this.spokes.push(this.generateSpoke(i*angleDelta,this.numSpokes))
  }
 // this.set('spoke1',this.generateSpoke(0,2));
 // this.set('spoke2',this.generateSpoke(Math.PI,2));
}


return item;
});

