
core.require('/timeline/shortInterval.js','/image/rectangleWithImage.js',function (intervalP,boxP) {



var item = intervalP.instantiate();
item.__defaultSize = geom.Point.mk(10,10);

let box = item.set('box',boxP.instantiate());
box.__fixedWidth = false;
box.__fixedHeight = true;
box.textBelowImage = true;
box['font-size'] =14;
box.width = 70;

//box.__unselectable = true;

//ui.setTransferredProperties(item,ui.stdTransferredProperties);


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['dataXlb','dataXub'],own);
  ui.setImageOf(this.box,src.box.image.href);
  //this.box.setImageOf(src.box.image.href);
}

  //this.box.set('image',src.box.image);



/*
item.__transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
return item;

});
