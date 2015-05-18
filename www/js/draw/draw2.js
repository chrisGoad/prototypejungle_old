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
  var editMsg = ui.editMsg;
  var dataMsg = ui.dataMsg;
  
  
   
  //============= Support for the code editor ==============
  var editor,dataEditor;
  var unbuiltMsg = ui.unbuiltMsg;
   
  ui.processIncomingItem = function (rs,cb) {
    ui.root =  rs;
    pj.ws = rs; 
    rs.__sourceRepo = ui.repo;
    rs.__sourcePath = ui.path;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
    dat.installData(rs,cb);
  }
  
  
  ui.installNewItem = function () {
    var itm = ui.root;
    svg.main.addBackground(ui.root.backgroundColor);
    var mn = svg.main;
    if (mn.contents) {
      dom.removeElement(mn.contents);
    }
    mn.contents=ui.root;
    if (itm.draw) {
      itm.draw(svg.main.__element); // update might need things to be in svg
    }
    if (itm.soloInit) { 
      itm.soloInit(); 
    }
    ui.updateAndDraw(ui.fitMode);
  }

var activeMessageA = {"Objects":ui.obMsg,"Code":ui.codeMsg,"Data":ui.dataMsg};

ui.activeMessage = function () {
  var cmode = ui.modeTab.selectedElement;
  var rs = activeMessageA[cmode];
  return rs?rs:ui.obMsg;
}
 

function displayDone(el,afterMsg) {
  ui.displayMessage(el,"Done");
  setTimeout(function () {
    ui.displayMessage(el,afterMsg?afterMsg:"");
  },500);
}


  function whenObjectsModified() {
    if (!ui.objectsModified) {
      ui.objectsModified = 1;
      return;
    }
  }
  
   ui.objectsModifiedCallbacks.push(whenObjectsModified);
  
  
// an overwrite from svg
svg.drawAll = function (){ // svg and trees
    tree.initShapeTreeWidget(); 
    if (ui.fitMode) svg.main.fitContents();
    svg.main.draw();
  }
