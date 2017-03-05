  
  
 
var disableGray = "#aaaaaa";

var enableButton1 =function (bt,vl) {
  bt.disabled = !vl;
  bt.$css({color:vl?"black":disableGray});
}

var enableButton = function (bt,vl) {
  if (arguments.length === 1) {
    enableButton1(bt,true);
  } else {
    enableButton1(bt,vl);
  }
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
var fileIsOwned = function (url) {
   if (!url) {
    return false;
  }
  var uid = fb.currentUid();
  if (!uid) {
    return false;
  }
  var owner = pj.uidOfUrl(url);
  return uid ===  owner;
}
// if the current item has been loaded from an item file (in which case ui.itemSource will be defined),
// this checks whether it is owned by the current user, and, if so, returns its path
var ownedFilePath = function (url) {
  if (!fileIsOwned(url)) {
    return undefined;
  }
  return pj.pathOfUrl(url);
}



 