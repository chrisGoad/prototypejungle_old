
// this contains the minimum needed to support standalone pages (eg, the docs, home page(

(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjtopbar.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> small ====================================================


om.DNode.mk = function () {
  return Object.create(om.DNode);
}

om.DNode.set = function (nm,vl) {
  this[nm]=vl;
  if (vl && (typeof vl === 'object')) {
    vl.__name = nm;
    vl.__parent = this;
  }
  return vl;
}

om.beforeChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(0,idx);
}
  
om.afterChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(idx+1);
}

om.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}
  
// only strings that pass this test may  be used as names of nodes
om.checkName = function (s) {
  if (s === undefined) {
    om.error('Bad arguments');
  }
  if (s==='') return false;
  if (s==='$') return true;
  if (typeof s==='number') {
    return s%1 === 0;
  }
  return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}

//end extract


})(prototypeJungle);