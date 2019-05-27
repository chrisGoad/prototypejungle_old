// Copyright 2019 Chris Goad
// License: MIT
/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), 
 * and leaves which are of primitive type (numbers,boolean,null,strings), or are functions.
 * Internal nodes have __name and __parent  attributes.
 */
 
// Non-null non-array object. 
const ObjectNode = {}; 

// Sequential, zero-based array
const ArrayNode = [];

//export {ObjectNode,ArrayNode};
// codeRoot is the root of the PrototypeJungle realm, relative to which paths are computed
// root is the root of the current item (the item that becomes visible in the UI)


const codeRoot = Object.create(ObjectNode);
const vars = Object.create(ObjectNode);

let root;
const setRoot = function (rt) {
  root = rt;
}


codeRoot.Object = ObjectNode;
codeRoot.Array = ArrayNode;


// do the work normally performed by 'set'  by hand for these initial objects


ObjectNode.__parent = codeRoot;
ObjectNode.__name = 'Object';
ArrayNode.__parent = codeRoot;
ArrayNode.__name = 'Array';


// motivation: we need to define geometric methods for arrays too, and this provides access.

const defineArrayNodeMethod = function (name,method) {
  ArrayNode[name] = method;
}
  

export {setRoot,root,ObjectNode,ArrayNode,codeRoot,vars,defineArrayNodeMethod};