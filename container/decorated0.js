
core.require('/box/decorated0.js','/container/textAndImage.js',function (borderPP,contentsPP) {

core.standsAlone('/box/decorated0.js');  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.width = 35;
item.height = 35;
item.stroke = 'black';
item['stroke-width'] = 2;
item.fill = 'transparent';
/* end adjustable parameters */

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

