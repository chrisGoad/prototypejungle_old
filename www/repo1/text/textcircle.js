
'use strict';

pj.require('/text/textbox.js','/shape/circle.js','/shape/circlePeripheryOps.js',
function (textboxP,circleP,peripheryOps) {
var item = textboxP.instantiate();
item.set('box',circleP.instantiate());
item.box.__unselectable = true;
item.__dimension = item.box.__dimension;
peripheryOps.installOps(item);

item.uiShowForBox();
return item;
});

