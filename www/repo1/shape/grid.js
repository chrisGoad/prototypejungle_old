// Arrow

'use strict';

pj.require(function () {

var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');// x1="0" y1="0" x2="500" y2="50" stroke="black" stroke-width="2"/>');
item.rows= 10;
item.cols = 10;
item.spacing = 200;
item.set("occupants",pj.Array.mk());

item.update = function () {
  debugger;
   var i,j;
     if (this.occupants.length > 0) {
      return;
   }
   for (i=0;i<this.rows;i++) {
     for (j=0;j<this.cols;j++) {
       // if ((i+j === this.dimension) || (i===j)) {
        // if ((i%2 === 0)  && (j%2 ===0)) {
         var occupant = this.occupantP.instantiate().__show();
        occupant.update();
        this.occupants.push(occupant);
        occupant.__moveto(i*this.spacing,j*this.spacing);
     }
   }
}
 

return item;
});
//();
