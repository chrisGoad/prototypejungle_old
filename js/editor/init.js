(function (pj) {
  "use strict"
   
   var ui = pj.ui;
  var dom = pj.dom;
  var geom = pj.geom;
  var svg = pj.svg;
  var html = pj.html;
  var tree = pj.tree;
  var lightbox = pj.lightbox;
  //var page = pj.page;
  var dat = pj.dat;
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract
/*
  ui.messageCallbacks.insertChart = function (v) {
    debugger;
  }
  */
  var mpg = ui.mpg;
  /*
   ui.checkSignedIn = function (cb) {
    ui.currentUser = firebase.auth().currentUser;
    ui.setSignInOutButtons();
  }
    */
  ui.processIncomingItem = function (rs,cb) {
    pj.root = rs;
    pj.replaceableSpread = pj.descendantWithProperty(pj.root,'replacements');
    //rs.__sourceRepo = pj.repo;
    //rs.__sourcePath = pj.path;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
    if (cb) {
      cb(undefined,rs);
    }
  }
  
  ui.installNewItem = function () {
    var itm = pj.root;
    svg.main.addBackground(pj.root.backgroundColor);
    var mn = svg.main;
    if (mn.contents) {
      dom.removeElement(mn.contents);
    }
    mn.contents=pj.root;
    if (itm.__draw) {
      itm.__draw(svg.main.__element); // update might need things to be in svg
    }
    if (itm.soloInit) { 
      itm.soloInit(); 
    }
    ui.refresh(ui.fitMode);
  }


function displayDone(el,afterMsg) {
  ui.displayMessage(el,"Done");
  setTimeout(function () {
    ui.displayMessage(el,afterMsg?afterMsg:"");
  },500);
}


  
ui.setSaved = function (){}; // stub called from ui

  
  
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
    $('.mainTitle').click(function () {
      location.href = "http://protochart.org";
    });
    ui.enableButton(ui.upBut,false);
    ui.enableButton(ui.topBut,false);
    ui.enableButton(ui.downBut,false);
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
       var lb = lightbox.newLightbox(r);
      lb.box.$css({"padding-left":"20px"}); 
      mpg.set("lightbox",lb);
      mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
      mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
      if (!pj.replaceableSpread) {
        ui.disableButton(ui.replaceBut);
      }
      if (!dat.findDataSource()) {
        ui.disableButton(ui.viewDataBut);
      }
      var htl = ui.hasTitleLegend();
      fsel.disabled.addLegend = ui.legendAdded || !(htl.hasTitle || htl.hasLegend);
      $('body').css({"background-color":"#eeeeee"});
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
    

  // set some vars in ui. from the query
  
  function processQuery(iq) {
    var q = ui.parseQuerystring();
    var itm = q.item;
    var intro = q.intro;
    if (q.source) {
      ui.source = decodeURIComponent(q.source);
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
      pj.path = itm;//itms[1];//itms.slice(3).join("/");
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
  // the default 
  ui.config =  {insert_chart:'http://prototypejungle.org/sys/repo1/test/insert_chart.html'};
  
  ui.initPage = function (o) {
    ui.inInspector = true;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = true;
    }
          pj.tlog("document  ready");
          $('body').css({"background-color":"#eeeeee",color:"black"});
          ui.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a ui-back inadvertantly
          //ui.addMessageListener();
            function afterInstall(e,rs)  {
              debugger;
              if (e === "noUrl") {
                //ui.shareBut.$css('color','gray');
              }
               pj.tlog("install done");
              if (e) {
                if (!rs) {
                  rs = svg.tag.g.mk(); 
                  rs.__isAssembly = true;
                }
                if (e !== "noUrl") rs.__installFailure = e;
              } 
              ui.processIncomingItem(rs,function (err) {
                ui.initFsel();
                ui.genMainPage(function () {
                  pj.tlog("starting build of page");
                  var ue = ui.updateErrors && (ui.updateErrors.length > 0);
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
                  tree.initShapeTreeWidget();
                  if (ui.addLegendOnStart) {
                    ui.addTitleAndLegend(function () {svg.main.fitContents();pj.tree.showTop('force');});
                  }
                  return;
                  ui.insertItem('/repo1/text/textbox1.js','titleBox',undefined,'title',function () { //svg.main.fitContents();return;
                    ui.insertItem('/repo1/chart/component/legend3.js','legend',undefined,'legend',function () {
                      svg.main.fitContents();
                    });
                  });

                  //ui.setSignInOutButtons();
                });
              });
            }
            pj.tlog("Starting install");
            if (ui.configUrl) {
               pj.returnValue= function (err,item) {
                 ui.config = item;
                // afterInstall("noUrl");
              }
              pj.loadScript(ui.configUrl);
            }
            if (ui.source) {
              pj.main(ui.source,afterInstall);
            } else if (pj.path) {
              var fpath = 'https://protochart.firebaseio.com'+pj.path+'.json?callback=prototypeJungle.assertItemLoaded';
              debugger;
              pj.install(fpath,afterInstall); 
            } else {
              afterInstall("noUrl");
            }
            $(window).resize(function() {
                ui.layout();
                if (ui.fitMode) svg.main.fitContents();
              });   
  }

//end extract

})(prototypeJungle);


