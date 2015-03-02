(function (pj) {
  var actionHt;
  var pt = pj.pt;
  //var page = pj.set("page",pt.DNode.mk());
  var geom = pj.geom;
  var svg = pj.svg;
   var dat = pj.dat;
   var ui = pj.ui;
   ui.fitMode = 0; // 7mod

   // This is one of the code files assembled into pjview.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract


/*
 * Prototypejungle items can be embedded in pages via iframes. These functions provide support
 * for communication from the containing page with the item via HTML5's postMessage mechanism.
 * An item should have a __commandInterpreter method if it wishes to interpret incoming messages,
 * Conversely, the containing page should listen for messages with origin http://prototypejungle.org.
 */

ui.initComm = function (item) {
  //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
  window.addEventListener("message",function (event) {
    var cmi = item.__commandInterpreter;
    if (cmi) {
      var jdt = event.data;
      var data = JSON.parse(jdt);
      cmi(data);
    }
  });
}




ui.postMessage = function(msg) {
  // dont send a message to yourself
  if (window !== window.parent) {
    window.parent.postMessage(msg,"*");
  }
}

  var actionHt;
  var bkColor = "white";  
  var item;
  
pt.urlMap = function (u) {return u.replace(ui.itemDomain,ui.s3Domain);}
pt.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}

pt.parseQuerystring = function(){
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
    if (ui.fitMode) svg.main.fitContents();
  }
  
  

ui.init = function (q) {
  if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
    pt.urlMap = undefined;
    pt.inverseUrlMap = undefined;
  }
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
  pt.installWithData(repo,path,function (e,itm) {
    pj.ui.root = itm;
    item = itm;
    ui.initComm();
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

