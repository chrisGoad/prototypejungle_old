// Arrow

'use strict';
pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
//var item = svg.Element.mk('<g/>');
var item =   svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>');


//item.set("__contents",
//  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>'));

item.__customControlsOnly = true;

item.__cloneable = true;
item.roundOneEnd = false;
item.roundTop = false;
//item.__contents.__unselectable = true;
//item.__contents.__show();
item.set('end0',geom.Point.mk(-250,-100));
item.set('end1', geom.Point.mk(250,100));
item.halfWaveCount = 15;
item.waveAmplitude = 1; // as a fraction of the wave length
item.cornerFraction = 0.4; // the fraction of the wave taken up by  corners


//item.cornerRadius = 10;  
item.fill = 'none';
item.stroke = 'blue';
item['stroke-width'] = 4;
item.radiusFactor = 0.6;

item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

var sqrt2 = Math.sqrt(2);


item.setColor = function (color) {
  this.fill = color;
  //this.__contents.fill = color;
}


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
   // var distToP2 = 1 - distToP1;
    var n = delta.normal();
    if (up) {
      n = n.minus();
    }
    var deltaToP1 = delta.times(distToP1).plus(n.times(a));
    var p1 = startPoint.plus(deltaToP1);
    var c1 = startPoint.plus(deltaToP1.times(1.3));//.plus(geom.Point.mk(0,15));
    var deltaToP2 = delta.times(-distToP1).plus(n.times(a));
    var p2 = endPoint.plus(deltaToP2);
    var c2 = endPoint.plus(deltaToP2.times(1.3));//.plus(geom.Point.mk(0,15));
    //var p2 = startPoint.plus(delta.times(dToP2)).plus(n.times(a));
    //var path = p2str('M',startPoint,' ')+p2str('L',p1,' ')+
    var path = p2str('L',p1,' ')+
        p2str('C',c1,',')+//p2str(' ',p1,',')+
        p2str(' ',c2,',') + p2str(' ',p2,' ') +  p2str('L',endPoint,' ')
  //var path = p2str('M',startPoint,' ')+p2str('L',p1,' ')+p2str('L',p2,' ')+p2str('L',endPoint,'');
  //var path = p2str('M',startPoint,' ')+p2str('L',p1,' ')+p2str('L',c1,' ')+
 //p2str('M',endPoint,' ')+p2str('L',p2,'')+p2str('L',c2)
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
  //var d = pathForHalfWave(e0,e1,1);
  //this.BowedLine['stroke-width'] = this.strokeWidth;
  console.log('path','['+path+']');
  //this.__contents.d = path;
  this.d = path;
 // pj.transferState(this.__contents,this);
}

item.__adjustable = true;
item.__draggable = true;
// support for the resizer 

item.__cloneResizable = true;

 
// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.__setExtent = function (extent,ordered) {
  debugger;
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
  var end = idx?this.end1:this.end0;
  end.copyto(pos);
  event = pj.Event.mk('moveArrowEnd',end);
  event.emit();
  this.update();
  this.__draw();
}
  


//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);
return item;
});
