
//assumption: one catalog is open at a time
pj.catalog = {};
pj.catalog.theCatalogs = {};
pj.catalog.theCatalogsJSON = {};

//var catalog = pj.catalog;
/*
pj.unselectCatalogElements = function (catalogState) {
  var elements =catalogState.elements;
   elements.forEach(function (anEl) {
        anEl.style.border = 'solid thin black';
   });
}

*/
// these variables are set by the entry point: getAndShowCatalog
var selectedTab;
var catalog;

var computeTabs = function (catalogState) {
  var catalog = catalogState.catalog;
  var selectedTab = catalogState.selectedTab;
  var tabs = [];
  var allDefined = true;
  catalog.forEach(function (member) {
    var tab = member.tab;
    if (tab === undefined) {
       allDefined = false;
    }  else {
      if (tabs.indexOf(tab)===-1) {
        tabs.push(tab);
      }
    }
  });
  if (1  || catalogState.forCodeEditor) {
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
   // if (tab === 'undefined') {
   //   tab = 'Default';
   // }
      var tabDiv = tabDivs[j];
      tabDiv.style['border'] = (tab === selectedTab)?'solid thin black':'none';
    }
  }
  for (i=0;i<n;i++) {
    var member = catalog[i];
    var el = elements[i];
    var tab = member.tab;
    if (role || (member.tab === selectedTab)) {
      var whichCol = count%numCols;
      var col = cols[whichCol];
      col.appendChild(el);
      count++;
     /* if (count%2) {
        col2.appendChild(el);
      } else {
        col1.appendChild(el);
      }
      count++
      */
    }
  }
}

//pj.catalog.highlightCatalogElement = function (catalogState,el) {
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
//pj.catalog.unselectCatalogElements = function (catalogState) {

pj.catalog.unselectElements = function (catalogState) {
  pj.catalog.highlightElement(catalogState);
}


//pj.selectCatalogTab = function(catalogState,tab) {
pj.catalog.selectTab = function(catalogState,tab) {
  catalogState.selectedTab = tab;
  showCurrentTab(catalogState);
}

pj.catalog.tabSelectCallbacks = [];

//pj.showCatalog = function (tabsDiv,cols,imageWidthFactor,whenClick) {
//pj.catalog.showCatalog = function (catalogState) {

