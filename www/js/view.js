(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
  // fake a little tree, for code that expects it
  __pj__.set("tree",om.DNode.mk());
  __pj__.tree.adjust = function (){};
  var dataOps = __pj__.dataOps;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var bkColor = "white";  

  page.genError = function (msg) {
    if (page.errorOccurred) return;
    alert("ERROR ",msg); // improve on this
    return;
    page.errorOccurred = 1;
    $('#error')._show();
    $('#error').html(msg);
  }
   

  function layout(noDraw) {
    var bkg = om.root.backgroundColor;
    var svgwd = svg.main.width;
    var svght = svg.main.height;
    var cdims = geom.Point.mk(svgwd,svght);
    var winwid = $(window).width();
    var winht = $(window).height();
    var svgwd = winwid-10;
    var svght = winht-30;
    mpg.css({left:0+"px",width:svgwd,height:svght});
    svgDiv.css({width:svgwd +"px",height:svght + "px","background-color":bkg,borderr:"solid thin red"});
    svg.main.resize(svgwd,svght);
  }
  var mpg; // main page
 
  var jqp = __pj__.jqPrototypes;
  var mpg = dom.El({tag:"div",style:{overflow:"hidden",width:"100%",height:"100%"}});
  var errorDiv =  dom.El({tag:"div",style:{"display":"none","text-align":"center",width:"100%","padding-top":"40px"}});
  errorDiv._hide();
  mpg.addChild("error",errorDiv);

  
  svgDiv =  dom.El('<div style="postion:absolute;overflow:hidden;border:none;display:inline-block"/>');
  mpg.addChild("svgDiv", svgDiv);
  
  page.genError = function (err) {
    mpg.install($("body"));
    layout();
  }

  page.genMainPage = function () {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    mpg.install($("body"));
    svg.init(svgDiv._element[0]);
    layout(true); //nodraw
    $('body').css({"background-color":"white"});
    mpg.css({"background-color":"white"})
  }
  
  function afterAfterLoadData(ok,msgEl,startingUp) {
    svg.refresh();//  _get all the latest into svg
    svg.main.fitContents();
    svg.refresh();
    $('#loading')._hide();
  }
  
  
  
  function loadDataStep(errEl,startingUp) {
    var ds = om.initializeDataSource(page.unpackedUrl);//om.root.dataSource;
    if (ds) {
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
    var wssrc = o.item;
    unpackedUrl = om.unpackUrl(wssrc);
    page.unpackedUrl = unpackedUrl; 
    var inst = o.instantiate;
    var cb = o.callback;
    $('document').ready(
      function () {
        errEl = $('#error');
        $('body').css({"background-color":"white",color:"black"});
         if (!wssrc) {
          errorDiv._show();
          errorDiv.html("<span class='errorTitle'>Error:</span> no item specified (ie no ?item=... )");
          return;
        }  
      function extractOverrides(itm) {
        var ovr = itm._overrides;
        if (!ovr) {
          ovr = {}; 
        }
        if (ovr) {
          delete itm._overrides;
        }
        return ovr;
      }
      function afterInstall(ars) {
        var ln  = ars.length;
        if (ln>0) {
          om.processIncomingItem(ars[0]);
          page.genMainPage();
          loadDataStep(errEl,1);// 1 = starting up
          return;
          var ds = om.initializeDataSource(page.unpackedUrl);
          if (ds) {
            om.tlog("BEFORE LOAD DATA");
            om.loadData(ds,function (err,dt) {
              om.afterLoadData(dt);
              theCanvas.initialView();
            });
          } else {
            om.afterLoadData();
            theCanvas.initialView();
          }
      
        }
      }      
      var lst = om.pathLast(wssrc);
      if (inst) {
        var fdst = lst; // where to install the instance
      }
      om.install(unpackedUrl.url,afterInstall);
      $(window).resize(function() {
          layout();
        });   
      });
    }
   
})(prototypeJungle);

