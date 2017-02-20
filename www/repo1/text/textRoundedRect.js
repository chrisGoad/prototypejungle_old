// Arrow

'use strict';

pj.require('/text/textbox.js','/shape/roundedRectangle.js',function (textboxP,rectangleP) {

var item = textboxP.instantiate();
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.uiShowForBox();
return item;
});

