
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

let debugInstall = false;

const installDebug = function () {
  if (debugInstall) {
    debugger;
  }
}
pj.installError = function (src,erm) {
  debugger;
  let where = src==='top'?' at top level':' in '+src;
  pj.afterInstall(erm + where);
}
pj.loadedUrls = [];
pj.getCache = {};

pj.getPending = {};
const httpGetForInstall = function (iurl,cb) {
  pj.log('install','httpGet',iurl);
  let cache = pj.getCache[iurl];
  let rs;
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

  pj.mapUrl(iurl,function (url) {
    let request = new XMLHttpRequest();
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
  });
}



pj.installedItems = {};
pj.loadedScripts = {};
pj.evaluatedScripts = {};
const resetLoadVars = function () {
  pj.evaluatedScripts = {};
  pj.requireActions = {};
  pj.requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the pj.require call)
  pj.installErrorSource = undefined; // set to the source where the install failed, if a failure occurs
}

let installRequire;


const dependenciesEvaluated = function (src) {
  if ((src !== pj.requireRoot) && !pj.evaluatedScripts[src]) {
    return false;
  }
  let dependencies = pj.requireEdges[src];
  let ln = dependencies?dependencies.length:0;
  for (let i=0;i<ln;i++) {
    if (!dependenciesEvaluated(dependencies[i])) {
      pj.log('install','missing dependency',dependencies[i]);
      return false;
    }
  }
  return true;
}



// the requester is the url of the script in which pj.require of these sources occurred
const require1 = function (requester,sources) {
  installDebug();
  let numRequires = sources.length;
  let numLoaded = 0;
  let afterLoads = [];
  const sourceAction = function (erm,src,rs) {
    //if (!pj.loadedScripts[src]) {
  //  if (!pj.installedItems[src]) {
    if (pj.endsIn(src,'.js')) {
        pj.loadedScripts[src] = rs;
        pj.currentRequire = src;
        pj.log('install','RECORDING DEPENDENCIES FOR',src);
        if (pj.catchInstall) {
          try {
            eval(rs);
            pj.evaluatedScripts[src] = rs;
          } catch (e) {
            pj.installError(e.message);
            return;
          }
        } else {
          eval(rs);
          pj.evaluatedScripts[src] = rs;
        }
        pj.log('install','RECORDED DEPENDENCIES FOR',src);
    } else if (pj.endsIn(src,'.json')) {
        pj.installedItems[src] = JSON.parse(rs);
    } else if (pj.endsIn(src,'.item')) {
      let prs = JSON.parse(rs);
      pj.loadedScripts[src] = prs;
      let requires = prs.__requires;
      require1(src,requires);
    }
    if (dependenciesEvaluated(pj.requireRoot)) {
         pj.log('install','INSTALLING REQUIRES AFTER',src);
         installRequires();
    }
  }
  pj.requireEdges[requester] = [].concat(sources);
  sources.forEach(function (src) {
    let script  = pj.loadedScripts[src];
    if (script) {
      sourceAction(undefined,src,script);
      return;
    }
    httpGetForInstall(src,function (erm,rs) {
      //delete pj.scriptsPendingLoad[src];
      sourceAction(erm,src,rs);
    });
  });
}

pj.catchInstall = true; // false is useful for debugging, but should be on for normal usage

installRequire = function (src) {
  installDebug();
  if (pj.installErrorSource) {
    return pj.installErrorSource;
  }
  let val = pj.installedItems[src];
  if (val) {
    return val;
  }
  let children = pj.requireEdges[src];
  let values = children?children.map(installRequire):[];
  //if (values.indexOf(installErrorIndicator) !== -1)  {
  //  return installErrorIndicator;
  //}
  if (pj.endsIn(src,'.item')) {
    val = pj.deserialize(pj.loadedScripts[src]);//pj.loadedItem);;
  } else {
    let action = pj.requireActions[src];
    if (!action) {
      installDebug();
    }
    pj.log('install','RUNNING ACTIONN',src);
    if (pj.catchInstall) {
      try {
        val = action.apply(undefined,values);
      } catch (e) {
        pj.installErrorSource = src;
        pj.installError(src,e.message);
        return src;
      }
    } else {
      val = action.apply(undefined,values);
    }
  }
  pj.installedItems[src]= val;
  val.__sourceUrl = src;
  return val;
}


const installRequires1 = function (src) {
  let dependencies = pj.requireEdges[src];
  if (dependencies) {
    dependencies.forEach(installRequires1);
  }
  return installRequire(src);
}

const installRequires = function () {
  let val = installRequires1(pj.requireRoot);
  if (pj.installErrorSource) {
    debugger;
    return;
  }
  pj.log('install','AFTER INSTALL');
  pj.afterInstall(undefined,val);
}

pj.require = function () {
  let cr = pj.currentRequire;
  installDebug();
  let numRequires,src,i;
  numRequires = arguments.length-1;
  let sources = [];
  for (i=0;i<numRequires;i++) {
    let src = arguments[i];
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
  httpGetForInstall(src,function (erm,rs) {
    //installDebug();
    let prs = JSON.parse(rs);
    pj.loadedScripts[src] = prs;
    let requires = prs.__requires;
   require1(src,requires);
    
  })
}

const evalWithCatch = function (src,script) {
  if (pj.catchInstall) {
    try {
      eval(script);
    } catch (e) {
      pj.installErrorSource = src;
      pj.installError(src,e.message);
      return src;
    }
  } else {
    eval(script);
  }
}

pj.install = function (src,cb) {
  //installDebug();
  let rs = pj.installedItems[src];
  if (rs) {
    cb(undefined,rs);
    return;
  }
  resetLoadVars();
  pj.requireRoot = src;
  pj.currentRequire = src;
  pj.afterInstall = cb;
  if (pj.endsIn(src,'.item')) {
    pj.loadItem(src);
    return;
  }
  let scr = pj.loadedScripts[src];
  if (scr) {
    evalWithCatch(src,scr);
    return;
  }
  httpGetForInstall(src,function (erm,rs) {
    pj.loadedScripts[src] = rs;
    evalWithCatch(src,rs);
  });
}


