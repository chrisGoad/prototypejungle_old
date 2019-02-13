// Copyright 2019 Chris Goad
// License: MIT

/* This installs components implemented by js scripts. The scripts should have the form
 * core.require(file1,file2...fileN,function (v1,v2... vn)){...return value});. Such code builds an item, and returns it, utilizing
 * the items already defined in the dependencies file1... filen, bound to v1... vn.
 * How it works: each script goes through 3 stages: loading, recording dependendencies, and installation.
 *  as soon as a script is loaded, its contained core.require is executed in a mode which records its dependendcies, but does not run its funcdtion
 *  Those depedencies are, in turn loaded, and their dependencies recorded
 *  core.requireEdges holds the graph of dependencies
 *  Once the graph is complete, the requires are installed from bottom up; that is each f(v1,...vn) is run with values
 *  that have already been computed for file1.. filen
 */
    

/* first, the error handler (throw doesn't work, since much of the activity is invoked from async callbacks) */

let debugInstall = false;
// this is true if a hust of 127.0.0.1:3000 indicates running protopedia itself locally. This is turned off for export.
vars.local = beginsWith(window.location.host,'127');

const installDebug = function () {
  if (debugInstall) {
    debugger; //keep
  }
}
const installError = function (src,erm) {
  debugger; //keep
  let where = src==='top'?' at top level':(erm?' in ':'')+src;
  afterInstall(erm?(erm + where):where);
}
let loadedUrls = [];
let getCache = {};

let getPending = {};

const mapUrl = function (url,cb) {cb(url)};

vars.mapUrl = mapUrl;
vars.inverseMapUrl = function (url) {return url;}


