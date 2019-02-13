//okok
// circle

core.require(function () {
let item =  svg.Element.mk('<circle/>');

/* adjustable parameters */
item.dimension = 30; //either 
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width']  = 1;
/* end adjustable parameters */

// r can also be used for radius
Object.defineProperty(item,'r',{get() {return 0.5 * this.dimension},set(x) {this.dimension = 2 * x;}});
ui.hide(item,['r']);

item.role = 'spot';
item.resizable = true;


item.update =  () => {};

// used to compute where connections (eg arrows) terminate on this shape's periphery
graph.installCirclePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}


return item;
});

