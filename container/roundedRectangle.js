core.require('/shape/roundedRectangle.js','/container/textAndImage.js',function (borderPP,contentsPP) {

core.standsAlone('/shape/roundedRectangle.js');  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.width = 35;
item.height = 25;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/* end adjustable parameters */

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


item.controlPoints = function () {
  return this.border.controlPoints();
}

item.updateControlPoint = function (idx,pos) {
  this.border.updateControlPoint(idx,pos);
}

graph.installRectanglePeripheryOps(item);

return item;
});

