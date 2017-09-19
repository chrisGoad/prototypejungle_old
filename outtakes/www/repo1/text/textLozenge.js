// Arrow

'use strict';

pj.require('/text/textbox.js','/shape/lozenge.js','/shape/lozengePeripheryOps.js',function (textboxP,lozengeP,peripheryOps) {

var item = textboxP.instantiate();
item.set('box',lozengeP.instantiate());
item.box.__unselectable = true;
item.__defaultSize = pj.geom.Point.mk(40,40);
peripheryOps.installOps(item);
item.cornerCurviness = 0.4;
item.set('boxProperties',pj.Array.mk(['cornerCurviness']));
//item.width = 60;
//item.height = 60;
item.uiShowForBox();
return item;
});

