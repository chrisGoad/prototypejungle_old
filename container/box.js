
core.require('/box/basic.js','/container/textAndImage.js',function (borderPP,contentsPP) {

core.standsAlone('/box/basic.js');  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */
item.width = 40;
item.height = 30;
item.extraRight = 15;
item.extraLeft = 5;
item.stroke = 'black';
item['stroke-width'] = 2;
item.fill = 'transparent';
item.cornerOffset = 0;
/* end adjustable parameters */

item.set('borderProperties',core.lift(['extraRight','extraLeft','cornerOffset']));

contentsPP.installContainerMethods(item,borderPP,contentsPP);

graph.installRectanglePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

ui.hide(item,['containerPropertiesShown','border']);

return item;
});

