
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



pj.httpGet = function (url,cb) {
/* from youmightnotneedjquery.com */
  var request = new XMLHttpRequest();
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
        cb(undefined,request.responseText);
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

var loadScriptViaGet = function (url,cb) {
  pj.httpGet(pj.mapUrl(url),function (erm,rs) {
    //debugger;
      eval(rs);
      if (cb) {
        cb(erm,rs);
        //code
      }
    });
}

/* first, gather all scripts hereditarily mentioned in requires */

var requireDepth;
var resetLoadVars = function () {
requireDepth = 0;
pj.loadedScripts = {};
pj.executedScripts = {};
pj.requireActions = {};
pj.requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the pj.require call)
}
var cRequireNode;

pj.allDone = function () {
  debugger;
 var rs = pj.installRequire(pj.requireRoot);

}

pj.loadItem = function (src) {
  //if (pj.installedItems[src] || pj.loadedItems[src]) {
  //  return;
  //}
  pj.httpGet(src,function (erm,rs) {
    var prs = JSON.parse(rs);
    pj.loadedItem = prs;
    var requires = prs.__requires;
    //pj.requireEdges[cRequireNode] = requires;
    cRequireNode = src;
    pj.require1(requires);
    
  })
}
pj.require1 = function () {  // isources is present only for the loadItem case
  var sources,numRequires,src,i;
 // if (requireDepth === 0) {
 //   cRequireNode = pj.requireTree;
  //}
  requireDepth++;
  if (0 && isources) {
    sources = isources;
    numRequires = sources.length;
  } else {
    numRequires = arguments.length-1;
    var sources = [];
   // var lastSource,i,index,svReturn,svRelto,item,requires,path,i,repo,location,nm,xItem,loadedComponents,
    //  isData,dataSource; 
    //var action = arguments[numRequires];
    for (i=0;i<numRequires;i++) {
      var src = arguments[i];
      sources.push(src);
    //pj.requireTree[src] = {};
    }
    pj.requireActions[pj.currentRequire] = arguments[numRequires];
  }
  var getDone = function () {
    //debugger;
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
      debugger;
      pj.allDone();
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
      pj.loadedScripts[src] = rs;
      numLoaded++;
      if (numLoaded==numRequires) {
        getDone();
      }
    });
  });
 
}

pj.require = pj.require1;
pj.installedItems = {};
pj.installRequire = function (src) {
  debugger;
  var val = pj.installedItems[src];
  if (val) {
    return val;
  }
  var children = pj.requireEdges[src];
  var values = children.map(pj.installRequire);
  if (pj.endsIn(src,'.item')) {
    val = pj.deserialize(pj.loadedItem);;
  } else {
    var action = pj.requireActions[src];
    val = action.apply(undefined,values);
  }
  pj.installedItems[src]= val;
  val.__sourceUrl = src;
  if (pj.requireRoot === src) {
    debugger;
    pj.afterInstall(undefined,val);
  }
  return val;
}


pj.main = function (location,cb) {
  debugger;
  resetLoadVars();
  pj.requireRoot = location;
  pj.currentRequire = location;
  pj.afterInstall = cb;
  if (pj.endsIn(location,'.item')) {
    pj.loadItem(location);
  } else {
    loadScriptViaGet(location);
  }
}

pj.install = pj.main;

pj.returnValue = function (rs) {
  debugger;
}