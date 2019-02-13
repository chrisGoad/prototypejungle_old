// Arrow

'use strict';

core.require('/shape/circle.js','/shape/radiant.js',function (CirclePP,RadiantPP) {

var svg = core.svg;
var ui = core.ui;
var geom =  core.geom;
var item = svg.Element.mk('<g/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');
item.__dimension = 10;;
item.cellDimension = 200;
item.set("occupants",core.Array.mk());
item.set('CircleP',CirclePP.instantiate().__hide());
item.CircleP.dimension = item.cellDimension*0.4;

item.set('RadiantP',RadiantPP.instantiate().__hide());
item.RadiantP.dimension = item.cellDimension*1.5;
item.RadiantP.numRays = 50;
var zeroPoint = geom.Point.mk(0,0);
item.update = function () {
   var i,j;
     if (this.occupants.length > 0) {
      return;
   }
   for (i=0;i<this.dimension;i++) {
     for (j=0;j<this.dimension;j++) {
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
