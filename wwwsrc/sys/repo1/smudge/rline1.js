/* generate a line which is one element of a smudge: which departs from the given array of points by a randomized amount */

(function () {
var svg = pj.svg;
var geom = pj.geom;
/*
 * inputs:
 *   interval
 *   points
 *   jiggle
 */

var item = svg.Element.mk('<g/>');
item.interval = 20; // interval between points
item.jiggle = 5;
item.set("main",
  svg.Element.mk('<polyline fill="none" stroke="blue"  stroke-opacity="0.5" stroke-linecap="round" stroke-width="15"/>'));
item.__unselectable = 1;
item.main.__unselectable = 1;
item.main.set('__signature',pj.Signature.mk({stroke:'S','stroke-opacity':'N','stroke-width':'N'}));

//item.strokeWidth = 1;
item.origin = pj.geom.Point.mk(0,0);
item.setColor = function (color) {
  this.stroke = color;
  this.main.stroke = color;
}
item.update = function () {
  debugger;
  var points = this.points;
  var numPoints = points.length;
  var i,j;
  var rs = pj.Array.mk();
  var jiggle = this.jiggle;
  var jigglePoint = function (p) {
    var x=p.x + jiggle*Math.random();
    var y=p.y + jiggle*Math.random();
    return geom.Point.mk(x,y);
  }
  for (i=0;i<numPoints-1;i++) {
    var cp = points[i];
    var np = points[i+1];
    var d = np.distance(cp);
    var numInner = Math.ceil(d/this.interval);
    var ivec = np.difference(cp).times(1/numInner);
    for (j=0;j<numInner;j++) {
      var ip = cp.plus(ivec.times(j));
      rs.push(jigglePoint(ip));
    }
  }
 
  this.main.set("points",pj.svg.toSvgPoints(rs));
}
pj.returnValue(undefined,item);

})()

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
