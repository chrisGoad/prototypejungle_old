
'use strict';
core.require('/timeline/event.js','/text/rectangleWithText.js',function (eventP,boxP) {

let {ui,svg} = core;


var item = eventP.instantiate();
// when replacing outlines, what to use
item.set('__outlineMap',core.lift({roundedRectangle:'/timeline/roundedRectangleEvent.js'}));
let box = item.set('box',boxP.instantiate());
box.__fixedWidth = false;
box.__fixedHeight = false;
box.textBelowImage = true;
box['font-size'] =14;
//box.width = 30; // width is set by this.defaultWidth in interval.js meaning common for all timelines
//box.height = 70;
box.width = 70; // height is computed from the width when text is below
box.text = 'Text';
//box.height = 70;
//box.__unselectable = true;

//ui.setTransferredProperties(item,ui.stdTransferredProperties);

/*
item.__transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
return item;

});
