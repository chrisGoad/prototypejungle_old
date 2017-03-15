++OBSOLETE++
// Arrow

'use strict';

pj.require('/shape/arrowP.js',function (arrowP) {

var item = arrowP.instantiate();

item.headInMiddle = false;

//item.buildLineHead();
//item.hideLineHeadInUI();

item.update = function () {
  debugger;
  this.updateCommon();
  //this.drawLineHead();
}

return item;
});

