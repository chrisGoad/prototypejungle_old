
core.require('/timeline/interval.js','/image/rectangleWithImage.js',function (intervalP,boxP) {



var item = intervalP.instantiate();

let box = item.set('box',boxP.instantiate());
box.fixedWidth = true;
box.fixedHeight = false;
box.textBelowImage = false;
box['font-size'] =14;
//box.width = 30; // width is set by this.defaultWidth in interval.js meaning common for all timelines
box.height = 70;

//box.__unselectable = true;

//ui.setTransferredProperties(item,ui.stdTransferredProperties);


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['dataXlb','dataXub'],own);
  ui.setImageOf(this.box,src.box.image.href);
}


return item;

});
