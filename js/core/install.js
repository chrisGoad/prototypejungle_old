
/* This installs components implemented by js scripts. The scripts should have the form
 * pj.require(file1,file2...fileN,function (v1,v2... vn)){...return value});. Such code builds an item, and returns it, utilizing
 * the items already defined in the dependencies file1... filen, bound to v1... vn.
 * How it works: each script goes through 3 stages: loading, recording dependendencies, and installation.
 *  as soon as a script is loaded, its contained pj.require is executed in a mode which records its dependendcies, but does not run its funcdtion
 *  Those depedencies are, in turn loaded, and their dependencies recorded
 *  pj.requireEdges holds the graph of dependencies
 *  Once the graph is complete, the requires are installed from bottom up; that is each f(v1,...vn) is run with values
 *  that have already been computed for file1.. filen
 */
    

/* first, the error handler (throw doesn't work, since much of the activity is invoked from async callbacks) */

var debugInstall = false;

var installDebug = function () {
  if (debugInstall) {
    debugger;
  }
}
pj.installError = function (erm) {
  //alert(erm);
  debugger;
  pj.afterInstall(erm);
}
pj.loadedUrls = [];
pj.getCache = {};

pj.getPending = {};

pj.httpGet = function (iurl,cb) {
  pj.log('install','httpGet',iurl);
  var cache = pj.getCache[iurl];
  var rs;
  if (cache) {
    installDebug();
    cb(undefined,cache);
    return;
  }
  if (pj.getPending[iurl]) {
    return;
  }
  pj.getPending[iurl] =true;
  pj.log('install',"getting ",iurl);

  var url = pj.mapUrl(iurl);
  var request = new XMLHttpRequest();
  
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    pj.log('install','httpGet loaded',iurl);
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
       rs = request.responseText;
       pj.log('install',"GOT ",iurl);
       delete pj.getPending[iurl];
       pj.loadedUrls.push(iurl);
       pj.getCache[iurl] = rs;
       cb(undefined,rs);
        
      } else {
        pj.installError('Failed to load '+iurl);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      pj.installError('Failed to load '+iurl);
  };
  request.send();
}



pj.installedItems = {};
pj.loadedScripts = {};
pj.evaluatedScripts = {};

var resetLoadVars = function () {
  pj.evaluatedScripts = {};
  pj.requireActions = {};
  pj.requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the pj.require call)
}

var installRequire;
/*
var dependenciesLoaded = function (src) {
  if ((src !== pj.requireRoot) && !pj.loadedScripts[src] && !pj.installedItems[src]) {
//  if ((src !== pj.requireRoot) && !pj.installedItems[src]) {
    return false;
  }
  var dependencies = pj.requireEdges[src];
  var ln = dependencies?dependencies.length:0;
  for (var i=0;i<ln;i++) {
    if (!dependenciesLoaded(dependencies[i])) {
      pj.log('install','missing dependency',dependencies[i]);
     // debugger;
      return false;
    }
  }
  return true;
}
*/

var dependenciesEvaluated = function (src) {
  //if ((src !== pj.requireRoot) && !pj.loadedScripts[src] && !pj.installedItems[src]) {
  if ((src !== pj.requireRoot) && !pj.evaluatedScripts[src]) {
    return false;
  }
  var dependencies = pj.requireEdges[src];
  var ln = dependencies?dependencies.length:0;
  for (var i=0;i<ln;i++) {
    if (!dependenciesEvaluated(dependencies[i])) {
      pj.log('install','missing dependency',dependencies[i]);
     // debugger;
      return false;
    }
  }
  return true;
}


var installRequires;

// the requester is the url of the script in which pj.require of these sources occurred
var require1 = function (requester,sources) {
  installDebug();
  var numRequires = sources.length;
  var numLoaded = 0;
  var afterLoads = [];
  var sourceAction = function (erm,src,rs) {
    //if (!pj.loadedScripts[src]) {
  //  if (!pj.installedItems[src]) {
    if (pj.endsIn(src,'.js')) {
        pj.loadedScripts[src] = rs;
        pj.currentRequire = src;
        pj.log('install','RECORDING DEPENDENCIES FOR',src);
        try {
          eval(rs);
          pj.evaluatedScripts[src] = rs;
        } catch (e) {
          pj.installError(e.message);
          return;
        }
        pj.log('install','RECORDED DEPENDENCIES FOR',src);
    } else if (pj.endsIn(src,'.json')) {
        pj.installedItems[src] = JSON.parse(rs);
    } else if (pj.endsIn(src,'.item')) {
      var prs = JSON.parse(rs);
      pj.loadedScripts[src] = prs;
      var requires = prs.__requires;
      require1(src,requires);
    }
    if (dependenciesEvaluated(pj.requireRoot)) {
         pj.log('install','INSTALLING REQUIRES AFTER',src);
         installRequires();
    }
  }
  pj.requireEdges[requester] = [].concat(sources);
  sources.forEach(function (src) {
    var script  = pj.loadedScripts[src];
    if (script) {
      sourceAction(undefined,src,script);
      return;
    }
    pj.httpGet(src,function (erm,rs) {
      //delete pj.scriptsPendingLoad[src];
      sourceAction(erm,src,rs);
    });
  });
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
    return installErrorIndicator;
  }
  if (pj.endsIn(src,'.item')) {
    debugger;
    val = pj.deserialize(pj.loadedScripts[src]);//pj.loadedItem);;
    debugger;
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
/*
  if (values) {
    values.forEach(function (child) {
      var csrc = child.__sourceUrl;
      if (pj.endsIn(csrc,'.item'))
      
        //code
      }
 */       //code
 //     }
 //   })
 // }
  //if (pj.requireRoot === src) {
 //   pj.afterInstall(undefined,val);
 // }
  return val;
}


var installRequires1 = function (src) {
  var dependencies = pj.requireEdges[src];
  if (dependencies) {
    dependencies.forEach(installRequires1);
  }
  return installRequire(src);
}

var installRequires = function () {
  var val = installRequires1(pj.requireRoot);
  pj.log('install','AFTER INSTALL');
  pj.afterInstall(undefined,val);
}

pj.require = function () {
  debugger;
  var cr = pj.currentRequire;
  installDebug();
  //if (pj.installedItems[pj.currentRequire]) {
  //  return;
 // }
  var sources,numRequires,src,i;
  numRequires = arguments.length-1;
  var sources = [];
  for (i=0;i<numRequires;i++) {
    var src = arguments[i];
    sources.push(src);
  }
  pj.requireActions[pj.currentRequire] = arguments[numRequires];
  if (numRequires === 0 && (pj.currentRequire === pj.requireRoot)) {
    installRequires();
  } else {
    require1(pj.currentRequire,sources);
  }
}

pj.loadItem = function (src) {
  pj.httpGet(src,function (erm,rs) {
    //installDebug();
    var prs = JSON.parse(rs);
    pj.loadedScripts[src] = prs;
    var requires = prs.__requires;
   require1(src,requires);
    
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
    eval(scr);
    return;
  }
  pj.httpGet(src,function (erm,rs) {
    pj.loadedScripts[src] = rs;
    eval(rs);
  });
}


