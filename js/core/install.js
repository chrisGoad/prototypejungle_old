
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

/* This installs components implemented by js scripts. The scripts should have the form
 * pj.require(file1,file2...fileN,function (v1,v2... vn)){...return value});. Such code builds an item, and returns it, utilizing
 * the items already defined in the dependencies file1... filen, bound to v1... vn.
 * How it works: stage 1: all the scripts mentioned hereditarily  are loaded; stage 2: the scripts are run, bindin
 */
    
/* sequence of activity:
 * loadItems
 * loadScripts (each item might have a scriptsToLoad property; load these)
 * internalizeItems
 */

/* first, the error handler (throw doesn't work, since much of the activity is invoked from async callbacks) */

var debugInstall = false;

var installDebug = function () {
  if (debugInstall) {
    debugger;
  }
}
var afterInstallExecuted; 
pj.installError = function (erm) {
  //alert(erm);
  debugger;
  pj.afterInstall(erm);
}
pj.loadedUrls = [];
pj.getCache = {};

pj.getPending = {};

pj.httpGet = function (iurl,cb) {
/* adapted from youmightnotneedjquery.com */
  var cache = pj.getCache[iurl];
  var rs;
  if (cache) {
    installDebug();
    cb(undefined,cache);
    return;
  }
  if (pj.getPending[iurl]) {
    window.setTimeout(function () {pj.httpGet(iurl,cb);},200);
    return;
  }
  pj.getPending[iurl] =true;
  pj.log('install',"getting ",iurl);

  var url = pj.mapUrl(iurl);
  var request = new XMLHttpRequest();
  
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
       rs = request.responseText;
       pj.log('install',"GOT ",iurl);

       pj.loadedUrls.push(iurl);
       pj.getCache[iurl] = rs;
       cb(undefined,rs);
        
      } else {
        pj.installError('Failed to load '+iurl);
        //cb('http GET error for url='+url);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      pj.installError('Failed to load '+iurl);
  };
  request.send();
}

/* first, gather all scripts hereditarily mentioned in requires */

pj.installedItems = {};
pj.loadedScripts = {};

var resetLoadVars = function () {
  afterInstallExecuted = false;
  pj.pendingScripts = {};
  pj.executedScripts = {};
  pj.requireActions = {};
  pj.requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the pj.require call)
  }
var cRequireNode;

var installRequire;
var allDone = function () {
  installDebug();
 var rs = installRequire(pj.requireRoot);

}



var getDone;

var require1 = function (sources) {
  installDebug();
  var numRequires = sources.length;
  
  
  var numLoaded = 0;
  var afterLoads = [];
  cRequireNode = pj.currentRequire;
  var cChildren = pj.requireEdges[cRequireNode] = [];
  if (numRequires === 0) {
    getDone();
    return;
  }
  var sourceAction = function (erm,src,rs) {
    if (pj.endsIn(src,'.json')) {
      pj.installedItems[src] = JSON.parse(rs);
    } else {
      pj.loadedScripts[src] = rs;
      delete pj.installedItems[src];
    }
    numLoaded++;
    if (numLoaded==numRequires) {
      getDone();
    }
  }
  // next pile the scripts at the sources into the loaded scripts
  // once every script has been successfully loaded (numLoaded === numRequires)
  // go ahead execute the scripts.
  sources.forEach(function (src) {
    cChildren.push(src);
    var script  = pj.loadedScripts[src];
    if (script) {
      sourceAction(undefined,src,script);
      return;
    }
    pj.pendingScripts[src] = true;
  
    pj.httpGet(src,function (erm,rs) {
      delete pj.pendingScripts[src];
      sourceAction(erm,src,rs);
      return;
      if (pj.endsIn(src,'.json')) {
        //installDebug();
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
  
    return;
    var moreToDo = getDone();
   
    moreToDo = false;
    if (!moreToDo) {
      for (var s in pj.pendingScripts) {
        moreToDo = true;
      }
    }
    if (!moreToDo) {
      pj.log('install','ALL DONE');
      allDone();
    }
    
}

// Now execute all the loaded scripts (except those which have been executed)
// Running each script will pile its dependencies into  pj.loadedScripts or pj.pendingScripts
getDone = function () {
  installDebug();
    //var moreToDo = false;
    for (var ssrc in pj.loadedScripts) {
      
      if (!pj.executedScripts[ssrc]) {
        //moreToDo = true;
        pj.executedScripts[ssrc] = true;
        var sscript = pj.loadedScripts[ssrc];
        pj.currentRequire = ssrc;
        //delete pj.installedItems[ssrc];
        pj.log('install',"EVALUATING REQUIRE",ssrc);
        try {
          eval(sscript);
        } catch (e) {
          pj.installError(e.message);
          return;
        }
      }
    }
    var moreToDo = false;
     // running the dependent scripts may have added to pj.pendingScripts, and in that case we're not all finished
    // allDone will be called when the very last set of scripts has completed loading. Which branch will be finished
    // first is not determined, since the require-source loop revs up a bunch of gets at the same  time, which may complete
    // in any order.
    if (!moreToDo) {
      for (var s in pj.pendingScripts) {
        moreToDo = true;
      }
    }
    if (!moreToDo) {
      pj.log('install','ALL DONE');
      allDone();
    }
}

var installErrorIndicator = {};
pj.catchInstall = false; // false is useful for debugging, but should be on for normal usage

installRequire = function (src) {
  installDebug();
  var val = pj.installedItems[src];
  if (val) {
    return val;
  }
  var children = pj.requireEdges[src];
  var values = children?children.map(installRequire):[];
  if (values.indexOf(installErrorIndicator) !== -1)  {
    return installErrorIndincator;
  }
  if (pj.endsIn(src,'.item')) {
    val = pj.deserialize(pj.loadedItem);;
  } else {
    var action = pj.requireActions[src];
    if (!action) {
      installDebug();
    }
    pj.log('install','RUNNING ACTIONN',src);
    if (pj.catchInstall) {
      try {
        val = action.apply(undefined,values);
      } catch (e) {
        pj.installError(e.message);
        return installErrorIndicator;
      }
    } else {
      val = action.apply(undefined,values);
    }
  }
  pj.installedItems[src]= val;
  val.__sourceUrl = src;
  if (pj.requireRoot === src) {
    //installDebug();
    pj.afterInstall(undefined,val);
  }
  return val;
}


pj.require = function () {
  var cr = pj.currentRequire;
  installDebug();
  
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
    //installDebug();
    var prs = JSON.parse(rs);
    pj.loadedItem = prs;
    var requires = prs.__requires;
    //pj.requireEdges[cRequireNode] = requires;
    cRequireNode = src;
   require1(requires);
    
  })
}

pj.install = function (src,cb) {
  //installDebug();
  resetLoadVars();
  pj.requireRoot = src;
  pj.currentRequire = src;
  pj.afterInstall = cb;
  if (pj.endsIn(src,'.item')) {
    pj.loadItem(src);
    return;
  }
  var scr = pj.loadedScripts[src];
  if (scr) {
    pj.executedScripts[src] = true;
    eval(scr);
    return;
  }
  pj.httpGet(src,function (erm,rs) {
    pj.loadedScripts[src] = rs;
    eval(rs);
  });
}


