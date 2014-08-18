window.prototypeJungle =  (function () {

// This is one of the code files assembled into pjcs.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract
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
//var LNode = Object.create(DNode); // list node, with __children named by sequential integers starting with 0
om.LNode = LNode;

// do the work normally performed by "set"  by hand for these initial objects
om.__parent = pj;
om.__name = "om";
DNode.__parent = om;
DNode.__name = "DNode";
LNode.__parent = om;
LNode.__name = "LNode";

//end extract

return pj;
})();
