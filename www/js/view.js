(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  // fake a little tree, for code that expects it
  __pj__.set("tree",om.DNode.mk());
  __pj__.tree.adjust = function (){};
  //var tree = __pj__.tree;
  var dataOps = __pj__.dataOps;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var treePadding = 10;
  var bkColor = "white";
  var plusbut,minusbut;
  
  
  
  
  page.genError = function (msg) {
    if (page.errorOccurred) return;
    alert("ERROR ",msg); // improve on this
    return;
    page.errorOccurred = 1;
    $('#error').show();
    $('#error').html(msg);
  }
   


  function layout() {
    var cdims = geom.Point.mk(draw.canvasWidth,draw.canvasHeight);
    var winwid = $(window).width();
    var winht = $(window).height();
    /*
    var cnvht = winht*0.80;
    var cnvwd = winwid-50;
    mpg.css({left:25+"px",width:cnvwd});
    */
    var cnvwd = winwid-20;
    var cnvht = winht-20;
    mpg.css({left:0+"px",width:cnvwd});

    draw.mainCanvas.div.attr({width:cnvwd,height:cnvht}); 
    draw.mainCanvas.hitDiv.attr({width:cnvwd,height:cnvwd});
  
    //cnv.attr({width:cnvwd,height:cnvht});
    //hitcnv.attr({width:cnvwd,height:cnvht});
    draw.canvasWidth = cnvwd;
    draw.canvasHeight = cnvht;
    plusbut.css({"left":(cnvwd - 50)+"px"});
    minusbut.css({"left":(cnvwd - 30)+"px"});
    var rtt = draw.mainCanvas.transform();
    if (rtt) {
      draw.mainCanvas.adjustTransform(rtt,cdims);
      draw.refresh();
    }
}
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  draw.canvasWidth = 600;
   
  var jqp = __pj__.jqPrototypes;
  var mpg = dom.El({tag:"div"});
  var errorDiv =  dom.El({tag:"div",style:{"display":"none","text-align":"center",width:"100%","padding-top":"40px"}});
  errorDiv.hide();
  mpg.addChild("error",errorDiv);

 //var cdiv =  dom.El({tag:"div",style:{postion:"absolute","background-color":"white",display:"inline-block"}});
  //mpg.addChild("canvasDiv", cdiv);

    canvasDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        ibut = jqp.button.instantiate().set({html:"Inspect",style:{position:"absolute",top:"0px",left:"10px"}}),
        
        plusbut = jqp.button.instantiate().set({html:"+",style:{position:"absolute",top:"0px"}}),
        minusbut = jqp.button.instantiate().set({html:"&#8722;",style:{position:"absolute",top:"0px"}}),
     ]);
       //canvasDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
   mpg.addChild("canvasDiv", canvasDiv);

