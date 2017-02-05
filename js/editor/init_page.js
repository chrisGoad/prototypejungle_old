


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
      enableButton(ui.upBut,false);
      enableButton(ui.topBut,false);
      enableButton(ui.downBut,false);
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
      //mpg.set("textedit_lightbox",lightbox.newLightbox(insertR));
     // if ((ui.whichPage === 'editor') && !pj.replaceableSpread) {
    //    disableButton(ui.replaceBut);
     // }
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
    var catalog = q.catalog;
    ui.catalogUrl = catalog?catalog:'[twitter:14822695]/forCatalog/default.catalog';//'/catalog/default.catalog';
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
      if (!mainGetVars[s]) {
        var qs = q[s];
        var nqs = Number(qs);
        settings[s] = isNaN(nqs)?qs:nqs;
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

var initFsel; // defined differently per page

ui.initPage = function (o) {
  fb.setCurrentUser(function () {
    ui.inInspector = true;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = true;
    }
    initFsel();
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

ui.afterPageGenerated = function () {
  ui.installMainItem(ui.source,ui.dataUrl);//,undefined,ui.afterTheInstall);  
}

//ui.catalogUrl = '/catalog/default.catalog';

  
    