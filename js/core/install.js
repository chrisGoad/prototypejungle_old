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


pj.isFullUrl = function (url) {
  return pj.beginsWith(url,'http://') || pj.beginsWith(url,'https://');
}



// components might refer to their repos with '.'s, meaning 'the current repo


var requireToUrl = function (relto,require) {
  var path = require.path;
  if (pj.beginsWith(path,'./')) {
    return relto + path.substr(1);
  } else {
    return path;
  }
}

// this finds the url among the pending loads; note that the pending loads are in repo form. it returns repo form.
var findAmongPending = function (url) {
  return itemLoadPending[url]?url:undefined;
  var item,itemUrl;
  for (item in itemLoadPending) {
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



/* 
 * error reporting is done node-style (call back takes error,data)
 * error reporting: the top-level calls define installCallback. 
 * When there is an error, this is called with the error message as the first argument.
 *installCallback(null,rs) is called in absence of error
 */


var installCallback; //call this with the installed item
var installErrorCallback; 

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

pj.returnContents = function (url,cb) {
  pj.tlog('returnContents from ',url);
  pj.httpGet(url,function (erm,rs) {
    pj.tlog('returnContents from ',url,' DONE');

    if (cb) {
      cb(erm,rs);
      return;
    }
    if (erm) {
      pj.error(erm);
    } else {
      pj.returnData(rs);
    }
  });
}

// support for urls that require two hops - the content at the first url points to the value
pj.indirectUrl = function (url) {} // this may be redefined by applications


pj.loadScript = function (iurl,cb) {
  var url;
  pj.tlog('loading script ',iurl);
  //var mappedUrl = pj.urlMap?pj.urlMap(url):url;
  var indirect = pj.indirectUrl(iurl);  
  if (indirect) {
    url = indirect+'?callback=pj.returnContents';
    pj.loadScript(url);
    return;
  } else {
    url = iurl;
  }
  var  onError = function (errorEvent) {
    var erm = {message:'Failed to load '+url};
    var icb;
    if (cb) {  
      cb(erm);
    } 
  }
  var  onLoad = function (loadEvent) {
    pj.tlog('done loading',url);
    if (cb) {
      cb(null,loadEvent);
    }
  }
  var element = document.createElement('script');
  var  head = document.getElementsByTagName('head')[0];
  element.setAttribute('type', 'text/javascript');
  element.setAttribute('src', url);
  if (cb) element.addEventListener('load',onLoad);
  element.addEventListener('error', onError);
  head.appendChild(element); 
}

var topPath,badItem,missingItem,loadFailed,itemsToLoad,itemsLoaded,itemLoadPending,
  internalizedItems,scriptsToLoad,idsForScriptComponents,dsPaths,dataSources;

var resetLoadVars = function () {
  itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A.
                   // Each item is in the 'repo form' (see above). items are in repo form
  itemsLoaded  = {};  //  urls  -> noninternalized __values
  itemLoadPending = {}; // Maps urls to 1 for the items currently pending
  internalizedItems = {};
  scriptsToLoad = [];
  idsForScriptComponents = [];
  badItem = false;
  missingItem = false;
  loadFailed = false;
  topPath = undefined;
  dsPaths = [];
  dataSources = [];
  topDependencies = pj.Array.mk();

}




 



pj.assertItemLoaded = function (x) {
  pj.log('load','done loading ',x);
  pj.lastItemLoaded = (typeof x === 'string')?JSON.parse(x):x;
  return;
}

var afterLoad = function (errorEvent,loadEvent) {
    var lastItemLoaded = pj.lastItemLoaded;
    var id;
    if (lastItemLoaded===undefined) { // something went wrong
      itemsLoaded[topPath] = 'badItem';
      pj.log('bad item ');
      badItem = true;
      pj.doneLoadingItems();
      return; 
    }
    var sourceUrl = loadEvent.target.src;
    lastItemLoaded.__sourcePath = sourceUrl;
    //  path is relative to pj; always of the form /x/handle/repo...
    var requires = lastItemLoaded.__requires;
    if (requires) {
      requires.forEach(function (path) {
        var alreadyMentioned;
        if (typeof(path) === 'string') { // non internalized array, so has an annotion object as first element
          if (pj.endsIn(path,'.js')||pj.endsIn(path,'.json')||pj.endsIn(path,'returnData')) {
             alreadyMentioned = scriptsToLoad.some(
               function (toLoad) {return toLoad[1] === path}
              );
             if (!alreadyMentioned) {
               scriptsToLoad.push(path);
            }
          } else {
            if (itemsToLoad.indexOf(path) < 0) {
              itemsToLoad.push(path);
            }
          }
        }
      });
      
    }
    itemsLoaded[sourceUrl] = lastItemLoaded;
    delete itemLoadPending[sourceUrl];
    loadMoreItems();
  }

  

/* conventions:
 * if path ends in a .js , this is assumed to be item file. Ow, /item.js is appended
 * if the form of the call is install(x,cb), and x has the form http: *prototypejungle.org/....
 * then the repo and path are extracted from x automatically
 */

pj.install = function (path,cb) {
  if (typeof path === 'string') {
    if (pj.endsIn(path,'.js')||pj.endsIn(path,'returnData')) {
      pj.main(path,cb,true);
      return;
    }
    installCallback = cb;
    resetLoadVars();
    requireDepth = 1;
    itemsToLoad.push(pj.fullUrl(undefined,path));
    loadMoreItems();
  } else {
    installedUrls = [];
    path.forEach(function (p) {
      installedUrls.push(p);
      itemsToLoad.push(p);
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
  var pending = false;
  itemsToLoad.forEach(function (item) {
    if (!itemsLoaded[item]) {
      pending = true;
      if (!itemLoadPending[item]) {
        itemLoadPending[item] = true;
        pj.loadScript(item,afterLoad);
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
  var rcb,mainItem;
  installCallback = undefined;
  var rcb = function (err,item) {
      internalizeLoadedItems();
      mainItem = pj.installedItems[itemsToLoad[0]];
      icb(undefined,mainItem);
    }
  if (scriptsToLoad.length > 0) {
    // rcb is the callback for require
    pj.require.apply(undefined,scriptsToLoad.concat([rcb]));
  } else {
    rcb();
  }
  return; 
}

var catchInternalizationErrors= false; 

var internalizeLoadedItem = function (url) {
  var irelto = pj.pathExceptLast(url);
  var item = itemsLoaded[url];
 // var url = pj.repoFormToUrl(itemRepoForm);
  var internalizedItem,requires;
  if (!item) {
    pj.error('Failed to load '+url);
    return;
  }
  if (catchInternalizationErrors) { 
    try {
      internalizedItem = pj.internalize(item,irelto);
      
    } catch(e) {
      console.log("ERROR in internalizing ",url); 
      internalizedItem = pj.svg.Element.mk('<g/>');
     
    }
  } else {
    internalizedItem = pj.internalize(item,irelto);
  }
  internalizedItems[url] = 1;
  pj.installedItems[url] = internalizedItem;
}


var internalizeLoadedItems = function () {
  var ln = itemsToLoad.length;
  var i,rs;
  if (ln===0) return undefined;
  for (i = ln-1;i>=0;i--) {
    internalizeLoadedItem(itemsToLoad[i]);
  }
  rs = pj.installedItems[itemsToLoad[0]];
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
    var sourceRelto = current.__get('__sourceRelto');
    var sourcePath = current.__get('__sourcePath')
    if (sourcePath) {
      url = pj.fullUrl(sourceRelto,sourcePath); ///sourceRepo + '/' + current.__sourcePath;
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
  if (pj.isRepoForm(location)) {
   repo = pj.beforeChar(location,"|");
   path = pj.afterChar(location,"|");
   xItem = pj.XItem.mk(repo,path,true);
  } else if (pj.isFullUrl(location)) {
   xItem = pj.XItem.mk("",location,true);
  } else {
   xItem = pj.XItem.mk(".",location,true);
  }
  return xItem;
}

pj.returnData = function (idata,location) {
  var data;
  if (typeof idata === 'string') {
    data = JSON.parse(idata);
  } else {
    data = idata;
  }
  var lifted = pj.lift(data);
  pj.returnValue(undefined,lifted,location);
}


pj.domainOf = function (url) {
  var r = /(^http\:\/\/[^\/]*)\/.*$/
  var m = url.match(r);
  return m?m[1]:m;
}

pj.fullUrl = function (relto,path) {
  if (pj.beginsWith(path,'http:')||pj.beginsWith(path,'https:')||pj.beginsWith(path,'[')) {
    return path;
  }
  if (!relto) {
    return path;
  }
  if (pj.beginsWith(path,'/')) {
    var domain = pj.domainOf(relto)
    return domain + path;
  } else if (pj.beginsWith(path,'./')) {
    return relto + path.substr(1);
  } else if (pj.beginsWith(path,'../')) {
    return pj.fullUrl(pj.pathExceptLast(relto),path.substr(3))
  } else {
    return relto + '/' + path;

  }
  return path;
}
/*
 * this version takes arguments: src0,src1, .. srcn, and cb, which takes args
 * err,a0,.. an, corresponding to the sources.
 */
pj.require = function () {
  console.log('requireDepth',requireDepth);
  if (requireDepth === 0) {
    resetLoadVars();
  }
  requireDepth++;
  var numRequires = arguments.length-1;
  var sources = [];
  var lastSource,i,index,svReturn,svRelto,item,requires,path,i,repo,location,nm,xItem,loadedComponents,
      isData,dataSource; 
  var cb = arguments[numRequires];
  for (i=0;i<numRequires;i++) {
    sources.push(arguments[i])
  }
  
  index = 0;
  svReturn = pj.returnValue;
  svRelto = pj.relto;
  loadedComponents = [];
  pj.returnValue= function (err,component,ilocation) {
    var nm,location,url,fullUrl,path,xItem,nm,requireD,args;
    location = ilocation?ilocation:sources[index];
     if (component) {
       pj.tlog('returnValue from ',location,' is ilocation ',Boolean(ilocation));
     } 
     path = location;
    
     fullUrl = pj.fullUrl(svRelto,path);
     if (component) { 
       component.__sourcePath = path;
       component.__sourceRelto = svRelto;
       component.__requireDepth = requireDepth;
       if (requireDepth === 1) {
         topDependencies.push(fullUrl);
       }
       pj.installedItems[fullUrl] = component;
       if (ilocation) {
         return;
       }
       loadedComponents.push(component);
       index++;
       if (index === numRequires) { // all of the components have been loaded      
         pj.returnValue = svReturn;
         pj.relto = svRelto;
         args = [undefined].concat(loadedComponents);
         requireDepth--;
         cb.apply(undefined,args);
         return;
       }
     }
     location = sources[index];// load the script of the next require
     fullUrl = pj.fullUrl(svRelto,location)
     var cv = pj.installedItems[url];
     if (cv) {
        pj.returnValue(undefined,cv);
     } else {
       pj.relto = pj.pathExceptLast(fullUrl);
       pj.loadScript(fullUrl);
     }
   };
   pj.returnValue();
}


pj.requireOne = function (location,cb) {
  pj.require(location,cb);
}
var requireDepth = 0;
var topDependencies;
//  Loads the main script. If !forInstall, the first level of requires are recorded
pj.main = function (location,cb,forInstall) {
  resetLoadVars();
  installCallback = cb;
  var url = pj.fullUrl(undefined,location);
  var relto = pj.pathExceptLast(url);
  var path = url;
  pj.relto =  relto;
  pj.path = path;
  pj.returnValue= function (err,item) {
    if (forInstall) {
      item.__sourcePath = url;
      item.__requireDepth = 1;
    } else {
      item.__originPath = url;  // conveninient to use a different name; not used in the require machinery
      item.__requireDepth = 0;
    }
    item.__topLevel = 1;
    cb(err,item); 
  }
  requireDepth = forInstall?1:0;
  var sendAlongError = function (erm,rs) {
    if (erm) {
      cb(erm);
    }
  }
  pj.loadScript(url,sendAlongError);
}



// bring in a component that was external into its  parent structure; used for data that is wanted inside rather than outside
pj.Object.__importComponent = function () {
  var parent = this.parent();
  var proto = Object.getPrototypeOf(this);
  if (parent && proto.__sourcePath) {
    parent.set(this.__name,proto);
    delete proto.__sourcePath;
    delete proto.__sourceRelto;
  }
}

//end extract

})(prototypeJungle);
