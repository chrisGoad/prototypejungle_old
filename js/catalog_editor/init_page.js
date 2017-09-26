
  var mpg = ui.mpg;
 
  ui.displayMessageInSvg = function (msg) {
    pj.root.__hide();
    ui.svgMessageDiv.$show();
    ui.svgMessageDiv.$html(msg);
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
  
  
ui.genButtons = function (container,options) {
  ui.addButton(container,'stateEditor','Draw','/draw.html');
  ui.addButton(container,'codeEditor','Code','/code.html');
  ui.genStdButtons(container);
}
  
  ui.genMainPage = function (cb) {
    if (pj.mainPage) return;
    pj.mainPage = mpg;
    ui.mpg.__addToDom();   
    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
    ui.genButtons(ui.ctopDiv.__element,{});
    //function () {
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
      mpg.set("lightbox",lightbox.newLightbox(r)).box.$css({"padding-left":"20px"});
      mpg.set("alert_lightbox",lightbox.newLightbox(r)).box.$css({"padding-left":"20px"});
      mpg.set("confirm_lightbox",lightbox.newLightbox(r)).box.$css({"padding-left":"20px"});
      mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
      $('body').css({"background-color":"#eeeeee"});
  
      cb();
 //   });
  }
    
 var loadingItem = undefined;
  // set some vars in ui. from the query
  
 
ui.initPage = function (o) {
  fb.setCurrentUser(function () {
    var q = ui.parseQuerystring();
    if (q.source) {
      ui.source = fb.handleTwiddle(q.source);
    }
    if (q.add) {
      ui.addUrl = q.add;
    }
    if (q.view) {
      ui.viewUrl = q.view;
    }
    if (q.catalog) {
      ui.source = fb.handleTwiddle(q.catalog);
    }
    ui.initFsel();
    ui.genMainPage(function () {
      ui.layout();
      setSaved(true);
      setupYesNo();  
      $(window).resize(function() {
        ui.layout();
       });
      if (!ui.source) {
         var userName = fb.currentUserName();
         ui.source = (userName && (userName !== 'sys'))?'('+userName+')/default.catalog':'(sys)/global.catalog';
      }
       ui.showCatalog(ui.source,function () {
        debugger;
         if (ui.addUrl) {
          ui.addNewEntry(ui.addUrl);
         } else if (ui.viewUrl) {
          ui.viewEntry(ui.viewUrl);
          //code
         }
        ui.displayMessage(ui.catalogMsg,'Current catalog: '+pj.ui.source+'<br>(click on left panel to select)');

         
       });
    });
    
  });
}




