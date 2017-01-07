// Arrow

'use strict';
pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("__contents",
  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>'));
item.__cloneable = true;
item.roundOneEnd = false;
item.roundTop = false;
item.__contents.__unselectable = true;
item.__contents.__show();
item.end0 = geom.Point.mk(-250,-100);
item.end1 = geom.Point.mk(250,100);
item.halfWaveCount = 15;
item.waveAmplitude = 1; // as a fraction of the wave length
item.cornerFraction = 0.4; // the fraction of the wave taken up by  corners


//item.cornerRadius = 10;  
item.fill = 'blue';
item.stroke = 'black';
item['stroke-width'] = 2;
item.radiusFactor = 0.6;

item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

var sqrt2 = Math.sqrt(2);


item.setColor = function (color) {
  this.fill = color;
  this.__contents.fill = color;
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
  this.__contents.d = path;
 // pj.transferState(this.__contents,this);
}

item.__adjustable = true;
item.__draggable = true;
// support for the resizer 

 
 
  

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);
return item;
});
