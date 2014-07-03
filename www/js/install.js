(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjcs.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract

// <Section> Install  ======================================

// each external item might have a __requires field, which is an array of objects of the form {name:nm,repo:r,path:p}
// repo is a url, and the path is the path within that url. repo might be ".", meaning the repo from which the current item is being loaded.
// "repo form" for something to load is "repo|path"; ie the url of the repo and the path, separated by a |.


om.set("XItem", om.DNode.mk()).namedType(); // external item

om.XItem.mk = function (nm,repo,path) {
  var rs = Object.create(om.XItem);
  rs.name = nm;
  rs.repo = repo;
  rs.path = path;
  return rs;
}


var internalizeXItems = function (itm) {
  var cms = itm.__requires;
  var rs = om.LNode.mk();
  if (cms) {
    cms.forEach(function (cm) {
      var xit = om.XItem.mk(cm.name,cm.repo,cm.path);
      rs.push(xit);
    });
  }
  itm.set("__requires",rs);
  //return rs;
}

om.mkXItemsAbsolute = function (itms,repo) {
  itms.forEach(function (itm) {
    if (itm.repo===".") {
      itm.repo = repo;
    }
  });
}
  
    
// sequence of activity:
// loadItems
// loadScripts (each item might have a scriptsToLoad property; load these)
// internalizeItems
// installData (each item might have a dataSource property; load these and assign to the data property of each iterm


om.dataInternalizer = undefined; // set from the outside; currently in the dat module. 

var repoForm = function (repo,path) {
  return repo+"|"+path;
}
var repoFormToUrl = function (rf) {
  return rf.replace("|","/");
}
// components might refer to their repos with "."s, meaning "the current repo"
om.componentToUrl = function (repo,cm) {
  var r = cm.repo;
  if (r === ".") {
    r = repo;
  }
  return r + "/" + cm.path;
}
  
om.componentToRepoForm= function (repo,cm) {
  var r = cm.repo;
  if (r === ".") {
    r = repo;
  }
  return r + "|" + cm.path;
}
  

// this finds the url among the pending loads; note that the pending loads are in repo form. it returns repo form.
var findAmongPending = function (url) {
  for (var k in itemLoadPending) {
    var uk = repoFormToUrl(k);
    if (uk === url) {
      return k;
    }
  }
}
om.installedItems = {};
// machinery for installing items

// items are denoted by their full paths beneath pj (eg /x/handle/repo)
// The following variables are involved

//om.activeConsoleTags.push("load");

om.urlMap = undefined; // these are set from the outside, if the real urls from which loading should be done are different from the given urls
om.inverseUrlMap = undefined;
//  in the prototypeJungle ui, items are loaded from prototypejungle.s3.amazonaws.org rather than prototypejungle.org, to get around cloud front.

// error reporting is done node-style (call back takes error,data)
// error reporting: the top-level calls define installCallback. 
//  When there is an error, this is called with the error message as the first argument.
// installCallback(null,rs) is called in absence of error



var installCallback; //call this with the installed item 
om.loadScript = function (url,cb) {
  var  onError = function (e) {
    var u = url;
    if (installCallback) {
      var icb = installCallback;
      installCallback = undefined;
      icb({message:'Failed to load '+url});
    } else if (cb) {
      cb(e,null);
    }
  }
  var  onLoad = function (e) {
    cb(null,e);
  }
  var murl = om.urlMap?om.urlMap(url):url;
  var element = document.createElement("script");
  var  head = document.getElementsByTagName("head")[0];
  element.setAttribute("type", "text/javascript");
  element.setAttribute("src", murl);
  if (cb) element.addEventListener("load",onLoad);
  element.addEventListener("error", onError);

  head.appendChild(element);
}

var topPath;
var variantOf;
var variantOf; //  if the top level restore is a variant, this is the path of the item of which it is a variant
var badItem,missingItem,loadFailed,codeBuilt,itemsToLoad,itemsLoaded,itemLoadPending,internalizedItems,scriptsToLoad;

var resetLoadVars = function () {
  itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A.
                   // Each item is in the "repo form" (see above). items are in repo form
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




 

// the data file uses the JSONP pattern, calling loadFuntion.  The data file also says of itself what it's own url is, and what path it should be loaded into within
// the jungle


// called jsonp style when main item is loaded


om.assertItemLoaded = function (x) {
  om.log("load","done loading ",x);
  om.lastItemLoaded = x;
  return;
}
 
var afterLoad = function (e,s) {
    var vl = om.lastItemLoaded;
    if (vl===undefined) { // something went wrong
      itemsLoaded[topPath] = "badItem";
      om.log("bad item ");
      badItem = 1;
      om.doneLoadingItems();
      return;
    }
    var surl =  s.target.src;
    var url = om.inverseUrlMap?om.inverseUrlMap(surl):surl;
    var rf = findAmongPending(url);
    var rfs = rf.split("|");
    var thisRepo = rfs[0];
    var thisPath = rfs[1];
    vl.__sourceRepo = thisRepo;
    vl.__sourcePath = thisPath;
    //  path is relative to pj; always of the form /x/handle/repo...
    var cmps = vl.__requires;
    if (!cmps) {
      cmps = vl.__components;
      if (cmps) {
        vl.__requires = cmps;
        delete vl.__components;
      }
    }
    if (cmps) {
      cmps.forEach(function (c) {
        var crf = om.componentToRepoForm(thisRepo,c);
        if (itemsToLoad.indexOf(crf) < 0) {
          itemsToLoad.push(crf);
        }
      });
    }
    var stl = vl.scriptsToLoad;
    if (stl) {
      // externalizing LNodes involves listing properties as the zeroth element
      // shift away that element.
      stl.shift();
      scriptsToLoad = scriptsToLoad.concat(stl);
    }
    itemsLoaded[rf] = vl;
    delete itemLoadPending[rf];
    loadMoreItems();
  }
  



om.install = function (repo,path,cb) {
  if (typeof path === "string") {
    var rf = repo+"|"+path;
    installCallback = cb;
    resetLoadVars();
    itemsToLoad.push(rf);
    loadMoreItems();
  } else {
    var rfs = [];
    var urls = [];
    path.forEach(function (p) {
      rfs.push(repo+"|"+p);
      urls.push(repo+"/"+p);
      itemsToLoad.push(rf);
    });
    installCallback = function (e) {
      if (e) {
        cb(e);
      } else {
        var rs = urls.map(function (u) {return om.installedItems[u];});
        cb(null,rs);
      }
    };
    loadMoreItems();
  };
              
      
}

om.installComponents = function (repo,cms,cb) {
  if (cms.length === 0) {
    cb(null,[]);
    return;
  }
  resetLoadVars();
  var rfs =  cms.map(function (c) {return om.componentToRepoForm(repo,c)});
  var urls =  cms.map(function (c) {return om.componentToUrl(repo,c)});
  installCallback = function (e) {
    if (e) {
      cb(e);
    } else {
      var rs = urls.map(function (u) {return om.installedItems[u];});
      cb(rs);
    }
  };
  itemsToLoad = rfs;
  loadMoreItems();
}



  

var loadMoreItems  = function () {
  var ln = itemsToLoad.length;
  var pending = 0;
  for (var i=0;i<ln;i++) {
    var ci = itemsToLoad[i];
    if (!itemsLoaded[ci]) {
      pending = 1;
      if (!itemLoadPending[ci]) {
        itemLoadPending[ci] = 1;
        om.loadScript(repoFormToUrl(ci),afterLoad);
        return; // this makes loading sequential. try non-sequential sometime.
      }
    }
  }
  if (!pending) {
    loadScripts();
  }
}


var loadScripts = function () {
  var urls = scriptsToLoad;
  var cnt = 0;
  var ln = urls.length;
  //ln = 0;
  //if (ln===0) {
   // cb();
  //  return;
  //}
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


var internalizeLoadedItem = function (rf) {
  var itm = itemsLoaded[rf];
  var url = repoFormToUrl(rf);
  if (!itm) {
    om.error("Failed to load "+url);
    return;
  }
  var cmps = itm.__requires;
  var rs = om.internalize(itm,om.beforeChar(rf,"|"));
  internalizeXItems(rs);
  om.installedItems[url] = rs;
  return rs;
}


var internalizeLoadedItems = function () {
  var rs;
  var ln = itemsToLoad.length;
  if (ln===0) return undefined;
  for (var i = ln-1;i>=0;i--) {
    internalizeLoadedItem(itemsToLoad[i]);
  }
  return om.installedItems[repoFormToUrl(itemsToLoad[0])];
}


var installData = function () {
  var installDataIndex = 0;// index into itemsToLoad of the current install data job
  var installMoreData = function () {
    var ln = itemsToLoad.length;
    while (installDataIndex<ln) {
      var iitm = om.installedItems[repoFormToUrl(itemsToLoad[installDataIndex])];
      var ds = iitm.__dataSource;
      console.log("Data loading for ",itemsToLoad[installDataIndex]," index ",installDataIndex);
      if (ds) {
        console.log("Installing ",ds);
        om.loadScript(ds);// this will invoke window.dataCallback when done
        return;
      } else {
        console.log("No data to install");
        installDataIndex++
      }
    }
    // ok, all done
    var rs = om.installedItems[repoFormToUrl(itemsToLoad[0])];
    if (installCallback) {
      var icb = installCallback;
      installCallback = undefined;
      icb(null,rs);
    }
  }
  window.callback = window.dataCallback = function (rs) {
    var iitm = om.installedItems[repoFormToUrl(itemsToLoad[installDataIndex])];
    iitm.__xdata = rs;
    if (om.dataInternalizer) {
      iitm.data = om.dataInternalizer(rs);
    } else {
      iitm.data = rs;
    }
    installDataIndex++;
    installMoreData();
  }
  installDataIndex = 0;
  installMoreData();
  
}


 /* Items are constructs or  variants. A variant is an item whose top level is derived from a single component (__variantOf), with overrides.
 Constructs in the current environment are built from code. */
 
om.isVariant = function (nd) { 
  return !!om.getComponent(nd,"__variantOf");
}


om.variantOf = function (nd) {
  return om.getComponentValue(nd,"__variantOf");
}

om.mkVariant = function (nd) {
  var rs = om.variantOf(nd);
  if (!rs) {
    rs = nd.instantiate();
    var rsc = om.LNode.mk();
    var c0 = om.DNode.mk();
    c0.name = "__variantOf";
    c0.repo = nd.__sourceRepo;
    c0.path = nd.__sourcePath;
    rsc.push(c0);
    rs.set("__requires",rsc);
    //rs.__sourceRepo = ui.repo;
    //rs.__sourcePath = ui.path;
      
  }
  return rs;
}


//end extract
})(prototypeJungle);
