core.require('/shape/ellipse.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */
item.width = 35;
item.height = 25;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/* end adjustable parameters */


// properties to be transferred to the border */
item.set('borderProperties',core.lift(['fill','stroke','stroke-width']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installRectanglePeripheryOps(item);

return item;
});

