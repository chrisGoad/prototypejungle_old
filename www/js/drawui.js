(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var treePadding = 10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var isTopNote;
  var inputFont = "8pt arial";
  
  page.elementsToHideOnError = [];
  
  var mpg; // main page
  /* the panels: main, prototype, library
    insertPanel = dom.newJQ({tag:"div",

  draw.canvasWidth = 600;
  draw.canvasHeight = 600;;
  tree.codeToSave = "top";
  
  /* saw the lone ranger. a principle was observed: only nonsense among non-humans alowed. */
  var jqp = __pj__.jqPrototypes;
  
  
  var jqp = __pj__.jqPrototypes;
 
 
  var mpg = dom.wrapJQ("#main",{style:{position:"absolute","margin":"0px",padding:"0px"}});

  var topbarDiv = dom.wrapJQ('#topbar',{style:{position:"relative",left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  mpg.addChild("topbar",topbarDiv);
  var mainTitleDiv = dom.wrapJQ('#mainTitle');
  var ctopDiv = dom.wrapJQ('#topbarInner',{style:{float:"right"}});
  topbarDiv.addChild('ctop',ctopDiv);

  var errorDiv =  dom.wrapJQ($('#error'));
  var cols =  dom.newJQ({tag:"div",style:{left:"0px",position:"relative"}});
  mpg.addChild("columns",cols);
 

  function addCanvas(div,main) {
    var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green"}});  //TAKEOUT replace by above line
    div.addChild("canvas", cnv);
    if (main) {
      var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue"}});
      mpg.addChild("hitcanvas", hitcnv);
    }
    var rs = draw.Canvas.mk(cnv,hitcnv);
    rs.isMain = main;
    rs.dragEnabled = main;
    rs.panEnabled = main
    return rs;
  }
  //Hi Annette. Did you get this message? We seem to be connected skype-wise as far as I can tell from this end.
  //var mainPanel= {};
  mainPanel.top = dom.newJQ({tag:"div"}).addChildren([
    mainPanel.pathLine = dom.newJQ({tag:"span",html:"path"}),
    mainPanel.itemName = dom.newJQ({tag:"span"}),
    mainPanel.canvasDiv = dom.newJQ({tag:"div",style:{position:"absolute",border:"solid thin red"}})
  ]);
  
  mainPanel.canvas = addCanvas(mainPanel.canvasDiv,true);
  cols.addChild(mainPanel.top);

  
  var instancePanel= {};
  instancePanel.top = dom.newJQ({tag:"div",style:{position:"absolute",border:"solid thin black"}}).addChildren([
    instancePanel.pathLine = dom.newJQ({tag:"span",html:"path"}),
    instancePanel.canvasDiv = dom.newJQ({tag:"div",style:{position:"absolute"}}),
    instancePanel.dataDiv = dom.newJQ({tag:"div",style:{position:"absolute","font-size":"8pt"}})
  ]);
  instancePanel.canvas = addCanvas(instancePanel.canvasDiv,false);
  instancePanel.canvas.fitFactor = 0.7;

  cols.addChild(instancePanel.top);

   var protoPanel= {};
  protoPanel.top = dom.newJQ({tag:"div",style:{position:"absolute",border:"solid thin black"}}).addChildren([
    protoPanel.pathLine = dom.newJQ({tag:"span",html:"path"}),
    protoPanel.canvasDiv = dom.newJQ({tag:"div",style:{position:"absolute"}}),
    protoPanel.dataDiv = dom.newJQ({tag:"div",style:{position:"absolute","font-size":"8pt"}})
  ]);
  protoPanel.canvas = addCanvas(protoPanel.canvasDiv,false);

  protoPanel.canvas.fitFactor = 0.7;

  cols.addChild(protoPanel.top);

  
  var libPanel= {};
  libPanel.top =  dom.newJQ({tag:"div",style:{position:"absolute",border:"solid thin red"}});
  
  
  libPanel.canvas = addCanvas(libPanel.top,false);
  cols.addChild(libPanel.top);

  function layout() {
    var cdim = draw.mainCanvas.dims();

    var awinwd = $(window).width();
    var awinht = $(window).height();
    var topht  = 50;
    console.log(awinht,cdim.y);
    var mplft = awinwd/5;
    var mpwd = 2*awinwd/5;
    var mpht = awinht - topht;
    var iwd = awinwd/5;
    var ilft = mplft + mpwd;
    var plft = ilft + iwd;
    var icht = mpht/4;
    var idht = mpht/2;
    var idtp = icht;
    var lblft = 0;
    var lbwd = mplft;
    var lbht = 0.96*awinht;
    var lbtop = 0;
    
    //mainPanel.canvasDiv.css({width:mpwd+"px",height:mpht+"px",border:"solid thin black"});
    topbarDiv.css({width:awinwd+"px"});
    mainPanel.canvas.div.attr({width:mpwd,height:mpht});
    mainPanel.canvasDiv.css({top:"0px",left:mplft+"px"});
    if (mainPanel.canvas.hitDiv) {
      mainPanel.canvas.hitDiv.attr({width:mpwd,height:mpht});
    }
    draw.mainCanvas.adjustTransform(draw.mainCanvas.transform(),cdim);
    
    instancePanel.top.css({top:"0px",left:ilft+"px",width:iwd+"px",height:(icht+idht)+"px"});
    instancePanel.canvas.div.attr({width:iwd,height:icht});
    instancePanel.canvasDiv.css({top:"0px",lft:"0px"});
    instancePanel.dataDiv.css({left:"0px",top:idtp+"px",width:iwd+"px",height:idht+"px",overflow:"auto"});
   
    protoPanel.top.css({top:"0px",left:plft+"px",width:iwd+"px",height:(icht+idht)+"px"});
    protoPanel.canvas.div.attr({width:iwd,height:icht});
    protoPanel.canvasDiv.css({top:"0px",lft:"0px"});
    protoPanel.dataDiv.css({left:"0px",top:idtp+"px",width:iwd+"px",height:idht+"px",overflow:"auto"});
     
    
    //draw.mainCanvas.adjustTransform(draw.mainCanvas.transform(),cdim);
    
   // dataPanel.canvas.div.attr({width:dtwd,height:dtht});
   // dataPanel.canvasDiv.css({width:dtwd+"px",height:dtht+"px",left:dtlft+"px",top:dttop+"px"});
    
    libPanel.canvas.div.attr({width:lbwd,height:lbht});
    libPanel.top.css({width:lbwd+"px",height:lbht+"px",left:lblft+"px",top:lbtop+"px"});
     
     
    //draw.refresh();
  }
 
  /* non-standalone items should not be updated or displayed; no canvas needed; show the about page intead */
  page.genMainPage = function (cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    mpg.install($("body"));
    draw.addCanvas(mainPanel.canvas);
    draw.addCanvas(instancePanel.canvas);
    draw.addCanvas(protoPanel.canvas);

    $('.mainTitle').click(function () {
      location.href = "/";
    });
    page.genButtons(ctopDiv.__element__,{toExclude:{'about':1,'file':1}});
    $('body').css({"background-color":"#eeeeee"});
    layout();
    setInstance(draw.wsRoot.r2);
    cb();   
  }
    
    
  var hiddenProperties = {__record__:1,__isType__:1,__record_:1,__externalReferences__:1,__selected__:1,__selectedPart__:1,
                          __notes__:1,__computed__:1,__descendantSelected__:1,__fieldStatus__:1,__source__:1,__about__:1,
                          __overrides__:1,__mfrozen__:1,__inputFunctions__:1,__outputFunctions__:1,__current__:1,__canvasDimensions__:1,
                          __beenModified__:1,__autonamed__:1,__origin__:1,__from__:1,__changedThisSession__:1,__topNote__:1,
                          __saveCount__:1,__saveCountForNote__:1,__setCount__:1,__setIndexx__:1,__doNotUpdate__:1};
  
   
  om.DNode.showProperties1 = function (pr,forProto) {
    var computeWd = function (s) {
      var wm = draw.measureText(s,inputFont);
      return Math.max(50,wm+20)
    }
    var props = this.properties();
    var thisHere = this;
  
    props.forEach(function (k) {
      if (hiddenProperties[k]) {
        return;
      }
      var v = thisHere[k];
      var tp = typeof v;
      if (tp == "object" && v) {
      if (om.isNode(v)) {
          
          var tel =dom.newJQ({tag:"div",html:k});
          pr.addChild(tel);
          var el = dom.newJQ({tag:"div",style:{"margin-left":"15px"}});
          pr.addChild(el);
          v.showProperties1(el,forProto);
        }//todo deal with ref case
      } else if (tp == "function") {
        return;
      } else {
        var ownp = true;
        if (!forProto) {
          ownp =thisHere.hasOwnProperty(k);
        }
        var frozen = thisHere.fieldIsFrozen(k);
        var computed = thisHere.isComputed();
        var vts = ownp?v:"inherited";
        var inpwd = computeWd(vts);
        //var el = dom.newJQ({tag:"div",html:k+":"+vts});
        if (frozen || computed) { // cannot edit this field
          var el = dom.newJQ({tag:"div",html:k+":"+vts});
          pr.addChild(el);
        } else {
          var el = dom.newJQ({tag:"div",html:k+":"});
          var inp =dom.newJQ({tag:"input",type:"input",attributes:{value:vts},
                             style:{font:inputFont,"background-color":"#e7e7ee",width:inpwd+"px","margin-left":"10px"}});
          el.addChild(inp);
          pr.addChild(el);
          var blurH = function () {
          var chv = dom.processInput(inp,thisHere,k,!ownp,computeWd);
          if (typeof chv == "string") {
           // page.alert(chv);
          } else if (chv) {
            mainPanel.canvas.refresh();
            if (forProto) {
              protoRefresh();
            }
            instancePanel.canvas.fitContents(true);
            instancePanel.canvas.refresh();
          }
        }
        inp.blur = blurH;
        var removeInherited = function () {
          var vl = inp.prop("value");
          if (vl=="inherited") {
            inp.prop("value","");
          }
        }
        inp.mousedown = removeInherited;
        inp.enter = blurH;
        }
      }


    });
  }
  
  om.DNode.showProperties = function (pr,forProto) {
    pr.empty();
    var top =dom.newJQ({tag:"div",style:{"margin-left":"20px"}});
    pr.addChild(top);
    this.showProperties1(top,forProto);
    top.install();
  }
  
  function protoRefresh() {
    var pcanvas = protoPanel.canvas;
    var itm = pcanvas.contents;
     if (!itm) {
      return;
    }
    var st = itm.style;
    if (st) {
      var hd  = st.hidden;
      if (hd) {
        st.hidden = 0; // temporarily
      }
    }
    pcanvas.fitContents(true);
      pcanvas.refresh();
    if (hd) {
      st.hidden = hd;
    }
  }
  
  function setProto(itm) {
    var pcanvas = protoPanel.canvas
    pcanvas.contents = itm;
    protoRefresh();
    itm.showProperties(protoPanel.dataDiv,true);
  }
  
  function setInstance(itm) {
    if (!itm) {
      return;
    }
    debugger;
    //alert("selecting "+itm.__name__);
    var icanvas = instancePanel.canvas;
    icanvas.contents = itm;
    icanvas.fitContents();
   // var tr = icanvas.fitTransform();
   // icanvas.xform = tr;
    icanvas.refresh();
    itm.showProperties(instancePanel.dataDiv);
    var pr = Object.getPrototypeOf(itm);
    setProto(pr);
  }
  
  draw.selectCallbacks.push(setInstance);
  
   // either nm,scr (for a new empty page), or ws (loading something into the ws) should be non-null
  
  page.initPage = function (o) {
    var q = om.parseQuerystring();
    draw.bkColor = "white";
  
    //var itm = q.item;
    //var nm = o.name;
    //var scr = o.screen;
    var wssrc = q.item;
    page.newItem = q.newItem;
    var itm = q.item;     
    page.itemUrl =  wssrc;
    if (wssrc) {
      page.itemName = om.pathLast(wssrc);
      page.itemPath = om.stripDomainFromUrl(wssrc);
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
            
     $('document').ready(
        function () {
          $('body').css({"background-color":"white",color:"black"});
          om.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a page-back inadvertantly
            function afterInstall(ars) {
              var ln  = ars?ars.length:0;
              if (ln>0) {
                var rs = ars[ln-1];
                if (rs) { // rs will be undefined if there was an error in installation 
                  var inst  = !(rs.__autonamed__);// &&  !noInst; // instantiate directly built fellows, so as to share their code
                  var ovr = installOverrides(rs);
                  var ws = __pj__.set("ws",om.DNode.mk());
                  if (inst) {
                    var frs = rs.instantiate();
                  } else {
                     frs = rs;
                  }
                  ws.set(rs.__name__,frs); // @todo rename if necessary
                  draw.wsRoot = frs;
                  page.codeBuilt = !(frs.__saveCount__);
                  om.root = draw.wsRoot;
                  draw.enabled = 1;
                 
                  om.overrides = ovr;
                  frs.deepUpdate(ovr);
                   
                  var bkc = frs.backgroundColor;
                  if (!bkc) {
                    frs.backgroundColor="white";
                  }
                }
               
              } else {
                // newItem
                draw.wsRoot = __pj__.set("ws",om.DNode.mk());
                om.root = draw.wsRoot;
                page.codeBuilt = false;
              }
               
            
                page.genMainPage(function () {
                 
                  var ue = om.updateErrors && (om.updateErrors.length > 0);
                  if (ue) {
                    var lb = mpg.lightbox;
                    lb.pop();
                    lb.setHtml("<div id='updateMessage'><p>An error was encountered in running the update function for this item: </p><i>"+om.updateErrors[0]+"</i></p></div>");
                  }
                  om.loadTheDataSources([draw.wsRoot],function () {
                    mainPanel.canvas.contents = draw.wsRoot;

                    draw.wsRoot.deepUpdate(ovr);
                    var isVariant = !!(draw.wsRoot.__saveCount__);
                    var tr = draw.wsRoot.transform;
                    var cdims = draw.wsRoot.__canvasDimensions__;
                    if (tr  && cdims) {
                      mainPanel.canvas.adjustTransform(mainPanel.canvas.transform(),cdims);
                    } else {
                      if (!isVariant || !tr) { 
                        tr = mainPanel.canvas.fitTransform();//draw.wsRoot);
                        draw.wsRoot.set("transform",tr);
                      }
                    }
                    draw.refresh();
                    page.libChooser = page.Chooser.mk();
                    page.libChooser.genPage("libChooser",libPanel.top);
                    page.libChooser.popItems();
                  });
                });
            
            }
            if (!wssrc) {
              //draw.emptyWs(nm,scr);
              afterInstall();
            } else {
                var lst = om.pathLast(wssrc);
                om.install(wssrc,afterInstall)
            }
            
            $(window).resize(function() {
                layout();
                draw.mainCanvas.fitContents();
                draw.refresh();
              });   
          });
  }
})(prototypeJungle);

