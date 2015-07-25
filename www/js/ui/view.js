(function (pj) {
  var actionHt;
  
  var geom = pj.geom;
  var svg = pj.svg;
   var dat = pj.dat;
   var ui = pj.ui;
   ui.fitMode = 1; 

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
  if (window !== window.__parent) {
    window.__parent.postMessage(msg,"*");
  }
}

  var actionHt;
  var bkColor = "white";  
  var item;
  
pj.urlMap = function (u) {return u.replace(ui.itemDomain,ui.s3Domain);}
pj.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}

pj.parseQuerystring = function(){
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
  
   ui.partsWithDataSource = function () {
    var rs = [];
    pj.forEachPart(ui.root,function (node) {
      if (node.dataSource) {
        rs.push(node);
      }
    });
    return rs;
  }
  
  
  ui.processIncomingItem = function (rs,cb) {
    pj.root = rs;
    rs.__sourceRepo = ui.repo;
    rs.__sourcePath = ui.path;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
    dat.installData(rs,cb);
  }
  
  
ui.init = function (q) {
  if (q.cf) { // meaning grab from cloudfront, so null out the urlmap
    pj.urlMap = undefined;
    pj.inverseUrlMap = undefined;
  }
  // compute a repo and path for install
  var qs = q.item.split("/");
  var repoD = qs[1]+"/"+qs[2];
  var repo = "http://prototypejungle.org/"+repoD; 
  var path = qs.slice(3).join("/")+"/item.js";
  var svgRoot = svg.Root.mk(document.getElementById("svgDiv"));
  svg.main = svgRoot;
  svgRoot.fitFactor = 0.7;
  var data;
  pj.install(repo,path,function (e,itm) { 
    ui.processIncomingItem(itm, function() {
      item = itm;
      ui.initComm();
      svgRoot.fitFactor = 0.95;
      svgRoot.contents = item;
      svgRoot.draw(); 
      svgRoot.updateAndDraw(1);// 1 means do fit
      layout();
    });
    return;  
    var ds=itm.dataSource;
    if (ds) {
      dat.loadData(ds,function (err,dt) {
        if (err) {
          alert('Failed to load data');// ToDo improve on this
          return;
        }
        data = dat.internalizeData(dt,itm.markType);
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

