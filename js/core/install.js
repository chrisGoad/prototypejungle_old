
/*
 * Each item might include external components. At any time, pj.installedItems contains a dictionary,
 *  by url, of those components.
 *  Externalization collects these external dependencies and puts them into the __requires array. That
 *  array is used on installation to figure out what needs to be loaded first. 
 * 
*  Elements of __requires have  the form 'repo||path'
 * repo is a url, and the path is the path within that url. repo might be '.',
 * meaning the repo from which the current item is being loaded.
 * The 'repo form' for something to load is 'repo|path'; ie the url of the repo and the path, separated by a |.
 *
 */

pj.dotCode = 'd73O18t';
    
/* sequence of activity:
 * loadItems
 * loadScripts (each item might have a scriptsToLoad property; load these)
 * internalizeItems
 */


pj.loadedUrls = [];
pj.getCache = {};

pj.getPending = {};

pj.httpGet = function (iurl,cb) {
/* from youmightnotneedjquery.com */
  var cache = pj.getCache[iurl];
  var rs;
  if (cache) {
    debugger;
    cb(undefined,cache);
    return;
  }
  if (pj.getPending[iurl]) {
    window.setTimeout(function () {pj.httpGet(iurl,cb);},200);
    return;
  }
  pj.getPending[iurl] =true;
  var url = pj.mapUrl(iurl);
  var request = new XMLHttpRequest();
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
       rs = request.responseText;
       pj.loadedUrls.push(iurl);
       pj.getCache[iurl] = rs;
       cb(undefined,rs);
        
      } else {
        cb('http GET error for url='+url);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      cb('http GET error for url='+url);
  };
  request.send();
}

/* first, gather all scripts hereditarily mentioned in requires */

pj.installedItems = {};

var resetLoadVars = function () {
  pj.loadedScripts = {};
  pj.executedScripts = {};
  pj.requireActions = {};
  pj.requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the pj.require call)
  }
var cRequireNode;

var installRequire;
var allDone = function () {
  //debugger;
 var rs = installRequire(pj.requireRoot);

}




var require1 = function (sources) {  
  var numRequires = sources.length;
  var getDone = function () {
    var moreToDo = false;
    for (var ssrc in pj.loadedScripts) {
      if (!pj.executedScripts[ssrc]) {
        moreToDo = true;
        pj.executedScripts[ssrc] = true;
        var sscript = pj.loadedScripts[ssrc];
        pj.currentRequire = ssrc;
        eval(sscript);
      }
    }
    if (!moreToDo) {
      //debugger;
      allDone();
    }
    
  }
  var numLoaded = 0;
  var afterLoads = [];
  cRequireNode = pj.currentRequire;
  var cChildren = pj.requireEdges[cRequireNode] = [];
  if (numRequires === 0) {
    getDone();
    return;
  }
  sources.forEach(function (src) {
    cChildren.push(src);
    pj.httpGet(src,function (erm,rs) {
      if (pj.endsIn(src,'.json')) {
        //debugger;
        pj.installedItems[src] = JSON.parse(rs);
      } else {
        pj.loadedScripts[src] = rs;
      }
      numLoaded++;
      if (numLoaded==numRequires) {
        getDone();
      }
    });
  });
 
}


installRequire = function (src) {
  // debugger;
  var val = pj.installedItems[src];
  if (val) {
    return val;
  }
  var children = pj.requireEdges[src];
  var values = children?children.map(installRequire):[];
  if (pj.endsIn(src,'.item')) {
    val = pj.deserialize(pj.loadedItem);;
  } else {
    var action = pj.requireActions[src];
    val = action.apply(undefined,values);
  }
  pj.installedItems[src]= val;
  val.__sourceUrl = src;
  if (pj.requireRoot === src) {
    //debugger;
    pj.afterInstall(undefined,val);
  }
  return val;
}

pj.require = function () { 
  var sources,numRequires,src,i;
  numRequires = arguments.length-1;
  var sources = [];
  for (i=0;i<numRequires;i++) {
    var src = arguments[i];
    sources.push(src);
  }
  pj.requireActions[pj.currentRequire] = arguments[numRequires];
  require1(sources);
}

pj.loadItem = function (src) {
  //if (pj.installedItems[src] || pj.loadedItems[src]) {
  //  return;
  //}
  pj.httpGet(src,function (erm,rs) {
    //debugger;
    var prs = JSON.parse(rs);
    pj.loadedItem = prs;
    var requires = prs.__requires;
    //pj.requireEdges[cRequireNode] = requires;
    cRequireNode = src;
   require1(requires);
    
  })
}

pj.install = function (src,cb) {
  //debugger;
  resetLoadVars();
  pj.requireRoot = src;
  pj.currentRequire = src;
  pj.afterInstall = cb;
  if (pj.endsIn(src,'.item')) {
    pj.loadItem(src);
  } else {
    pj.httpGet(src,function (erm,rs) {
      pj.loadedScripts[src] = rs;
      eval(rs);
    });
  }
}

