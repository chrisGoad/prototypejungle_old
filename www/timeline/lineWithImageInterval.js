
core.require('/timeline/interval.js','/container/horizontalBracket.js',function (intervalP,boxP) {



var item = intervalP.instantiate();
item.defaultSize = geom.Point.mk(150,100);

let box = item.set('box',boxP.instantiate());
box.fixedWidth = true;
box.fixedHeight = false;
box.textBelowImage = false;
box['font-size'] =14;

//box.width = 30; // width is set by this.defaultWidth in interval.js meaning common for all timelines
box.height = 70;
box.unselectable = true;

//ui.setTransferredProperties(item,ui.stdTransferredProperties);


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['dataXlb','dataXub'],own);
}

/*
item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
return item;

});
