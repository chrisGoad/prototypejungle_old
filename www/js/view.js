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
  var bkColor = "white";  

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
    var cnvwd = winwid-20;
    var cnvht = winht-20;
    mpg.css({left:0+"px",width:cnvwd});
    draw.mainCanvas.div.attr({width:cnvwd,height:cnvht}); 
    draw.mainCanvas.hitDiv.attr({width:cnvwd,height:cnvwd});
     draw.canvasWidth = cnvwd;
    draw.canvasHeight = cnvht;
    theCanvas.positionButtons(cnvwd);
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

    canvasDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
      ibut = jqp.button.instantiate().set({html:"Inspect",style:{position:"absolute",top:"0px",left:"10px"}}),
    ]);
   mpg.addChild("canvasDiv", canvasDiv);
   
  ibut.click = function () {
    var host = location.host;
    if (host === "s3.prototypejungle.org") {
      var whr = "http://prototypejungle.org/"
    } else {
      whr = "/";
    }
    window.top.location.href = whr + "inspect?item="+page.itemPath;
  };
  
  
  page.genError = function (err) {
    mpg.install($("body"));
    layout();
  }

  page.genMainPage = function () {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    theCanvas = dom.addCanvas(canvasDiv);
    theCanvas.contents = om.root;

    mpg.install($("body"));
    theCanvas.initButtons();
    layout();
    theCanvas.init();
    $('body').css({"background-color":"white"});
    mpg.css({"background-color":"white"})
    layout();
  }
      
  
  page.initPage = function (o) {
    draw.viewerMode = 1;
    draw.bkColor = "white";
    draw.selectionEnabled = 0;
    var wssrc = o.item;
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
        function extractOverrides(itm) {
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
            var ovr = extractOverrides(rs);
            if (inst) {
              var frs = rs.instantiate();
              __pj__.set(rs.__name__,frs); // @todo rename if necessary
            } else {
              frs = rs;
            }
            om.root = frs;
            page.genMainPage();
            draw.overrides = ovr;
            //frs.deepUpdate(null,ovr);
            var bkc = frs.backgroundColor;
            if (!bkc) {
              frs.backgroundColor="rgb(255,255,255)";
            }
            var ds = om.initializeDataSource(page.unpackedUrl);
            if (ds) {
              om.tlog("BEFORE LOAD DATA");
              // page.setDataSourceInHref(om.root.dataSource);
              om.loadData(ds,function (err,dt) {
                om.afterLoadData(err,dt);
                theCanvas.initialView();
                //afterAfterLoadData();
              });
            } else {
              om.afterLoadData();
              theCanvas.initialView();
             // afterAfterLoadData();
            }
        
          }
        }      
           
        var lst = om.pathLast(wssrc);
        if (inst) {
          var fdst = lst; // where to install the instance
        }
        //alert("loading "+wssrc);
        om.install(wssrc,afterInstall);
        $(window).resize(function() {
            layout();
            draw.fitContents();
          });   
      });
  }
    
  
})(prototypeJungle);

