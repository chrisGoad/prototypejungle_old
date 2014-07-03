
(function (pj) {
  var om = pj.om;

  
// This is one of the code files assembled into pjcs.js. //start extract and //end extract indicate the part used in the assembly

//start extract

// <Section> Externalize ==========================



// a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
// theory of the namespaces
// pj ends up being one big tree.  Its structure is pj/om pj/geom etc for the core modules.
// the rest of the world exists under  pj/x. Eg pj/x/sys/repo0/chart. Later, when things can be at any url: pj/u/domain/...
// pj.r is predefined to point to the current repo.

// any top level externalizable item may have a __requires field.  each component has a name and url
// if the url has the form "/..." this means that it is relative to it's own repo, whose url is held in __repo
// In internalization, om.itemsLoaded holds the items loaded so far by url. Every loaded item has  __sourceRepo and __sourcePath
// fields, describing where it was loaded from.
//  In the externalized object, references to external objects are either urls,
// or paths of the form componentName/.../  or /<internalpath> such as /om/DNode or /svg/g.  ./path is used for references
// within the object being externalized

var xrepo; // this is the repo for the current externalization. Needed to interpret components (but not needed if no components)


om.DNode.__isProtoChild = function () {
  var prt = Object.getPrototypeOf(this);    
  if (!prt) return false;
  var pr = this.__get("_parent");
  if (!pr) return false;
  var pprt = Object.getPrototypeOf(pr);
  if (!om.DNode.isPrototypeOf(pprt)) return false;
  var nm = this._name;
  var pvl = pprt[nm];
  return (pvl === prt);
}

  

Function.prototype.__isProtoChild = function () {return false;}

// rti is the root of the externalization, or null, if this is the root
var exRecursionExclude = {__prototype:1,_name:1,__typePrototype:1,_parent:1,widgetDiv:1,__requires:1} //@todo rename widgetDiv
  
var currentX ; // the object currently being externalized



om.externalizedAncestor = function (x,rt) {
  if ((x === rt)||om.getval(x,"__sourceRepo")||om.getval(x,"__builtIn")) { // all externalized fellows have this property. It might be "builtIn" (if in the installed instance of prototypejungle)
    return x;
  } else {
    var pr = om.getval(x,"__parent");
    if (pr) {
      return om.externalizedAncestor(pr,rt);
    } else {
      return undefined;
    }
    
  }
}


om.findComponent = function (x,rt) {
  var cms = rt.__requires;
  if (!cms) return undefined;
  var rs = undefined;
  cms.some(function (c) {
    var r = c.repo;
    if (c.repo === ".") {// relative to current rep
      r = xrepo;
    }
    if ((x.__sourceRepo === r) && (x.__sourcePath === c.path)) {
      rs = c.name;
      return true;
    }
   // if (c.value === x) {
   //   rs = c.name;
   //   return true;
   // }
  });
  return rs;
}
  
om.Exception = {};

om.Exception.mk = function (msg,vl) {
  var rs = Object.create(om.Exception);
  rs.message = msg;
  rs.value = vl;
  return rs;
}

om.refCount = 0;
om.refPath = function (x,rt) {
  var ans = om.externalizedAncestor(x,rt);
  if (ans===undefined) {
    throw(om.Exception.mk("Cannot build reference",x));

  }
  var builtIn = om.getval(ans,"__builtIn");
  var me = ans === rt;
  if ( !(builtIn || me)) {
    var c = om.findComponent(ans,rt);
    if ( !c) {
      throw(om.Exception.mk("Not in a component",x));
    }
  }
  var pth = x.__pathOf(ans);
  var rf = pth.join("/");
  if (builtIn) {
    var bp = ans.__pathOf(pj);
    return bp.join("/") + "/" + rf;
  }
  if (me) {
    return "./"+rf;
  }
  return (rf==="")?c:c+"/"+rf;
}

  
om.DNode.externalize = function (rti) {
  if (rti) {
    var rt = rti;
  } else {
    rt = this;
  }
  var rs = {};
  //currentX = rt;
  var ispc = this.__isProtoChild();
  if (ispc) { // in this case, when internalize, we can compute the value of __prototype from the parent and its prototype
    rs.__protoChild = 1;
  } else {
    var pr =  Object.getPrototypeOf(this);
    var rf = om.refPath(pr,rt);
    if (rf) {
      rs.__prototype = rf;
     
    }
  }
  var thisHere = this;      
  om.mapOwnProperties(this,function (v,k) {
    if (!om.treeProperty(thisHere,k,1)) { //1 means includeLeaves
      var rf = om.refPath(v,rt);
      if (rf) rs[k] = {__reference:rf};
      return; // for now; these are references
    }
    if (!exRecursionExclude[k]) {
      if (om.isNode(v)) {
        var srs = v.externalize(rt);
        rs[k] = srs;
      } else {
         rs[k] = v;
      } 
    }
  });
  if (this === rt) {
    var cms = this.__requires;
    if (cms) {
      var xcms = cms.map(function (c) {
        return {name:c.name,repo:c.repo,path:c.path};
      });
    } else {
      xcms = [];
    }
    rs.__requires = xcms;
  }
  return rs;
  }
 
  // __properties of the LNode are placed in the first element of the form {__props:1,,,
om.LNode.externalize = function (rti) {
  if (rti) {
    var rt = rti;
  } else {
    rt = this;
  }
  var sti = this.__setIndex;
  if (sti !== undefined) {
    var rs = [{__props:1,__setIndex:sti}];
  } else {
    rs = [];
  }
  var ln = this.length;
  for (var i=0;i<ln;i++) {
    var v = this[i];
    if (om.isNode(v)) {
      var srs = v.externalize(rt);
    } else {
      srs = v;
    }
    rs.push(srs);
  }
  return rs;
}

om.DNode.stringify = function (repo) {
  xrepo = repo
  var x = this.externalize();
  var jx = JSON.stringify(x);
  var rs = "prototypeJungle.om.assertItemLoaded("+jx+");\n";
  //rs += "//k52nejm6yx8xtvr\n"; // so that a regexp can easily pick out the assertion and function parts
  var fns = this.__funstring();
  rs += fns;
  return rs;
}

//end extract
})(prototypeJungle);