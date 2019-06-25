//shaded and crossed circle

core.require('/shape/arcThing2.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');
/*adjustable parameters  */

/*adjustable parameters */
item.dimension = 35;
//item.segWidth = 30;
item.armWidth = 5;
item.gap = 2.5;
item.circleRadiusFraction = 1.01;
item.fill = 'rgb(64,64,62)';
item.outerFill = 'black';
/*end adjustable parameters */


// properties to be transferred to the border */
item.set('borderProperties',core.lift(['dimension','armWidth','gap','outerFill','fill','circleRadiusFraction']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installCirclePeripheryOps(item);

item.setFieldType('fill','svg.Rgb');
item.setFieldType('outerFill','svg.Rgb');

return item;
});

