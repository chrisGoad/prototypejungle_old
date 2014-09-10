(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjcs.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> Install  ======================================

/* each external item might have a __requires field, which is an array of objects of the form {name:name,repo:r,path:p}
 * repo is a url, and the path is the path within that url. repo might be '.', meaning the repo from which the current item is being loaded.
 * 'repo form' for something to load is 'repo|path'; ie the url of the repo and the path, separated by a |.
 */


om.set('XItem', om.DNode.mk()).namedType(); // external item

om.XItem.mk = function (name,repo,path) {
  var rs = Object.create(om.XItem);
  rs.name = name;
  rs.repo = repo;
  rs.path = path;
  return rs;
}


var internalizeXItems = function (itm) {
  var requires = itm.__requires,
    rs = om.LNode.mk();
  if (requires) {
    requires.forEach(function (require) {
      var xItem = om.XItem.mk(require.name,require.repo,require.path);
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
  console.log('GETREQUIRE');
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

  
om.mkXItemsAbsolute = function (xitems,repo) {
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
var installingWithData;

om.loadScript = function (url,cb) {
  var  onError = function (errorEvent) {
    if (installCallback) {
      var icb = installCallback;
      installCallback = undefined;
      icb({message:'Failed to load '+url});
    } else if (cb) {
      cb(errorEvent,null);
    }
  }
  var  onLoad = function (loadEvent) {
    cb(null,loadEvent);
  }
  var mappedUrl = om.urlMap?om.urlMap(url):url;
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
var badItem,missingItem,loadFailed,codeBuilt,itemsToLoad,itemsLoaded,itemLoadPending,internalizedItems,scriptsToLoad;

var resetLoadVars = function () {
  itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A.
                   // Each item is in the 'repo form' (see above). items are in repo form
  itemsLoaded  = {};  //  repo forms  -> noninternalized __values
  itemLoadPending = {}; // Maps repo forms to 1 for the items currently pending
  internalizedItems = {};
  scriptsToLoad = [];
  badItem = 0;
  missingItem = 0;
  loadFailed = 0;
  codeBuilt = 0;
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
    //  path is relative to pj; always of the form /x/handle/repo...
    var requires = lastItemLoaded.__requires;
    if (requires) {
      requires.forEach(function (require) {
        var requireRepoForm = requireToRepoForm(thisRepo,require);
        if (itemsToLoad.indexOf(requireRepoForm) < 0) {
          itemsToLoad.push(requireRepoForm);
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
  var requireRepoForms =  requires.map(function (c) {return requireToRepoForm(repo,c)});
  var requireUrls = requires.map(function (c) {return requireToUrl(repo,c)});
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


// install the requires listed for this node, and assign
om.installRequires = function (repo,node,cb) {
  var requires = node.__requires;
  if (!requires) {
    cb(null,node);
    return;
  }
  om.installRequires1(repo,requires,function (err,items) {
    if (err) {
      cb(err);
      return;
    }
    var ln = requires.length;
    for (var i=0;i<ln;i++) {
      var require = requires[i];
      var item = items[i].instantiate();
      if (item.hide) {
        item.hide();
      }
      node.set(require.name,citm);
    }
    cb(null,node);
  });
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
  var item = itemsLoaded[itemRepoForm];
  var url = repoFormToUrl(itemRepoForm);
  if (!item) {
    om.error('Failed to load '+url);
    return;
  }
  var requires = item.__requires;
  var internalizedItem = om.internalize(item,om.beforeChar(itemRepoForm,'|'));
  internalizeXItems(internalizedItem);
  om.installedItems[url] = internalizedItem;
}


var internalizeLoadedItems = function () {
  var ln = itemsToLoad.length;
  if (ln===0) return undefined;
  for (var i = ln-1;i>=0;i--) {
    internalizeLoadedItem(itemsToLoad[i]);
  }
  return om.installedItems[repoFormToUrl(itemsToLoad[0])];
}



var installData = function () {
  var whenDoneInstallingData = function () {
    var mainItem = om.installedItems[repoFormToUrl(itemsToLoad[0])];
    if (installCallback) {
      var icb = installCallback;
      installCallback = undefined;
      icb(null,mainItem);
    }
  }
  var installDataIndex = 0;// index into itemsToLoad of the current install data job
  var installMoreData = function () {
    var ln = itemsToLoad.length;
    while (installDataIndex<ln) {
      var installedItem = om.installedItems[repoFormToUrl(itemsToLoad[installDataIndex])];
      var datasource = installedItem.__dataSource;
      var fixedData = installedItem.__fixedData; // this means that the data should be installed even if this is a subcomponent (meaning the
                                  // data is 'built-in' to this component, and is not expected to set from outside by update)
      console.log('Data loading for ',itemsToLoad[installDataIndex],' datasource ',datasource,' index ',installDataIndex, ' ln ',ln);
      if (datasource && (((installDataIndex === 0) && installingWithData) ||fixedData)) {
        console.log('Installing ',datasource);
        om.loadScript(datasource);// this will invoke window.dataCallback when done
        return;
      } else {
        console.log('No data to install');
        installDataIndex++
      }
    }
    // ok, all done
    whenDoneInstallingData();
  }
  window.callback = window.dataCallback = function (data) {
    var itemWithData = om.installedItems[repoFormToUrl(itemsToLoad[installDataIndex])];
    itemWithData.__xdata = data;
    if (om.dataInternalizer) {
      itemWithData.data = om.dataInternalizer(data);
    } else {
      itemWithData.data = data;
    }
    installDataIndex++;
    installMoreData();
  }
  installDataIndex = 0;
  installMoreData();
  
}

// a standalone version of loadData

var loadData = function (item,url,cb) {
  window.callback = window.dataCallback = function (rs) {
    item.__xdata = rs;
    if (om.dataInternalizer) {
    item.data = om.dataInternalizer(rs);
    } else {
      item.data = rs;
    }
    cb(null,rs);
  }     
  om.loadScript(url);// this will invoke window.dataCallback when done
}

/* Items are constructs or  variants. A variant is an item whose top level is derived from a single component (__variantOf), with overrides.
 * Constructs in the current environment are built from code.
 */
 
om.isVariant = function (node) { 
  return !!om.getRequire(node,'__variantOf');
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
    console.log('evalXpath');

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
