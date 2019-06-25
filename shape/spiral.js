//spiral

core.require(function () {

var item = svg.Element.mk('<g/>');

/* adjustable parameter */
item.dimension = 50;
item.numTurns = 0.75;
item.numSpokes = 3;
item.stroke = "black";  //the fill of the path is set to this
item.widthAtEndFactor = 0.02;
item.widthAtStartFactor = 0.04;// as factor of dimension
/* end adjustable parameters */

item.resizable = true;
item.role = 'vertex';

var radianToDegree = 180/Math.PI;

item.generateSpoke = function (iAngle,numSpokes) {
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  var spoke =   svg.Element.mk('<path />');
  spoke.unselectable = true;
  spoke.fill= this.stroke;
  spoke.stroke = 'transparent';
  spoke.__unselectable = true;
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
  for (let cnt = 1;cnt<=npoints+1;cnt++) {
    let factor = iFactor + cnt*factorDelta;
    let i = factor*cnt;
    let cRadius = rdelta * i;
    let rangle = angleDelta * i;
    let cangle = iAngle + rangle;//angleDelta * (i-1);
    let chWidth = 0;
    if (rangle < 2*Math.PI) {
        chWidth =  this.widthAtStart * (2*Math.PI - rangle)/(2*Math.PI) + hwidthAtEnd * (rangle/(2*Math.PI));
    } 
    let cPoint = geom.Point.mk(cRadius*Math.cos(cangle),cRadius*Math.sin(cangle));
    let cvec = cPoint.difference(lastCpoint).normalize();
    let normal = cvec.normal();
    let lPoint = cPoint.plus(normal.times(-chWidth));
    let rPoint = cPoint.plus(normal.times(chWidth));
    lpoints.push(lPoint);
    rpoints.push(rPoint);
    lastCpoint= cPoint;
  }
  let d = 'M 0 0 ';
  let cRadius = 0;
  for (i=0;i<npoints;i++) {
    cRadius = rdelta * (i<2?i+1:i);
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
  this.set('spokes',core.declareComputed(core.ArrayNode.mk()));
  this.spokes.unselectable = true;
  let angleDelta = 2*Math.PI/this.numSpokes;
  this.radius = 0.5 * this.dimension;
  this.widthAtStart = this.widthAtStartFactor * this.radius;
  for (let i=0;i<this.numSpokes;i++) {
    this.spokes.push(this.generateSpoke(i*angleDelta,this.numSpokes))
  }
}

// used to compute where connections (eg arrows) terminate on this shape's periphery
graph.installCirclePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

ui.hide(item,['d','end0','end1','spokes','widthAtStart','__aspectRatio','radius','fill']);

return item;
});

