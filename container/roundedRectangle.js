core.require('/shape/roundedRectangle.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */
item.width = 35;
item.height = 25;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/* end adjustable parameters */

item.set('borderProperties',core.lift(['fill','stroke','stroke-width']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

item.controlPoints = function () {
  return this.border.controlPoints();
}

item.updateControlPoint = function (idx,pos) {
  this.border.updateControlPoint(idx,pos);
}

graph.installRectanglePeripheryOps(item);

return item;
});

