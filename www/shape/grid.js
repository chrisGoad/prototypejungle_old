// Arrow

'use strict';

core.require(function () {

var svg = core.svg;
var ui = core.ui;
var geom =  core.geom;
var item = svg.Element.mk('<g/>');
item.rows= 10;
item.cols = 10;
item.spacing = 200;
item.set("occupants",core.Array.mk());

item.update = function () {
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
