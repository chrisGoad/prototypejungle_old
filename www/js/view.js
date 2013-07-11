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
  function layout() { 
    var winwid = $(window).width();
    var winht = $(window).height();
    var cnvht = winht*0.80;
    var cnvwd = winwid-50;
    mpg.css({left:25+"px",width:cnvwd});
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
  var topbarDiv = dom.newJQ({tag:"div",style:{left:"0px","background-color":bkColor,"margin":"0px",padding:"0px"}});
  //var titleDiv = dom.newJQ({tag:"div",html:"PrototypeJungle",style:{"margin":"0px",padding:"0px"}});
  //var mpg = dom.newJQ({tag:"div",style:{position:"absolute","margin":"0px",padding:"0px"}});
  var mpg = dom.newJQ({tag:"div"});
  //mpg.addChild("title",titleDiv);
     mpg.addChild("topbar",topbarDiv);
 var cdiv =  dom.newJQ({tag:"div",style:{postion:"absolute","background-color":"white",border:"solid thin green",display:"inline-block"}});
  mpg.addChild("canvasDiv", cdiv);

  var cnv = dom.newJQ({tag:"canvas",attributes:{border:"solid thin green",width:"100%"}});
  cdiv.addChild("canvas", cnv);
  draw.theCanvas = cnv;

  
  
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

    
  page.genMainPage = function (cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg); 
    mpg.install($("body"));
    draw.theContext = draw.theCanvas.__element__[0].getContext('2d');
    draw.hitContext = draw.hitCanvas.__element__[0].getContext('2d');
    $('body').css({"background-color":"#eeeeee"});
    mpg.css({"background-color":"#444444"})
    layout();
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
              draw.wsRoot = rs;
              draw.wsRoot.deepUpdate();
              draw.fitContents();
               if (cb) cb();
            }
           
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
        });
  }
    
  
})();

