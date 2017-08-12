  
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
  var userName= fb.currentUserName();
  if (!userName) {
    return false;
  }
  var owner = pj.userNameOfUrl(url);
  return (userName===  owner);// || ((uid === 'twitter:14822695') && (owner === 'sys'));
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
     mpg.lightbox.dismiss();
    });
    noBut.$click(function () {
      mpg.lightbox.dismiss();
    });
}

var setYesNoText = function (text) {
  yesNoText.$html(text);
}

ui.confirm = function (text,yesF) {
  yesNoText.$html(text);
  afterYes = yesF;
  mpg.lightbox.pop();
}

window.addEventListener("beforeunload", function (event) {
  var msg = "There are unsaved changes. Are you sure you want to leave this page?";
  if (ui.fileModified && fb.currentUser) {
    event.returnValue = msg;
    return msg;
  }
});


ui.openStructureEditor = function () {
  debugger;
  var url = '/draw.html';
  if (ui.source && pj.endsIn(ui.source,'.js')) {
    url += '?source='+ui.source;
  }
  location.href = url;
}




ui.findPrototypeWithUrl = function (url){
  if (!pj.root.prototypes) {
    return undefined;
  }
  var rs = undefined;
  pj.forEachTreeProperty(pj.root.prototypes, function (itm,name) {
    if (itm.__sourceUrl === url) {
      rs = itm;
    }
  });
  return rs;
}

ui.stdTransferredProperties = ['stroke','stroke-width','fill','__unselectable','__role'];

ui.setTransferredProperties = function (item,props) {
  debugger;
  //var props = iprops.concat(['__transferredProperties']);
  item.set('__transferredProperties',pj.lift(props))
  return item;
}
