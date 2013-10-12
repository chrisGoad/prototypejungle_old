// support for loading and viewing items from code, rather than a PrototypeJungle UI
(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var treePadding = 10;
  var bkColor = "white";
  var plusbut,minusbut;
  
 
  var mpg; // main page
     
  var jqp = __pj__.jqPrototypes;
  
  function addCanvas(div,main) {
    var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green"}});  //TAKEOUT replace by above line
    div.addChild("canvas", cnv);
    div.install();
    var wd = div.width();
    var ht = div.height();
    cnv.attr({width:wd,height:ht});
    if (main) {
      var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue"}});
      mpg.addChild("hitcanvas", hitcnv);
      mpg.install();
      hitcnv.attr({width:wd,height:ht});

    }
    var rs = draw.Canvas.mk(cnv,hitcnv);
    rs.isMain = main;
    rs.dragEnabled = main;
    rs.panEnabled = main;
    return rs;
  }

  

  var ibut = jqp.button.instantiate();
  ibut.style.position = "absolute";
  ibut.style.top = "0px";
  ibut.style.left = "10px";
  ibut.html = "Inspect";
  //ibut.style["z-index"]=3000;
  
  ibut.click = function () {
    var host = location.host;
    if (host == "s3.prototypejungle.org") {
      var whr = "http://prototypejungle.org/"
    } else {
      whr = "/";
    }
    window.top.location.href = whr + "inspect?item="+page.itemPath;
  };
  
  
  plusbut = jqp.button.instantiate();
  plusbut.style.position = "absolute";
  plusbut.style.top = "0px";
  plusbut.html = "+";
  
  minusbut = jqp.button.instantiate();
  minusbut.style.position = "absolute";
  minusbut.style.top = "0px";
  minusbut.html = "&#8722;";
  
  var mpg,cdiv,theCanvas;
  

 
 
  
 
  var addButtons = function (div) {
    div.addChild(plusbut);
    div.addChild(minusbut);
    div.install();
    plusbut.__element__.mousedown(draw.startZooming);
    plusbut.__element__.mouseup(draw.stopZooming);
    plusbut.__element__.mouseleave(draw.stopZooming);
    minusbut.__element__.mousedown(draw.startUnZooming);
    minusbut.__element__.mouseup(draw.stopZooming);
    minusbut.__element__.mouseleave(draw.stopZooming);
    var wd= div.width()
    plusbut.css({"left":(wd - 50)+"px"});
    minusbut.css({"left":(wd - 30)+"px"});
   
  }
  
  draw.initCanvas = function (idiv,noButtons) {
    // for use in the scratch pad, a canvas is kept around
    if (draw.scratchCanvas) {
      return draw.scratchCanvas;
    }
    if (typeof idiv == "string") {
      var odiv = $(idiv);
    } else {
      odiv = idiv;
    }
    var lodiv = dom.wrapJQ(odiv);
    mpg= dom.wrapJQ('body');
   // var odiv = dom.wrapJQ('#canvas');
    // need a relatively placed subdiv
    var cdiv = dom.newJQ({'tag':'div',style:{position:"relative",height:"100%",width:"100%"}});
    lodiv.addChild(cdiv);
    lodiv.install();
    var theCanvas = addCanvas(cdiv,1);
    draw.addCanvas(theCanvas);
    if (!noButtons) {
      addButtons(cdiv);
    }
    draw.scratchCanvas = theCanvas;
    return theCanvas;
  }
  
  om.loadItem = function (itm,cb) {
    var inst = false; // no downside to instantiating in this situation
    om.install(itm, function (ars) {
      var ln  = ars.length;
      if (ln>0) {
        var rs = ars[ln-1]
        cb(rs);
      } else {
        cb();
      }
    });
  }
  
  draw.installAsRoot = function (itm,cnv,cb) {
    if (typeof itm == "string") {
      om.loadItem(itm,function (rs) {
        if (rs) {
          draw.installAsRoot(rs,cnv,cb);
        } else {
          cb();
        }
      });
    } else {
      var ovr = itm.__overrides__;
      if (!ovr) {
        delete itm.__overrides__;
      } else {
        ovr = {}; 
      }
      draw.wsRoot = itm;
      om.root = itm;
      cnv.contents = itm;
      draw.overrides = ovr;
      itm.deepUpdate(ovr);
      cb(itm);
    }
  }
    
 
  page.initPage = function (itm,cb) {
    debugger;
    var cnv = draw.initCanvas(true);
   // addButtons(cdiv);
   // draw.viewerMode = 1;
    draw.bkColor = "white";
   // draw.selectionEnabled = 0;
   // var wssrc = itm;
   // page.itemPath = wssrc;
   // var inst = false;
    draw.installAsRoot(itm,cnv,function (rs) {
      if (rs) {
        cnv.fitContents(true);
        cnv.refresh();
        cb(rs);
      } else {
        cb();
      }
    });
  }
    /*
  
  page.initPage = function (itm,cb) {
    debugger;
    initCanvas();
    addButtons(cdiv);
    draw.viewerMode = 1;
    draw.bkColor = "white";
    draw.selectionEnabled = 0;
    var wssrc = itm;
    page.itemPath = wssrc;
    var isAnon = wssrc && ((wssrc.indexOf("http:") == 0) || (wssrc.indexOf("https:")==0));
    var inst = false;
    function installOverrides(itm) {
      var ovr = itm.__overrides__;
      if (!ovr) {
        ovr = {}; 
      }
      if (ovr) {
        delete itm.__overrides__;
      }
      return ovr;
    }
    function afterInstall(ars) {
      var ln  = ars.length;
      if (ln>0) {
        var rs = ars[ln-1]
        var ovr = installOverrides(rs);
        if (inst) {
          var frs = rs.instantiate();
          __pj__.set(rs.__name__,frs); // @todo rename if necessary
        } else {
          frs = rs;
        }
        draw.wsRoot = frs;
        om.root = frs;
        theCanvas.contents = draw.wsRoot;
  
        draw.overrides = ovr;
        frs.deepUpdate(ovr);
       
        var bkc = frs.backgroundColor;
        if (!bkc) {
          frs.backgroundColor="rgb(255,255,255)";
        }
      }
      draw.wsRoot.deepUpdate(draw.overrides);
      theCanvas.fitContents(true);
      draw.refresh();
    }
    om.install(wssrc,afterInstall)
  }
  */
  
})(prototypeJungle);

