
core.require(function () {

var item = dom.SvgElement.mk('<rect/>');

/* adjustable parameters */
item.dimension = 50;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/*end adjustable parameters*/

item.resizable = true;
item.role = 'vertex';
//A square plays the role of a vertex in graphs.



item.update =  function () {
  this.setDomAttribute('x',-0.5*this.dimension);
  this.setDomAttribute('y',-0.5*this.dimension);
}

/*
 Installs the functionality needed for management of arrows connected to the square;
 in particular, for dragging the arrow around so as to maintain the connection.
*/

graph.installRectanglePeripheryOps(item);

/*
When the square is swapped for some other shape,
this handles transferring the square's state to that new shape.
*/

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

return item;
});
