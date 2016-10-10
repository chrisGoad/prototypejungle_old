
var shapeCatalog = [
    {title:'Circle',id:'circle',svg:"[twitter:14822695]/forCatalog/circle.svg",url:'/repo1/shape/circle.js',
     settings:{drawVertically:true}},
    {title:'Arrow',id:'arrow',svg:"http://prototypejungle.org/repo1/svg/smudgedBar.svg",url:'/repo1/shape/arrow.js',
     settings:{drawVertically:true}},
     {title:'Rounded bar',id:'rounded_rectangle',svg:'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fvertical_rounded_bar.svg?alt=media&token=dbd570f5-eaab-44ee-bd43-f1ea7647481e',
     url:'/repo1/shape/rounded_rectangle.js',
      settings:{roundTop:true}},
    {title:'Shiny bar',id:'shiny_rectangle',
    svg:'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fvertical_shiny_bar.svg?alt=media&token=d18903ad-6564-4eb1-915a-82359be39fab',
     url:'/repo1/shape/shaded_rectangle.js'},
     {title:'Simple bar',id:'rectangle',
     svg:"https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/twitter%3A14822695%2Freplacement%2Fvertical_simple_bar.svg?alt=media&token=dadfc707-00a3-422b-81a0-3215b883a2ab",
    url:'/repo1/shape/rectangle.js'}
    ];

pj.showCatalog = function (col1,col2,catalog,whenClick) {
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
    img.width = (uiWidth/2 - 40)+'';
    img.src = pj.storageUrl(selected.svg);
    //shapeEl.txt.$html(selected.title);
    shapeEl.addEventListener('click',mkClick(shapeEl,selected));//.url,selected.settings));
    if (i%2) {
      col2.appendChild(shapeEl);
    } else {
      col1.appendChild(shapeEl);
    }
    allEls.push(shapeEl);
  }  
}
/*
var shapeDiv = html.Element.mk('<div style="displayy:inline-block"/>');
shapeDiv.set('img',html.Element.mk('<img width="150"/>'));
shapeDiv.set('txt',html.Element.mk('<div style="text-align:center">TXT</div>')); 

ui.showShapeCatalog = function (col1,col2,catalog,whenClick) {
  col1.$empty();
  col2.$empty();
  var ln = catalog.length;
  var els1 = [];
  var els2 = [];
  var allEls = [];
  var highlightEl = function (el) {
    allEls.forEach(function (anEl) {
      if (anEl === el) {
        anEl.$setStyle('border','solid  red');
      } else {
        anEl.$setStyle('border','solid thin black');
      }
    });
  }
  var mkClick = function (el,dest,settings) {
    return function() {
      highlightEl(el);
      debugger;
      ui.unselect();
      whenClick(dest,settings)};
  }
  for (var i=0;i<ln;i++) {
    var selected = catalog[i];
    var shapeEl = shapeDiv.instantiate();// replacement.svg;
    shapeEl.img.width = (uiWidth/2 - 40)+'';
    shapeEl.img.src = pj.storageUrl(selected.svg);
    shapeEl.txt.$html(selected.title);
    shapeEl.$click(mkClick(shapeEl,selected));//.url,selected.settings));
    if (i%2) {
      col2.push(shapeEl);
    } else {
      col1.push(shapeEl);
    }
    allEls.push(shapeEl);
  }  
}
*/