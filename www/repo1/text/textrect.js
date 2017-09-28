
'use strict';

pj.require('/text/textbox.js','/shape/rectangle.js','/shape/rectanglePeripheryOps.js',
function (textboxP,rectanglePP,peripheryOps) {
var item = textboxP.instantiate();
let boxP = pj.ui.installPrototype('rectangle',rectanglePP);
item.set('box',boxP.instantiate());
item.box.__unselectable = true;
item.box.__role = 'box';
item.__defaultSize = pj.geom.Point.mk(45,30);
item.multiline = false;
item.width = 45;
item.height = 30;
item.uiShowForBox();
peripheryOps.installOps(item);
return item;
});

