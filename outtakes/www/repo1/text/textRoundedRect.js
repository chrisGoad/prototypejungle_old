// Arrow

'use strict';

pj.require('/text/textbox.js','/shape/roundedRectangle.js','/shape/rectanglePeripheryOps.js',
function (textboxP,rectangleP,peripheryOps) {

var item = textboxP.instantiate();
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.__defaultSize = pj.geom.Point.mk(45,30);
peripheryOps.installOps(item);

//item.width = 60;
//item.height = 40;
item.uiShowForBox();
return item;
});

