// Arrow

'use strict';
pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item =   svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>');

item.__customControlsOnly = true;

item.__cloneable = true;
//item.roundOneEnd = false;
//item.roundTop = false;
item.set('end0',geom.Point.mk(-100,0));
item.set('end1', geom.Point.mk(100,0));


item.fill = 'none';
item.stroke = 'blue';
item['stroke-width'] = 2;
//item.radiusFactor = 0.6;
item.turnCount = 6;
item.pathWidth = 40;
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
  debugger;
  var d,cr;
  var thisHere = this;
  var e0 = this.end0,e1 = this.end1;
  var v = e1.difference(e0);
  var ln = v.length();
  var d = v.times(1/ln);
  var turnStep = v.times(1/this.turnCount);
  var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  
  var pointsToPath = function (points,directions) {
    var ln = points.length;
    var path = '';
    var factor = 0.3;
    for (var n = 0;n<ln-1;n++) {
      var cp = points[n];
      var np = points[n+1];
      var dir1 = directions[n];
      var dir2 = directions[n+1];
      var dir0 = np.difference(cp);//.normalize();
      var sln = (np.difference(cp)).length();
      var c1 = cp.plus(dir1.times(factor*sln));
      var c2 = np.difference(dir2.times(factor*sln));
      if (0) { // for debugging
        path += p2str('M',c1,' ');
        path += p2str('L',cp,' ');
        path += p2str('L',cp.plus(dir0.times(0.6)),' ');
        path += p2str('M',c2,' ');
        path += p2str('L',np,' ');
      } else {
          path += p2str('M',cp,' ');
          path += p2str('C',c1,',');
          path += p2str('',c2,',');
          path += p2str('',np,' ');
      }
    }
    return path;
  }
  var pointsForTurn= function (startPoint,direction,first) {
    var normal = direction.normal();
    var radius = thisHere.pathWidth * 0.5;
    var center = startPoint.plus(normal.times(radius));
    var pointCount = 8;
    var angleLinearVelocity = turnStep.times(1/(2*Math.PI));
    var angleIncrement = (Math.PI * 2)/pointCount;
    var directions = [];//direction.times(-1)];
    var points = [];
    var pointAtAngle = function (angle) {
      var x = Math.cos(angle);
      var y =  Math.sin(angle);
      var linearStep = angleLinearVelocity.times(angle);
      return center.plus(linearStep).plus(direction.times(-y*radius)).
                         plus(normal.times(-x*radius));
    }
    var starti=first?Math.floor(pointCount/2.5):0;
    for (var i=starti;i<=pointCount;i++) {
      var angle = i * angleIncrement;
      var point = pointAtAngle(angle);
      points.push(point);
      var point1 = pointAtAngle(angle+0.01);
      var dir = (point1.difference(point)).normalize();
      directions.push(dir);
    }
    return [points,directions];
  }
  var path = '';
  var first = true;
  for (var i=0;i<this.turnCount;i++) {
    var pAndD = pointsForTurn(e0.plus(turnStep.times(i)),d,first);
    path += pointsToPath(pAndD[0],pAndD[1]);
    first = false;
  }
  this.d = path;
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
