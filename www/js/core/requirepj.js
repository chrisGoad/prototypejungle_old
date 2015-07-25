(function (pj) {

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> Requirepj  ======================================

/*
 * This is a very simple module system for PrototypeJungle. It defines
 * pj.require(baseUrl,[path1,path2,...pathN],function (v1, ...vn) {})
 *  The code within each require should assign to the global pj.export as its result.
 *  pj.config contains the configuration, including the baseUrl property
 */


pj.require = function (paths,cb) {
   var index = 0;
   var numPaths = paths.length;
   var rs =[];
   var loadNext = function () {
     if (index === numpaths) {
       cb.apply(undefined,rs);
     } else {
       var path = paths[index++];
       var url = pj.config.baseUrl + path;
       pj.loadScript(url,loadNext);
     }
   };
   loadNext();
}

     
     


pj.set('XItem', pj.Object.mk()).namedType(); // external item
// id might be a path, ie contain /'s
pj.XItem.mk = function (id,repo,path) {
  var rs = Object.create(pj.XItem);
  rs.id = id;
  rs.repo = repo;
  rs.path = path;
  return rs;
}
// a replacement specifies when a require should be instantiated as the value of a require
pj.set('Replacement', pj.Object.mk()).namedType(); // external item

pj.Replacement.mk = function (destPath,requireName) {
  var rs = Object.create(pj.Replacement);
  rs.destPath = destPath;
  rs.requireName = requireName;
  return rs;
}


var internalizeXItems = function (itm) {
  var rs = pj.Array.mk();
  var requires = itm.__requires;
  var id;
  if (requires) {
    if (Array.isArray(requires)) {
      requires.forEach(function (require) {
        var xItem = pj.XItem.mk(require.id,require.repo,require.path);
        rs.push(xItem);
      });
    } else {  
      for (id in requires) {
        var require = requires[id];
        var xItem = pj.XItem.mk(id,require.repo,require.path);
        rs.push(xItem);
      }
    } 
  }
  itm.set('__requires',rs);
}

pj.Object.setRepo = function (repo) {
  this.__sourceRepo = repo;
}

// adds to the  array that records requires

pj.Object.addToRequires = function (id,v) {
  var sr = this.__sourceRepo;
  var dr = v.__sourceRepo;
  var path = v.__sourcePath;
  if (sr && (sr === dr)) {
    var repo = '.';
  } else {
    repo = dr;
  }
  var requires = this.__requires;
  if (requires === undefined) {
    requires = this.set("__requires",pj.Array.mk());
  }
  var found = requires.some(function (r) {
    if (r.id === id) {
        r.repo = repo;
        r.path = path;
        return 1;
      }
    });
  if (!found) {
    var xit = pj.XItem.mk(id,repo,path);
    requires.push(xit);
  }
}


pj.getRequireFromArray = function (requires,id) { 
  var rs;
  if (!requires) {
    return undefined;  
  }
  requires.some(function (require) {
    if (require.id === id) {
      rs = require;
      return 1;
    }
  });
  return rs;
}
  
pj.getRequire = function (requires,id) { 
  if (requires) {
    if (Array.isArray(requires) || pj.Array.isPrototypeOf(requires)) {
      return pj.getRequireFromArray(requires,id);
    } else { 
      return requires[id];
    }
  }
}


pj.autonameRequire = function (item,seed) {
  var requires = item.__requires;
  if ( !requires) return seed;
  var ids = {};
  requires.forEach(function (r) {
    ids[r.id] = 1;
  });
  return pj.autoname(ids,seed);
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
    cb(null,loadEvent);
  }
  var element = document.createElement('script');
  var  head = document.getElementsByTagName('head')[0];
  element.setAttribute('type', 'text/javascript');
  element.setAttribute('src', mappedUrl);
  if (cb) element.addEventListener('load',onLoad);
  element.addEventListener('error', onError);

  head.appendChild(element); 
}
var topPath;
var variantOf;
var variantOf; //  if the top level restore is a variant, this is the path of the item of which it is a variant
var badItem,missingItem,loadFailed,itemsToLoad,itemIsPart,itemsLoaded,itemLoadPending,
  internalizedItems,scriptsToLoad,dsPaths,dataSources;

var resetLoadVars = function () {
  itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A.
                   // Each item is in the 'repo form' (see above). items are in repo form
  itemsLoaded  = {};  //  repo forms  -> noninternalized __values
  itemIsPart = {}; // repo forms -> 0 or 1, depending on whether this is a part
  itemLoadPending = {}; // Maps repo forms to 1 for the items currently pending
  internalizedItems = {};
  scriptsToLoad = [];
  badItem = 0;
  missingItem = 0;
  loadFailed = 0;
  variantOf = undefined;
  topPath = undefined;
  dsPaths = [];
  dataSources = [];
}




 

 /* the data file uses the JSONP pattern, calling loadFuntion.  The data file also says of itself what it's own url is,
  * and what path it should be loaded into within the jungle
  */


// called jsonp style when main item is loaded 


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
    var isAssembly = lastItemLoaded.__isAssembly;
    //  path is relative to pj; always of the form /x/handle/repo...
    var requires = lastItemLoaded.__requires;
    if (requires) {
      for (var id in requires) {
        var requireRepoForm = requireToRepoForm(thisRepo,requires[id]);
        if (itemsToLoad.indexOf(requireRepoForm) < 0) {
          itemsToLoad.push(requireRepoForm);
          if (isAssembly) {
            itemIsPart[requireRepoForm] = 1;
          }
        }
      }
      
    }
    var lastItemScripts = lastItemLoaded.scriptsToLoad;
    if (lastItemScripts) {
      // externalizing Arrays involves listing properties as the zeroth element. shift away that element.
      lastItemScripts.shift();
      scriptsToLoad = scriptsToLoad.concat(lastItemScripts);
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
  if (typeof icb === 'function') { // 4 arg version
    var repo = irepo;
    var path = ipath;
    var cb = icb;
  } else if (typeof ipath === 'function') { // 3 arg version
    var upk = unpackUrl(irepo);
    if (upk) {
      var repo = upk.repo;
      var path = upk.path;
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
    var rf = repo+'|'+path;
    installCallback = cb;
    resetLoadVars();
    itemsToLoad.push(rf);
    loadMoreItems();
  } else {
    var installedUrls = [];
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




//   a variant used in the ui
pj.installRequires1 = function (repo,requires,cb) {
  var requireRepoForms,requireUrls,installedItems;
  if ((!requires) || (requires.length === 0)) {
    cb(null,[]);
    return;
  }
  resetLoadVars();
  requireRepoForms =  pj.removeDuplicates(requires.map(function (c) {return requireToRepoForm(repo,c)}));
  requireUrls = pj.removeDuplicates(requires.map(function (c) {return requireToUrl(repo,c)}));
  installCallback = function (err) {
    if (err) {
      cb(err);
    } else {
      installedItems = requireUrls.map(function (url) {return pj.installedItems[url];});
      cb(null,installedItems);
    }
  };
  itemsToLoad = requireRepoForms;
  loadMoreItems();
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
  var urls = scriptsToLoad;
  var cnt = 0;
  var ln = urls.length;
  var loadNextScript = function () {
    if (cnt < ln) {
      var url = urls[cnt];
      cnt++;
      pj.loadScript(url,loadNextScript);
    } else {
      internalizeLoadedItems(); 
      var mainItem = pj.installedItems[repoFormToUrl(itemsToLoad[0])];

      if (installCallback) {
        var icb = installCallback;
        installCallback = undefined;
        icb(undefined,mainItem); 
      }
    }
  }
  loadNextScript();
}
var catchInternalizationErrors= 0; 

var internalizeLoadedItem = function (itemRepoForm) {
  var item = itemsLoaded[itemRepoForm];
  var url = repoFormToUrl(itemRepoForm);
  var isPart = itemIsPart[itemRepoForm];
  var internalizedItem;
  if (!item) {
    pj.error('Failed to load '+url);
    return;
  }
  var requires = item.__requires;
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
  if (isPart) {
    internalizedItem.__isPart = 1;
  }
  internalizeXItems(internalizedItem);
  pj.installedItems[url] = internalizedItem;
}


var internalizeLoadedItems = function () {
  var ln = itemsToLoad.length;
  var i;
  if (ln===0) return undefined;
  for (i = ln-1;i>=0;i--) {
    internalizeLoadedItem(itemsToLoad[i]);
  }
  var rs = pj.installedItems[repoFormToUrl(itemsToLoad[0])];
  return rs;
}




pj.isVariant = function (node) { 
  return !!pj.getRequire(node.__requires,'__variantOf');
}

pj.isAssembly = function (node) {
  return node.__isAssembly;
}

pj.variantOf = function (node) {
  return pj.getRequireValue(node,'__variantOf');
}

pj.mkVariant = function (node) {
  var rs = pj.variantOf(node);
  if (!rs) {
    rs = node.instantiate();
    var requires = pj.Array.mk();
    var require = pj.Object.mk();
    require.id = '__variantOf';
    require.repo = node.__sourceRepo;
    require.path = node.__sourcePath;
    requires.push(c0);
    rs.set('__requires',rsc);     
  }
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
      var url = sourceRepo + '/' + current.__sourcePath;
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
  var p0;
  if (!path) {
    pj.error('No path');
  }
  p0 = path[0];
  if (p0 === '.') {
    var current = root;
  } else if (p0 === '') {
    current = pj;
  } else { 
    var current = pj.installedItems[p0];
  }
  var ln=path.length;
  for (var i=1;i<ln;i++) {
    var prop = path[i];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined; 
    }
  }
  return current;
}

//end extract

})(prototypeJungle);
