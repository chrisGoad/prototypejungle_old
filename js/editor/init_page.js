



ui.openCatalogEditor = function () {
  var url = '/catalog.html?source='+ui.catalogUrl;
  if (ui.mainUrl) {
    url += '&view='+ui.mainUrl;
  }
  location.href = url;
}


ui.genButtons = function (container,options,cb) {
  var addEditorButtons = function () {
    //var diagramsButton =   ui.addButton(container,'Diagram','Make a New Diagram','/diagrams.html');
    if (ui.source) {
      var structureEditorButton = ui.addButton(container,'structureEditor','Edit Structure');
      structureEditorButton.addEventListener('click',ui.openStructureEditor);
    }
    var catalogEditorButton = ui.addButton(container,'catalogEditor','Catalog');
    catalogEditorButton.addEventListener('click',ui.openCatalogEditor);

  }
  if (ui.whichPage === 'structure_editor') {
    var codeEditorButton = ui.addButton(container,'codeEditor','Code');//,'/code.html');
    codeEditorButton.addEventListener('click',ui.openCodeEditor);
  } else {
    addEditorButtons();
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
  ui.svgDiv.__element.draggable = true;
  svg.main.activateInspectorListeners();
  svg.main.addButtons("View");
  pj.root = svg.Element.mk('<g/>'); // to be replaced by incoming item, usually
  svg.main.contents=pj.root;
  pj.root.__sourceUrl = ui.source;
  $('.mainTitle').click(function () {
    location.href = "http://prototypejungle.org";
  });
  if (ui.upBut) {
    disableButton(ui.upBut);
    enableButton(ui.topBut);
    disableButton(ui.downBut);
  }
  ui.genButtons(ui.ctopDiv.__element,{});
    $('body').css({"background-color":"#eeeeee"});
    var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
    var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
    mpg.set("lightbox",lightbox.newLightbox(r)).box.$css({"padding-left":"20px"});
    mpg.set("alert_lightbox",lightbox.newLightbox(r)).box.$css({"padding-left":"20px"});
    mpg.set("confirm_lightbox",lightbox.newLightbox(r)).box.$css({"padding-left":"20px"});
    mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
    mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
    mpg.set("textedit_lightbox",lightbox.newLightbox(r));
    setupYesNo();
    if ((ui.whichPage === 'structure_editor') &&   ui.blankPage){
      ui.popInserts();
    }
    ui.layout();
    if (ui.whichPage === 'code_editor') {
      pj.returnValue = function () {};
      if (ui.source) {
        pj.httpGet(ui.source,function (erm,rs) {
          cb();
       });
      } else {
        cb();
      }
    } else {
      cb();
    }
   
}

var mainGetVars = {'source':true,'catalog':true,'intro':true,'data':true};

function processQuery(iq) {
  var q = ui.parseQuerystring();
  var intro = q.intro;
  ui.source = q.source;
  if (ui.source) {
    ui.source = fb.handleTwiddle(ui.source);
    ui.sourceFile = pj.afterLastChar(ui.source,'/');
    ui.blankPage = ui.source === '/diagram/backGraph.js';
  } else {
    ui.blankPage = true;
  }
  if (q.fit) {
    ui.fitFactor = Number(q.fit);
  }
  //ui.dataUrl = q.data;
  ui.catalogUrl = q.catalog;
  if (ui.catalogUrl) {
    ui.catalogUrl = fb.handleTwiddle(ui.catalogUrl);
  }
  var catalogExtension = q.extension;
  if (catalogExtension) {
    ui.catalogExtensionUrl = fb.handleTwiddle(catalogExtension);
  } 
  if (ui.docDiv) {
    if (intro) {
      ui.intro = true;
      ui.docDiv.src = "/intro/"+intro+".html"; 
    } else {
      ui.docDiv.$hide();
    }
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
    svg.fitStdExtent = (ui.whichPage === 'structure_editor') && !(ui.source);
    if (ui.whichPage === 'code_editor') {
      debugger;
      ui.genMainPage(function () {
          var userName = fb.currentUserName();
          if (!ui.catalogUrl) {
            ui.catalogUrl = (userName && (userName !== 'sys'))?'('+userName+')/default.catalog':'(sys)/global.catalog';
          }
          ui.afterPageGenerated();
          ui.catalogUrlEl.$html('<b>Catalog:</b> '+ui.catalogUrl);
          ui.loadCatalog();
      });
    } else {
      if (!ui.catalogUrl) {
        ui.catalogUrl = '(sys)/global.catalog';
      }
      ui.genMainPage(ui.afterPageGenerated);
    }
  });
}

ui.afterPageGenerated = function () {
 
  if (ui.sourceFile  && ui.fileDisplay) {
    ui.fileDisplay.$html(ui.sourceFile);
  }
  ui.installMainItem(ui.source,ui.dataUrl);
}


  
    