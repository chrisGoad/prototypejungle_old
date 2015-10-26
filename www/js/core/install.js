(function (pj) {

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> Install  ======================================

/*
 * Each item might include external components. At any time, pj.installedItems contains a dictionary,
 *  by url, of those components.
 *  Externalization collects these external dependencies and puts them into the __requires array. That
 *  array is used on installation to figure out what needs to be loaded first. 
 * 
*  Elements of __requires have  the form {repo:r,path:p}
 * repo is a url, and the path is the path within that url. repo might be '.',
 * meaning the repo from which the current item is being loaded.
 * The 'repo form' for something to load is 'repo|path'; ie the url of the repo and the path, separated by a |.
 *
 */


pj.set('XItem', pj.Object.mk()).__namedType(); // external item

// might take just one argument, which is assumed to be a repoForm
pj.XItem.mk = function (repo,path,isScript) {
  var rs = Object.create(pj.XItem);
  var split;
  if (arguments.length === 1) {
    split= repo.split("|");
    rs.repo = split[0];
    rs.path = split[1];
  } else {
    rs.repo = repo;
    rs.path = path;
    rs.isScript = isScript;
  }
  return rs;
}



var internalizeXItems = function (itm) {
  var rs = pj.Array.mk();
  var requires = itm.__requires;
  var id;
  if (requires) {
    requires.forEach(function (require) {
      var xItem = pj.XItem.mk(require.repo,require.path,require.isScript);
      rs.push(xItem);
    });
  }
}


  
pj.mkXItemsAbsolute = function (xitems,repo) {
  if (!xitems) return;
  xitems.forEach(function (xitem) { 
    if (xitem.repo==='.') {
      xitem.repo = repo;
    }
  });
}
  
    
/* sequence of activity:
 * loadItems
 * loadScripts (each item might have a scriptsToLoad property; load these)
 * internalizeItems
 */



var repoForm = function (repo,path) {
  return repo+'|'+path;
}
var repoFormToUrl = function (rf) {
  return rf.replace('|','/');
}

var isRepoForm = function (s) {
  return s.indexOf("|")>=0;
}
// components might refer to their repos with '.'s, meaning 'the current repo

var requireToUrl = function (repo,require) {
  var rrepo = require.repo;
  if (rrepo === '.') {
    rrepo = repo;
  }
  return rrepo + '/' + require.path;
}
  
var requireToRepoForm= function (repo,require) {
  var rrepo = require.repo;
  if (rrepo === '.') {
    rrepo = repo;
  }
  return rrepo + '|' + require.path;
}
  
// this finds the url among the pending loads; note that the pending loads are in repo form. it returns repo form.
var findAmongPending = function (url) {
  var item,itemUrl;
  for (item in itemLoadPending) {
   itemUrl = repoFormToUrl(item);
    if (itemUrl === url) {
      return item;
    }
  }
}

pj.installedItems = {};
 
/* machinery for installing items
 * items are denoted by their full paths beneath pj (eg /x/handle/repo)
 * The following variables are involved
 */


pj.urlMap = undefined; // these are set from the outside, if the real urls from which loading should be done are different from the given urls
pj.inverseUrlMap = undefined;

/* in the prototypeJungle ui, items are loaded from prototypejungle.s3.amazonaws.org rather than prototypejungle.org, to get around cloud front.
 *error reporting is done node-style (call back takes error,data)
 *error reporting: the top-level calls define installCallback. 
 * When there is an error, this is called with the error message as the first argument.
 *installCallback(null,rs) is called in absence of error
 */


var installCallback; //call this with the installed item
var installErrorCallback; 

pj.loadScript = function (url,cb) {
  var mappedUrl = pj.urlMap?pj.urlMap(url):url;
  var  onError = function (errorEvent) {
    var erm = {message:'Failed to load '+url};
    var icb;
    if (cb) {  
      cb(erm);
    } 
  }
  var  onLoad = function (loadEvent) {
    if (cb) {
      cb(null,loadEvent);
    }
  }
  var element = document.createElement('script');
  var  head = document.getElementsByTagName('head')[0];
  element.setAttribute('type', 'text/javascript');
  element.setAttribute('src', mappedUrl);
  if (cb) element.addEventListener('load',onLoad);
  element.addEventListener('error', onError);

  head.appendChild(element); 
}

var topPath,badItem,missingItem,loadFailed,itemsToLoad,itemsLoaded,itemLoadPending,
  internalizedItems,scriptsToLoad,idsForScriptComponents,dsPaths,dataSources;

var resetLoadVars = function () {
  itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A.
                   // Each item is in the 'repo form' (see above). items are in repo form
  itemsLoaded  = {};  //  repo forms  -> noninternalized __values
  itemLoadPending = {}; // Maps repo forms to 1 for the items currently pending
  internalizedItems = {};
  scriptsToLoad = [];
  idsForScriptComponents = [];
  badItem = 0;
  missingItem = 0;
  loadFailed = 0;
  topPath = undefined;
  dsPaths = [];
  dataSources = [];
}




 



pj.assertItemLoaded = function (x) {
  pj.log('load','done loading ',x);
  pj.lastItemLoaded = x;
  return;
}

var afterLoad = function (errorEvent,loadEvent) {
    var lastItemLoaded = pj.lastItemLoaded;
    var id;
    if (lastItemLoaded===undefined) { // something went wrong
      itemsLoaded[topPath] = 'badItem';
      pj.log('bad item ');
      badItem = 1;
      pj.doneLoadingItems();
      return; 
    }
    var unmappedSourceUrl =  loadEvent.target.src;
    var sourceUrl = pj.inverseUrlMap?pj.inverseUrlMap(unmappedSourceUrl):unmappedSourceUrl; // needed if urls are being mapped
    var item = findAmongPending(sourceUrl);// repo form of the item just loaded
    var itemSplit = item.split('|');
    var thisRepo = itemSplit[0];
    var thisPath = itemSplit[1];
    lastItemLoaded.__sourceRepo = thisRepo;
    lastItemLoaded.__sourcePath = thisPath;
    //  path is relative to pj; always of the form /x/handle/repo...
    var requires = lastItemLoaded.__requires;
    if (lastItemLoaded.__repo) {
      debugger;
      pj.repo = lastItemLoaded.__repo;
    }
    if (requires) {
    // for (var id in requires) {
      requires.forEach(function (require) {
        if (typeof require === 'string') {
          //code
        }
        //var require = requires[id];
        var requireRepoForm = requireToRepoForm(thisRepo,require);
        if (require.isScript) {
           var alreadyMentioned = scriptsToLoad.some(
             function (toLoad) {return toLoad[1] === requireRepoForm}
            );
          if (!alreadyMentioned) {
            //scriptsToLoad.push([id,requireRepoForm]);
             scriptsToLoad.push(requireRepoForm);
           //scriptsToLoad.push(requireRepoForm);
            //idsForScriptComponents.push(id);
          }
        } else {
          if (itemsToLoad.indexOf(requireRepoForm) < 0) {
            itemsToLoad.push(requireRepoForm);
          }
        }
      });
      
    }
    itemsLoaded[item] = lastItemLoaded;
    delete itemLoadPending[item];
    loadMoreItems();
  }

  

/* conventions:
 * if path ends in a .js , this is assumed to be item file. Ow, /item.js is appended
 * if the form of the call is install(x,cb), and x has the form http: *prototypejungle.org/....
 * then the repo and path are extracted from x automatically
 */


var unpackUrl = function (url) {
  var r,m,repo,path;
  if (!url) return;
  if (pj.beginsWith(url,'http')) {
    var r = /(http(?:s|)\:\/\/[^\/]*\/[^\/]*\/[^\/]*)\/(.*)$/
  } 
  var m = url.match(r);
  if (!m) return;
  var repo = m[1];
  var path = m[2];
  return {repo:repo,path:path};
  }

pj.install = function (irepo,ipath,icb) {
  var repo,path,cb,upk,rf,installedUrls;
  if (typeof icb === 'function') { // 4 arg version
    repo = irepo;
    path = ipath;
    cb = icb;
  } else if (typeof ipath === 'function') { // 3 arg version
    var upk = unpackUrl(irepo);
    if (upk) {
      repo = upk.repo;
      path = upk.path;
    }
    cb = ipath;
  }
  if (!path) {
    pj.error('wrong form for pj.install','install');
    return;
  }
  if (typeof path === 'string') {
    if (!pj.endsIn(path,'.js')) {
      path = path+'/item.js';
    }
    rf = repo+'|'+path;
    installCallback = cb;
    resetLoadVars();
    itemsToLoad.push(rf);
    loadMoreItems();
  } else {
    installedUrls = [];
    path.forEach(function (p) {
      installedUrls.push(repo+'/'+p);
      itemsToLoad.push(rf);
    });
    installCallback = function (err) {
      if (err) {
        cb(err);
      } else {
        var installedItems = installedUrls.map(function (url) {return pj.installedItems[url];});
        cb(null,installedItems);
      }
    };
    loadMoreItems();
  };
}



var loadMoreItems  = function () {
  var ln = itemsToLoad.length;
  var pending = 0;
  itemsToLoad.forEach(function (item) {
    if (!itemsLoaded[item]) {
      pending = 1;
      if (!itemLoadPending[item]) {
        itemLoadPending[item] = 1;
        pj.loadScript(repoFormToUrl(item),afterLoad);
        return; // this makes loading sequential. try non-sequential sometime.
      }
    }
  });
  if (!pending) {
     loadScripts();
  }
}


var loadScripts = function () { 
  var icb = installCallback;
  var rcb;
  installCallback = undefined;
  var mainItem = itemsLoaded[itemsToLoad[0]];
  if (scriptsToLoad.length > 0) {
    rcb = function (err,item) {
      internalizeLoadedItems();
      mainItem = pj.installedItems[repoFormToUrl(itemsToLoad[0])];
      icb(undefined,mainItem);
    }
    // rcb is the callback for require
    pj.require.apply(undefined,scriptsToLoad.concat([rcb]));
  } else {
    internalizeLoadedItems(); 
    mainItem = pj.installedItems[repoFormToUrl(itemsToLoad[0])];
    icb(undefined,mainItem);
  }
  return; 
}

var catchInternalizationErrors= 0; 

var internalizeLoadedItem = function (itemRepoForm) {
  var item = itemsLoaded[itemRepoForm];
  var url = repoFormToUrl(itemRepoForm);
  var internalizedItem,requires;
  if (!item) {
    pj.error('Failed to load '+url);
    return;
  }
  requires = item.__requires;
  item.__requires = undefined;
  if (catchInternalizationErrors) { 
    try {
      internalizedItem = pj.internalize(item,pj.beforeChar(itemRepoForm,'|'),requires);
      
    } catch(e) {
      console.log("ERROR in internalizing ",itemRepoForm); 
      internalizedItem = pj.svg.Element.mk('<g/>');
     
    }
  } else {
    internalizedItem = pj.internalize(item,pj.beforeChar(itemRepoForm,'|'),requires);
  }
  if (requires) {
    internalizedItem.__requires = requires;
  }
  internalizedItems[itemRepoForm] = 1;
  internalizeXItems(internalizedItem);
  pj.installedItems[url] = internalizedItem;
}


var internalizeLoadedItems = function () {
  var ln = itemsToLoad.length;
  var i,rs;
  if (ln===0) return undefined;
  for (i = ln-1;i>=0;i--) {
    internalizeLoadedItem(itemsToLoad[i]);
  }
  rs = pj.installedItems[repoFormToUrl(itemsToLoad[0])];
  return rs;
}




/* A normal setup for managing pj items,  is for there to be a current item which
 * is being manipulated in a running state, a state which contains various other items installed from external sources.
 * Each node in such a set up can be assigned a path, call it an 'xpath' (x for 'possibly external'). The first element
 * of this path is either '.' (meaning the current item), '' (meaning pj itself)  or the url of the source of the item.
 * pj.xpathOf(node,root) computes the path of node relative to root, and pj.evalXpath(root,path) evaluates the path
 */

 
pj.xpathOf = function (node,root) {
  var rs = [];
  var current = node;
  var url,name;
  while (true) {
    if (current === undefined) {
      return undefined;
    }
    if (current === root) {
      rs.unshift('.');
      return rs;
    }
    if (current === pj) {
      rs.unshift('');
      return rs;
    }
    var sourceRepo = current.__get('__sourceRepo');
    if (sourceRepo) {
      url = sourceRepo + '/' + current.__sourcePath;
      rs.unshift(url);
      return rs;
    }
    var name = pj.getval(current,'__name');
    if (name!==undefined) {// if we have reached an unnamed node, it should not have a parent either
      rs.unshift(name);
    }
    current = pj.getval(current,'__parent');
  }
  return undefined;
} 

pj.evalXpath = function (root,path) {
  var p0,current,ln,prop,i;
  if (!path) {
    pj.error('No path');
  }
  p0 = path[0];
  if (p0 === '.') {
    var current = root;
  } else if (p0 === '') {
    current = pj;
  } else { 
    current = pj.installedItems[p0];
  }
  ln=path.length;
  for (i=1;i<ln;i++) {
    prop = path[i];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined; 
    }
  }
  return current;
}


 /* components can be represented either by prototype trees, or by code. In the latter case,
  * the code builds the item, and then calls pj.returnValue(errorMessage,,item).
  * Code may be located at any url. Code is loaded from within
  *  another piece of code by
  *  pj.require(loc0,loc1,..,function (error,id0,id1..) {
  * }
  This binds idN to the result of loading locN, for each N.
  * The locations might be paths (meaning relative to the current repo), or repo forms. Whe
  */


pj.locationToXItem = function (location) {
  var repo,path,xItem;
  if (isRepoForm(location)) {
   repo = pj.beforeChar(location,"|");
   path = pj.afterChar(location,"|");
   xItem = pj.XItem.mk(repo,path,1);
  } else {
   path = location;
   xItem = pj.XItem.mk(".",location,1);
  }
  return xItem;
}

pj.returnData = function (data) {
  pj.returnValue(undefined,pj.lift(data));
  return;
}


/*
 * this version takes arguments: src0,src1, .. srcn, and cb, which takes args
 * err,a0,.. an, corresponding to the sources.
 */

pj.require = function () {
  var numRequires = arguments.length-1;
  var sources = [];
  var i,index,svReturn,svRepo,item,requires,path,i,repo,location,nm,xItem,loadedComponents;
  var cb = arguments[numRequires];
  for (i=0;i<numRequires;i++) {
    sources.push(arguments[i])
  }
  
  index = 0;
  svReturn = pj.returnValue;
  svRepo = pj.repo;
  loadedComponents = [];
  pj.returnValue= function (err,component) {
    var nm,location,url,path,xItem,nm,requireD;
    location = sources[index];
     path = isRepoForm(location)?pj.afterChar(location,"|"):location;
     if (component) { 
       component.__sourceRepo = pj.repo;
       component.__sourcePath = path;
       pj.installedItems[pj.repo + "/" + path] = component;
       loadedComponents.push(component);
       index++;
       if (index === numRequires) { // all of the components have been loaded
         pj.returnValue = svReturn;
         debugger;
         pj.repo = svRepo;
         var args = [undefined].concat(loadedComponents);
         cb.apply(undefined,args);
         return;
       }
     }
     location = sources[index];// load the script of the next require
     if (isRepoForm(location)) {
       pj.repo = pj.beforeChar(location,"|");
       url = repoFormToUrl(location);
     } else {
       url = pj.repo + "/" + location;
     }
     var cv = pj.installedItems[url];
     if (cv) {
        pj.returnValue(undefined,cv);
     } else {
       pj.loadScript(url);
     }
   };
   pj.returnValue();
}

pj.requireOne = function (location,cb) {
  pj.require(location,cb);
}

//  Loads the main script
pj.main = function (location,cb) {
  var url = repoFormToUrl(location);
  pj.repo = pj.beforeChar(location,"|");
  pj.returnValue= function (err,item) {
    item.__repo = pj.repo;
    cb(err,item); 
  }
  pj.loadScript(url);
}

// bring in a component that was external into its  parent structure; used for data that is wanted inside rather than outside
pj.Object.__importComponent = function () {
  var parent = this.parent();
  var proto = Object.getPrototypeOf(this);
  if (parent && proto.__sourcePath) {
    parent.set(this.__name,proto);
    delete proto.__sourcePath;
    delete proto.__sourceRepo;
  }
}

//end extract

})(prototypeJungle);
