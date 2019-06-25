//shaded circle

core.require('/shape/shadedCircle.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');
/*adjustable parameters  */
item.dimension = 35;
item.midpoint = 0.7;
item.midOpacity = 0.7;
item.finalOpacity = 1;
item.outerFill = 'rgb(50,50,100)';
item.innerFill = 'red';
item.stroke = 'transparent';
item['stroke-width'] = 1;
item.fx = 0.2;
item.fy = 0.2;
/* end adjustable parameters */

// properties to be transferred to the border */
item.set('borderProperties',core.lift(['midpoint','midOpacity','finalOpacity','stroke','stroke-width','innerFill','outerFill','fx','fy']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installCirclePeripheryOps(item);

item.setFieldType('innerFill','svg.Rgb');
item.setFieldType('outerFill','svg.Rgb');

return item;
});

