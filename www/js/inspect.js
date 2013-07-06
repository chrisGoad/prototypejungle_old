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
  var withDoc  = 1;
  function layout() { 
    var winwid = $(window).width();
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
    if (withDoc) {
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
   actionDiv.css({width:(uiWidth + "px"),"padding-top":"20px","padding-bottom":"20px",left:canvasWidth+"px",top:"0px"});
    var actionHt = actionDiv.__element__.outerHeight();
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var canvasHeight = pageHeight - actionHt -30;
    cnv.attr({width:canvasWidth,height:canvasHeight});
    hitcnv.attr({width:canvasWidth,height:canvasHeight});
    //cdiv.css({top:"0px",width:(canvasWidth + "px"),height:(cdivHt + "px"),left:"0px"});
    var treeHt = canvasHeight - 2*treePadding;
    obDiv.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    draw.canvasWidth = canvasWidth;
    draw.canvasHeight = canvasHeight;
    docDiv.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});

}
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  draw.canvasWidth = 600;
  draw.canvasHeight = 600;;
  tree.codeToSave = "top";
  
  var jqp = __pj__.jqPrototypes;
  var topbarDiv = dom.newJQ({tag:"div",style:{position:"relative",left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  var titleDiv = dom.newJQ({tag:"div",html:"Prototype Jungle",style:{"float":"left",font:"bold 12pt arial","padding-left":"60px","padding-top":"20px"}});
  var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
     mpg.addChild("tobar",topbarDiv);
  topbarDiv.addChild("title",titleDiv);

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
  
  
  var obDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                               overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}});
  uiDiv.addChild("obDiv",obDiv);
  docDiv =  dom.newJQ({tag:"iframe",attributes:{src:"chartdoc.html"},style:{position:"absolute"}});
  mpg.addChild("doc",docDiv);
  obDiv.click = function () {
    dom.unpop();
  };
  
  tree.protoDiv = dom.newJQ({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}});
  tree.protoDivTitle = dom.newJQ({tag:"div",html:"Prototitle"});
  tree.protoDiv.addChild("title",tree.protoDivTitle);
  tree.protoDivRest = dom.newJQ({tag:"div"});
  tree.protoDiv.addChild("rest",tree.protoDivRest);

  tree.protoSubDiv = dom.newJQ({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});
 uiDiv.addChild("protoDiv",tree.protoDiv);
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
 
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 



 
  page.saveWS = function () {
    om.s3Save(draw.wsRoot,function (nm) {
      mpg.lightbox.pop();
      if (nm == true) {
        var ht = 'An unlikely name collision took place. Please try your save again.'
      } else {
        var fnm = "https://s3.amazonaws.com/prototypejungle/item/"+nm
        var ht = '<div>'+mkLink(fnm)+'</div>'; // @todo
        var itm = "http://prototypejungle.org/inspect?item="+fnm;
        ht += '<div>'+mkLink(itm)+'</div>';
      }
     mpg.lightbox.setHtml(ht);
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

 
 
 

 
  var updateBut = jqp.button.instantiate();
  updateBut.html = "Update";
   actionDiv.addChild("update",updateBut);
 
  updateBut.click = function () {
      draw.wsRoot.deepUpdate();
      draw.fitContents();
      tree.initShapeTreeWidget();
    };
    
    
  var contractBut = jqp.button.instantiate();
  contractBut.html = "Contract";
  actionDiv.addChild("contract",contractBut);

  contractBut.click = function () {
    dom.unpop();
    draw.wsRoot.deepContract();
    tree.initShapeTreeWidget();
    draw.refresh();
  };
  
  
   var viewBut = jqp.button.instantiate();
  viewBut.html = "View...";
   actionDiv.addChild("view",viewBut);

  var vsel = dom.Select.mk();
  vsel.selected = 0;
  
  vsel.containerP = jqp.pulldown;
  vsel.optionP = jqp.pulldownEntry;
  vsel.options = ["Only editable fields",
                  "All fields except functions",
                  "All fields, including functions"];
  vsel.optionIds = ["editable","notFunctions","all"];
  vsel.onSelect = function (n) {
    if (n==0) {
      tree.showNonEditable = false;
      tree.showFunctions = false;
    } else if (n==1) {
      tree.showNonEditable = true;
      tree.showFunctions = false;
    } else {
      tree.showNonEditable = true;
      tree.showFunctions = true;
    }
    tree.initShapeTreeWidget();
    tree.refreshProtoChain();

  }
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
  
  titleDiv.click = function () {
    location.href = "/";
  }
  
  page.genMainPage = function (cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
   
   
    
    
    mpg.install($("body"));
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
                  __pj__.set(fdst,frs);
                } else {
                  frs = rs;
                }
                draw.wsRoot = frs;
              }
              tree.initShapeTreeWidget();
              draw.fitContents();
               if (cb) cb();
            }
            if (nm) {
              draw.emptyWs(nm,scr);
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

