(function () {
var svg = pj.svg;
var ui = pj.ui;

var item = svg.Element.mk('<g/>'); 
item.set("BowedLine",
  svg.Element.mk('<polyline fill="none" stroke="blue"  stroke-opacity="0.5" stroke-linecap="round" stroke-width="15"/>'));
item.numSegments = 10;
item.width = 1000;
item.height = -100;
item.__unselectable = true;
item.BowedLine.__unselectable = true;
//item.strokeWidth = 1;
item.origin = pj.geom.Point.mk(0,0);
item.update = function () {
  var vertical = this.vertical;
  var points = pj.Array.mk();
  var ns = this.numSegments;
  var hns = ns/2;
  var thisHere = this;
  var pointN = function (n) {
    if (vertical) {
      var y = thisHere.height * n/ns;
      var x = - Math.pow((n-hns)/hns,2) * thisHere.width;
    } else {
      var x =thisHere.width * n/ns;
      var y = - Math.pow((n-hns)/hns,2) * thisHere.height;
    }
    return pj.geom.Point.mk(x,y);
  }
  var mp0 = this.origin.plus(pointN(0).times(-1));
  console.log(mp0.y);
  for (var i=0;i<=ns;i++) {
    var pnt = pointN(i).plus(mp0);
    points.push(pnt);
  }
  //this.BowedLine['stroke-width'] = this.strokeWidth;
  this.BowedLine.set("points",pj.svg.toSvgPoints(points));
}
pj.returnValue(undefined,item);

})()

/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|nonfunctional/lines1.js
*/
