(function (pj) {
  var actionHt;
  var om = pj.om;
  var page = pj.set("page",om.DNode.mk());
  var geom = pj.geom;
  var svg = pj.svg;
   var dat = pj.dat;
   var ui = pj.ui;
    var bkColor = "white";  
  var item;
  
om.urlMap = function (u) {return u.replace(ui.itemDomain,ui.s3Domain);}
om.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}

om.parseQuerystring = function(){
    var nvpair = {};
    var qs = window.location.search.replace('?', '');
    var pairs = qs.split('&');
    pairs.forEach(function(v){
      var pair = v.split('=');
      if (pair.length>1) {
        nvpair[pair[0]] = pair[1];
      }
    });
    return nvpair;
  }
  
  var layout = function (noDraw) {
    //var bkg = om.root.backgroundColor;
    var wd = document.body.offsetWidth;
    var ht = document.body.offsetHeight;
    var wd = window.innerWidth;
    var ht = window.innerHeight;
    //var winwid = document.body.scrollWidth;
    //var winht = document.body.scrollHeight;
    //.innerWidth();
    //var winwid = $(window).width();
    //var winht = $(window).height();
    var svgwd = wd-20;
    var svght = ht-20;
    var svgdiv = document.getElementById("svgDiv");
    svgdiv.style.width = svgwd +"px";
    svgdiv.style.height = svght + "px";
    //item.refresh();
   svg.main.fitContents();
   // item.refresh();
  }
  
  

page.init = function (q) {
  debugger;
  // var url = "http://prototypejungle.org/sys/repo0/chart/Line2/item.js";
  //var url = "
  // compute a repo and path for install
  var qs = q.item.split("/");
  var repoD = qs[1]+"/"+qs[2];
  var repo = "http://prototypejungle.org/"+repoD;
  var path = qs.slice(3).join("/")+"/item.js";
  //var url = "http://prototypejungle.org.s3.amazonaws.com/sys/repo0/example/BarChart1/item.js";
  var svgRoot = svg.Root.mk(document.getElementById("svgDiv"));
  svg.main = svgRoot;
  svgRoot.fitFactor = 0.7;
  var data;
  //om.resetLoadVars();
  om.install(repo,path,function (e,itm) {
    pj.ui.root = itm;
    item = itm;
    console.log("Installed ",item);
    var afterDataLoaded = function () {
      svgRoot.contents = item;
      svgRoot.refresh();
      if (data) {
        item.setData(data);
      } else {
        item.fullUpdate();
      }
      svgRoot.refresh();
      layout();
    }
    var ds=itm.__dataSource;
    if (ds) {
      dat.loadData(ds,function (err,dt) {
        if (err) {
          alert('Failed to load data');// ToDo improve on this
          return;
        }
        debugger;
        data = dat.internalizeData(dt);
        //ui.processIncomingData(dt);
        afterDataLoaded();
      });
    } else {
      afterDataLoaded();
    }
   
  });
  window.onresize = layout;
}
})(prototypeJungle);