const domainOf = function (url) {
  if (beginsWith(url,'/')||beginsWith(url,'(')) {
    return '';
  }
  let m = url.match(/^(https?:\/\/[^\/]*)\//);
  return m?m[1]:m;
}

const absoluteUrl = function (path,requester) {
  if (beginsWith(path,'http://')|| beginsWith(path,'https://') || beginsWith(path,'(')) {
     return path;
  }
  if (beginsWith(path,'/'))  {
    return path;
  }
  installDebug();
  let up =  beforeLastChar(requester,'/');
  let rs = path;
  while (beginsWith(rs,'..')) {
    up = beforeLastChar(up,'/');
    rs = path.substr(3);
  }
  return up + '/' + rs;
}
 
const httpGetForInstall = function (iurl,cb) {
  log('install','httpGet',iurl);
  let cache = getCache[iurl];
  let rs;
  if (cache) {
    installDebug();
    cb(undefined,cache);
    return;
  }
  if (getPending[iurl]) {
    return;
  }
  getPending[iurl] =true;
  log('install',"getting ",iurl);

  vars.mapUrl(iurl,function (url) {
    let request = new XMLHttpRequest();
    request.open('GET',url, true);// meaning async
    request.onload = function() {
      log('install','httpGet loaded',iurl);
      if (cb) {
        if (request.status >= 200 && request.status < 400) {
        // Success!
         rs = request.responseText;
         log('install',"GOT ",iurl);
         delete getPending[iurl];
         loadedUrls.push(iurl);
         getCache[iurl] = rs;
         cb(undefined,rs);
        } else {
          installError('Failed to load '+iurl);
        }
        // We reached our target server, but it returned an error
      }
    };
    request.onerror = function() {
        installError('Failed to load '+iurl);
    };
    request.send();
  });
}


const loadjs = function (iurl,requester) {
    log('install','loadjs',iurl,' from ',requester);
    loadedUrls.push(iurl);
    vars.mapUrl(iurl,function (url) {
        var fileref=document.createElement('script');
        fileref.setAttribute("type","application/javascript");
        fileref.setAttribute("src", url);
         (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(fileref);
    },requester);
}



let installedItems = {};
let loadedScripts = {};
let evaluatedScripts = {};
let requireActions,requireEdges,installErrorSource,requireRoot,currentRequire;
let afterInstall;
let requiresInstalled = false;

const resetInstalledItems = function () {
 installedItems = {};
}
const resetLoadVars = function () {
  evaluatedScripts = {};
  requireActions = {};
  requireEdges = {}; // maps urls of nodes to urls of their children (dependencies listed in the require call)
  installErrorSource = undefined; // set to the source where the install failed, if a failure occurs
  requiresInstalled = false;
}

let installRequire;


const dependenciesEvaluated = function (src) {
  let rs = true;
  if (!src) {
    return true;
  }
  let isItem = endsIn(src,'.item');
  if (isItem) {
    if (evaluatedScripts[src]) {
      return true;
    }
    if (!loadedScripts[src]) {
      return false;
    }
  }
  if ((src !== requireRoot) && !evaluatedScripts[src] && !isItem) {
    return false;
  }
  let dependencies = requireEdges[src];
  let ln = dependencies?dependencies.length:0;
  for (let i=0;i<ln;i++) {
    if (rs && !dependenciesEvaluated(dependencies[i])) {
      rs = false;
    }
  }
  if (isItem && rs) {
    evaluatedScripts[src] = 1;
  }
  return rs;
}

// items have their surface parts (eg a circle and lozeng), and then the prototypes object which holds their prototypes. We want to be able to load
// such items into a protopedia state, which involves adding the prototypes of the item to the main prototypes object, creating a prototype PTOP with the given parts
// (in our example a circle and lozenge), and then adding PTOP to the main prototypes object as well. If there is only one part, we need not built a tree for PTOP,
// but can use that single  part as PTOP instead.

 const assemblyParts = function (item) { 
    let ownprops = Object.getOwnPropertyNames(item);
    let candidates = [];
    ownprops.forEach((prop) => {
      let v = item[prop];
      if (core.isNode(v)) {
        if (!((prop ==='prototypes') || (prop.substring(0,2) === '__') || (prop === 'transform'))) {
          candidates.push(v);
        }
      }
    });
    return candidates;
 };
 
 const importItem = function (item) {
   let source =  item.__sourceUrl;
   // we are about to dismantle the item, so need to forget it for reassmbly next time it is loaded
   installedItems[source] = undefined;
   let itemProtos = item.prototypes;
      // move the protos over to the main prototypes object
   core.forEachTreeProperty(itemProtos,(iproto,nm) => {
      if (iproto.__sourceUrl) {
        core.installPrototype(nm,iproto);
      }
   });
   let candidates = assemblyParts(item);
   let rs;
   if (candidates.length === 1) {
     rs = candidates[0];//.instantiate();
   } else {
     rs = svg.Element.mk('<g/>');
     rs.__assembly = true;
     candidates.forEach((c) => {
       let pos = c.getTranslation();
       let nm = c.__name;
       c.__singleton = true; // has only one instance;means that this prototype need not be shown in the object-property panel nor used in copy
       rs.set(nm,c);
       c.moveto(pos);
       c.unselectable = true;
     });
   }
   let frs = core.installPrototype('import',rs);
   return frs;
 }

// the requester is the url of the script in which require of these sources occurred
// returns true if it found something already installed, allowing satisfaction of a new dependency
const require1 = function (requester,sources) {
  installDebug();
  const installRequiresIfPossible = function () {
    if (dependenciesEvaluated(requireRoot)) {
      installRequires();
    }
  }
  if (sources.length === 0) {
    installRequiresIfPossible();
    return;
  }
  let satisfiedDependency = false;
  sources.forEach(function (src) {
    let isItem = endsIn(src,'.item');
    if (endsIn(src,'.jpg')) { // afterImageUrl set in the UI
      installDebug();
      if (vars.afterImageUrl) {
        vars.afterImageUrl(src,function (erm,rs) {
          evaluatedScripts[src] = 1; // so that this is no longer regarded as as an unfullfilled dependency
          installedItems[src] = rs;
          rs.__sourceUrl = src;
          installRequiresIfPossible();
        });
      }
    } else if (isItem) {
       loadItem(src);
    }  else if (endsIn(src,'.json') || endsIn(src,'.data') || isItem) {
       httpGetForInstall(src,function (erm,rs) {
         evaluatedScripts[src] = 1; // so that this is no longer regarded as as an unfullfilled dependency
         loadedScripts[src] = rs;        
         let parsedRs = lift(parseJSONwithCatch(src,rs));
         if (parsedRs !== 'parseError') {
           parsedRs.__sourceUrl = src;
           installedItems[src] = parsedRs;
         }
         installRequiresIfPossible();
       });
    } else {
      let evScript = evaluatedScripts[src];
      let inItem = installedItems[src];
      let ldScript = loadedScripts[src];
      if (!(evScript || inItem || ldScript)) {
        loadjs(src,requester);
      } else {
        if (inItem) {
          evaluatedScripts[src] = 1;
        } else if (ldScript && !evScript) {
          eval(ldScript);
          evaluatedScripts[src] = 1;
        }
        log('install','AVOIDED repeat load of ',src);
        satisfiedDependency = true;
      }
    }
  });
  // check for completion  if  a dependency has been satisfied
  if (satisfiedDependency) {
    installRequiresIfPossible();
  }
  return satisfiedDependency;
 
}

let catchInstall = true; // false is useful for debupgging, but should be on for normal usage

const  debugMode = function (vl) {
  if (vl) {
    catchUpdateErrors = false;
    catchInstall = false;
  } else {
    catchUpdateErrors = true;
    catchInstall = true;    
  }
}
installRequire = function (src) {
  installDebug();
  if (installErrorSource) {
    return installErrorSource;
  }
  let val = installedItems[src];
  if (val) {
    return val;
  }
  let children = requireEdges[src];
  let values = children?children.map(installRequire):[];
  if (endsIn(src,'.item')) {
    val = deserialize(loadedScripts[src]);//loadedItem);;
  } else {
    let action = requireActions[src];
    if (!action) {
      installDebug();
    }
    log('install','RUNNING ACTIONN',src,catchInstall);
    if (catchInstall) {
      try {
        val = action(...values); // run the function fn of the require core.require(fl0,fl1...,fn)
      } catch (e) {
        installErrorSource = src;
        installError(src,e.message);
        return src;
      }
    } else {
      val = action(...values);
    }
  }
  if (val) {
    installedItems[src]= val;
    val.__sourceUrl = src;
    if (vars.onInstall) {
       vars.onInstall(val);
    }
  }
  return val;
}


const installRequires1 = function (src) {
  let dependencies = requireEdges[src];
  if (dependencies) {
    dependencies.forEach(installRequires1);
  }
  return installRequire(src);
}

const installRequires = function () {
  if (requiresInstalled) {
    return;
  }
  requiresInstalled = true;
  let val = installRequires1(requireRoot);
  if (installErrorSource) {
    installDebug();
    return;
  }
  log('install','AFTER INSTALL');
  afterInstall(undefined,val);
}

let require = function () {
  installDebug();
  let cRequire;
  let thisScript = document.currentScript;
  if (thisScript ){
    let thisDomain =  (vars.local?'http://':'https://')+window.location.host + '/';
    let fullRequire = thisScript.src;
    if (beginsWith(fullRequire,thisDomain)) {
       let servedFromPJ = (thisDomain === 'https://prototypejungle.org/') || (thisDomain === 'https://protopedia.org/') || vars.local;
     cRequire = (servedFromPJ)?fullRequire.replace(thisDomain,'/'):fullRequire;
    } else {
      cRequire = vars.inverseMapUrl(fullRequire);
    }
  } else { // this case occurs only when install is from the  code_editor
    cRequire = currentRequire;
  }
  evaluatedScripts[cRequire] = 1;
  installDebug();
  let numRequires;
  numRequires = arguments.length-1;
  let sources = [];
  for (let i=0;i<numRequires;i++) {
    let isrc = arguments[i];
    let src = absoluteUrl(isrc,cRequire);
    sources.push(src);
  }
  requireActions[cRequire] = arguments[numRequires];
  requireEdges[cRequire] = [].concat(sources);
  require1(cRequire,sources);
}


const loadItem = function (src) {
  httpGetForInstall(src,function (erm,rs) {
    installDebug();
    let prs = JSON.parse(rs);
    loadedScripts[src] = prs;
    let requires = prs.__requires;
    let arequires = requires.map(function (url) {return absoluteUrl(url,'/');});
    requireEdges[src] = [].concat(arequires);
    require1(src,arequires);
  })
}

let prescript = 'let {core,geom,dom,graph,ui,editor}=Window,codeRoot=core.codeRoot,root=core.root,svg=dom.svg,Point=geom.Point;\n';

let prescriptNeeded = false; // needed for Safari, but not other browsers
const evalWithCatch = function (src,iscript) {
  let script = (prescriptNeeded)?prescript + iscript:iscript;
  if (catchInstall) {
    try {
      eval(script);
    } catch (e) {
      installErrorSource = src;
      installError(src,e.message);
      return src;
    }
  } else {
    eval(script);
  }
}


const parseJSONwithCatch = function (src,script) {
  let rs;
  if (catchInstall) {
    try {
      rs = JSON.parse(script);
    } catch (e) {
      installErrorSource = src;
      installError(src,e.message);
      return 'parseError';
    }
  } else {
     rs = JSON.parse(script);
  }
  return rs;
}

let afterLoadTop;   

const loadTopDefs = function (cb) {
  afterLoadTop = cb;
  // binds globals to the modules
  loadjs('/topdefs.js');
}

const install = function (isrc,cb) {
  installDebug();
  let requester = '/';
  let src = absoluteUrl(isrc,requester);
  let rs = installedItems[src];
  if (rs) { 
    cb(undefined,rs);
    return;
  }
  resetLoadVars();
  afterInstall = cb;
  requireRoot = src;
  if (endsIn(src,'.item')) {
    loadItem(src);
    return;
  }
  currentRequire = src;
  let ldScript = loadedScripts[src];
  if (ldScript) {
    evalWithCatch(src,ldScript);
  } else {
    if (beginsWith(src,'http'))  {
      loadjs(src,requester);
    } else {
      httpGetForInstall(src, function (err,rs) {
        evalWithCatch(currentRequire,rs);
      });
    }
  }
}


const findPrototypeWithUrl = function (url) {
  if (!root.prototypes) {
    return undefined;
  }
  let rs;
  forEachTreeProperty(root.prototypes,function (itm) {
    if (itm.__sourceUrl === url) {
      rs = itm;
    }
  });
  return rs;
}


const replaceRequireInItem = function (url,toReplace,replacement) {
  let code = loadedScripts[url];
  let newCode = code.replace(toReplace,replacement);
  loadedScripts[url] = newCode;
}


const checkSyntax = function (code)  {
  let svRequire = require;
  require = () => {};
  try {
    eval(code);
  } catch (e) {
    if (e instanceof SyntaxError) {
      require = svRequire;
      return e.message;
    }
  }
  require = svRequire;
}

export {httpGetForInstall,loadjs,install,require,debugMode,requireEdges,loadedUrls,replaceRequireInItem,
        findPrototypeWithUrl,loadedScripts,installedItems,resetInstalledItems,afterLoadTop,
        absoluteUrl,loadTopDefs,checkSyntax,assemblyParts,importItem};
        
        