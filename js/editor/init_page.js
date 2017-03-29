


ui.genButtons = function (container,options,cb) {
  ui.addButton(container,'tutorial','Intro ','/edit.html?source=/diagram/cayleyD3.js&intro=intro');
  if (ui.whichPage === 'structure_editor') {
    var codeEditorButton = ui.addButton(container,'codeEditor','Code Editor');//,'/code.html');
    codeEditorButton.addEventListener('click',ui.openCodeEditor);
  } else {
    var structureEditorButton = ui.addButton(container,'editor','Structure Editor');//,'/edit.html');
    structureEditorButton.addEventListener('click',ui.openStructureEditor);
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
    disableButton(ui.topBut);
    disableButton(ui.downBut);
  }
  ui.genButtons(ui.ctopDiv.__element,{});
    $('body').css({"background-color":"#eeeeee"});
    var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
    var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
     var lb = lightbox.newLightbox(r);
    lb.box.$css({"padding-left":"20px"}); 
    mpg.set("lightbox",lb);
    mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
    mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
    mpg.set("textedit_lightbox",lightbox.newLightbox(r));
    setupYesNo();
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
    ui.sourceFile = pj.afterLastChar(ui.source,'/');
  }
  ui.dataUrl = q.data;
  var catalog = q.catalog;
  var catalogExtension = q.catalogExtension;
  if (catalogExtension) {
    ui.catalogUrl = catalog?catalog:ui.defaultCatalog;
    ui.catalogExtensionUrl = catalogExtension;
  } else {
    ui.catalogUrl = catalog?catalog:ui.defaultCatalog;
  }
  if (intro) {
    ui.intro = true;
    ui.docDiv.src = "/doc/"+intro+".html"; 
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

ui.afterPageGenerated = function () {
  if (ui.sourceFile  && ui.fileDisplay) {
    ui.fileDisplay.$html(ui.sourceFile);
  }
  ui.installMainItem(ui.source,ui.dataUrl);//,undefined,ui.afterTheInstall);  
}


  
    