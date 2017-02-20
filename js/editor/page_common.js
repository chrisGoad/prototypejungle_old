  
  
 
var disableGray = "#aaaaaa";

var enableButton1 =function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

var enableButton = function (bt) {
  enableButton1(bt,true);
}

var disableButton = function (bt) {
  enableButton1(bt,false);
}

var setClickFunction = function (bt,fn) {
  bt.$click(function () {
    if (!bt.disabled) {
      fn();
    }
  });
}
 
function enableTreeClimbButtons() {
  var isc = tree.selectionHasChild();
  var isp = tree.selectionHasParent();
  ui.upBut.$show();
  ui.topBut.$show();
  ui.downBut.$show();
  enableButton1(ui.upBut,isp);
  enableButton1(ui.topBut,isp);
  enableButton1(ui.downBut,isc);
}

ui.enableTreeClimbButtons = enableTreeClimbButtons;

var activateTreeClimbButtons = function () {
setClickFunction(ui.topBut,function () {
  var top = tree.getParent(1);
  if (top) {
    top.__select('svg');
  }
  enableTreeClimbButtons();
});

setClickFunction(ui.upBut,function () {
  var pr = tree.getParent();
  if (pr) {
    pr.__select('svg');
  }
  enableTreeClimbButtons();
});


setClickFunction(ui.downBut,function () {
  tree.showChild();
  enableTreeClimbButtons();
});
}

 