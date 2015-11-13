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

  
  var mpg = ui.mpg;

   
  ui.processIncomingItem = function (rs,cb) {
    pj.root = rs;
    rs.__sourceRepo = pj.repo;
    rs.__sourcePath = pj.path;
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
    if (itm.draw) {
      itm.draw(svg.main.__element); // update might need things to be in svg
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
      location.href = "http://prototypejungle.org";
    });
    ui.enableButton(ui.upBut,0);
    ui.enableButton(ui.topBut,0);
    ui.enableButton(ui.downBut,0);
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
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
    if (intro) {
      ui.source = "http://prototypejungle.org/sys/repo3|example/bar_chart.js";
      ui.intro = 1;
      ui.docDiv.src = pj.devVersion?"/devdoc/intro.html":"/doc/intro.html"; 
    } else {
      ui.docDiv.$hide();
    }
    if (itm) {
      var itms = itm.split("/");
      pj.repo = "http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      pj.path = itms.slice(3).join("/");
    } else {
      pj.repo=q.repo;
      pj.path=q.path?pj.stripInitialSlash(q.path):undefined;
    }
    if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
      pj.urlMap = undefined;
      pj.inverseUrlMap = undefined;
    }
    if (!pj.repo) {
      return 0;
    }
    var psp = pj.path.split("/");
    var pln = psp.length;
    ui.itmName = psp[pln-2];
    var sr = pj.repo.split("/");
    var srln = sr.length;
    ui.handle = sr[srln-2];
    if (pj.repo.indexOf('htt')!==0) {
      pj.repo = 'http://prototypejungle.org'+pj.repo;
    }
    ui.url = pj.repo+"/"+pj.path;
    ui.includeDoc = q.intro;
    return 1; 
  }
 
  ui.initPage = function (o) {
    ui.inInspector = 1;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = 1;
    }
          pj.tlog("document  ready");
          $('body').css({"background-color":"#eeeeee",color:"black"});
          ui.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a ui-back inadvertantly
          ui.addMessageListener();
            function afterInstall(e,rs)  {
              if (e === "noUrl") {
                ui.shareBut.$css('color','gray');
              }
               pj.tlog("install done");
              if (e) {
                if (!rs) {
                  rs = svg.tag.g.mk(); 
                  rs.__isAssembly = 1;
                }
                if (e !== "noUrl") rs.__installFailure = e;
              } 
              ui.processIncomingItem(rs,function (err) {
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
                });
              });
            }
            pj.tlog("Starting install");
            if (ui.source) {
              pj.main(ui.source,afterInstall);
            } else if (pj.repo) {
              pj.install(pj.repo,pj.path,afterInstall); 
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


