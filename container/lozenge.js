//okok
core.require('/shape/lozenge.js','/container/textAndImage.js',function (borderPP,contentsPP) {

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.width = 35;
item.height = 35;
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

graph.installLozengePeripheryOps(item);


//ui.hide(item,['contents','border','text']);

return item;
});

