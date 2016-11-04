
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
    debugger;
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
//pj.currentScriptUrl = null;
//pj.requireTree = {};
}
var cRequireNode;

pj.allDone = function () {
  debugger;
}
pj.require1 = function (cb) {
  debugger;
  console.log('requireDepth',requireDepth);
 // if (requireDepth === 0) {
 //   cRequireNode = pj.requireTree;
  //}
  requireDepth++;
  var numRequires = arguments.length-1;
  var sources = [];
  var lastSource,i,index,svReturn,svRelto,item,requires,path,i,repo,location,nm,xItem,loadedComponents,
      isData,dataSource; 
  //var action = arguments[numRequires];
  for (i=0;i<numRequires;i++) {
    var src = arguments[i];
    sources.push(src);
    //pj.requireTree[src] = {};
  }
  pj.requireActions[pj.currentRequire] = arguments[numRequires];
  //var svRequireDone = pj.requireDone;
  //var svNumDone = pj.numDone;
  //var svNumRequires = pj.numRequires;
  /*pj.requireDone = function () {
    debugger;
    if (pj.numDone === pj.numRequires) {
      debugger;
      pj.requireDone = svRequireDone;
      pj.numDone = svNumDone;
      pj.numRequires = svNumRequires;
      svRequireDone();
    } else {
      var tsrc = sources[pj.numDone];
      var tscrpt = 
    }
  }
  pj.numDone = 0;
  pj.numRequires = numRequires;
  */
  var getDone = function () {
    debugger;
    var moreToDo = false;
    for (var ssrc in pj.loadedScripts) {
      if (!pj.executedScripts[ssrc]) {
        moreToDo = true;
        pj.executedScripts[ssrc] = true;
        var sscript = pj.loadedScripts[ssrc];
        debugger;
        pj.currentRequire = ssrc;
        eval(sscript);
      }
    }
    if (!moreToDo) {
      debugger;
      pj.allDone();
    }
    
  }
  /* var svRequireNode = cRequireNode;
    sources.forEach(function (src) {
      var scrpt = pj.loadedScripts[src];
      cRequireNode = cRequireNode[src];
      
    })
  }*/
  var numLoaded = 0;
  var afterLoads = [];
  sources.forEach(function (src) {
    pj.httpGet(src,function (erm,rs) {
      //cRequireNode[src] = {};
      pj.loadedScripts[src] = rs;
      numLoaded++;
      if (numLoaded==numRequires) {
        getDone();
      }
    });
  });
 
}

pj.require = pj.require1;
pj.require2 = function () {
  var numRequires = arguments.length-1;
  var sources = [];
  var lastSource,i,index,svReturn,svRelto,item,requires,path,i,repo,location,nm,xItem,loadedComponents,
      isData,dataSource; 
  //var action = arguments[numRequires];
  for (i=0;i<numRequires;i++) {
    var src = arguments[i];
    sources.push(src);
    //pj.requireTree[src] = {};
  }  
}

pj.main = function (location,cb,forInstall) {
  resetLoadVars();
  pj.currentRequire = location;
  loadScriptViaGet(location);
}
  

// bring in a component that was external into its  parent structure; used for data that is wanted inside rather than outside
/*
pj.Object.__importComponent = function () {
  var parent = this.parent();
  var proto = Object.getPrototypeOf(this);
  if (parent && proto.__sourcePath) {
    parent.set(this.__name,proto);
    delete proto.__sourcePath;
    delete proto.__sourceRelto;
  }
}
*/