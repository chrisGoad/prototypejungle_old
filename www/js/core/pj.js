window.prototypeJungle =  (function () {

// This is one of the code files assembled into pjcore.js. "start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> basics ==================


/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), and atomic leaves (numbers,null,functions,strings).
 * Internal nodes have __name and parent  attributes.
 * A Object is what python calls a dictionary, and Array is like a python list or Javascript array ([] is its prototype).
 */

// dictionary node
var ObjectNode = {}; 

// list node, with __children named by sequential integers starting with 0
var ArrayNode = [];

// pj is the root of the PrototypeJungle realm.

var pj = Object.create(ObjectNode);

pj.previousPj = window.pj; // for noConflict
pj.noConflict = function noConflict() {
  var ppj = prototypeJungle.previousPj;
  if (ppj  === undefined) {
    delete window.pj;
  } else {
    window.pj = ppj;
  }
}

window.pj = pj;
pj.Object = ObjectNode;
pj.Array = ArrayNode;


// do the work normally performed by 'set'  by hand for these initial objects


ObjectNode.__parent = pj;
ObjectNode.__name = 'Object';
ArrayNode.__parent = pj;
ArrayNode.__name = 'Array';



//end extract

return pj;
})();
