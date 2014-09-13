(function (pj) {
  var actionHt;
  var om = pj.om;
  //var page = pj.set("page",om.DNode.mk());
  var geom = pj.geom;
  var svg = pj.svg;
   var dat = pj.dat;
   var ui = pj.ui;
   
   // This is one of the code files assembled into pjview.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract

  var actionHt;
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
    var wd = document.body.offsetWidth;
    var ht = document.body.offsetHeight;
    var wd = window.innerWidth;
    var ht = window.innerHeight;
    var svgwd = wd-20;
    var svght = ht-20;
    var svgdiv = document.getElementById("svgDiv");
    svgdiv.style.width = svgwd +"px";
    svgdiv.style.height = svght + "px";
    svg.main.fitContents();
  }
  
  

ui.init = function (q) {
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
  om.installWithData(repo,path,function (e,itm) {
    pj.ui.root = itm;
    item = itm;
    console.log("Installed ",item);
    var afterDataLoaded = function () {
      svgRoot.contents = item;
      svgRoot.draw();
      if (data) {
        item.setData(data);
      } else {
        item.outerUpdate();
        
      }
      if (window.parent.updateCallback) {
          window.parent.updateCallback(path);
      }
      svgRoot.draw();
      layout();
    }
    var ds=itm.__dataSource;
    if (ds) {
      dat.loadData(ds,function (err,dt) {
        if (err) {
          alert('Failed to load data');// ToDo improve on this
          return;
        }
        data = dat.internalizeData(dt);
        afterDataLoaded();
      });
    } else {
      afterDataLoaded();
    }
   
  });
  window.onresize = layout;
}


//end extract

})(prototypeJungle);

