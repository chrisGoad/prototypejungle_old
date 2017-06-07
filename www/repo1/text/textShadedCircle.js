
'use strict';

pj.require('/text/textbox.js','/shape/shadedCircle.js','/shape/circlePeripheryOps.js',
function (textboxP,circleP,peripheryOps) {
var item = textboxP.instantiate();
item.set('box',circleP.instantiate());
item.box.__unselectable = true;
peripheryOps.installOps(item);
//item.uiShowForBox();
return item;
});

