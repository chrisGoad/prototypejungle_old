// Copyright 2017 Chris Goad
// License: MIT

/* A normal setup for managing pj items,  is for there to be a current item which
 * is being manipulated in a running state, a state which contains various other items installed from external sources.
 * Each node in such a set up can be assigned a path, call it an 'xpath' (x for 'possibly external'). The first element
 * of this path is either '.' (meaning the current item), '' (meaning pj itself)  or the url of the source of the item.
 * pj.xpathOf(node,root) computes the path of node relative to root, and pj.evalXpath(root,path) evaluates the path
 */


pj.xpathOf = function (node,root) {
  var rs = [];
  var current = node;
  var url,name;
  while (true) {
    if (current === undefined) {
      return undefined;
    }
    if (current === root) {
      rs.unshift('.');
      return rs;
    }
    if (current === pj) {
      rs.unshift('');
      return rs;
    }
    //var sourceRelto = current.__get('__sourceRelto');
    //var sourcePath = current.__get('__sourcePath')
    var sourceUrl = current.__get('__sourceUrl');
    //if (sourcePath) {
    if (sourceUrl) {
     // url = pj.fullUrl(sourceRelto,sourcePath); ///sourceRepo + '/' + current.__sourcePath;
      rs.unshift(sourceUrl);
      return rs;
    }
    var name = pj.getval(current,'__name');
    if (name!==undefined) {// if we have reached an unnamed node, it should not have a parent either
      rs.unshift(name);
    }
    current = pj.getval(current,'__parent');
  }
  return undefined;
} 

pj.evalXpath = function (root,path) {
  var p0,current,ln,prop,i;
  if (!path) {
    pj.error('No path');
  }
  p0 = path[0];
  if (p0 === '.') {
    var current = root;
  } else if (p0 === '') {
    current = pj;
  } else { 
    current = pj.installedItems[p0];
  }
  ln=path.length;
  for (i=1;i<ln;i++) {
    prop = path[i];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined; 
    }
  }
  return current;
}
