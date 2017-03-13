
//assumption: one catalog is open at a time
pj.catalog = {};
pj.catalog.theCatalogs = {};
pj.catalog.theCatalogsJSON = {};

/* the role facility (which allows only catalog entries with the assigned role to be shown) is not in use as of 3/3/2017 */

// these variables are set by the entry point: getAndShowCatalog
var selectedTab;
var catalog;

pj.catalog.sortByTabOrder = function (catalog,order) {
  var rs = [];
  order.forEach(function (tab) {
    catalog.forEach(function (entry) {
      if (entry.tab === tab) {
        rs.push(entry);
      }
    });
  });
  catalog.forEach(function (entry) {
    var tab = entry.tab;
    if (!tab || (order.indexOf(tab) === -1 )) {
      rs.push(entry);
    }
  });
  return rs;
}
var computeTabs = function (catalogState) {
  var catalog = catalogState.catalog;
  var selectedTab = catalogState.selectedTab;
  var tabs = [];
  var allTabs = {};
  var allDefined = true;
  catalog.forEach(function (member) {
    var tab = member.tab;
    if (tab === undefined) {
       allDefined = false;
    }  else {
      if (!allTabs[tab]) {
        allTabs[tab] = 1;
        tabs.push(tab);
      }
    }
  });
  if (catalogState.forCodeEditor) {
    if (!allDefined && (tabs.length > 0)) {
      tabs.push(undefined);
    }
  }
  if (!selectedTab || (tabs.indexOf(selectedTab)===-1)) {
    catalogState.selectedTab = tabs[0];
  }
  catalogState.tabs = tabs;
  return tabs;
}

var forClipboard;
var showCurrentTab = function (catalogState) {
  var i;
  var catalog = catalogState.catalog;
  var role = catalogState.role; // no tabs in this case
  var elements = catalogState.elements;
  var cols = catalogState.cols;
  var catalog = catalogState.catalog;
  var tabs = catalogState.tabs;
  var tabDivs = catalogState.tabDivs
  var selectedTab = catalogState.selectedTab;
  var numCols = cols.length;
  
  for (i = 0;i<numCols;i++) {
    cols[i].innerHTML = '';
  }
  var n = catalog.length;
  var count = 0;
  if (!role) {
    var numTabs = tabs.length;
    for (var j =0;j<numTabs;j++) {
      var tab = tabs[j];
      var tabDiv = tabDivs[j];
      tabDiv.style['border'] = (tab === selectedTab)?'solid thin black':'none';
    }
  }
  forClipboard=  document.createElement("input");
  forClipboard.type = 'input';
  forClipboard.style.width = '60%';
  forClipboard.style.display = 'none';
  forClipboard.value = '';
  cols[0].appendChild(forClipboard)

  for (i=0;i<n;i++) {
    var member = catalog[i];
    var el = elements[role?count:i];
    var tab = member.tab;
    if (role || (member.tab === selectedTab)) {
      if ((role && member.roles && (member.roles.indexOf(role)>-1))||!role) {
        var whichCol = count%numCols;
        var col = cols[whichCol];
        col.appendChild(el);
        count++;
      }
    }
  }
}

pj.catalog.highlightElement = function (catalogState,el) {
  var allEls = catalogState.elements;
  allEls.forEach(function (anEl) {
    if (anEl === el) {
      anEl.style.border = 'solid  red';
    } else {
      anEl.style.border = 'none';//solid thin black';
    }
  });
}

pj.catalog.unselectElements = function (catalogState) {
  pj.catalog.highlightElement(catalogState);
}


pj.catalog.selectTab = function(catalogState,tab) {
  catalogState.selectedTab = tab;
  showCurrentTab(catalogState);
}

pj.catalog.tabSelectCallbacks = [];

