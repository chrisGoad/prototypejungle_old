
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
    ui.afterDataAvailable();
  }
}

ui.afterMainInstall = function (e,rs) {
  if (e) {
    ui.installError = e;
    pj.root = svg.Element.mk('<g/>');
    ui.afterDataAvailable();
  } else {
    delete rs.__sourceUrl;
    ui.main = rs;
    if (ui.dataUrl) {
      ui.getData(ui.dataUrl,function (erm,data) {
        ui.data = data;
        ui.afterDataAvailable();
      });
    } else {
     ui.afterDataAvailable();
    }
  }
}
 
ui.afterDataAvailable = function () {
  if (!ui.installError) { 
    pj.root = svg.Element.mk('<g/>');
    //pj.root.set("main",ui.main);
    if (ui.main && ui.settings) {
      ui.main.set(ui.settings);
    }
    pj.ui.itemSource = loadingItem;
    var bkc = pj.root.backgroundColor;
    if (!bkc) {
      pj.root.backgroundColor="white";
    }
  }
  ui.finishMainInstall();
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
  var itm = ui.main?ui.main:pj.root;//pj.root;
  svg.main.addBackground(pj.root.backgroundColor);
  ui.installAsSvgContents(pj.root);
  if (ui.main && !atTopLevel) {
    pj.root.set('main',ui.main);
  }
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

ui.finishMainInstall = function () {
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
  ui.svgInstall();
  ui.layout();
  if (ui.whichPage === 'code_editor') {
    ui.viewSource();
  }
  svg.main.fitContents(ui.fitFactor);
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
  