ui.setSaved = function (){}; // stub called from ui


    
  
  ui.pathToXitem = function (path,absolute) {
    var sp = path.split("/");
    var h = sp[0];
    var r = sp[1];
    var nm = sp[sp.length-1];
    var p = sp.slice(2).join("/")+"/item.js";
    var sameRepo = (!absolute) && (ui.handle === h) && (ui.pjrepo === r);
    var rr = sameRepo?".":"http://prototypejungle.org/"+h+"/"+r;
    var xit = pj.XItem.mk(nm,rr,p);
    return xit;
  }
  
  ui.addToRequires = function (xit) {
    var rr = xit.repo;
    var p = xit.path;
    var nm = xit.name;
    if (ui.root.__requires === undefined) {
      ui.root.set("__requires",pj.Array.mk());
    }
    var cmps = ui.root.__requires;
    var fpath = rr + "/" + p;
    ui.root.__requires.push(xit);//pj.lift({name:nm,repo:rr,path:p}));
  }
  
  ui.inserts = function () {
    var rs = ui.root.__inserts;
    if ( !rs) {
      rs = ui.root.set("__inserts",pj.svg.Element.mk('<g/>'));
      ui.root.__insertCount = 0;
    }
    return rs;
  }
 
  
   
  ui.shapesPath = 'sys/repo2/shape/';
  ui.chartsPath = 'sys/repo2/chart/';
  
  ui.instantiateInserts = 1;
  ui.insertXdisplace = 50; // how far to displace the inserted item
  ui.pathsForInserts = {
    'text':'sys/repo2/text/text',
    'textbox':'sys/repo2/text/box',
    'Bar':'sys/repo2/chart/Bar1', 
    'Column':'sys/repo2/chart/Column1',
    'Scatter':'sys/repo2/chart/Scatter1',
    'Line':'sys/repo2/chart/Line1',
  'legend':'sys/repo2/chart/component/Legend2'
  };
  
  
  
  ui.installTheData = function (item,iData,xData,dataSource) { 
    item.__xdata = xData; 
    item.dataSource = theDataSource;
    item.set("data", iData);
    item.reset();  
    item.outerUpdate();
    item.draw();
  }
  ui.insertItem = function (category,where,ipth,forIntroCallback) {   
    if ((category === 'shape') && (ipth === 'rectangle')) {
      var rect = ui.insertRectangle(where);
      var ibnds = rect.toRectangle();
      moveOutOfWay(rect,bnds,ibnds);
      mpg.insert_lightbox.dismiss();
      return; 
    }
    var pth = ui.pathsForInserts[ipth];
    var xit = ui.pathToXitem(pth,1); 
    var afterInstall = function (err,itm) {
      if (!forIntroCallback) {
        mpg.insert_lightbox.dismiss();
        ui.unselect();
      }
      ui.addToRequires(xit);
      if (itm.__value) {
        itm = itm.__value;
      }
      var xd = itm.__xdata;
      delete itm.__xdata;
      if (ui.instantiateInserts) {
        var iitm = itm.instantiate();
      } else {
        iitm = itm;
      }
      iitm.__isPart = 1; //  a top level part of this assembly 
      ui.root.set(where,iitm);
      ui.whereToInsert = where;
      ui.insertedItem = iitm; 
      if (forIntroCallback) {
        forIntroCallback();
        return; 
      }
      mpg.insert_lightbox.dismiss();
      ui.popDataSourceSelector();
    }
    pj.install(xit.repo,xit.path,afterInstall);  
  }
  
  ui.moveOutOfWay = function (inserted) {
    var bnds = svg.boundsOnVisible(ui.root,ui.root);
    var ibnds = inserted.bounds();
    if (bnds) {
      var xoutofway = bnds.corner.x + bnds.extent.x + 0.5*ibnds.extent.x + ui.insertXdisplace;
      inserted.moveto(xoutofway,0);
      bnds.extent.x = bnds.extent.x + ibnds.extent.x + ui.insertXdisplace;
    } else {
      bnds = ibnds;
    }
    svg.main.fitBounds(0.8,bnds);
  }
    
  ui.legendPath = 'sys/repo2/chart/component/Legend2';
  
  ui.insertLegend = function (chart,cb) {
    var pth = ui.legendPath;
    var xit = ui.pathToXitem(pth,1); 
    var afterInstall = function (err,legend) {
      legend.dataSource = undefined;
      ui.addToRequires(xit);
      var ilegend= legend.instantiate();
      ilegend.forChart= pj.pathOf(chart,ui.root).join("/");  
      ui.root.set('legend',ilegend);
      ilegend.__isPart = 1; //  a top level part of this assembly
      ilegend.outerUpdate();
      ilegend.draw();
      ui.moveOutOfWay(ilegend);
      if (cb) {
        cb();
      }

    }
    pj.install(xit.repo,xit.path,afterInstall);  
  } 
  
  ui.completeTheInsert = function (iData,xData,dataSource) { 
    var where = ui.whereToInsert;
    ui.installTheData(ui.insertedItem,iData,xData,dataSource);
    ui.moveOutOfWay(ui.insertedItem);
    var afterInsertLegend = function () {
      svg.main.fitContents();   
      if (iData.categories) {
        ui.noteSpan.$html('Click on things to adjust them. Adjust category colors via the legend');
      } else {
        ui.noteSpan.$html('Click on things to adjust them.');
      }
      ui.fsel.setDisabled("dataSource",false);

    };
    if (iData.categories) {
      ui.insertLegend(ui.insertedItem,afterInsertLegend);
    } else {
      afterInsertLegend();
    }
  }

 
  
   
  
  
  ui.genMainPage = function (cb) {
    if (pj.mainPage) return;
    pj.mainPage = mpg;
   // pj.set("mainPage",mpg);  
    if (ui.includeDoc) {
      mpg.addChild("doc",ui.docDiv);
    }
    ui.mpg.__addToDom(); 
    svg.main = svg.Root.mk(ui.svgDiv.__element);
    svg.main.activateInspectorListeners();
    svg.main.addButtons("View");      
    svg.main.navbut.$click(function () {
      var viewPage = ui.useMinified?"/view":"viewd";
      var url = viewPage + "?item="+ui.pjpath;;
      location.href = url;
    });
  

    $('.mainTitle').click(function () {
      location.href = "http://prototypejungle.org";
    });
    
    ui.enableButton(ui.upBut,0);
    ui.enableButton(ui.topBut,0);
    ui.enableButton(ui.downBut,0);
 
    ui.genButtons(ui.ctopDiv.__element,{}, function () {
      $('body').css({"background-color":"#eeeeee"});
      var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
      var rc = geom.Rectangle.mk({corner:[0,0],extent:[600,200]});
      var lb = lightbox.newLightbox(r);
      lb.box.$css({"padding-left":"20px"}); 
      mpg.set("lightbox",lb);
      var clb = lightbox.newLightbox(rc);
      mpg.set("insert_lightbox",lightbox.newLightbox(rc));
      mpg.set("datasource_lightbox",lightbox.newLightbox(rc));
      var elb = lightbox.newLightbox(rc);
      mpg.set("editor_lightbox",elb);
     // ui.itemName.$html(ui.itmName);  
      if (typeof(ui.root) == "string") {
        ui.editButDiv.$hide();
        ui.editMsg.$hide();
        if (ui.root === "missing") {
          var msg = "404 No Such Item"
        } else {
          // the first character indicates whether the item is code built (1) or not (0)
          msg = "Load failed for "+(ui.root.substr(1));
          ui.setPermissions();
        }
        ui.svgDiv.setHtml("<div style='padding:100px;font-weight:bold'>"+msg+"</div>");
        ui.root = pj.mkRoot();
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
    if (intro) {
      itm = "/anon/repo2/hfpp44fjx4";
      ui.intro = 1;
      ui.docDiv.src = "/doc/intro.html"; 
    } else {
      ui.docDiv.$hide();
    }
    if (itm) {
      var itms = itm.split("/");
      ui.repo = "http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      ui.path = itms.slice(3).join("/");
    } else {
      ui.repo=q.repo;
      ui.path=q.path?pj.stripInitialSlash(q.path):undefined;
    }
    if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
      pj.urlMap = undefined;
      pj.inverseUrlMap = undefined;
    }
    if (!ui.repo) {
      return 0;
    }
    if (!pj.endsIn(ui.path,".js")) {
      ui.path += "/item.js";
    }
    var psp = ui.path.split("/");
    var pln = psp.length;
    ui.itmName = psp[pln-2];
    var sr = ui.repo.split("/");
    var srln = sr.length;
    ui.handle = sr[srln-2];
    ui.pjrepo = sr[srln-1]; // eg repo0 for /sys/repo0
    if (ui.repo.indexOf('htt')!==0) {
      ui.repo = 'http://prototypejungle.org'+ui.repo;
    }
    ui.url = ui.repo+"/"+ui.path;
    if (pj.beginsWith(ui.url,'http://prototypejungle.org')) {
      ui.pjpath=pj.pathExceptLast(ui.url.substring(26));
    }
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
          $('body').css({"background-color":"white",color:"black"});
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
                ui.initFsel();
                ui.genMainPage(function () {
                  if (ui.intro || ui.path ) { 
                   if (ui.intro) {
                     ui.fsel.setDisabled("dataSource",true);
                   }
                  } else {
                    ui.fsel.setDisabled("dataSource",true);
                    ui.popInserts('charts');
                  }
                  pj.tlog("starting build of page");
                  ui.setPermissions();
                  ui.setFselDisabled(); 
                  if  (!ui.root._pj_about) {
                    ui.aboutBut.$hide();
                  }
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
            if (ui.repo) {
              pj.install(ui.repo,ui.path,afterInstall); 
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


