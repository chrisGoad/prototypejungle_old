(function (pj) {
  var actionHt;
  var html = pj.html;
  var geom = pj.geom;
  var svg = pj.svg;
  var ui = pj.ui = {};
  ui.fitMode = true;
  //stubs
  ui.hide = function () {}


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
  
//pj.urlMap = function (u) {return u.replace(ui.itemDomain,ui.s3Domain);}
//pj.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}

var parseQuerystring = function(){
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
  
  function processQuery(iq) {
    var q = parseQuerystring();
    var intro = q.intro;
    if (q.source) {
      pj.source = decodeURIComponent(q.source);
    }
    if (q.itm) {
      //var itms = itm.split("|");
      //pj.repo = itms[0];//"http://prototypejungle.org/"+itms[1]+"/"+itms[2];
      pj.path = itm;//
    }
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
    svg.main.resize(svgwd,svght); 

   // if (ui.fitMode)
    svg.main.fitContents();
  }

  
pj.init = function (q) {
  processQuery(q);
  var svgDiv;
  var svgRoot = svg.Root.mk(document.getElementById("svgDiv"));
  svg.main = svgRoot;
  svgRoot.fitFactor = 0.8;
  function afterInstall(e,rs)  {
    pj.root = rs;
    var bkc = rs.backgroundColor;
    if (!bkc) {
      rs.backgroundColor="white";
    }
    svgRoot.contents = rs;
    svgRoot.draw(); 
    svgRoot.updateAndDraw(true);// true means do fit
    layout();
  }
  if (pj.source) {
    pj.install(pj.source,afterInstall);
  } else if (pj.path) {
    var fpath = 'https://prototypejungle.firebaseio.com'+pj.path+'.json?callback=prototypeJungle.assertItemLoaded';
    pj.install(fpath,afterInstall); 
  } else {
    afterInstall("noUrl");
  }
  window.onresize = layout;
}


})(prototypeJungle);

