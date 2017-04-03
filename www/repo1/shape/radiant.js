// Arrow

'use strict';

pj.require('/shape/line.js',function (LinePP) {

var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');
item.numRays = 20;
item.dimension = 200;
item.set("lines",pj.Array.mk());

item.set('LineP',LinePP.instantiate().__hide());

var zeroPoint = geom.Point.mk(0,0);
item.update = function () {
  debugger;
   var i;
   if (this.lines.length > 0) {
      return;
   }
   for (i=0;i<this.numRays;i++) {
      var ray = this.LineP.instantiate();
      var angle = 2*Math.PI*Math.random();
      var length = 0.25*this.dimension * (Math.random() + 1);
      var pnt = geom.Point.mk(Math.cos(angle),Math.sin(angle)).times(length);
      ray.setEnds(zeroPoint,pnt);
      ray.__show();
      this.lines.push(ray);
   }
}

return item;
});
//();
