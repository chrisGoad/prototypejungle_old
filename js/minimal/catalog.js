
//assumption: one catalog is open at a time
pj.theCatalogs = {};
pj.theCatalogsJSON = {};

pj.unselectCatalogElements = function (elements) {
   elements.forEach(function (anEl) {
        anEl.style.border = 'solid thin black';
   });
}


pj.showCatalog = function (col1,col2,imageWidthFactor,catalog,whenClick) {
  console.log('col1',col1.offsetWidth);
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
      whenClick(selected)};
  }
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
  return allEls;
}

pj.getAndShowCatalog = function (col1,col2,imageWidthFactor,catalogUrl,whenClick,cb) {
  var theCatalog,elements;
   var showIt = function (catalog) {
     elements = pj.showCatalog(col1,col2,imageWidthFactor,catalog,whenClick)
  }
  var theCatalog = pj.theCatalogs[catalogUrl];
  if (theCatalog) {
    showIt(theCatalog);
  } else {
    pj.httpGet(catalogUrl,function (error,json) {
      debugger;
      try {
        pj.theCatalogsJSON[catalogUrl] = json;
        theCatalog = JSON.parse(json);
        pj.theCatalogs[catalogUrl] = theCatalog;
      } catch (e) {
        debugger;
      }
      showIt(theCatalog);
      if (cb) {
        cb(undefined,{json:json,catalog:theCatalog,elements:elements});
        //code
      }
    });
  }
}