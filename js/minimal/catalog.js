
pj.showCatalog = function (col1,col2,imageWidthFactor,catalog,whenClick) {
  var imageWidth = imageWidthFactor * col1.offsetWidth;
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
}

var theCatalogs = [];
pj.getAndShowCatalog = function (col1,col2,imageWidthFactor,catalogUrl,whenClick) {
   var showIt = function (catalog) {
    pj.showCatalog(col1,col2,imageWidthFactor,catalog,whenClick)
  }
  var theCatalog = theCatalogs[catalogUrl];
  if (theCatalog) {
    showIt(theCatalog);
  } else {
    pj.httpGet(catalogUrl,function (error,rs) {
      debugger;
      try {
        theCatalogs[catalogUrl] =  theCatalog = JSON.parse(rs);
      } catch (e) {
        debugger;
      }
      showIt(theCatalog);
    });
  }
}