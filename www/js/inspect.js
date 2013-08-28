// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
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
  var docDiv;
  var minWidth = 1000;
  page.elementsToHideOnError = [];
  function layout() {
    // aspect ratio of the UI 
    var ar = 0.5;
    var pdw = 30; // minimum padding on sides
    var vpad = 40; //minimum sum of padding on top and bottom
    var awinwid = $(window).width();
    var awinht = $(window).height();
    if (awinwid < minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = pdw;
    } else if (awinht < ar * minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = 0.5 * (awinwid - minWidth) +  pdw;
    } else { // enough room
      var twd =  awinht/ar; 
      if (twd < awinwid) { // extra space in width
        var lrs = 0.5 * (awinwid-twd) + pdw;
        var ppageWidth = twd;
      } else {
        var lrs = pdw;
        var ppageWidth = awinwid;
      }
    }
    var ppageHeight = ar * ppageWidth;
    var pageWidth = ppageWidth - 2 * pdw;
    var pageHeight = ppageHeight - vpad;

    if (page.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = awinht - pageHeight - 30;
    }
    var canvasWidth = pageWidth/2;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - 2*treePadding;
    mpg.css({left:lrs+"px",width:pageWidth+"px"});

    cols.css({left:"0px",width:pageWidth+"px"});
    uiDiv.css({top:"0px",left:canvasWidth+"px",width:(canvasWidth + "px")})
    ctopDiv.css({"padding-top":"10px","padding-bottom":"20px","padding-right":"10px",left:canvasWidth+"px",top:"0px"});

    actionDiv.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:"200px",top:"0px"});
    var actionHt = actionDiv.__element__.outerHeight();
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var canvasHeight = pageHeight - actionHt -30;
    cnv.attr({width:canvasWidth,height:canvasHeight}); //PUTBACK
    console.log("canvas cims",canvasWidth,canvasHeight);
    hitcnv.attr({width:canvasWidth,height:canvasHeight}); //PUTBACK
    var treeHt = canvasHeight - 2*treePadding;
    tree.myWidth = treeInnerWidth;
    tree.obDiv.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    draw.canvasWidth = canvasWidth;
    draw.canvasHeight = canvasHeight;
    if (docDiv) docDiv.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});

}
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  draw.canvasWidth = 600;
  draw.canvasHeight = 600;;
  tree.codeToSave = "top";
  
  /* saw the lone ranger. a principle was observed: only nonsense among non-humans alowed. */
  var jqp = __pj__.jqPrototypes;
  var topbarDiv = dom.newJQ({tag:"div",style:{position:"relative",left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  var mainTitleDiv = dom.newJQ({tag:"div",html:"Prototype Jungle ",hoverIn:{"color":"#777777"},hoverOut:{color:"black"},style:{color:"black","cursor":"pointer","float":"left",font:"bold 12pt arial"}});
  var titleDiv = dom.newJQ({tag:"div",style:{color:"black",float:"left",font:"bold 12pt arial",width:"140px","padding-left":"60px","padding-top":"10px"}});
//  titleDiv.addChild(ctopDiv);
  var subtitleDiv = dom.newJQ({tag:"div",html:"Inspector/Editor",style:{font:"10pt arial",left:"0px"}});
  var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
     mpg.addChild("topbar",topbarDiv);
  topbarDiv.addChild("title",titleDiv);
  titleDiv.addChild("maintitle",mainTitleDiv);
  titleDiv.addChild("subtitle",subtitleDiv);
    var toViewer = dom.newJQ({tag:"div",html:"to Viewer",style:{font:"8pt arial","cursor":"pointer"}});
 //titleDiv.addChild("toViewer",toViewer);
  var topNoteDiv = dom.newJQ({tag:"div",style:{position:"absolute","top":"40px",left:"215px",font:"11pt arial italic","cursor":"pointer"}});
    topbarDiv.addChild("topNote",topNoteDiv);

  var errorDiv =  dom.newJQ({tag:"div",style:{"text-align":"center","margin-left":"auto","margin-right":"auto","padding-bottom":"40px"}});
  mpg.addChild("error",errorDiv);
  var cols =  dom.newJQ({tag:"div",style:{left:"0px",position:"relative"}});
  mpg.addChild("mainDiv",cols);
  page.elementsToHideOnError.push(cols);
  var cdiv =  dom.newJQ({tag:"div",style:{postion:"absolute","background-color":"white",border:"solid thin green",display:"inline-block"}});
  cols.addChild("canvasDiv", cdiv);
  
  var cnvht = draw.hitCanvasDebug?"50%":"100%"
  //var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"100%",height:cnvht}});
    var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
  cdiv.addChild("canvas", cnv);
  draw.theCanvas = cnv;
  //var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:"100%",height:cnvht}});
   var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
 mpg.addChild("hitcanvas", hitcnv);
  draw.hitCanvas = hitcnv;
 
  var uiDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px",
                               padding:"0px"}});
  cols.addChild("uiDiv",uiDiv);


  var actionDiv = dom.newJQ({tag:"div",style:{position:"absolute",margin:"0px",
                              overflow:"none",padding:"5px",height:"20px"}});

                              
  topbarDiv.addChild('action',actionDiv);
    page.elementsToHideOnError.push(actionDiv);

    var ctopDiv = dom.newJQ({tag:"div",style:{float:"right"}});
  topbarDiv.addChild('ctop',ctopDiv);
  tree.obDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                               overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}});
  uiDiv.addChild("obDiv",tree.obDiv);
  var obDivTitle = dom.newJQ({tag:"div",html:"Workspace",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}});
  tree.obDiv.addChild("title",obDivTitle);
  tree.obDivRest = dom.newJQ({tag:"div",style:{overflow:"auto"}});
  tree.obDiv.addChild("rest",tree.obDivRest); 
  docDiv =  dom.newJQ({tag:"iframe",attributes:{src:"chartdoc.html"},style:{border:"solid thin black",position:"absolute"}});
  page.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
  tree.protoDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}});
  
  tree.protoDivTitle = dom.newJQ({tag:"div",html:"Prototype Chain",style:{"border-bottom":"solid thin black"}});
  tree.protoDiv.addChild("title",tree.protoDivTitle);
  tree.protoDivRest = dom.newJQ({tag:"div",style:{overflow:"auto"}});
  tree.protoDiv.addChild("rest",tree.protoDivRest);
  
  tree.protoSubDiv = dom.newJQ({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});
 uiDiv.addChild("protoDiv",tree.protoDiv);
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
  
  tree.setNote = function(k,note) {
    var h = '<b>'+k+':</b> '+note
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 


  var annLink = dom.newJQ({'tag':'div'});
  annLink.addChild('caption',dom.newJQ({'tag':'div'}));
  annLink.addChild('link',dom.newJQ({'tag':'div'}));

  function setTopNote() {
    var note = draw.wsRoot.topNote;
    if (note) {
      topNoteDiv.setHtml(note);
    }
  }
// returns "ok", or an error message
function afterSave(rs) {
  if (rs.status=='fail') {
    if (rs.msg == 'collision') {
      var ht = 'An unlikely name collision took place. Please try your save again.'
    } else if (rs.msg == 'busy') {
      var ht = 'The site is too busy to do the save. Please try again later';
    } else if ((rs.msg=="noSession")||(rs.msg == "timedOut")) {
      var ht = 'Your session has timed out. Please sign in again.'
      page.logout();
    } else {
      var ht = "Error: "+rs.msg;
    }
    return ht;
  } else {
    return "ok"
  }
}
  
  
  page.saveWS = function () {
    var h = localStorage.handle;
    if (!h) {
      mpg.lightbox.pop();
      mpg.lightbox.setHtml("You must be logged in to save items. No registration is required - just use your twitter account or email address.")
      return;
    }
    draw.wsRoot.__beenModified__ = 1;
    var paths = draw.wsRoot.computePaths();
    var whr = paths.host + "/" + localStorage.handle + "/" + 'variant' + paths.path +  "/";
    var  suggested = om.randomName();
    var ht = "Save as <br/>"+whr+"<input id='saveAs' type='text' style='width:200px' value='"+suggested+"'></input>";
    ht += '<p><div class="button" id="saveButton">Save</div><div class="button" id="cancelButton">Cancel</div></p>';
    ht += '<p id="lbError" class="error"></p>';
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(ht);
    $('#cancelButton').click(function (){mpg.lightbox.dismiss()})
    $('#saveButton').click(function (){
      var sva = $('#saveAs').prop('value');
      if (!om.checkName(sva)) {
        $('#lbError').html('Error: the last part of the path must contain only letters, numerals, or the underbar, and may not start with a numeral.');
        return;
      }
      var url = whr + sva;
      var upk = om.unpackUrl(url,true);
      
      om.s3Save(draw.wsRoot,upk,function (srs) {
        mpg.lightbox.pop();
        var asv = afterSave(srs);
        if (asv == "ok") {
          var msg = om.mkLinks(upk,'saved');
        } else {
          msg = asv;
        }
        mpg.lightbox.setHtml(msg);
      },true); // true = remove computed
    });
  }
        
  
  var saveBut = jqp.button.instantiate();
  saveBut.html = "Save";
  actionDiv.addChild("save",saveBut);
  saveBut.click = page.saveWS;

 
 

  page.saveImage = function () {  
    var h = localStorage.handle;
    if (!h) {
      mpg.lightbox.pop();
      mpg.lightbox.setHtml("You must be logged in to save images. No registration is required - just use your twitter account or email address.")
      return;
    }
    var qs = om.parseQuerystring();
    var url = qs.item;
    var upk = om.unpackUrl(url);
    var img = upk.image;
    var h = localStorage.handle;
    if (h == upk.handle) {
        var pth = '/'+h+img;
    } else {
      // this is someone else's item, but we want to store it in the user's tree, so need to make up a name
      if (draw.wsRoot.__autonamed__) {
        upk = om.unpackUrl(url,1);
      }
      pth = "/"+h+upk.path+"/"+om.randomName()+".jpg";
    }
    draw.postCanvas(pth,function (rs) {
      mpg.lightbox.pop();
      var asv = afterSave(rs);
      if (asv == "ok") {
        var fnm = upk.host + pth;
        var msg = '<div>The image has been stored at '+mkLink(fnm)+'</div>'; 
      } else {
        msg = asv;
      }
     
     mpg.lightbox.setHtml(msg);
    });     
  }
  
  
  
  var saveImageBut = jqp.button.instantiate();
  saveImageBut.html = "Save Image";
   actionDiv.addChild("saveImage",saveImageBut);
  saveImageBut.click = page.saveImage;

 

  
  var viewBut = jqp.button.instantiate();
  viewBut.html = "View...";
  actionDiv.addChild("view",viewBut);

  var vsel = dom.Select.mk();
  
  vsel.containerP = jqp.pulldown;
  vsel.optionP = jqp.pulldownEntry;
  vsel.options = ["Only editable fields",
                  "All fields except functions",
                  "All fields, including functions"];
  vsel.optionIds = ["editable","notFunctions","all"];
  vsel.onSelect = function (n) {
    if (n==0) {
      tree.onlyShowEditable = true;
      tree.showFunctions = false;
    } else if (n==1) {
      tree.onlyShowEditable = false;
      tree.showFunctions = false;
    } else {
      tree.onlyShowEditable = false;
      tree.showFunctions = true;
    }
    tree.initShapeTreeWidget();
    tree.refreshProtoChain();
  }
  
  
  vsel.selected = 1;
  tree.onlyShowEditable= false;
  tree.showFunctions = false;
  
  var vselJQ = vsel.toJQ();
  page.vv = vselJQ;
  mpg.addChild(vselJQ); 
  vselJQ.hide();

  
  page.popViews = function () {
    if (page.viewsPopped) {
      vselJQ.hide();
      page.viewsPopped = 0;
      return;
    }
    var mof = mpg.offset();
    var ht = viewBut.height();
    var ofs = viewBut.offset();
    var rofL = ofs.left-mof.left;
    var rofT = ofs.top-mof.top;
    vselJQ.css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
    page.viewsPopped = 1;
  }
  
  page.hideViewsSel = function () {
    vselJQ.hide();
  }
  
  viewBut.click = function () {dom.popFromButton("views",viewBut,vselJQ);}
  
  
  
  var optionsBut = jqp.button.instantiate();
  optionsBut.html = "Options...";
  actionDiv.addChild("options",optionsBut);

  
  var osel = dom.Select.mk();
  
  osel.containerP = jqp.pulldown;
  osel.optionP = jqp.pulldownEntry;
  osel.options = ["Auto update",
                  "Manual update"];
  osel.optionIds = ["auto","manual"];
  osel.onSelect = function (n) {
    if (n==0) {
      tree.autoUpdate = 1;
      updateBut.hide();
      contractBut.hide();
    } else if (n==1) {
      tree.autoUpdate = 0;
      updateBut.show();
      contractBut.show();
    }
  }
  
  tree.autoUpdate = 1;
  
  page.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
  
  osel.selected = 0;
 
  var oselJQ = osel.toJQ();
  mpg.addChild(oselJQ); 
  oselJQ.hide();

  optionsBut.click = function () {dom.popFromButton("options",optionsBut,oselJQ);}

  
 
  var updateBut = jqp.button.instantiate();
  updateBut.html = "Update";
  actionDiv.addChild("update",updateBut);
 
  function updateAndShow() {
    draw.wsRoot.removeComputed();
    draw.wsRoot.deepUpdate(draw.overrides);
    draw.fitContents();
    tree.initShapeTreeWidget();
  }
  
  updateBut.click = function () {
    dom.unpop();
    updateAndShow();
  }
  
  tree.updateAndShow = updateAndShow; // make this available in the tree module
    
    
  var contractBut = jqp.button.instantiate();
  contractBut.html = "Remove Computed";
  actionDiv.addChild("contract",contractBut);

  contractBut.click = function () {
    dom.unpop();
    draw.wsRoot.removeComputed();
    tree.initShapeTreeWidget();
    draw.refresh();
  };
  
  
  var aboutBut = jqp.button.instantiate();
  aboutBut.html = "About";
  actionDiv.addChild("about",aboutBut);
  aboutBut.click = function () {
    dom.unpop();
    var rt = draw.wsRoot;
    mpg.lightbox.pop();
    var tab = rt.__about__;
    var ht = '<p>The general <i>about</i> page for Prototype Jungle is <a href="http://prototypejungle.org/about.html">here</a>. This note concerns the current item.</p>';
    var src = rt.__source__;
    if (src) {
      ht += "<p>Source code: "+om.mkLink(src);
      if (rt.__beenModified__) {
        ht += " with subsequent modifications";
      ht += "</p>";
      }
    }
    var org = rt.__source__;
    if (tab) ht += "<div>"+tab+"</div>";
    mpg.lightbox.setHtml(ht);
  }



 function getHelpHtml()  {
  if (page.helpHtml) return page.helpHtml;
  if (page.includeDoc) {
  var helpHtml0 = '<p> Please see the explanations at the bottom of this  intro page first (after dismissing this lightbox).  Other topics are covered below.</p>'
 } else {
  var helpHtml0 = '<p>Two panels, labeled "Workspace" and "Prototype Chain", appear on the right-hand side of the screen. The workspace panel displays the hierarchical structure of the JavaScript objects which represent the item. You can select a part of the item either by clicking on it in the graphical display, or in the workspace panel. The <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain">prototype chain</a> of the selected object will be shown in rightmost panel. </p>';
 }

page.helpHtml = helpHtml0 + '<p> The <b>View</b> pulldown allows you to choose which fields are displayed in the workspace and prototype browsers.  </p><p>The significance of the <b>Options</b> pulldowns is as  follows: In most applications, parts of the item are computed from a more compact description.  In auto-update mode, this computation is run every time something changes, but in manual mode, an update button appears for invoking the operation explicitly, and also a "remove computed" button, so you can see what is being recomputed.  (Many changes are seen immediately even in manual mode - those which have effect in a redraw, rather than a regeneration of the item).   ';
return page.helpHtml;
 }
 
   var helpBut = jqp.button.instantiate();
  helpBut.html = "Help";
   actionDiv.addChild("help",helpBut);
   helpBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(getHelpHtml());
   };
   
  mainTitleDiv.click = function () {
    location.href = "/";
  }
  
  
  toViewer.click = function () {
    location.href = page.itemUrl;
  }
  page.genMainPage = function (cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    if (page.includeDoc) {
      mpg.addChild("doc",docDiv);
    }
    mpg.install($("body"));
    var oselEl =osel.jq.__element__;
    oselEl.mouseleave(function () {dom.unpop();});
    vsel.jq.__element__.mouseleave(function () {dom.unpop();});
    page.genButtons(ctopDiv.__element__,{toExclude:'about'});
    updateBut.hide();
    contractBut.hide();
    //tree.noteDiv.hide();
    //tree.noteDivP.hide();
    draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
    if (draw.hitCanvasEnabled) {
      draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');
    } else {
      draw.hitCanvasActive = 0;
    }
    $('body').css({"background-color":"#eeeeee"});
    mpg.css({"background-color":"#444444","z-index":200})
    layout();
    var r = geom.Rectangle.mk({corner:[0,0],extent:[700,200]});
    var r = geom.Rectangle.mk({corner:[0,0],extent:[700,200]});
    var lb = lightbox.newLightbox($('body'),r,__pj__.lightbox.template.instantiate());
    mpg.set("lightbox",lb);
    cb();   
  }
    
  
      
   // either nm,scr (for a new empty page), or ws (loading something into the ws) should be non-null
  
  page.initPage = function (o) {
    var nm = o.name;
    var scr = o.screen;
    var wssrc = o.wsSource;
    page.itemUrl =  wssrc;
    var noInst = o.noInst;
    var isAnon = wssrc && ((wssrc.indexOf("http:") == 0) || (wssrc.indexOf("https:")==0));
    var inst = o.instantiate;
    var cb = o.callback;
     $('document').ready(
        function () {
          $('body').css({"background-color":"white",color:"black"});
          om.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a page-back inadvertantly
          page.genMainPage(function () {
            //draw.test();
            //return;// TAKEOUT
            draw.init();
            if (!wssrc) {
              page.genError("<span class='errorTitle'>Error:</span> no item specified (ie no ?item=... )");
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
                var rs = ars[ln-1];
                inst  = !(rs.__autonamed__) &&  !noInst; // instantiate directly built fellows, so as to share their code
                var ovr = installOverrides(rs);
                var ws = __pj__.set("ws",om.DNode.mk());
                if (inst) {
                  var frs = rs.instantiate();
                } else {
                  frs = rs;
                }
                ws.set(rs.__name__,frs); // @todo rename if necessary
                draw.wsRoot = frs;
                setTopNote();
                draw.overrides = ovr;
                frs.deepUpdate(ovr);
                var bkc = frs.backgroundColor;
                if (!bkc) {
                  frs.backgroundColor="white";
                } 
                om.loadTheDataSources([frs],function () {
                  // for some reason, computeBounds breaks html5 canvas on chrome, unless it has a moment to recover from its
                  // first draw before doing a getImageData. so we initialize autoFit to 0, and then turn it back on after a moment. Funky!
                  var isChrome = navigator.userAgent.match('Chrome');
                  if (!isChrome) {
                    draw.autoFit = 1;
                  }
                  updateAndShow();
                  tree.openTop();
                  if (isChrome) {
                    setTimeout(function () {
                      draw.autoFit = 1;
                      draw.fitContents();
                    },100);
                  }
                  if (cb) cb();
                });
              }
            }
            if (nm) {
              draw.emptyWs(nm,scr);
              afterInstall();
            } else {
                var lst = om.pathLast(wssrc);
                om.install(wssrc,afterInstall)
            }
            
            $(window).resize(function() {
                layout();
                draw.fitContents();
              });   
          });
        });
  }
})(__pj__);

