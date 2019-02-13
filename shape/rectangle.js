//okok

//This code implements the rectangle shape

core.require(function () {

var item = svg.Element.mk('<rect/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/*end adjustable parameters*/


item.resizable = true;
item.role = 'vertex';
//A rectangle plays the role of a vertex in graphs.


item.update =  function () {
  this.setDomAttribute('x',-0.5*this.width);
  this.setDomAttribute('y',-0.5*this.height);
}

/*
 Installs the functionality needed for management of arrows connected to the rectangle;
 in particular, for dragging the arrow around so as to maintain the connection.
*/

graph.installRectanglePeripheryOps(item);

/*
When the rectangle is swapped for some other shape,
this handles transferring the rectangle's state to that new shape.
*/

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

return item;
});
