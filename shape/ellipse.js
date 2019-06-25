// circle

core.require(function () {
let item =  svg.Element.mk('<ellipse cx="0" cy="0" />');

/* adjustable parameters */
item.width = 50;  
item.height = 30;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width']  = 1;
/* end adjustable parameters */

item.role = 'spot';
item.resizable = true;



item.update =  function () {
  this.setDomAttribute('rx',0.5*this.width);
  this.setDomAttribute('ry',0.5*this.height);
}


// used to compute where connections (eg arrows) terminate on this shape's periphery
graph.installRectanglePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

return item;
});

