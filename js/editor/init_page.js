


ui.genButtons = function (container,options,cb) {
  ui.addButton(container,'tutorial','Intro ','/edit.html?source=/repo1/startchart/column.js&intro=1');
  if (ui.whichPage === 'structure_editor') {
    ui.addButton(container,'codeEditor','Code Editor','/code.html');
  } else {
    ui.addButton(container,'editor','Structure Editor','/edit.html');
  }
  ui.genStdButtons(container,cb);
}

 ui.genMainPage = function (cb) {
    if (pj.mainPage) return;
    pj.mainPage = mpg;
    if (ui.includeDoc) {
      mpg.addChild("doc",ui.docDiv);
    }
    ui.mpg.__addToDom(); 
    svg.main = svg.Root.mk(ui.svgDiv.__element);
    svg.main.activateInspectorListeners();
    svg.main.addButtons("View");
    pj.root = svg.Element.mk('<g/>'); // to be replaced by incoming item, usually
    svg.main.contents=pj.root;
    pj.root.__sourceUrl = ui.source;
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
    if (ui.upBut) {
      ui.enableButton(ui.upBut,false);
      ui.enableButton(ui.topBut,false);
      ui.enableButton(ui.downBut,false);
    }
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
      $('body').css({"background-color":"#eeeeee"});
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
       var lb = lightbox.newLightbox(r);
      lb.box.$css({"padding-left":"20px"}); 
      mpg.set("lightbox",lb);
      mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
      mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
      mpg.set("textedit_lightbox",lightbox.newLightbox(r));
      if (!pj.replaceableSpread) {
        ui.disableButton(ui.replaceBut);
      }
      ui.layout();
      if (ui.whichPage === 'code_editor') {
        pj.returnValue = function () {};
        if (ui.source) {
          pj.httpGet(ui.source,function (erm,rs) {
            debugger;
            //ui.viewSource();
            cb();
         });
        } else {
          cb();
        }
      } else {
        cb();
      }
      return;
      //if (!pj.data.findDataSource()) {
      //  ui.disableButton(ui.viewDataBut);
      //}
      /*
      var htl = ui.hasTitleLegend();
      fsel.disabled.addLegend = ui.legendAdded || !(htl.hasTitle || htl.hasLegend);
      */
      debugger;
      if (typeof(pj.root) == "string") {
        ui.editButDiv.$hide();
        ui.editMsg.$hide();
        if (pj.root === "missing") {
          var msg = "404 No Such Item"
        } else {
          msg = "Load failed ";
        }
        ui.svgDiv.setHtml("<div style='padding:100px;font-weight:bold'>"+msg+"</div>");
        pj.root = pj.mkRoot();
      } else {
        cb();
      }
    });
  }


  function processQuery(iq) {
    var q = ui.parseQuerystring();
    var itm = q.item;
    var intro = q.intro;
    var source = q.source;
    var catalog = q.catalog;
    ui.dataUrl = q.data;
    if (source) {
      //if (source[0] === '[') {  // of the form [uid]/path
      ui.source = source;//pj.storageUrl(source);
      //} else {
      //  ui.source = decodeURIComponent(q.source);
      //}
    }
    ui.catalogUrl = '/catalog/default.catalog';
    if (catalog) {
      ui.catalogUrl = pj.storageUrl(catalog);
    }
    if (q.config) {
      ui.configUrl = decodeURIComponent(q.config);
    }
    ui.addLegendOnStart = q.addLegend;
    if (intro) {
      //ui.source = "http://prototypejungle.org/sys/repo3|example/bar_chart.js";
      ui.intro = true;
      ui.docDiv.src = "/doc/intro.html"; 
    } else {
      ui.docDiv.$hide();
    }
    if (itm) {
      //var itms = itm.split("|");
      //pj.repo = itms[0];//"http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      ui.item = itm;
      pj.path = itm;//itms[1];//itms.slice(3).join("/")
      loadingItem = itm;
    } else {
      pj.repo=q.repo;
      pj.path=q.path?pj.stripInitialSlash(q.path):undefined;
    }
    //if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
    //  pj.urlMap = undefined;
    //  pj.inverseUrlMap = undefined;
    //}
    if (!pj.path) {
      return false;
    }
    var psp = pj.path.split("/");
    var pln = psp.length;
    ui.itmName = psp[pln-2];
    ui.handle = psp[1];
    ui.url = pj.path; //pj.repo+"/"+pj.path;
    ui.includeDoc = q.intro;
    return true; 
  }  
  
ui.initPage = function (o) {
 
  ui.inInspector = true;
  var q = ui.parseQuerystring();
  if (!processQuery(q)) {
    var noUrl = true;
  }
  //installItem(ui.source,ui.dataUrl,undefined,function () {
  ui.initFsel();
  ui.genMainPage(ui.afterPageGenerated);
}
/*
  ui.installItem(ui.source,ui.dataUrl,undefined,function () {
    ui.initFsel();
    ui.genMainPage(ui.afterPageGenerated);
  });
}
*/
ui.afterTheInstall = function () {
    debugger;
    var ue = ui.updateErrors && (ui.updateErrors.length > 0);
    var e = ui.installError;
    if (ue || (e  && (e !== "noUrl"))) {
      if (ue) {
        var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+pj.updateErrors[0]+'</i></p>';
       } else if (e) {
        var emsg = '<p style="font-weight:bold">'+e.message+'</p>';
      }
      ui.errorInInstall = emsg;
      ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');                  
    }
    ui.installNewItem();
    ui.layout();
    if (ui.whichPage === 'code_editor') {
      ui.viewSource();
    }
    $(window).resize(function() {
      ui.layout();
      if (ui.fitMode) svg.main.fitContents();
    });
  }
ui.afterPageGenerated = function () {
  debugger;
  ui.installItem(ui.source,ui.dataUrl,undefined,ui.afterTheInstall);  
}

ui.catalogUrl = '/catalog/default.catalog';

  
    