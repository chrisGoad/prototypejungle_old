
'use strict';

pj.require('/text/textbox.js','/shape/shadedCircle.js','/shape/circlePeripheryOps.js',
function (textboxP,circleP,peripheryOps) {
var item = textboxP.instantiate();
item.set('box',circleP.instantiate());
item.box.__unselectable = true;
item.__defaultSize = pj.geom.Point.mk(30,30);
item.__dimension = 30;
peripheryOps.installOps(item);
//item.uiShowForBox();
return item;
});