pj.catalog.show = function (catalogState) {
  var tabDivs;// the divs of the individual taps
  var showUrl = catalogState.showUrl;
  var  role = catalogState.role;
  var tabsDiv = catalogState.tabsDiv;// the div which contains all the tabs
  var cols = catalogState.cols;
  var whenClick = catalogState.whenClick;
  var catalog = catalogState.catalog;
   if (role) {
    var tabs = [];
  } else {
    var tabHt = tabsDiv.offsetHeight;
    var tabs = computeTabs(catalogState);
  } 
  tabsDiv.style.display = (tabs.length === 0)?'':'inline-block';
  tabsDiv.style.height = (tabs.length === 0)?'0px':'30px';
  var imageWidth = 0.9*cols[0].offsetWidth;
  var ln = catalog.length;
  var els1 = [];
  var els2 = [];
  var allEls = [];
  var mkClick = function (el,selected) {
    return function() {
      pj.catalog.highlightElement(catalogState,el);
      whenClick(selected)
    }
  }
  var mkTabClick = function(tab) {
    return function () {
      catalogState.selectedTab = tab;
      showCurrentTab(catalogState);
      pj.catalog.tabSelectCallbacks.forEach(function (fn) {
        fn(tab);
      });
    }
  } 
  var tabEls = [];
  tabsDiv.innerHTML = '';
  catalogState.tabDivs = tabDivs = [];
  tabs.forEach(function (tab) {
    var tabDiv = document.createElement("div");
    tabDiv.style.display = 'inline-block';
    tabDiv.style.height = (tabHt-8) + 'px';
    tabDiv.style['padding-top'] = '5px';
    tabDiv.style['padding-left'] = '10px';
    tabDiv.style['padding-right'] = '10px';
    var tabTxt = document.createTextNode(tab?tab:'Marks');
    tabDiv.appendChild(tabTxt);
    tabsDiv.appendChild(tabDiv);
    tabDiv.addEventListener('click',mkTabClick(tab));
    tabDivs.push(tabDiv);

  });
  for (var i=0;i<ln;i++) {
    var selected = catalog[i];
    selected.index = i;
    if (role && (!(selected.roles) || (selected.roles.indexOf(role)===-1))) {
      debugger;
      continue;
    }
    var shapeEl =  document.createElement("div");
    shapeEl.style['margin-right'] = 'auto';
    shapeEl.style['margin-left'] = 'auto';
    shapeEl.style['padding-bottom'] = '20px';
    shapeEl.style['padding-top'] = '20px';
    var img =  document.createElement("img");
    img.style.display = 'block';
    img.style['margin-right'] = 'auto';
    img.style['margin-left'] = 'auto';
    shapeEl.appendChild(img);
    var title = showUrl?selected.url:selected.title;
    if (1 || showUrl) {
      var txtDiv = document.createElement("div");
      txtDiv.style['text-align'] = 'center';  
      var txt = document.createTextNode(title?title:'');
      txtDiv.appendChild(txt);
    shapeEl.appendChild(txtDiv);

    }
    var fitFactor = selected.fitFactor?selected.fitFactor:1;
    img.width =  fitFactor*imageWidth;//(uiWidth/2 - 40)+'';
    //console.log('SVG',selected.svg);
    img.src = selected.svg?pj.storageUrl(selected.svg):undefined;
    if (whenClick) {
      shapeEl.addEventListener('click',mkClick(shapeEl,selected));
    }
    allEls.push(shapeEl);
  }
  catalogState.elements = allEls;
  showCurrentTab(catalogState);
}

pj.getCatalog = function (url,cb) {
  pj.httpGet(url,function (error,json) {
    try {
      pj.catalog.theCatalogsJSON[url] = json;
      pj.catalog.theCatalogs[url] = JSON.parse(json);
    } catch (e) {
      debugger;
    }
    cb();
  });
}

pj.getCatalogs = function (url1,url2,cb) {
   var catalog1  = pj.catalog.theCatalogs[url1];
   var catalog2  = url2?pj.catalog.theCatalogs[url2]:'ok';
   if (catalog1 && catalog2) {
      cb();
   }
   if ( (!url2) || catalog1 || catalog2) {
     var missing = catalog1?url2:url1;
     pj.getCatalog(missing,cb);
   } else {
     pj.getCatalog(url1,function () {
       pj.getCatalog(url2,cb);
     });
   }
}
     
 
pj.catalog.getAndShow = function (options) {
  var role = options.role;
  var catalogUrl = options.catalogUrl;
  var extensionUrl = options.extensionUrl; 
  var catalogState = {};
  for (var prop in options) {
    catalogState[prop] = options[prop]
  }
  var elements;
  var showIt = function () {
     return pj.catalog.show(catalogState);
  }
  
  pj.getCatalogs(catalogUrl,extensionUrl,function () {
    var catalog  = pj.catalog.theCatalogs[catalogUrl];
    debugger;
    var catalogJSON = pj.catalog.theCatalogsJSON[catalogUrl]
    if (extensionUrl) {
      var extendedCatalog = pj.catalog.theCatalogs[extensionUrl];
      catalog =catalog.concat(extendedCatalog);
    }
    selectedTab = undefined;
    if (catalog) {
      catalogState.catalog = catalog;
      catalogState.json = catalogJSON;
      pj.catalog.show(catalogState);
    } else {
     pj.error('missing catalog '+catalogUrl);
    }
    pj.catalog.show(catalogState);
    if (options.callback) {
      options.callback(undefined,catalogState);
    }
    pj.catalog.show(catalogState);
  });
}

/*
    pj.httpGet(catalogUrl,function (error,json) {
      try {
        catalogState.catalog = JSON.parse(json);
        debugger;
        catalogState.json = json;
        if (role) {
          catalogState.role = role;
        }
        pj.catalog.theCatalogsJSON[catalogUrl] = json;
        pj.catalog.theCatalogs[catalogUrl] = catalog;
      } catch (e) {
        debugger;
      }
      pj.catalog.show(catalogState);
      if (options.callback) {
        options.callback(undefined,catalogState);
      }
    });
  }
}
*/

pj.catalog.newState = function (tabsDiv,cols,catalogUrl,whenClick) {
    return {tabsDiv:tabsDiv,cols:cols,whenClick:whenClick,catalog:[],json:'[]'}
}



pj.catalog.httpGetString = function (entry) {
  debugger;
  var rs = '?source='+entry.url;
  //var data = entry.data;
  var settings = entry.settings;
  //if (data) {
  //  rs += '&data='+data;
  //}
  if (settings) {
    for (var prop in settings) {
      rs += '&'+prop+'='+settings[prop];
    }
  }
  return rs;
}

pj.catalog.copyToClipboard = function (txt) {
  forClipboard.style.display = 'block';

  forClipboard.value = txt;
  forClipboard.select();
  document.execCommand('copy');
    forClipboard.style.display = 'none';

}
