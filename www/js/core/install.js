(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> Install  ======================================

/* each external item might have a __requires field, which is an array of objects of the form {name:name,repo:r,path:p}
 * repo is a url, and the path is the path within that url. repo might be '.', meaning the repo from which the current item is being loaded.
 * 'repo form' for something to load is 'repo|path'; ie the url of the repo and the path, separated by a |.
 * References within the item can refer to require name.  In the  Dev application, require values are bound at toplevel
 * to the require name by bindComponent.  
 */


om.set('XItem', om.DNode.mk()).namedType(); // external item
// name might be a path, ie contain /'s
om.XItem.mk = function (name,repo,path) {
  var rs = Object.create(om.XItem);
  rs.name = name;
  rs.repo = repo;
  rs.path = path;
  return rs;
}
// a replacement specifies when a require should be instantiated as the value of a require
om.set('Replacement', om.DNode.mk()).namedType(); // external item

om.Replacement.mk = function (destPath,requireName) {
  var rs = Object.create(om.Replacement);
  rs.destPath = destPath;
  rs.requireName = requireName;
  return rs;
}


var internalizeXItems = function (itm) {
  var requires = itm.__requires,
    rs = om.LNode.mk();
    //isAssembly = itm.__isAssembly;
  if (requires) {
    requires.forEach(function (require) {
      var xItem = om.XItem.mk(require.name,require.repo,require.path);
      //if (isAssembly) {
      //  xItem.__isPart = 1;
      //}
      rs.push(xItem);
    });
  }
  itm.set('__requires',rs);
}


om.getRequireFromArray = function (requires,name) {
  var rs;
  requires.some(function (require) {
    if (require.name===name) {
      rs = require;
      return 1;
    }
  });
  return rs;
}
  
om.getRequire = function (item,name) {
  var requires = item.__requires;
  if (requires) return om.getRequireFromArray(requires,name);
}

om.addRequire = function (node,name,repo,ipath) {
  var path,xitem,requires;
  if (om.getRequire(node,name)) {
    om.error('A require assigning to ',name,' already exists','om');
  }
  if (om.endsIn(ipath,'.js')) {
    path = ipath;
  } else {
    path = ipath + '/item.js';
  }
  xitem = om.XItem.mk(name,repo,path);
  requires = node.__requires;
  if (!requires) {
    requires = node.set('__requires',om.LNode.mk());
  }
  requires.push(xitem);
  return xitem;
}

om.autonameRequire = function (item,seed) {
  var requires = item.__requires;
  if ( !requires) return seed;
  var names = {};
  requires.forEach(function (r) {
    names[r.name] = 1;
  });
  return om.autoname(names,seed+'ZZ');
}
  
om.mkXItemsAbsolute = function (xitems,repo) {
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
 * installData (each item might have a dataSource property; load these and assign to the data property of each iterm
 */


om.dataInternalizer = undefined; // set from the outside; currently in the dat module. 

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
  for (var item in itemLoadPending) {
    var itemUrl = repoFormToUrl(item);
    if (itemUrl === url) {
      return item;
    }
  }
}

om.installedItems = {};
 
/* machinery for installing items
 * items are denoted by their full paths beneath pj (eg /x/handle/repo)
 * The following variables are involved
 */

//om.activeConsoleTags.push('load');

om.urlMap = undefined; // these are set from the outside, if the real urls from which loading should be done are different from the given urls
om.inverseUrlMap = undefined;

/* in the prototypeJungle ui, items are loaded from prototypejungle.s3.amazonaws.org rather than prototypejungle.org, to get around cloud front.
 *error reporting is done node-style (call back takes error,data)
 *error reporting: the top-level calls define installCallback. 
 * When there is an error, this is called with the error message as the first argument.
 *installCallback(null,rs) is called in absence of error
 */


var installCallback; //call this with the installed item
var installErrorCallback; 
var installingWithData;

om.loadScript = function (url,cb) {
  var mappedUrl = om.urlMap?om.urlMap(url):url;
  var  onError = function (errorEvent) {
    var icb;
    var erm = {message:'Failed to load '+mappedUrl};
    if (installErrorCallback) {
      icb = installErrorCallback;
      installErrorCallback = undefined;
      icb(erm);
    } else if (installCallback) {
      icb = installCallback;
      installCallback = undefined;
      icb(erm);
    } else if (cb) {
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
var badItem,missingItem,loadFailed,itemsToLoad,itemIsPart,itemsLoaded,itemLoadPending,internalizedItems,scriptsToLoad;

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
}




 

 /* the data file uses the JSONP pattern, calling loadFuntion.  The data file also says of itself what it's own url is,
  * and what path it should be loaded into within the jungle
  */


// called jsonp style when main item is loaded


om.assertItemLoaded = function (x) {
  om.log('load','done loading ',x);
  om.lastItemLoaded = x;
  return;
}
 
var afterLoad = function (errorEvent,loadEvent) {
    var lastItemLoaded = om.lastItemLoaded;
    if (lastItemLoaded===undefined) { // something went wrong
      itemsLoaded[topPath] = 'badItem';
      om.log('bad item ');
      badItem = 1;
      om.doneLoadingItems();
      return; 
    }
    var unmappedSourceUrl =  loadEvent.target.src;
    var sourceUrl = om.inverseUrlMap?om.inverseUrlMap(unmappedSourceUrl):unmappedSourceUrl; // needed if urls are being mapped
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
      requires.forEach(function (require) {
        var requireRepoForm = requireToRepoForm(thisRepo,require);
        if (itemsToLoad.indexOf(requireRepoForm) < 0) {
          itemsToLoad.push(requireRepoForm);
          if (isAssembly) {
            itemIsPart[requireRepoForm] = 1;
          }
        }
      });
    }
    var lastItemScripts = lastItemLoaded.scriptsToLoad;
    if (lastItemScripts) {
      // externalizing LNodes involves listing properties as the zeroth element. shift away that element.
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
  if (om.beginsWith(url,'http')) {
    var r = /(http(?:s|)\:\/\/[^\/]*\/[^\/]*\/[^\/]*)\/(.*)$/
  } 
  var m = url.match(r);
  if (!m) return;
  //var nm = m[5];  
  var repo = m[1];
  var path = m[2];
  return {repo:repo,path:path};
  }

var install1 = function (withData,irepo,ipath,icb) {
  installingWithData = withData;
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
    om.error('wrong form for om.install','install');
    return;
  }
  if (typeof path === 'string') {
    if (!om.endsIn(path,'.js')) {
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
        var installedItems = installedUrls.map(function (url) {return om.installedItems[url];});
        cb(null,installedItems);
      }
    };
    loadMoreItems();
  };
}


/* outer layers for data, no data
 * an item may have an associated data source, but sometimes
 * installation is wanted without that data source, so that data can be inserted later
 *  om.install ignores the data soruce, and installingWithData takes it into account.
 */

om.install = function (irepo,ipath,icb) {
  install1(0,irepo,ipath,icb);
}


om.installWithData = function (irepo,ipath,icb) {
  install1(1,irepo,ipath,icb);
}



//   a variant used in the ui
om.installRequires1 = function (repo,requires,cb) {
  if ((!requires) || (requires.length === 0)) {
    cb(null,[]);
    return;
  }
  resetLoadVars();
  var requireRepoForms =  om.removeDuplicates(requires.map(function (c) {return requireToRepoForm(repo,c)}));
  var requireUrls = om.removeDuplicates(requires.map(function (c) {return requireToUrl(repo,c)}));
  installCallback = function (err) {
    if (err) {
      cb(err);
    } else {
      var installedItems = requireUrls.map(function (url) {return om.installedItems[url];});
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
        om.loadScript(repoFormToUrl(item),afterLoad);
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
      om.loadScript(url,loadNextScript);
    } else {
      internalizeLoadedItems();
      installData();
    }
  }
  loadNextScript();
}

var internalizeLoadedItem = function (itemRepoForm) {
  var internalizedItem;
  var item = itemsLoaded[itemRepoForm];
  var url = repoFormToUrl(itemRepoForm);
  var isPart = itemIsPart[itemRepoForm];
  if (!item) {
    om.error('Failed to load '+url);
    return;
  }
  var requires = item.__requires;
  try {
    internalizedItem = om.internalize(item,om.beforeChar(itemRepoForm,'|'));
  } catch(e) {
    internalizedItem = pj.svg.Element.mk('<g/>');
    if (requires) {
      internalizedItem.__requires = requires;
    }
  }
  internalizedItems[itemRepoForm] = 1;
  if (isPart) {
    internalizedItem.__isPart = 1;
  }
  internalizeXItems(internalizedItem);
  om.installedItems[url] = internalizedItem;
}


var internalizeLoadedItems = function () {
  var ln = itemsToLoad.length;
  if (ln===0) return undefined;
  for (var i = ln-1;i>=0;i--) {
    internalizeLoadedItem(itemsToLoad[i]);
  }
  var rs = om.installedItems[repoFormToUrl(itemsToLoad[0])];
  return rs;
}


var isAssembly;
var mainItem; 

var installData = function () {
  var whenDoneInstallingData = function (err) {
    //mainItem = om.installedItems[repoFormToUrl(itemsToLoad[0])];
    debugger;
    if (installCallback) {
      var icb = installCallback;
      installCallback = undefined;
      icb(err,mainItem);
    }
  }
/*  
 * For assemblies, data for the parts needs installing. 
 */
  var dsPaths = [];
  var dataSources = [];
  var collectDSPaths = function (node,path) {
    om.forEachTreeProperty(node,function (child,prop) {
      if (child.__isPart) {
        var ds = child.__dataSource;
        if  (ds) {
          path.push(prop);
          dataSources.push(ds);
          dsPaths.push(path.slice());
          path.pop();
        }
      } else {
        var crs = collectDSPaths(child);
        
      }
    });      //code
  }
  mainItem = om.installedItems[repoFormToUrl(itemsToLoad[0])];
  isAssembly = mainItem.__isAssembly;
  debugger;
  if (isAssembly) { 
    collectDSPaths(mainItem,[]);
  } else {
    var mds = mainItem.__dataSource;
    if (mds) {
      dsPaths = [[]];
      dataSources = [mds];
    }
  }
  mainItem.__dsPaths = dsPaths;
  mainItem.__dataSources = dataSources;

  installErrorCallback = whenDoneInstallingData;
  var installDataIndex = 0;// index into itemsToLoad of the current install data job
  var installMoreData = function () {
    var ln = isAssembly?dataSources.length:(mainItem.__dataSource?1:0);//itemsToLoad.length;
    if (installDataIndex<ln) {
      debugger;
      var datasource = dataSources[installDataIndex];
      om.log('install','Installing '+datasource);
      om.loadScript(datasource);// this will invoke window.dataCallback when done
    } else { 
    // ok, all done 
      whenDoneInstallingData();
    }
  }
  window.callback = window.dataCallback = function (data) {
    debugger;
    var path = mainItem.__dsPaths[installDataIndex];
    var part = om.evalPath(mainItem,path);
    part.__xdata = data;
    installDataIndex++;
    installMoreData();
  }
  installDataIndex = 0;
  installMoreData();
}

// a standalone version of loadData

//om.loadData = function (item,url,cb) {
om.loadData = function (url,cb) {
  window.callback = window.dataCallback = function (rs) {
    //item.__xdata = rs;
    cb(null,rs);
  }     
  om.loadScript(url);// this will invoke window.dataCallback when done
}

om.isVariant = function (node) { 
  return !!om.getRequire(node,'__variantOf');
}

om.isAssembly = function (node) {
  return node.__isAssembly;
}

om.variantOf = function (node) {
  return om.getRequireValue(node,'__variantOf');
}

om.mkVariant = function (node) {
  var rs = om.variantOf(node);
  if (!rs) {
    rs = node.instantiate();
    var requires = om.LNode.mk();
    var require = om.DNode.mk();
    require.name = '__variantOf';
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
 * of this path is either '.' (meanaing the current item), '' (meaning pj itself)  or the url of the source of the item.
 * om.xpathOf(node,root) computes the path of node relative to root, and om.evalXpath(root,path) evaluates the path
 */

 
om.xpathOf = function (node,root) {
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
    var name = om.getval(current,'__name');
    if (name!==undefined) {// if we have reached an unnamed node, it should not have a parent either
      rs.unshift(name);
    }
    current = om.getval(current,'__parent');
  }
  return undefined;
}

om.evalXpath = function (root,path) {
  if (!path) {
    om.error('No path');
  }
  var p0 = path[0];
  if (p0 === '.') {
    var current = root;
  } else if (p0 === '') {
    current = pj;
  } else { 
    var current = om.installedItems[p0];
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
