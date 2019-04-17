// rectangleWithImage

core.require('/image/imageContainer.js','/border/decorated1.js',function (container,outlineP) {

alert('obsolete image/boxWithImage');

var item = container.instantiate();
let outline = outlineP.instantiate();
item.set('outline',outline);
item.outline.__setIndex = 1;  // outline needs to be in the backgound
//item.image.__setIndex =2;
item.outline.unselectable = true;
item.outline.role = 'outline';

graph.installRectanglePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

return item;

});