/* maybe later move the contstruction of the tabdiv  and columns down here
var mkTab = function () {
  var rs =  document.createElement("div");
  rs.style.display = 'inline-block';
  rs.style.width = '100%';
  rs.style.height = '30px';
  return rs;
}
var mkColumn = function () {
  var rs =  document.createElement("div");
  rs.style.display = 'inline-block';
  rs.style.width = '49%';
  return rs;
}
*/
/*
var mkColumns = function (n) {
      ui.catalogTab = html.Element.mk('<div id="tab" style="width:100%;vertical-align:bottom;border:thin solid black;display:inline-block;height:30px;"></div>'),
       //ui.catalogTab = html.Element.mk('<div id="tab" style="vertical-align:bottom;border-bottom:thin solid black;height:30px;">Tab</div>'),
       ui.catalogCol1 = html.Element.mk('<div id="col1" style="display:inline-block;bborder:thin solid black;width:49%;"></div>'),
       ui.catalogCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;bborder:thin solid black;width:49%;"></div>')

}
*/
pj.catalog.show = function (catalogState) {
  var tabDivs;// the divs of the individual taps
  //theCatalogState = catalogState;
  var  role = catalogState.role;
  var tabsDiv = catalogState.tabsDiv;// the div which contains all the tabs
  var cols = catalogState.cols;
  //var imageWidthFactor = catalogState.imageWidthFactor;
  var whenClick = catalogState.whenClick;
  var catalog = catalogState.catalog;
  //var col1 = cols[0];
  //var col2 = cols[1];
  //console.log('col1',col1.offsetWidth);
  console.log('tabsDiv',tabsDiv.offsetHeight);
   if (role) {
   // tabsDiv.$hide();
    var tabs = [];
  } else {
    var tabHt = tabsDiv.offsetHeight;
    var tabs = computeTabs(catalogState);
  } 
  tabsDiv.style.display = (tabs.length === 0)?'':'inline-block';
  tabsDiv.style.height = (tabs.length === 0)?'0px':'30px';
  //var imageWidth = imageWidthFactor * col1.offsetWidth;
  var imageWidth = 0.9*cols[0].offsetWidth;
 // imageWidth = 200;

  var ln = catalog.length;
  var els1 = [];
  var els2 = [];
  var allEls = [];
  /*
  var highlightEl = function (el) {
    allEls.forEach(function (anEl) {
      if (anEl === el) {
        anEl.style.border = 'solid  red';
      } else {
        anEl.style.border = 'solid thin black';
      }
    });
  }*/
  var mkClick = function (el,selected) {
    return function() {
      pj.catalog.highlightElement(catalogState,el);
      ui.unselect();
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
    //theTabDivs[tab] = tabDiv;
    tabDiv.style.display = 'inline-block';
    //tabDiv.style.display = 'table-cell';
    //tabDiv.style['vertical-align'] = 'bottom';
    tabDiv.style.height = (tabHt-8) + 'px';
    tabDiv.style['padding-top'] = '5px';
    tabDiv.style['padding-left'] = '10px';
    tabDiv.style['padding-right'] = '10px';
    //if (tab === catalogState.selectedTab) {
    //  tabDiv.style['border'] = 'solid thin green';
    //}

    var tabTxt = document.createTextNode(tab?tab:'Marks');
   // tabTxt.style['vertical-align'] = 'bottom';
    tabDiv.appendChild(tabTxt);
    tabsDiv.appendChild(tabDiv);
    tabDiv.addEventListener('click',mkTabClick(tab));
    tabDivs.push(tabDiv);

  });
  for (var i=0;i<ln;i++) {
    var selected = catalog[i];
    selected.index = i;
    if (role && (selected.role !== role)) {
      continue;
    }
    var shapeEl =  document.createElement("div");
    //shapeEl.style.border = 'solid thin black';
    shapeEl.style['margin-right'] = 'auto';
    shapeEl.style['margin-left'] = 'auto';
    shapeEl.style['padding-bottom'] = '20px';
    var img =  document.createElement("img");//shapeDiv.instantiate();// replacement.svg;
    img.style.display = 'block';
    img.style['margin-right'] = 'auto';
    img.style['margin-left'] = 'auto';
    //img.style['border'] = 'solid thin red';
    //img.width = "200";
    //img.height = "100";
    var txtDiv = document.createElement("div");
    //txtDiv.style.display = 'block';
    //txtDiv.style['margin-right'] = 'auto';
    //txtDiv.style['margin-left'] = 'auto';
    txtDiv.style['text-align'] = 'center';
    var txt = document.createTextNode(selected.title);
    txtDiv.appendChild(txt);
    shapeEl.appendChild(img);
    shapeEl.appendChild(txtDiv);
    var fitFactor = selected.fitFactor?selected.fitFactor:1;
    img.width =  fitFactor*imageWidth;//(uiWidth/2 - 40)+'';
    console.log('SVG',selected.svg);
    img.src = selected.svg?pj.storageUrl(selected.svg):undefined;
    //shapeEl.txt.$html(selected.title);
    if (whenClick) {
      shapeEl.addEventListener('click',mkClick(shapeEl,selected));
    }//.url,selected.settings));
    /*
    if (i%2) {
      col2.appendChild(shapeEl);
    } else {
      col1.appendChild(shapeEl);
    }
    */
    allEls.push(shapeEl);
  }
  catalogState.elements = allEls;
  showCurrentTab(catalogState);
}

//pj.switchTab = function () {}


//pj.getAndShowCatalog = function (role,tabsDiv,cols,imageWidthFactor,catalogUrl,whenClick,cb) {
//pj.getAndShowCatalog = function (role,tabsDiv,cols,catalogUrl,whenClick,cb) {
pj.catalog.getAndShow = function (role,tabsDiv,cols,catalogUrl,whenClick,cb) {
  //var col1 = cols[0];
  //var col2 = cols[1];
  var elements;
  var showIt = function () {
     return pj.catalog.show(catalogState);
  }
  var catalog  = pj.catalog.theCatalogs[catalogUrl];
  var catalogJSON = pj.catalog.theCatalogsJSON[catalogUrl]
  var catalogState = {tabsDiv:tabsDiv,cols:cols,whenClick:whenClick,role:role}
  selectedTab = undefined;
  if (catalog) {
    catalogState.catalog = catalog;
    catalogState.json = catalogJSON;
    pj.catalog.show(catalogState);
  } else {
    pj.httpGet(catalogUrl,function (error,json) {
      try {
        catalogState.catalog = JSON.parse(json);
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
      if (cb) {
        cb(undefined,catalogState);//{json:json,catalog:catalog,elements:elements});
        //code
      }
    });
  }
}



pj.catalog.httpGetString = function (entry) {
  debugger;
  var rs = '?source='+entry.url;
  var data = entry.data;
  var settings = entry.settings;
  if (data) {
    rs += '&data='+data;
  }
  if (settings) {
    for (var prop in settings) {
      rs += '&'+prop+'='+settings[prop];
    }
  }
  return rs;
}
