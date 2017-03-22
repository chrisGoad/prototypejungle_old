window.prototypeJungle =  (function () {
"use strict";
/* The central structure is a tree, made of 2 kinds of internal nodes (pj.Object,pj.Array), 
 * and leaves which are of primitive type (numbers,boolean,null,strings), or are functions.
 * Internal nodes have __name and __parent  attributes.
 */

// Non-null non-array object. 
var ObjectNode = {}; 

// Sequential, zero-based array
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


pj.ready = function (fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


pj.httpGet = function (url,cb) {
/* from youmightnotneedjquery.com */

  var request = new XMLHttpRequest();
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
        cb(undefined,request.responseText);
      } else {
        cb('http GET error for url='+url);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      cb('http GET error for url='+url);
  };
  request.send();
}

