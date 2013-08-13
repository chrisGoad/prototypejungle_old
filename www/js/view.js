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
  
  function layout() {
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

    cnv.attr({width:cnvwd,height:cnvht});
    hitcnv.attr({width:cnvwd,height:cnvht});
    draw.canvasWidth = cnvwd;
    draw.canvasHeight = cnvht;
    // 2*pageHeight is for debugging gthe hit canvas
    //cdiv.css({top:"0px",width:(cwid + "px"),height:(cht + "px"),left:"0px"});
   // topbarDiv.css({width:cwid+"px",left:"0px"});
}
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  draw.canvasWidth = 600;
   
  var jqp = __pj__.jqPrototypes;
  //var topbarDiv = dom.newJQ({tag:"div",style:{left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  //var titleDiv = dom.newJQ({tag:"div",html:"PrototypeJungle",style:{"margin":"0px",padding:"0px"}});
  //var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
  var mpg = dom.newJQ({tag:"div"});
  //mpg.addChild("title",titleDiv);
     //mpg.addChild("topbar",topbarDiv);
  var errorDiv =  dom.newJQ({tag:"div",style:{"display":"none","text-align":"center",width:"100%","padding-top":"40px"}});
  errorDiv.hide();
  mpg.addChild("error",errorDiv);

 var cdiv =  dom.newJQ({tag:"div",style:{postion:"absolute","background-color":"white",display:"inline-block"}});
  mpg.addChild("canvasDiv", cdiv);

  

  var ibut = jqp.button.instantiate();
  ibut.style.position = "absolute";
  ibut.style.top = "10px";
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
    location.href = whr + "inspect?item="+page.itemPath;
  };
  
  var cnv = dom.newJQ({tag:"canvas",style:{"position":"absolute","top":"0px"},attributes:{border:"solid thin green",width:"100%"}});
  cdiv.addChild("canvas", cnv);
  draw.theCanvas = cnv;
    cdiv.addChild(ibut);

  var hitcnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin blue",width:"100%"}});
  //cdiv.addChild("hitcanvas", hitcnv);
  mpg.addChild("hitcanvas", hitcnv);
  draw.hitCanvas = hitcnv;
  if (!draw.hitCanvasDebug) {
    hitcnv.css('display','none');
  }
 

 
  
 
 
  page.genError = function (err) {
    mpg.install($("body"));
    layout();
  }

  page.genMainPage = function () {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg); 
    mpg.install($("body"));
    //var errorDiv = 
    draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
    draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');
    $('body').css({"background-color":"white"});
    mpg.css({"background-color":"white"})
    layout();
  }
    
   // either nm,scr (for a new empty page), or ws (loading something into the ws) should be non-null
  
  page.initPage = function (o) {
    var nm = o.name;
    var scr = o.screen;
    var wssrc = o.wsSource;
    page.itemPath = wssrc;
    var isAnon = wssrc && ((wssrc.indexOf("http:") == 0) || (wssrc.indexOf("https:")==0));
    var inst = o.instantiate;
    var cb = o.callback;
     $('document').ready(
        function () {
          $('body').css({"background-color":"white",color:"black"});
          page.genMainPage();
          draw.init();
          if (!wssrc) {
            errorDiv.show();
            errorDiv.html("<span class='errorTitle'>Error:</span> no item specified (ie no ?item=... )");
            return;
          }  //page.showFiles();
          
          
          
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
            draw.overrides = ovr;
            frs.deepUpdate(ovr);
           
            var bkc = frs.backgroundColor;
            if (!bkc) {
              frs.backgroundColor="rgb(255,255,255)";
            } 
          }
          
          draw.wsRoot.deepUpdate(draw.overrides);
          draw.fitContents();
          if (cb) cb();
        }
               
          /*     
          function afterInstall(rs) {
            draw.wsRoot = rs;
            var ovr = rs.__overrides__;
            if ((!ovr) || Array.isArray(ovr)) {
              ovr = {}; //TEMPORARY until rebuilds
            }
            draw.overrides = ovr;
            draw.wsRoot.deepUpdate(ovr);
            draw.fitContents();
             if (cb) cb();
          }
         */
          var lst = om.pathLast(wssrc);
          if (inst) {
            var fdst = lst; // where to install the instance
          }
          om.install(wssrc,afterInstall)
          $(window).resize(function() {
              layout();
              draw.fitContents();
            });   
        });
  }
    
  
})(__pj__);

