// Arrow

'use strict';

pj.require('/shape/arrowP.js',function (arrowP) {

var item = arrowP.instantiate();

item.headInMiddle = true;

item.buildLineHead();
item.hideLineHeadInUI();

item.update = function () {
  this.updateCommon();
  this.drawLineHead();
}

return item;
});

