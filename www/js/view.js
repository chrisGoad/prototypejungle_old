(function (__pj__) {
  debugger;
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
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
   

  function layout(noDraw) {
    debugger;
    var bkg = om.root.backgroundColor;

    var svgwd = svg.main.width;
    var svght = svg.main.height;
    var cdims = geom.Point.mk(svgwd,svght);
    var winwid = $(window).width();
    var winht = $(window).height();
    var svgwd = winwid-30;
    var svght = winht-50;
    mpg.css({left:0+"px",width:svgwd});
    svgDiv.css({width:svgwd +"px",height:svght + "px","background-color":bkg});
    svg.main.resize(svgwd,svght);
    svg.main.positionButtons(svgwd);
    /*
    var rtt = draw.mainCanvas.transform();
    if (rtt && !noDraw) {
      draw.mainCanvas.adjustTransform(rtt,cdims);
      draw.refresh();
    }
    */
  }
  var mpg; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
  //draw.canvasWidth = 600;
   
  var jqp = __pj__.jqPrototypes;
  var mpg = dom.El({tag:"div"});
  var errorDiv =  dom.El({tag:"div",style:{"display":"none","text-align":"center",width:"100%","padding-top":"40px"}});
  errorDiv.hide();
  mpg.addChild("error",errorDiv);

    svgDiv =  dom.El('<div style="postion:absolute;border:none;display:inline-block"/>');
   mpg.addChild("svgDiv", svgDiv);
   
  /*ibut.click = function () {
    var host = location.host;
    if (host === "s3.prototypejungle.org") {
      var whr = "http://prototypejungle.org/"
    } else {
      whr = "/";
    }
    window.top.location.href = whr + "inspect?item=/"+unpackedUrl.spath;
  };
  */
  
  
  page.genError = function (err) {
    mpg.install($("body"));
    layout();
  }

  page.genMainPage = function () {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
   // theCanvas = dom.addCanvas(canvasDiv);
    //theCanvas.contents = om.root;

    mpg.install($("body"));
    svg.init(svgDiv.__element__[0]);

    svg.main.addButtons("Inspect");
    svg.main.navbut.__element__.click(function () {
        var inspectPage = om.useMinified?"/inspect.html":"inspectd.html";
        var url = inspectPage + "?item="+unpackedUrl.spath;
        if (om.root.dataSource) {
          url = url + "&data="+om.root.dataSource;
        }
        location.href = url;
      });
      
      
   
    layout(true); //nodraw
    //theCanvas.init();
    $('body').css({"background-color":"white"});
    mpg.css({"background-color":"white"})
    //layout();
  }
  
function afterAfterLoadData(ok,msgEl,startingUp) {
    //svg.main.setContents(om.root);
    svg.refresh();//  get all the latest into svg
    svg.main.fitContents();
    svg.refresh();
    
  
}
  
  
  
    function loadDataStep(errEl,startingUp) {
      debugger;
      var ds = om.initializeDataSource(page.unpackedUrl);//om.root.dataSource;
      if (ds) {
       // page.setDataSourceInHref(om.root.dataSource);
        om.loadData(ds,function (err,dt) {
          var ok = om.afterLoadData(dt,null,1,errEl);
          afterAfterLoadData(ok,errEl,startingUp);
        });
      } else {
        var ok = om.afterLoadData(null,null,1,errEl);
        afterAfterLoadData(ok,errEl,startingUp);
      }
    }
  
  var errEl;
  page.initPage = function (o) {
    //draw.viewerMode = 1;
    //draw.bkColor = "white";
    //draw.selectionEnabled = 0;
    debugger;
    var wssrc = o.item;
    unpackedUrl = om.unpackUrl(wssrc);
    page.unpackedUrl = unpackedUrl; 
   
    //page.itemPath = wssrc;
    //var isAnon = wssrc && ((wssrc.indexOf("http:") === 0) || (wssrc.indexOf("https:")===0));
    var inst = o.instantiate;
    var cb = o.callback;
     $('document').ready(
        function () {
          errEl = $('#error');
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
            //draw.overrides = ovr;
            //frs.deepUpdate(null,ovr);
            var bkc = frs.backgroundColor;
            if (!bkc) {
              frs.backgroundColor="rgb(255,255,255)";
            }
            loadDataStep(errEl,1);// 1 = starting up
            return;
            var ds = om.initializeDataSource(page.unpackedUrl);
            if (ds) {
              om.tlog("BEFORE LOAD DATA");
              // page.setDataSourceInHref(om.root.dataSource);
              om.loadData(ds,function (err,dt) {
                om.afterLoadData(dt);
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
        om.install(unpackedUrl.url,afterInstall);
        $(window).resize(function() {
            layout();
            //draw.mainCanvas.fitContents();
          });   
      });
  }
   
    
  
})(prototypeJungle);

