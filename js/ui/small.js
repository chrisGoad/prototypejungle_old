
// this contains the minimum needed to support standalone pages (eg, the docs, home page(

(function (pj) {
  


//start extract


pj.Object.mk = function () {
  return Object.create(pj.Object);
}

pj.Object.set = function (nm,vl) {
  this[nm]=vl;
  if (vl && (typeof vl === "object")) {
    vl.name = nm;
    vl.__parent = this;
  }
  return vl;
}


pj.beforeChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(0,idx);
}
  
pj.afterChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(idx+1);
}

pj.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}
  
// only strings that pass this test may  be used as names of nodes
pj.checkName = function (s) {
  if (s === undefined) {
    pj.error('Bad arguments');
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