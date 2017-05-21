
var loadingItem = undefined;

ui.installMainItem = function (source,dataUrl,settings,cb)  {
  ui.mainUrl = source;
  ui.dataUrl = dataUrl;
  if (settings) {
    ui.settings = settings;
  }
  if (source) {
    pj.install(source,ui.afterMainInstall); 
  } else  {
    ui.finishMainInstall();
  }
}

ui.afterMainInstall = function (e,rs) {
  if (e) {
    ui.installError = e;
    ui.finishMainInstall();;
  } else {
    delete rs.__sourceUrl;
    ui.main = rs;
    ui.finishMainInstall();
  }
}

var setBackgroundColor = function (item) {
  debugger;
      if (!item.backgroundColor) {
        item.backgroundColor="white";
      }
   if (!item.__nonRevertable) {
     pj.root.set('__nonRevertable',pj.lift({backgroundColor:1}));
   }
}

ui.installAsSvgContents= function (itm) {
  ui.initControlProto();
  var mn = svg.main;
  if (mn.contents) {
    dom.removeElement(mn.contents);
  }
  mn.contents=itm;
  svg.draw();
}

ui.svgInstall = function () {
  var atTopLevel = ui.mainUrl && pj.endsIn(ui.mainUrl,'.item');
  if (ui.main && atTopLevel) {
    pj.root = ui.main;
  } else if (!pj.root) {
    pj.root = svg.Element.mk('<g/>');
  }

  setBackgroundColor(pj.root);
  var itm = ui.main?ui.main:pj.root;//pj.root;
  svg.main.addBackground(pj.root.backgroundColor);
  ui.installAsSvgContents(pj.root);
  if (ui.main && !atTopLevel) {
    pj.root.set('main',ui.main);
  }
  debugger;
  ui.graph = ui.findGraph(); 
  if (ui.dataUrl) {
    var erm = ui.setDataFromExternalSource(itm,ui.data,ui.dataUrl);
  } else {
    pj.updateRoot(function (node) {
      return !node.__hidden()
    });
  }
  if (pj.root.__draw) {
    pj.root.__draw(svg.main.__element); // update might need things to be in svg
  }
  if (itm.soloInit) { 
    itm.soloInit(); 
  }
  if (!pj.throwOnError) {
    ui.refresh(ui.fitMode);
  } else {
    try {
      ui.refresh(ui.fitMode);
  } catch (e) {
    ui.handleError(e);
  }
}
}

var enableButtons; //defined differently for different pages
ui.fitFactor = 0.8;
ui.findGraph = function () {
  var graphP = pj.installedItems['/diagram/graph2.js'];
  if (!graphP) {
    return undefined;
  }
  var graph =  pj.findDescendant(pj.root,function (node) {
    var rs = graphP.isPrototypeOf(node);
    return rs;
  });
  if (graph) {
    ui.installArrow();
  }
  return graph;
}

ui.finishMainInstall = function () {
  debugger;
  var ue = ui.updateErrors && (ui.updateErrors.length > 0);
  var e = ui.installError;
  if (ue || (e  && (e !== "noUrl"))) {
    if (ue) {
      var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+pj.updateErrors[0]+'</i></p>';
     } else if (e) {
      var emsg = '<p style="font-weight:bold">'+e+'</p>';
    }
    ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');                  
  }
  if (!ui.installError) {
    pj.ui.itemSource = loadingItem;
  }

  ui.svgInstall();
  debugger;
  ui.layout();
  if (ui.fitMode) svg.main.fitContents(ui.fitFactor);
  if (ui.whichPage === 'code_editor') {
    ui.viewSource();
  } else if (ui.whichPage === 'structure_editor') {
      tree.showItemAndChain(pj.root,'auto',true);// true -> noSelect
  }
  enableButtons();
  $(window).resize(function() {
    ui.layout();
   if (ui.fitMode) svg.main.fitContents();
  });
}

ui.displayMessageInSvg = function (msg) {
  pj.root.__hide();
  ui.svgMessageDiv.$show();
  ui.svgMessageDiv.$html(msg);
}

function displayDone(el,afterMsg) {
 ui.displayMessage(el,"Done");
 setTimeout(function () {
   ui.displayMessage(el,afterMsg?afterMsg:"");
 },500);
}

 ui.clearError = function () {
   pj.root.__show();
   ui.svgMessageDiv.$hide();
 }

ui.handleError = function (e) {
  debugger;
  if (pj.throwOnError) {
    var msg;
    if (e.kind === pj.data.badDataErrorKind) {
      msg = e.message;
    } else {
      msg = 'Unknown error in update';
    } 
    ui.displayMessageInSvg(msg);
  } else {
    pj.error(e.message);
  }
}
  