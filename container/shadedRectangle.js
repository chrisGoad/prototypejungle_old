
core.require('/shape/shadedRectangle.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.cornerRadiusFraction = 0.3;
item.stroke = 'black';
item['stroke-width'] = .1;
item.outerFill = 'rgb(100,100,240)';
item.innerFill = 'white';
/*end  adjustable parameters */

item.fill = 'transparent';

// properties to be transferred to the border */
item.set('borderProperties',core.lift(['cornerRadiusFraction','stroke','stroke-width','innerFill','outerFill']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installRectanglePeripheryOps(item);

item.setFieldType('innerFill','svg.Rgb');
item.setFieldType('outerFill','svg.Rgb');

return item;
});

