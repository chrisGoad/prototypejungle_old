
'use strict';

pj.require('/text/textbox.js','/shape/shadedCircle.js',function (textboxP,circleP) {

var item = textboxP.instantiate();
item.set('box',circleP.instantiate());
item.box.__unselectable = true;
item.uiShowForBox();
return item;
});

