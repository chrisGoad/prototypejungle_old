
core.require('/shape/shadedCircle.js','/container/textAndImage.js',function (borderPP,contentsPP) {

core.standsAlone('/shape/shadedCircle.js');  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.dimension = 35;
item.shadeStart = 10;
item.shadeOpacity = 0.5;
item.outerFill = 'black';
item.innerFill = 'red';
item.stroke = 'black';
item['stroke-width'] = 1;
/* end adjustable parameters */


// properties to be transferred to the border */
item.set('borderProperties',core.lift(['stroke','stroke-width','shadeStart','shadeOpacity','innerFill','outerFill']));

item.role = 'vertex';
item.resizable = true;
item.text = '';


item.borderP = core.installPrototype('border',borderPP);
item.contentsP = core.installPrototype('contents',contentsPP);
contentsPP.installContainerMethods(item,borderPP,contentsPP);


item.update = function () {
  this.stdUpdate();
}

graph.installCirclePeripheryOps(item);

item.setFieldType('innerFill','svg.Rgb');
item.setFieldType('outerFill','svg.Rgb');
//ui.hide(item,['contents','border','text']);

return item;
});

