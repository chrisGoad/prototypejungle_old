// Copyright 2017 Chris Goad
// License: MIT
window.prototypeJungle =  (function () {
/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), 
 * and leaves which are of primitive type (numbers,boolean,null,strings), or are functions.
 * Internal nodes have __name and __parent  attributes.
 */

// Non-null non-array object. 
const ObjectNode = {}; 

// Sequential, zero-based array
const ArrayNode = [];

// pj is the root of the PrototypeJungle realm.

const pj = Object.create(ObjectNode);

pj.previousPj = window.pj; // for noConflict
pj.noConflict = function noConflict() {
  let ppj = prototypeJungle.previousPj;
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
