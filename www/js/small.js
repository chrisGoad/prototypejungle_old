
// this contains the minimum needed to support standalone pages (eg, the docs, home page(

(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjtopbar.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract


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
om.activeConsoleTags = ["error"]; // ammended up in constants, usually 

om.addTagIfDev = function (tg) {
  if (ui.isDev) {
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


om.afterChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(idx+1);
}
  

//end extract


})(prototypeJungle);