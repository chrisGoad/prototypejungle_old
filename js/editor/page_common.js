  
// things used by each of the editors (editor,code_editor,catalog_editor)
 
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
var fileIsOwned = function (url) {
   if (!url) {
    return false;
  }
  var uid = fb.currentUid();
  if (!uid) {
    return false;
  }
  var owner = pj.uidOfUrl(url);
  return (uid ===  owner) || ((uid === 'twitter:14822695') && (owner === 'sys'));
}
// if the current item has been loaded from an item file (in which case ui.itemSource will be defined),
// this checks whether it is owned by the current user, and, if so, returns its path
var ownedFilePath = function (url) {
  if (!fileIsOwned(url)) {
    return undefined;
  }
  return pj.pathOfUrl(url);
}


var afterYes;
var yesNoText;

var setupYesNo = function (itext) {
  var yesBut,noBut;
  var text = itext?itext:'';
    var yesNoButtons = html.Element.mk('<div/>').__addChildren([
       yesNoText = html.Element.mk('<div style="margin-bottom:20px;font-size:10pt">'+text+'</div>'),
       yesBut =  html.Element.mk('<div class="button">Yes</div>'),
       noBut =  html.Element.mk('<div class="button">No</div>')
      ]);
    mpg.lightbox.setContent(yesNoButtons);
    yesBut.$click(function () {
     afterYes();
    });
    noBut.$click(function () {
      mpg.lightbox.dismiss();
    });
}

var setYesNoText = function (text) {
  yesNoText.$html(text);
}

window.addEventListener("beforeunload", function (event) {
  var msg = "There are unsaved changes. Are you sure you want to leave this page?";
  if (ui.fileModified) {
    event.returnValue = msg;
    return msg;
  }
});