window.prototypeJungle =  (function () {

// This is one of the code files assembled into pjcore.js. "start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> basics ==================


/* The central structure is a tree, made of 2 kinds of internal nodes (DNode,LNode), and atomic leaves (numbers,null,functions,strings).
 * Internal nodes have __name and parent  attributes.
 * A DNode is what python calls a dictionary, and LNode is like a python list or Javascript array ([] is its prototype).
 */

// dictionary node
var DNode = {};

// list node, with __children named by sequential integers starting with 0
var LNode = [];

// pj is the root of the PrototypeJungle realm.

var pj = Object.create(DNode);

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
//pj.DNode = DNode;
pj.Object = DNode;



pj.Array = LNode;

// do the work normally performed by 'set'  by hand for these initial objects

DNode.__parent = pj;
DNode.__name = 'Object';
LNode.__parent = pj;
LNode.__name = 'Array';
//pj.DNode = DNode;
//pj.LNode = LNode;

//end extract

return pj;
})();
