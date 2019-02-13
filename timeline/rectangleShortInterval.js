
'use strict';
core.require('/timeline/shortInterval.js','/text/rectangleWithText.js',function (intervalP,boxP) {

let {ui,svg} = core;


var item = intervalP.instantiate();

let box = item.set('box',boxP.instantiate());
box.__fixedWidth = false;
box.__fixedHeight = false;
box['font-size'] =14;
box.width = 70;
box.text = 'Text';
//box.__unselectable = true;

//ui.setTransferredProperties(item,ui.stdTransferredProperties);

/*
item.__transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
return item;

});
