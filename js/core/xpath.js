// Copyright 2019 Chris Goad
// License: MIT

/* A normal setup for managing items,  is for there to be a current item which
 * is being manipulated in a running state, a state which contains various other items installed from external sources.
 * Each node in such a set up can be assigned a path, call it an 'xpath' (x for 'possibly external'). The first element
 * of this path is either '.' (meaning the current item), '' (meaning pj itself)  or the url of the source of the item.
 * pj.xpathOf(node,root) computes the path of node relative to root, and pj.evalXpath(root,path) evaluates the path
 */



const xpathOf = function (node,root) {
  let sourceUrl;
  let rs = [];
  let current = node;
  let name;
  while (true) {
    if (current === undefined) {
      return undefined;
    }
    if (current === root) {
      rs.unshift('.');
      return rs;
    }
    if (current === codeRoot) {
      rs.unshift('');
      return rs;
    }
    sourceUrl = current.__get('__sourceUrl');
    if (sourceUrl) {
      rs.unshift(sourceUrl);
      return rs;
    }
    name = getval(current,'__name');
    if (name!==undefined) {// if we have reached an unnamed node, it should not have a parent either
      rs.unshift(name);
    }
    current = getval(current,'__parent');
  }
} 

const evalXpath = function (root,path) {
  let p0,current,ln,prop,i;
  if (!path) {
    error('No path');
  }
  p0 = path[0];
  if (p0 === '.') {
    current = root;
  } else if (p0 === '') {
    current = codeRoot;
  } else { 
    current = installedItems[p0];
  }
  ln=path.length;
  for (i=1;i<ln;i++) {
    prop = path[i];
    if (current && (typeof current === 'object')) {
      current = current[prop];
    } else {
      return undefined; 
    }
  }
  return current;
}

export {xpathOf,evalXpath};
