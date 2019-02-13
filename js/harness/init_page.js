

/*global setupYesNo setupDialog enableButton disableButton mpg: true */

let tutorialButton;


dom.vars.defaultTransform = Transform.mk(Point.mk(),1);

let mainPage;
let svgDivReady = false;

const setupSvgDiv = function () {
  if (!svgDivReady) {
    dom.setSvgMain(dom.SvgRoot.mk(svgDiv.__element));
    svgDiv.__element.draggable = true;
    svgDivReady = true;
  }
}

const genMainPage = function (cb) {
  if (mainPage) {
    return;
  }
  mainPage = buildPage();//mpg
  mpg.__addToDom();
  setupSvgDiv();
  core.setRoot(SvgElement.mk('<g/>')); // to be replaced by incoming item, usually
  core.root.set('transform',dom.vars.defaultTransform);
  dom.svgMain.contents=core.root;
  core.root.__sourceUrl = source;
  layout();
  installMainItem(source);
  return;
  if (cb) {
    cb();
  }
}

let mainGetVars = {'source':true,'intro':true,'data':true};

let source,sourceFile,helperUrl,content; 


//   from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
const parseQuerystring = function() {
  let nvpair = {};
  let qs = window.location.search.replace('?','');
  let pairs = qs.split('&');
  pairs.forEach(function(v) {
    let pair = v.split('=');
    if (pair.length>1) {
      nvpair[pair[0]] = pair[1];
    }
  });
  return nvpair;
}
  
const processQuery = function() {  
  let q = parseQuerystring();
  source = q.source;
  if (source==='none') {
    source = undefined;
  } else if (source) {
    sourceFile = core.afterLastChar(source,'/');
  } else {
      source = '';
      sourceFile = '';
  }
  if (q.fit) {
    fitFactor = Number(q.fit);
  }
}  

let userName,directory;
let pageInitialized = false; // to prevent repeats, which firebase will sometimes invoke via onIdTokenChanged

const initPage = function () {
  pageInitialized = true;
  processQuery();
  dom.vars.fitStdExtent = !(source);
  genMainPage();
}
  
export {initPage,userName,directory};
    
