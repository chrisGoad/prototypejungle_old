//okok
core.require('/box/decorated1.js','/container/textAndImage.js',function (borderPP,contentsPP) {


core.standsAlone('/box/decorated1.js');  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */

item.width = 35;
item.height = 35;
item.horizontalInset = 5;
item.verticalInset = 5;
item.topPadding = 5;
item.vSep = 5; // between image and text
item.bottomPadding = 5;
item.sidePadding = 5;
item.lineSep = 5;

/* end adjustable parameters */

item.role = 'vertex';
item.resizable = true;
item.text = '';

item.set('borderProperties',core.lift(['horizontalInset','verticalInset']));

item.borderP = core.installPrototype('border',borderPP);
item.contentsP = core.installPrototype('contents',contentsPP);
contentsPP.installContainerMethods(item,borderPP,contentsPP);

item.update = function () {
  this.stdUpdate();
}

graph.installRectanglePeripheryOps(item);
/*
item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['text'],own);
  if (own) {
    let im = src.__get('image');
    if (im) {
     dom.removeElement(im);
     this.set('image',im);
    }
  }
}
*/
return item;
});

