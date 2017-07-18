
'use strict';

pj.require('/text/textbox.js','/shape/horizontalBar.js','/shape/rectanglePeripheryOps.js',
function (textboxP,barP,peripheryOps) {
var item = textboxP.instantiate();
item.set('box',barP.instantiate());
item.dataLB = 'none';
item.dataUB = 'none';
item.box.__unselectable = true;
item.__defaultSize = pj.geom.Point.mk(45,30);

//item.width = 60;
//item.height = 40;
item.uiShowForBox();
peripheryOps.installOps(item);

return item;
});

