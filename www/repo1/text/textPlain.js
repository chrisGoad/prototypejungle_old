
'use strict';

pj.require('/text/textbox.js','/shape/rectanglePeripheryOps.js',
function (textboxP,peripheryOps) {var item = textboxP.instantiate();
item.__defaultSize = pj.geom.Point.mk(45,30);
peripheryOps.installOps(item);
return item;
});

