//shaded circle

core.require('/shape/arcThing3.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');
/*adjustable parameters  */

/*adjustable parameters */
item.dimension = 30;
//item.segWidth = 30;
item.armWidth = 10;
item.gap =5;
item.circleRadiusFraction = 1.01;
item.circleFill = 'blue'
item.fill = 'black';
/*end adjustable parameters */


// properties to be transferred to the border */
item.set('borderProperties',core.lift(['dimension','armWidth','gap','circleFill','fill','circleRadiusFraction']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installCirclePeripheryOps(item);

item.setFieldType('fill','svg.Rgb');
item.setFieldType('circleFill','svg.Rgb');

return item;
});

