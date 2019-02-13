
core.require('/timeline/event.js','/image/rectangleWithImage.js',function (eventP,boxP) {



var item = eventP.instantiate();
let box = item.set('box',boxP.instantiate());
box.fixedWidth = false;
box.fixedHeight = true;
box.textBelowImage = true;
box['font-size'] =14;
//box.width = 30; // width is set by this.defaultWidth in interval.js meaning common for all timelines
//box.height = 70;
box.width = 70; // height is computed from the width when text is below
//box.height = 70;
//box.unselectable = true;

//ui.setTransferredProperties(item,ui.stdTransferredProperties);

/*
item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
return item;

});
