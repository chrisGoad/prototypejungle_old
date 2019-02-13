//okok
core.require('/box/basic.js','/container/textAndImage.js',function (borderPP,contentsPP) {

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

item.role = 'vertex';
item.resizable = true;
item.text = '';
item.set('borderProperties',['extraRight','extraLeft','cornerOffset']);

item.borderP = core.installPrototype('border',borderPP);
item.contentsP = core.installPrototype('contents',contentsPP);
contentsPP.installContainerMethods(item,borderPP,contentsPP);

item.update = function () {
  this.stdUpdate();
}

graph.installRectanglePeripheryOps(item);
/*
item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
//ui.hide(item,['contents','border','text']);

return item;
});