/*
  var ibut = jqp.button.instantiate();
  ibut.style.position = "absolute";
  ibut.style.top = "0px";
  ibut.style.left = "10px";
  ibut.html = "Inspect";
  //ibut.style["z-index"]=3000;
  */
  ibut.click = function () {
    var host = location.host;
    if (host === "s3.prototypejungle.org") {
      var whr = "http://prototypejungle.org/"
    } else {
      whr = "/";
    }
    window.top.location.href = whr + "inspect?item="+page.itemPath;
  };
  
  /*
  plusbut = jqp.button.instantiate();
  plusbut.style.position = "absolute";
  plusbut.style.top = "0px";
  plusbut.html = "+";
  
  minusbut = jqp.button.instantiate();
  minusbut.style.position = "absolute";
  minusbut.style.top = "0px";
  minusbut.html = "&#8722;";
  */
  
   function addCanvas() {
  
      var cnv = dom.El({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      var hitcnv = dom.El({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
      mpg.addChild("hitcanvas", hitcnv);
      //var htmlDiv = canvasDiv; //dom.El({tag:"div",style:{position:"absolute",border:"solid red",width:"10px",height:"10px",top:"0px",left:"0px"}});
      //canvasDiv.addChild("html",htmlDiv);
      theCanvas = draw.Canvas.mk(cnv,hitcnv,canvasDiv);
      theCanvas.isMain = 1;
      theCanvas.dragEnabled = 1;
      theCanvas.panEnabled = 1;
  
    
  }
  /*
  var cnv = dom.El({tag:"canvas",style:{"position":"absolute","top":"0px"},attributes:{border:"solid thin green",width:"100%"}});
  cdiv.addChild("canvas", cnv);
  var theCanvas = draw.Canvas.mk(cnv);
  theCanvas.isMain = 1;
  theCanvas.dragEnabled = 0;
  theCanvas.panEnabled = 1;
    

  
  draw.theCanvas = cnv;
  cdiv.addChild(ibut);
  cdiv.addChild(plusbut);
  cdiv.addChild(minusbut);

  var hitcnv = dom.El({tag:"canvas",attributes:{border:"solid thin blue",width:"100%"}});
  //cdiv.addChild("hitcanvas", hitcnv);
  mpg.addChild("hitcanvas", hitcnv);
  draw.hitCanvas = hitcnv;
  if (!draw.hitCanvasDebug) {
    hitcnv.css('display','none');
  }
 
*/
 
  
 
 
  page.genError = function (err) {
    mpg.install($("body"));
    layout();
  }

  page.genMainPage = function () {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    addCanvas();
    mpg.install($("body"));
    theCanvas.contents = om.root;
    draw.addCanvas(theCanvas);

  //    draw.addCanvas(theCanvas);
 //    theCanvas.contents = om.root;

    plusbut.__element__.mousedown(draw.startZooming);
    plusbut.__element__.mouseup(draw.stopZooming);
    plusbut.__element__.mouseleave(draw.stopZooming);
    minusbut.__element__.mousedown(draw.startUnZooming);
    minusbut.__element__.mouseup(draw.stopZooming);
    minusbut.__element__.mouseleave(draw.stopZooming);

    //var errorDiv = 
   // draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
   // draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');
    $('body').css({"background-color":"white"});
    mpg.css({"background-color":"white"})
    layout();
  }
  
  page.getDataSourceFromHref = function () {
    var ash = om.afterChar(location.href,"#");
    if (ash && om.beginsWith(ash,"data=")) {
      return om.afterChar(ash,"=");
    }
  }
      
  
  page.initPage = function (o) {
    draw.viewerMode = 1;
    draw.bkColor = "white";
    draw.selectionEnabled = 0;
    var wssrc = o.item;
    var idataSource = page.getDataSourceFromHref();

    page.itemPath = wssrc;
    var isAnon = wssrc && ((wssrc.indexOf("http:") === 0) || (wssrc.indexOf("https:")===0));
    var inst = o.instantiate;
    var cb = o.callback;
     $('document').ready(
        function () {
          $('body').css({"background-color":"white",color:"black"});
   //       page.genMainPage();
          //draw.init();
          if (!wssrc) {
            errorDiv.show();
            errorDiv.html("<span class='errorTitle'>Error:</span> no item specified (ie no ?item=... )");
            return;
          }  
          
          
          
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
            om.root = frs;
           // theCanvas.contents = draw.wsRoot;
            page.genMainPage();

            draw.overrides = ovr;
            frs.deepUpdate(null,ovr);
           
            var bkc = frs.backgroundColor;
            if (!bkc) {
              frs.backgroundColor="rgb(255,255,255)";
            }
            var isrc = om.root.dataSource;
            var psrc = page.getDataSourceFromHref();
            om.root.dataSource = psrc?psrc:isrc;

          }
          
          
              function afterLoadData(err,idt) {
                    om.tlog("LOADED DATA ");
                    if (!idt) {
                      var dt = om.root.initialData; // data can be installed "by hand"
                    } else {
                
                      //if (om.root.setData) {
                      //  om.root.setData(dt);
                      //}
                      dt = dataOps.Series.mk(idt);
                      dt.groupByDomain();
                      
                      om.root.data = dt;
                    }
                    if (om.root.update) {
                      om.tlog("STARTING UPDATE");
                      om.root.update(dt);
                      om.tlog("FINISHED UPDATE");
                    
                    }
                   // if (!om.root.__bundled__ && (standalone || inspectDom))
                   // om.root.deepUpdate(null,null,ovr);
                   
                    var tr = om.root.transform;
                    var cdims = om.root.__canvasDimensions__;
                    if (tr  && cdims) {
                        draw.mainCanvas.adjustTransform(draw.mainCanvas.transform(),cdims);
                    } else {
                        tr = draw.mainCanvas.fitTransform();
                        om.root.set("transform",tr);
                    }
                    draw.refresh();

                  }
                  
          
          function aafterLoadData() {
            draw.wsRoot.deepUpdate(null,draw.overrides);
            var tr = draw.mainCanvas.transform();
            var cdims = draw.wsRoot.__canvasDimensions__;
            if (cdims) {
              draw.mainCanvas.adjustTransform(tr,cdims);
            } else {
              tr =  draw.mainCanvas.fitTransform();
              draw.wsRoot.set("transform",tr);
            }
            draw.refresh();
            if (cb) cb();
          }
          
          
          om.root.deepUpdate(null,draw.overrides);

          om.loadData(om.root.dataSource,afterLoadData);
/*
          om.loadTheDataSources(frs,function () {
            draw.wsRoot.deepUpdate(null,draw.overrides);
            var tr = draw.mainCanvas.transform();
            var cdims = draw.wsRoot.__canvasDimensions__;
            if (cdims) {
              draw.mainCanvas.adjustTransform(tr,cdims);
            } else {
              tr =  draw.mainCanvas.fitTransform();
              draw.wsRoot.set("transform",tr);
            }
            draw.refresh();
            if (cb) cb();
          }
          );
   */       
        
        }
           
          var lst = om.pathLast(wssrc);
          if (inst) {
            var fdst = lst; // where to install the instance
          }
          //alert("loading "+wssrc);
          om.install(wssrc,afterInstall)
          $(window).resize(function() {
              layout();
              draw.fitContents();
            });   
        });
  }
    
  
})(prototypeJungle);

