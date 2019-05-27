
import * as core from "/js/core-1.1.0.min.js";
import * as ui from "/js/ui-1.1.0.min.js";

//assumption: one catalog is open at a time
const theCatalogs = {};
const theCatalogsJSON = {};
let extensionCatalog;


// these variables are set by the entry point: getAndShowCatalog


const sortByTabOrder = function (catalog,order) {
  let rs = [];
  order.forEach(function (tab) {
    catalog.forEach(function (entry) {
      if (entry.tab === tab) {
        rs.push(entry);
      }
    });
  });
  catalog.forEach(function (entry) {
    let tab = entry.tab;
    if (!tab || (order.indexOf(tab) === -1 )) {
      rs.push(entry);
    }
  });
  return rs;
}
const computeTabs = function (catalogState) {
  let {catalog,selectedTab} = catalogState;
  let tabs = [];
  let allTabs = {};
  let allDefined = true;
  catalog.forEach(function (member) {
    let tab = member.tab;
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

let forClipboard;
const showCurrentTab = function (catalogState) {
  let i;
  let catalog = catalogState.filteredCatalog;
  let {elements,cols,tabs,tabDivs,selectedTab} = catalogState;
  let numCols = cols.length;  
  for (i = 0;i<numCols;i++) {
    cols[i].innerHTML = '';
  }
  let n = catalog.length;
  let numTabs = tabs.length;
  for (let j =0;j<numTabs;j++) {
    let tab = tabs[j];
    let tabDiv = tabDivs[j];
    tabDiv.style.border = (tab === selectedTab)?'solid thin black':'none';
  }
  forClipboard=  document.createElement("input");
  forClipboard.type = 'input';
  forClipboard.style.width = '60%';
  forClipboard.style.display = 'none';
  forClipboard.value = '';
  cols[0].appendChild(forClipboard);
  let tabMembers = [];  // an array of indices of members
  for (let i=0;i<n;i++) {
    let member = catalog[i];
    if (member.tab === selectedTab) {
      tabMembers.push(i);
    }
  }
  tabMembers.sort((a,b) => {
    let ai = catalog[a].iindex;
    let bi = catalog[b].iindex;
    ai = (typeof ai === 'number')?ai:0;
    bi = (typeof bi === 'number')?bi:0;
    return ai - bi;
  });
  
  let count = 0;
  tabMembers.forEach((i) => {
    let whichCol = (count++)%numCols;
    let col = cols[whichCol];
    col.appendChild(elements[i]);
    
  });
 /*
  for (i=0;i<n;i++) {s
    let member = catalog[i];
    let el = elements[i];
    if  (member.tab === selectedTab) {
        let whichCol = count%numCols;
        let col = cols[whichCol];
        col.appendChild(el);
        count++;
    }
  }
  */
}

const highlightElement = function (catalogState,el) {
  let allEls = catalogState.elements;
  allEls.forEach(function (anEl) {
    if (anEl === el) {
      anEl.style.border = 'solid  red';
    } else {
      anEl.style.border = 'none';
    }
  });
}

const selectEntry = function (catalogState,entry) {
  let idx = entry.index;
  catalogState.selectedIndex = idx;
  let el = catalogState.elements[idx];
  let tab = entry.tab;
  if (tab) {
    selectTab(catalogState,tab);
  }
  highlightElement(catalogState,el);
}

const findIndex = function (catalogState,fn) {
  let catalog = catalogState.catalog;
  let ln = catalog.length;
  for (let i=0;i<ln;i++) {
    let entry = catalog[i];
    if (fn(entry)) {
      return i;
    }
  }
  return -1;
}

const findIndexWithUrl = function (catalogState,url) {
  return findIndex(catalogState,function (entry) {return entry.url === url});
}


const unselectElements = function (catalogState) {
  highlightElement(catalogState);
}


const selectTab = function(catalogState,tab) {
  catalogState.selectedTab = tab;
  showCurrentTab(catalogState);
}

const tabSelectCallbacks = [];

const filterCatalog = function (catalogState) {
  let {catalog,forInsert,role} = catalogState;
  let filteredCatalog = [];
  catalog.forEach(function (member) {
    //if ((member.insertable || !forInsert) && (!role || (role === member.role))) {
    if (!role || (role === member.role)) {
      filteredCatalog.push(member);
    }
  });
  catalogState.filteredCatalog = filteredCatalog;
}
const show = function (catalogState) {
  let tabDivs;// the divs of the individual taps
  let {showUrl,tabsDiv,cols,whenClick,whenDrag} = catalogState;
  filterCatalog(catalogState);
  let catalog = catalogState.filteredCatalog;
  let tabs = computeTabs(catalogState);
  tabsDiv.style.display = (tabs.length === 0)?'':'inline-block';
  tabsDiv.style.height = (tabs.length === 0)?'0px':'60px';
  let imageWidth = 0.9*cols[0].offsetWidth;
  let ln = catalog.length;
  let allEls = [];
  const mkClick = function (el,selected) {
    return function() {
      catalogState.selectedIndex = selected.index;
      highlightElement(catalogState,el);
      whenClick(selected)
    }
  }
   const mkDrag = function (el,selected) {
    return function() {
      whenDrag(selected);
    }
  }
  const mkTabClick = function(tab) {
    return function () {
      catalogState.selectedTab = tab;
      showCurrentTab(catalogState);
      tabSelectCallbacks.forEach(function (fn) {
        fn(tab,catalogState);
      });
    }
  } 
  tabsDiv.innerHTML = '';
  catalogState.tabDivs = tabDivs = [];
  tabs.forEach(function (tab) {
    let tabDiv = document.createElement("div");
    tabDiv.style.display = 'inline-block';
    tabDiv.style['padding-top'] = '3px';
    tabDiv.style['padding-left'] = '5px';
    tabDiv.style['padding-right'] = '5px';
    tabDiv.style['padding-bottom'] = '3px';
    let tabTxt = document.createTextNode(tab?tab:'Marks');
    tabDiv.appendChild(tabTxt);
    tabsDiv.appendChild(tabDiv);
    tabDiv.addEventListener('click',mkTabClick(tab));
    tabDivs.push(tabDiv);

  });
  for (let i=0;i<ln;i++) {
    let selected = catalog[i];
    selected.index = i;
    let url = selected.url;
    let shapeEl =  document.createElement("div");
    shapeEl.style['margin-right'] = 'auto';
    shapeEl.style['margin-left'] = 'auto';
    shapeEl.style['padding-bottom'] = '10px';// 20px
    shapeEl.style['padding-top'] = '10px'; //20px
    let fitFactor = selected.fitFactor?selected.fitFactor:1;
    let width =  fitFactor*imageWidth;   
    let img =  document.createElement("img");
    img.style.display = 'block';
    img.style['margin-right'] = 'auto';
    img.style['margin-left'] = 'auto';
    shapeEl.appendChild(img);
    let title = showUrl?selected.url:selected.title;
    let txtDiv = document.createElement("div");
    txtDiv.style['text-align'] = 'center';  
    let txt = document.createTextNode(title?title:'');
    txtDiv.appendChild(txt);
    shapeEl.appendChild(txtDiv);
    img.width =  width;
    if (whenClick) {
      shapeEl.addEventListener('click',mkClick(shapeEl,selected));
    }
    if (whenDrag) {
      shapeEl.addEventListener('dragstart',mkDrag(shapeEl,selected));

    }
    allEls.push(shapeEl);
    if (selected.svg) {
      core.vars.mapUrl(selected.svg,function (iurl) {img.src = iurl;});
    } else if (ui.isImage(url)) {
      let mkWhenLoaded = function (whichSelected) { // need to close over selected
        return function () {
          whichSelected.naturalWidth = this.naturalWidth;
          whichSelected.naturalHeight = this.naturalHeight;
          whichSelected.isImage = true;
        }
      } 
      img.addEventListener('load',mkWhenLoaded(selected));
      img.src = url;
    } else {
      let withoutExtension = core.beforeLastChar(url,'.');
      let svg  = withoutExtension + '.svg';
      core.vars.mapUrl(svg,function (iurl) {img.src = iurl;});
    } 
  }
  catalogState.elements = allEls;
  showCurrentTab(catalogState);
}

const loadCatalog = function (url,cb) {
  core.httpGet(url,function (error,json) {
    try {
      theCatalogsJSON[url] = json;
      theCatalogs[url] = JSON.parse(json);
    } catch (e) {
       core.error('catalog','missing catalog:'+url); 
    }
    cb();
  });
}


const getCatalogs = function (url1,url2,cb) {
   let catalog1  = theCatalogs[url1];
   let catalog2  = theCatalogs[url2];
   let missing = [];
   if (url1 && !catalog1) {
    missing.push(url1);
   }
   if (url2 && !catalog2) {
    missing.push(url1);
   }
   let ln = missing.length;
   if (ln === 0) {
     cb();
   } else if (ln === 1) {
     loadCatalog(missing[0],cb);
   } else {
     loadCatalog(url1,function () {
       loadCatalog(url2,cb);
    });
   } 
}
     

const getCatalog = function (options) {
  let {catalogUrl,extensionUrl} = options;
  let catalogState = {};
  for (let prop in options) {
    catalogState[prop] = options[prop]
  }
  getCatalogs(options.catalogUrl,extensionUrl,function () {
    let catalog  = theCatalogs[catalogUrl];
    let catalogJSON = theCatalogsJSON[catalogUrl]
    if (extensionUrl) {
      extensionCatalog = theCatalogs[extensionUrl];
      catalog =catalog.concat(extensionCatalog);
    }
    let selectedTab = options.selectedTab;
    if (catalog) {
      catalogState.catalog = catalog;
      catalogState.json = catalogJSON;
    } else {
     core.error('missing catalog '+catalogUrl);
     return;
    }
    if (options.callback) {
      options.callback(undefined,catalogState);
    }
  });
}

const getAndShow = function (options) {
  let ocb = options.callback;
  options.callback = function (erm,catalogState) {
    show(catalogState);
    if (ocb) {
      ocb(erm,catalogState);
    }
  }
  getCatalog(options);
}


const newState = function (tabsDiv,cols,catalogUrl,whenClick) {
    return {tabsDiv,cols,whenClick,catalog:[],json:'[]'}
}



const httpGetString = function (entry,role) {
  let url = entry.url;
  let urls = entry.urls; 
  let rs = '?source='+(url?url:urls[role]);
  let settings = entry.settings;
  if (settings) {
    for (let prop in settings) {
      rs += '&'+prop+'='+settings[prop];
    }
  }
  return rs;
}

const copyToClipboard = function (txt) {
  forClipboard.style.display = 'block';
  forClipboard.value = txt;
  forClipboard.select();
  document.execCommand('copy');
    forClipboard.style.display = 'none';

}

export {extensionCatalog,show,getAndShow,tabSelectCallbacks,selectTab,highlightElement,
        sortByTabOrder,httpGetString,getCatalog,theCatalogs};