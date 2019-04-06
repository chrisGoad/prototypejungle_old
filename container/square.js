core.require('/shape/square.js','/container/textAndImage.js',function (borderPP,contentsPP) {

core.standsAlone('/shape/square.js');  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.dimension = 35;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/* end adjustable parameters */


// properties to be transferred to the border */
item.set('borderProperties',core.lift(['fill','stroke','stroke-width']));

item.role = 'vertex';
item.resizable = true;
item.text = '';


item.borderP = core.installPrototype('border',borderPP);
item.contentsP = core.installPrototype('contents',contentsPP);
contentsPP.installContainerMethods(item,borderPP,contentsPP);


item.update = function () {
  this.stdUpdate();
}

graph.installRectanglePeripheryOps(item);



return item;
});

