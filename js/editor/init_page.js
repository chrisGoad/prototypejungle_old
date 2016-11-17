


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
    ui.genButtons(ui.ctopDiv.__element,{});
    //function () {
      $('body').css({"background-color":"#eeeeee"});
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
       var lb = lightbox.newLightbox(r);
      lb.box.$css({"padding-left":"20px"}); 
      mpg.set("lightbox",lb);
      mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
      mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
      mpg.set("textedit_lightbox",lightbox.newLightbox(r));
      if ((ui.whichPage === 'editor') && !pj.replaceableSpread) {
        ui.disableButton(ui.replaceBut);
      }
      ui.layout();
      if (ui.whichPage === 'code_editor') {
        pj.returnValue = function () {};
        if (ui.source) {
          pj.httpGet(ui.source,function (erm,rs) {
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
//    });
  }

var mainGetVars = {'source':true,'catalog':true,'intro':true,'data':true};

  function processQuery(iq) {
    var q = ui.parseQuerystring();
    //var itm = q.item;
    var intro = q.intro;
    ui.source = q.source;
    ui.dataUrl = q.data;
    ui.catalogUrl = catalog?catalog:'/catalog/default.catalog';
    var catalog = q.catalog;
   /* if (catalog) {
      ui.catalogUrl = pj.storageUrl(catalog);
    }
    if (q.config) {
      ui.configUrl = decodeURIComponent(q.config);
    }
    ui.addLegendOnStart = q.addLegend;
    */
    if (intro) {
      //ui.source = "http://prototypejungle.org/sys/repo3|example/bar_chart.js";
      ui.intro = true;
      ui.docDiv.src = "/doc/intro.html"; 
    } else {
      ui.docDiv.$hide();
    }
    var settings = {};
    for (var s in q) {
      if (!mainGetVars[q]) {
        settings[s] = q[s];
      }
    }
    ui.settings = settings;
    return;
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
  fb.setCurrentUser(function () {
    debugger;
    ui.inInspector = true;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = true;
    }
    ui.initFsel();
    ui.genMainPage(ui.afterPageGenerated);
  });
}
/*
  ui.installItem(ui.source,ui.dataUrl,undefined,function () {
    ui.initFsel();
    ui.genMainPage(ui.afterPageGenerated);
  });
}
*/
ui.fitFactor = 0.8;
ui.afterTheInstall = function () {
    var ue = ui.updateErrors && (ui.updateErrors.length > 0);
    var e = ui.installError;
    if (ue || (e  && (e !== "noUrl"))) {
      if (ue) {
        var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+pj.updateErrors[0]+'</i></p>';
       } else if (e) {
        var emsg = '<p style="font-weight:bold">'+e+'</p>';
      }
      //ui.errorInInstall = emsg;
      ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');                  
    }
    ui.installNewItem();
    ui.layout();
    if (ui.whichPage === 'code_editor') {
      ui.viewSource();
    }
    debugger;
    svg.main.fitContents(ui.fitFactor);
    ui.enableButtons();
    $(window).resize(function() {
      ui.layout();
      if (ui.fitMode) svg.main.fitContents();
    });
  }
ui.afterPageGenerated = function () {
  ui.installItem(ui.source,ui.dataUrl,undefined,ui.afterTheInstall);  
}

ui.catalogUrl = '/catalog/default.catalog';

  
    