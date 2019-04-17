
core.require('/text/attachedText.js',function (textItemP) {


let item = svg.Element.mk('<g/>');
item.set('content',svg.Element.mk('<path fill="none" stroke="black"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>'));
item.content.neverselectable = true;


/* adjustable parameters */
item.stroke = 'black';
item.set('end0',geom.Point.mk(0,0));
item.set('end1', geom.Point.mk(50,0));
item['stroke-width'] = 2;
item.turnCount = 6;
item.pathWidth = 20;
item.text =  '';
/* end adjustable parameters */

item.role = 'edge';

item.customControlsOnly = true;
item.resizable = true;
//item.defaultSize = geom.Point.mk(50,0);
item.content.setComputedProperties(['d']);


var sqrt2 = Math.sqrt(2);


item.update = function () {
  var d,cr;
  core.setProperties(this.content,this,['stroke','stroke-width','stroke-opacity']);
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
      path += p2str('M',cp,' ');
      path += p2str('C',c1,',');
      path += p2str('',c2,',');
      path += p2str('',np,' ');
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
    var directions = [];
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
  this.content.d = path;
  if (this.text) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.neverselectable = true;
    }
    this.textItem.update();
  }
}


 
// If ordered is present, this called from finalizeInsert and
// ordered says which way the box was dragged, which in turn determines the direction of the arrow
item.setExtent = function (extent,ordered) {
  var center = this.end1.plus(this.end0).times(0.5);
  var ox = ordered?(ordered.x?1:-1):1;
  var oy = ordered?(ordered.y?1:-1):1;
  var end1  = geom.Point.mk(0.5 * ox * extent.x,0.5 * oy * extent.y);
  var end0 = end1.times(-1);
  this.setEnds(end0,end1);
}


item.controlPoints = function () {
  return  [this.end0,this.end1];
}



item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,0,rpos);
      } else {
        this.end0.copyto(rpos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,1,rpos);
      } else {
        this.end1.copyto(rpos);
      }
      break;
  }
  this.update();
  this.draw();
}

ui.hide(item,['content','end0','end1','stroke-linecap','text']);
graph.installEdgeOps(item);



item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width','text'],own);
  if (src.textItem) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.neverselectable = true;
    }
    this.textItem.transferState(src.textItem,own);
  }
}


return item;
});
