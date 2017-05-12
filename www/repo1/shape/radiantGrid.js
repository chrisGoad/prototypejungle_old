// Arrow

'use strict';

pj.require('/shape/circle.js','/shape/radiant.js',function (CirclePP,RadiantPP) {

var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');
item.__dimension = 10;;
item.cellDimension = 200;
item.set("occupants",pj.Array.mk());
item.set('CircleP',CirclePP.instantiate().__hide());
item.CircleP.__dimension = item.cellDimension*0.4;

item.set('RadiantP',RadiantPP.instantiate().__hide());
item.RadiantP.__dimension = item.cellDimension*1.5;
item.RadiantP.numRays = 50;
var zeroPoint = geom.Point.mk(0,0);
item.update = function () {
  debugger;
   var i,j;
     if (this.occupants.length > 0) {
      return;
   }
   for (i=0;i<this.__dimension;i++) {
     for (j=0;j<this.__dimension;j++) {
       // if ((i+j === this.__dimension) || (i===j)) {
        // if ((i%2 === 0)  && (j%2 ===0)) {
         if (Math.random()>0.8) {
         var occupant = this.RadiantP.instantiate().__show();
        } else {
          occupant = this.CircleP.instantiate().__show();
        }
        occupant.update();
        this.occupants.push(occupant);
        occupant.__moveto(i*this.cellDimension,(Math.random()*0+j)*this.cellDimension);
     }
   }
}
 

return item;
});
//();
