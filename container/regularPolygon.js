//regular polygon

core.require('/shape/regularPolygon.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */
item.dimension = 35;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
item.numberOfSides = 6;          //Number of sides
item.theta = 0;                 //Tilt angle of polygon, degrees
/* end adjustable parameters */

// properties to be transferred to the border */
item.set('borderProperties',core.lift(['numberOfSides','theta']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installCirclePeripheryOps(item);

return item;
});

