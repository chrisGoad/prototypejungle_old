
'use strict';

pj.require('/text/textbox.js','/shape/rectangle.js',function (textboxP,rectangleP) {

var item = textboxP.instantiate();
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.width = 60;
item.height = 40;
item.uiShowForBox();
return item;
});

