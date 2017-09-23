
'use strict';
pj.require('/shape/edgeOps.js',function (edgeOps) {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item =   svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>');

/* adjustable parameters */
item.set('end0',geom.Point.mk(0,0));
item.set('end1', geom.Point.mk(50,0));
item.halfWaveCount = 15;
item.waveAmplitude = 1; // as a fraction of the wave length
item.cornerFraction = 0.4; // the fraction of the wave taken up by  corners
item.stroke = 'black';
item['stroke-width'] = 2;
item.radiusFactor = 0.6;
/* endadjustable parameters */

ui.setTransferredProperties(item,['stroke','stroke-width']);

//ui.setupAsEdge(item);

item.__customControlsOnly = true;

item.__cloneable = true;

item.__adjustable = true;
item.__draggable = true;
item.__cloneResizable = true;
item.__defaultSize = geom.Point.mk(50,0);

var sqrt2 = Math.sqrt(2);


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

item.update = function () {
  var d,cr;
  var thisHere = this;
  var e0 = this.end0,e1 = this.end1;
  var v = e1.difference(e0);
  var ln = e1.length();
  var d = v.times(1/ln);
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  var pathForHalfWave = function (startPoint,endPoint,up,first) {
    var delta = endPoint.difference(startPoint);
    var a = 0.5 * thisHere.waveAmplitude;
    var distToP1 = ((1 - thisHere.cornerFraction)/2);
    var n = delta.normal();
    if (up) {
      n = n.minus();
    }
    var deltaToP1 = delta.times(distToP1).plus(n.times(a));
    var p1 = startPoint.plus(deltaToP1);
    var c1 = startPoint.plus(deltaToP1.times(1.3));
    var deltaToP2 = delta.times(-distToP1).plus(n.times(a));
    var p2 = endPoint.plus(deltaToP2);
    var c2 = endPoint.plus(deltaToP2.times(1.3));
     var path = p2str('L',p1,' ')+
        p2str('C',c1,',')+
        p2str(' ',c2,',') + p2str(' ',p2,' ') +  p2str('L',endPoint,' ')
     return path;
  }
  var hwc = this.halfWaveCount;
  var hwDelta = v.times(1/hwc);
  var current = e0;
  var path = p2str('M',e0,' ');
  for (var i=0;i<hwc;i++) {
    var next = current.plus(hwDelta);
    path += pathForHalfWave(current,next,i%2===0);
    current = next;
  }
  this.d = path;
}

 
// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}


item.__controlPoints = function () {
  return  [this.end0,this.end1];
}

item.__holdsControlPoint = function (idx,headOfChain) {
  return true;
  if (idx === 0) {
    return this.hasOwnProperty('headWidth')
  }
  return headOfChain;
}



item.__updateControlPoint = function (idx,pos) {
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  var graph = ui.containingDiagram(this);
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,0,pos);
      } else {
        this.end0.copyto(pos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,1,pos);
      } else {
        this.end1.copyto(pos);
      }
      break;
  }
  this.update();
  this.__draw();
}
edgeOps.installOps(item);
item.setupAsEdge(item);

ui.hide(item,['end0','end1','d','stroke-linecap']);

return item;
});
