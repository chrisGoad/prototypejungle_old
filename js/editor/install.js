
var loadingItem = undefined;

ui.installItem = function (source,dataUrl,settings,cb)  {
  ui.afterInstall = cb;
  ui.dataUrl = dataUrl;
  ui.settings = settings;
  if (source) {
  //  pj.main(source,ui.afterMain);
  //} else if (item) {
    pj.install(source,ui.afterMain); 
  } else if (ui.afterInstall) {
    ui.afterInstall();
  }
}

ui.afterMain = function (e,rs) {
  debugger;
  if (e === "noUrl") {
    ui.installError = e;
    ui.afterDataAvailable();
  } else {
    ui.main = rs;
    if (ui.dataUrl) {
      ui.getData(ui.dataUrl,function (erm,data) {
        debugger;
        ui.data = data;
        ui.afterDataAvailable();
      });
    } else {
     ui.afterDataAvailable();
    }
  }
}
 
ui.afterDataAvailable = function () {
  debugger;
  if (!ui.error) {
    pj.root = ui.main;
    pj.ui.itemSource = loadingItem;
    var bkc = pj.root.backgroundColor;
    if (!bkc) {
      pj.root.backgroundColor="white";
    }
  }
  //ui.installNewItem();
  if (ui.afterInstall) {
    ui.afterInstall();
    //code
  }
}


  ui.installNewItem = function () {
    debugger;

    if (!pj.root) {
      pj.root = svg.Element.mk('<g/>');
    }
    var itm = pj.root;
    svg.main.addBackground(itm.backgroundColor);
    ui.initControlProto();
    var mn = svg.main;
    if (mn.contents) {
      dom.removeElement(mn.contents);
    }
    if (ui.dataUrl) {
      var erm = ui.setDataFromExternalSource(itm,ui.data,ui.dataUrl);
    }
    mn.contents=pj.root;
    if (itm.__draw) {
      itm.__draw(svg.main.__element); // update might need things to be in svg
    }
    if (itm.soloInit) { 
      itm.soloInit(); 
    }
    //ui.displayMessageInSvg('ZUB');
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

 ui.displayMessageInSvg = function (msg) {
    pj.root.__hide();
    ui.svgMessageDiv.$show();
    ui.svgMessageDiv.$html(msg);
    //ui.svgDiv.$html("<div style='text-align:center;width:100%;padding-top:20px;font-weight:bold'>"+msg+"</div>");
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
    //alert(msg);
    //ui.displayMessage(ui.messageElement,msg);

  }
  
  
ui.removeBracketsFromPath = function (path,addS,includeUid) {
  debugger;
  if (path[0] === '[') {
    var closeBracket = path.indexOf(']');
    var uid = path.substring(1,closeBracket);
    if (uid !== fb.currentUid()) { // opening files is supported only for the directory of the signed in user, so far
      pj.error('Not yet');
    }
    var rest = path.substring(closeBracket+(includeUid?1:2));
    var rs = (includeUid?uid:'')+(addS?'/s':'')+rest;
    return rs;
  } else {
    return path;
  }
}