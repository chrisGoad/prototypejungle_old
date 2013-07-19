(function () {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.set("page",om.DNode.mk());
  var treePadding = 10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 900;
  function layout() { 
    var winwid = Math.max($(window).width(),minWidth);
    var winht  = $(window).height();
    // aspect ratio of the UI is 0.5
    var twd = 2 * winht;
    if (twd < winwid) {
      var pageWidth = twd;
      var lrs = 0.5 * (winwid-twd);
      var pageHeight = winht;
    } else {
      var lrs = 30;
      var pageWidth = winwid - 2*lrs;
      var pageHeight = 0.5 * pageWidth;
    }
    if (page.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = winht - pageHeight - 30;
      //code
    }
   /*
    var pjwid = 1200
    if (winwid < pjwid) {
      pjwid  = winwid;
    }
    var lrs = Math.max(30,0.5 * (winwid-pjwid));//left right space
    */
    var canvasWidth = pageWidth/2;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - 2*treePadding;
    //mpg.css({left:lrs+"px",width:pjwid+"px",height:pageHeight+"px"});
    mpg.css({left:lrs+"px",width:pageWidth+"px"});

    cols.css({left:"0px",width:pageWidth+"px"});
     // 2*pageHeight is for debugging gthe hit canvas
  //  uiDiv.css({top:"0px",left:canvasWidth+"px",width:(canvasWidth + "px"),height:(pageHeight + "px")})
     uiDiv.css({top:"0px",left:canvasWidth+"px",width:(canvasWidth + "px")})
   actionDiv.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:canvasWidth+"px",top:"0px"});
    var actionHt = actionDiv.__element__.outerHeight();
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var canvasHeight = pageHeight - actionHt -30;
    cnv.attr({width:canvasWidth,height:canvasHeight});
    hitcnv.attr({width:canvasWidth,height:canvasHeight});
    //cdiv.css({top:"0px",width:(canvasWidth + "px"),height:(cdivHt + "px"),left:"0px"});
    var treeHt = canvasHeight - 2*treePadding;
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
  var titleDiv = dom.newJQ({tag:"div",html:"Prototype Jungle ",hoverIn:{"color":"#777777"},hoverOut:{color:"black"},style:{color:"black","cursor":"pointer","float":"left",font:"bold 12pt arial","padding-left":"60px","padding-top":"10px"}});
  var ctopDiv = dom.newJQ({tag:"span"});
  titleDiv.addChild(ctopDiv);
  var subtitleDiv = dom.newJQ({tag:"div",html:"Inspector/Editor",style:{font:"10pt arial"}});
 var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
     mpg.addChild("tobar",topbarDiv);
  topbarDiv.addChild("title",titleDiv);
  titleDiv.addChild("subtitle",subtitleDiv);

  var cols =  dom.newJQ({tag:"div",style:{left:"0px",position:"relative"}});
  mpg.addChild("columns",cols);
  var cdiv =  dom.newJQ({tag:"div",style:{postion:"absolute","background-color":"white",border:"solid thin green",display:"inline-block"}});
  cols.addChild("canvasDiv", cdiv);
  
  var cnvht = draw.hitCanvasDebug?"50%":"100%"
  var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"100%",height:cnvht}});
  cdiv.addChild("canvas", cnv);
  draw.theCanvas = cnv;

  
  
  var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:"100%",height:cnvht}});
  //cdiv.addChild("hitcanvas", hitcnv);
  mpg.addChild("hitcanvas", hitcnv);
  draw.hitCanvas = hitcnv;
 
  var uiDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px",
                               padding:"0px"}});
  cols.addChild("uiDiv",uiDiv);


  var actionDiv = dom.newJQ({tag:"div",style:{position:"absolute",margin:"0px",
                              overflow:"none",padding:"5px",height:"20px"}});

  topbarDiv.addChild('action',actionDiv);
  
  
  tree.obDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                               overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}});
  uiDiv.addChild("obDiv",tree.obDiv);
  var obDivTitle = dom.newJQ({tag:"div",html:"Workspace",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}});
  tree.obDiv.addChild("title",obDivTitle);
  tree.noteDiv = dom.newJQ({tag:"div",html:"Notes:",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}});
  tree.obDiv.addChild("notes",tree.noteDiv);
  tree.obDivRest = dom.newJQ({tag:"div"});
  tree.obDiv.addChild("rest",tree.obDivRest); 
  docDiv =  dom.newJQ({tag:"iframe",attributes:{src:"chartdoc.html"},style:{position:"absolute"}});
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
  tree.protoDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}});
  
  tree.protoDivTitle = dom.newJQ({tag:"div",html:"Prototype Chain",style:{"border-bottom":"solid thin black"}});
  tree.protoDiv.addChild("title",tree.protoDivTitle);
  tree.noteDivP = dom.newJQ({tag:"div",html:"NotesP:",style:{"margin-bottom":"10px","padding":"10px","border-bottom":"solid thin black"}});
  tree.protoDiv.addChild("notesp",tree.noteDivP);
  tree.protoDivRest = dom.newJQ({tag:"div"});
  tree.protoDiv.addChild("rest",tree.protoDivRest);

  tree.protoSubDiv = dom.newJQ({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});
 uiDiv.addChild("protoDiv",tree.protoDiv);
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
  
  tree.setNote = function(k,note,inProto) {
    var div = inProto?tree.noteDivP:tree.noteDiv;
    if (note) {
      div.show();
      div.__element__.html('<b>'+k+':</b> '+note);
    } else {
      div.hide();
    }
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 


  var annLink = dom.newJQ({'tag':'div'});
  annLink.addChild('caption',dom.newJQ({'tag':'div'}));
  annLink.addChild('link',dom.newJQ({'tag':'div'}));
  
  
  
  page.saveWS = function () {
    draw.wsRoot.__beenModified__ = 1;
    om.s3Save(draw.wsRoot,function (nm) {
      mpg.lightbox.pop();
      if (nm == true) {
        var ht = 'An unlikely name collision took place. Please try your save again.'
      } else {
        alert(22);
        var links = om.mkLinks(nm);
        mpg.lightbox.setHtml(links);
        return;
        var fnm = prf+nm
        var cdlink = prf + "code/"+nm+".js";
        var itmlink = prf + "data/"+nm+".js";
        var inslink = "http://prototypejungle.org/inspect?item="+fnm;
        var viewlink = "http://prototypejungle.org/view?item="+fnm;
        
        var ins = annLink.instantiate();
        ins.selectChild('caption').html = 'To inspect the item you just saved:';
        ins.selectChild('link').html = mkLink(inslink);
   
        var vw = annLink.instantiate();
        vw.selectChild('caption').html = 'To view the item you just saved:';
        vw.selectChild('link').html = mkLink(viewlink);
   
        var itm = annLink.instantiate();
        itm.selectChild('caption').html = 'The JSON that describes the structure of this item:';
        itm.selectChild('link').html = mkLink(itmlink);
   
        var cd = annLink.instantiate();
        cd.selectChild('caption').html = 'The JavaScript functions associated with this itemc';
        cd.selectChild('link').html = mkLink(cdlink);
         mpg.lightbox.empty();
        mpg.lightbox.installContent(ins);
        mpg.lightbox.installContent(vw);
        mpg.lightbox.installContent(itm);
        mpg.lightbox.installContent(cd);

      }
    });
  }
        
  
   var saveBut = jqp.button.instantiate();
  saveBut.html = "Save";
   actionDiv.addChild("save",saveBut);
     saveBut.click = page.saveWS;

 
 

  page.saveImage = function () {
    var nm = om.randomName();
    draw.postCanvas(nm,function (rs) {
      mpg.lightbox.pop();
      if (rs.value == 'True') {
        var ht = 'An unlikely name collision took place. Please try your save again.'
      } else {
        var fnm = "https://s3.amazonaws.com/prototypejungle/image/"+nm+".jpg";
        var ht = '<div>'+mkLink(fnm)+'</div>'; // @todo
      }
     mpg.lightbox.setHtml(ht);
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
  
  
  osel.selected = 0;
 
  var oselJQ = osel.toJQ();
  //page.vv = vselJQ;
  mpg.addChild(oselJQ);
  oselJQ.hide();

  optionsBut.click = function () {dom.popFromButton("options",optionsBut,oselJQ);}

  
 
  var updateBut = jqp.button.instantiate();
  updateBut.html = "Update";
   actionDiv.addChild("update",updateBut);
 
  function updateAndShow() {
    draw.wsRoot.deepUpdate();
    draw.fitContents();
    tree.initShapeTreeWidget();
  }
  updateBut.click = updateAndShow;
  tree.updateAndShow = updateAndShow; // make this available in the tree module
    
    
  var contractBut = jqp.button.instantiate();
  contractBut.html = "Contract";
  actionDiv.addChild("contract",contractBut);

  contractBut.click = function () {
    dom.unpop();
    draw.wsRoot.deepContract();
    tree.initShapeTreeWidget();
    draw.refresh();
  };
  
  
  var aboutBut = jqp.button.instantiate();
  aboutBut.html = "About";
  actionDiv.addChild("about",aboutBut);
  aboutBut.click = function () {
    var rt = draw.wsRoot;
    mpg.lightbox.pop();
    var tab = rt.__about__;
    var ht = '<p>Note: The general <i>about</i> page for PrototypeJungle is <a href="http://prototypejungle.org/about.html">here</a></p>';
    var src = rt.__source__;
    if (src) {
      ht += "<p>Source code: "+om.mkLink(src);
      if (rt.__beenModified__) {
        ht += " with subsequent modifications";
      ht += "</p>";
      }
    }
    if (tab) ht += "<div>"+tab+"</div>";
    mpg.lightbox.setHtml(ht);
  }



 function getHelpHtml()  {
  if (page.helpHtml) return page.helpHtml;
  if (page.includeDoc) {
  var helpHtml0 = '<p> Please see the explanations at the bottom of this  intro page first (after dismissing this lightbox).  Other topics are covered below.</p>'
 } else {
  var helpHtml0 = '<p>Two panels, labeled "Workspace" and "Prototype Chain", appear on the right-hand side of the screen. The workspace panel displays the hierarchical structure of the JavaScript objects which represent the item. You can select a part of the item either by clicking on it in the graphical display, or in the workspace panel. The prototype chain of the selected object will be shown in rightmost panel. (For an explanation of prototype chains, see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain" target="_blank">this</a> document.) Note that many fields are editable.</p>';
 }

page.helpHtml = helpHtml0 + '<p> The <b>View</b> pulldown allows you to choose which fields are displayed in the workspace and prototype browsers.  </p><p>The significance of the <b>Options</b> pulldows is as  follows: In most applications, parts of the item are computed from a more compact description.  In auto-update mode, this computation is run every time something changes, but in manual mode, an update button appears for invoking the operation explicitly.  (Many changes are seen immediately even in manual mode - those which have effect in a redraw, rather than a regeneration of the item). Also, in auto-update mode, the automatically constructed parts of the item are removed before saving,  and are recomputed upon restore.  In manual mode, the "compact" button controls this removal operation.  This is useful if you wish to override results of the update computation, and store your overrides (at the expense of a larger file-size for the save). ';
return page.helpHtml;
 }
 
   var helpBut = jqp.button.instantiate();
  helpBut.html = "Help";
   actionDiv.addChild("help",helpBut);
   helpBut.click = function () {
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(getHelpHtml());
   };
   
  titleDiv.click = function () {
    location.href = "/";
  }
  
  page.genMainPage = function (cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
   
   
    if (page.includeDoc) {
      mpg.addChild("doc",docDiv);
    }
    mpg.install($("body"));
   __pj__.genButtons(ctopDiv.__element__,'about');
 
  //__pj__.genTopbar(actionDiv.__element__);
  
  updateBut.hide();
  contractBut.hide();
  tree.noteDiv.hide();
  tree.noteDivP.hide();
  draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
    draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');

    $('body').css({"background-color":"#eeeeee"});
    mpg.css({"background-color":"#444444"})
    layout();


     var r = geom.Rectangle.mk({corner:[0,0],extent:[700,200]});

        
    var r = geom.Rectangle.mk({corner:[0,0],extent:[700,200]});
    var lb = lightbox.newLightbox($('body'),r,__pj__.lightbox.template.instantiate());
    mpg.set("lightbox",lb);
  
  }
    
  
      
   // either nm,scr (for a new empty page), or ws (loading something into the ws) should be non-null
  
  page.initPage = function (o) {
    var nm = o.name;
    var scr = o.screen;
    var wssrc = o.wsSource;
    var isAnon = wssrc && ((wssrc.indexOf("http:") == 0) || (wssrc.indexOf("https:")==0));
    var inst = o.instantiate;
    var cb = o.callback;
     $('document').ready(
        function () {
          $('body').css({"background-color":"white",color:"black"});
          page.genMainPage();
          draw.whenReady(function () {
            if (!draw.hitCanvasDebug) {
              draw.hitCanvas.css({'display':'none'});
            }            //page.showFiles();
            function afterInstall(rs) {
              if (rs) {
                if (inst) {
                  var frs = rs.instantiate();
                  __pj__.set(rs.__name__,frs); // @todo rename if necessary
                } else {
                  frs = rs;
                }
                draw.wsRoot = frs;
              }
              updateAndShow();
              //tree.initShapeTreeWidget();
              //draw.fitContents();
               if (cb) cb();
            }
            if (nm) {
              draw.emptyWs(nm,scr);w
              afterInstall();
            } else {
                var lst = om.pathLast(wssrc);
                if (inst) {
                  var fdst = lst; // where to install the instance
                } 
                om.install(wssrc,afterInstall)
            }
            
            $(window).resize(function() {
                layout();
                draw.fitContents();
              });   
          });
        });
  }
    
  
})();

