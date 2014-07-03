
// this contains the minimum needed to support standalone pages (eg, the docs, home page(

window.prototypeJungle =  (function () {
  
  // <Section> basics ==================
  
var DNode = {}; // dictionary node
var pj = Object.create(DNode);
var om = Object.create(DNode);
pj.om = om;
pj.previousPj = window.pj; // for noConflict
pj.noConflict = function () {
  var ppj = prototypeJungle.previousPj;
  if (ppj  === undefined) {
    delete window.pj;
  } else {
    window.pj = ppj;
  }
}
window.pj = pj;
om.DNode = DNode;
var LNode = []; // list node, with __children named by sequential integers starting with 0
om.LNode = LNode;

// do the work normally performed by "set"  by hand for these initial objects
om.__parent = pj;
om.__name = "om";
DNode.__parent = om;
DNode.__name = "DNode";
LNode.__parent = om;
LNode.__name = "LNode";



om.DNode.mk = function () {
  return Object.create(om.DNode);
}

om.DNode.set = function (nm,vl) {
  this[nm]=vl;
  if (vl && (typeof vl === "object")) {
    vl.__name = nm;
    vl.__parent = this;
  }
  return vl;
}
om.activeConsoleTags = (om.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];

om.addTagIfDev = function (tg) {
  if (om.isDev) {
    om.activeConsoleTags.push(tg);
  }
}

om.removeConsoleTag = function (tg) {
  var a = om.activeConsoleTags;
  var i = array.indexOf(tg);
  if(i != -1) {
    a.splice(i, 1);
  }
  //om.removeFromArray(om.activeConsoleTags,tg);
}


om.argsToString= function (a) {
  // only used for slog1; this check is a minor optimization
  if (typeof(console) === "undefined") return "";
  var aa = [];
  var ln = a.length;
  for (var i=0;i<ln;i++) {
    aa.push(a[i]);
  }
  return aa.join(", ");
}

  

om.log = function (tag) {
  if (typeof(console) === "undefined") return;
  if ((om.activeConsoleTags.indexOf("all")>=0) || (om.activeConsoleTags.indexOf(tag) >= 0)) {
   if (typeof window === "undefined") {
     system.stdout(tag + JSON.stringify(arguments));
  } else {
    var aa = [];
    var ln = arguments.length;
    for (var i=0;i<ln;i++) {
      aa.push(arguments[i]);
    }
    console.log(tag,aa.join(", "));
  }
 }
};


return pj;


})();