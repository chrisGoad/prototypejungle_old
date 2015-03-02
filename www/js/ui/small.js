
// this contains the minimum needed to support standalone pages (eg, the docs, home page(

(function (pj) {
  var pt = pj.pt;

// This is one of the code files assembled into pjtopbar.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract


pt.DNode.mk = function () {
  return Object.create(pt.DNode);
}

pt.DNode.set = function (nm,vl) {
  this[nm]=vl;
  if (vl && (typeof vl === "object")) {
    vl.name = nm;
    vl.parent = this;
  }
  return vl;
}


pt.beforeChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(0,idx);
}
  
pt.afterChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(idx+1);
}

pt.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}
  
// only strings that pass this test may  be used as names of nodes
pt.checkName = function (s) {
  if (s === undefined) {
    pt.error('Bad arguments');
  }
  if (s==='') return false;
  if (s==='$') return true;
  if (typeof s==="number") {
    return s%1 === 0;
  }
  return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}

//end extract


})(prototypeJungle);