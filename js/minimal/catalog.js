
//assumption: one catalog is open at a time
pj.theCatalogs = {};
pj.theCatalogsJSON = {};

pj.unselectCatalogElements = function (catalogState) {
  var elements =catalogState.elements;
   elements.forEach(function (anEl) {
        anEl.style.border = 'solid thin black';
   });
}


// these variables are set by the entry point: getAndShowCatalog
var selectedTab;
var catalog;

var computeTabs = function (catalogState) {
  var catalog = catalogState.catalog;
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
  if (!allDefined) {
    tabs.push('Default');
  }
  if (!catalogState.selectedTab) {
    catalogState.selectedTab = tabs[0];
  }
  return tabs;
}

//pj.showCatalog = function (tabsDiv,cols,imageWidthFactor,whenClick) {
pj.showCatalog = function (catalogState) {
  debugger;
  //theCatalogState = catalogState;
  var tabsDiv = catalogState.tabsDiv;
  var cols = catalogState.cols;
  var imageWidthFactor = catalogState.imageWidthFactor;
  var whenClick = catalogState.whenClick;
  var catalog = catalogState.catalog;
  var col1 = cols[0];
  var col2 = cols[1];
  console.log('col1',col1.offsetWidth);
  console.log('tabsDiv',tabsDiv.offsetHeight);
  var tabHt = tabsDiv.offsetHeight;
  var tabs = computeTabs(catalogState);
  var imageWidth = imageWidthFactor * col1.offsetWidth;
  imageWidth = 100;
  col1.innerHTML = ''
  col2.innerHTML = '';
  var ln = catalog.length;
  var els1 = [];
  var els2 = [];
  var allEls = [];
  var highlightEl = function (el) {
    allEls.forEach(function (anEl) {
      if (anEl === el) {
        anEl.style.border = 'solid  red';
      } else {
        anEl.style.border = 'solid thin black';
      }
    });
  }
  var mkClick = function (el,selected) {
    return function() {
      highlightEl(el);
      debugger;
      ui.unselect();
      whenClick(selected)
    }
  }
  var mkTabClick = function(tab) {
    return function () {
      catalogState.selectedTab = tab;
      pj.showCatalog(catalogState);
    }
  } 
  var tabEls = [];
  tabsDiv.innerHTML = '';
  //theTabDivs = {};
  tabs.forEach(function (tab) {
    debugger;
    var tabDiv = document.createElement("div");
    //theTabDivs[tab] = tabDiv;
    tabDiv.style.display = 'inline-block';
    //tabDiv.style.display = 'table-cell';
    //tabDiv.style['vertical-align'] = 'bottom';
    tabDiv.style.height = (tabHt-8) + 'px';
    tabDiv.style['padding-top'] = '5px';
    tabDiv.style['padding-left'] = '10px';
    tabDiv.style['padding-right'] = '10px';
    if (tab === catalogState.selectedTab) {
      tabDiv.style['border'] = 'solid thin green';
    }

    var tabTxt = document.createTextNode(tab);
   // tabTxt.style['vertical-align'] = 'bottom';
    tabDiv.appendChild(tabTxt);
    tabsDiv.appendChild(tabDiv);
    tabDiv.addEventListener('click',mkTabClick(tab));

  });
  for (var i=0;i<ln;i++) {
    var selected = catalog[i];
    var shapeEl =  document.createElement("div");
    var img =  document.createElement("img");//shapeDiv.instantiate();// replacement.svg;
    var txtDiv = document.createElement("div");
    var txt = document.createTextNode(selected.title);
    txtDiv.appendChild(txt);
    shapeEl.appendChild(img);
    shapeEl.appendChild(txtDiv);
    img.width =  imageWidth;//(uiWidth/2 - 40)+'';
    console.log('SVG',selected.svg);
    img.src = pj.storageUrl(selected.svg);
    //shapeEl.txt.$html(selected.title);
    if (whenClick) {
      shapeEl.addEventListener('click',mkClick(shapeEl,selected));
    }//.url,selected.settings));
    if (i%2) {
      col2.appendChild(shapeEl);
    } else {
      col1.appendChild(shapeEl);
    }
    allEls.push(shapeEl);
  }
  catalogState.elements = allEls;
}

pj.switchTab = function () {}


pj.getAndShowCatalog = function (tabsDiv,cols,imageWidthFactor,catalogUrl,whenClick,cb) {
  var col1 = cols[0];
  var col2 = cols[1];
  var elements;
  var showIt = function () {
     return pj.showCatalog(catalogState);
  }
  var catalog  = pj.theCatalogs[catalogUrl];
  var catalogJSON = pj.theCatalogsJSON[catalogUrl]
  var catalogState = {tabsDiv:tabsDiv,cols:cols,imageWidthFactor:imageWidthFactor,whenClick:whenClick}
  selectedTab = undefined;
  if (catalog) {
    catalogState.catalog = catalog;
    catalogState.json = catalogJSON;
    showIt(catalogState);
  } else {
    pj.httpGet(catalogUrl,function (error,json) {
      debugger;
      try {
        catalogState.catalog = JSON.parse(json);
        catalogState.json = json;
        pj.theCatalogsJSON[catalogUrl] = json;
        pj.theCatalogs[catalogUrl] = catalog;
      } catch (e) {
        debugger;
      }
      showIt(catalogState);
      if (cb) {
        cb(undefined,catalogState);//{json:json,catalog:catalog,elements:elements});
        //code
      }
    });
  }
}