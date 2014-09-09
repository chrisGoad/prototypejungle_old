
(function (pj) {
  var om = pj.om;
// This is one of the code files assembled into pjcs.js. "start extract" and "end extract" indicate the part used in the assembly


//start extract



var irepo; // the repo (if any) for the current internalization

var iroot; // the root of the internalization


/* algorithm for internalization, taking prototypes into account.
  recurse from top of tree down.
  when __prototype is found, compute the prototype chain, and attach it to the nodes
  in the chain.
  when _protoChild_ is found, do the same thing, which will be possible
  because the parent chain will already exist.
  
  next, is the object creation phase. First build the objects for the chains. Attach these  at __v
  then build the rest. finally stitch together.
*/

var allEChains = [];
// the last element of a chain is either null
// for chains that terminate inside the object being internalized,
// or an externap pre-existing thing.
//var logCount = 0;
var installParentLinks1 = function (prx,x) {
  if (x && (typeof x === "object")) {
    for (var k in x) {
      if (x.hasOwnProperty(k)) {
        var v = x[k];
        if (v && (typeof v === "object")) {
          if (!v.__reference) {
            /* bug catching; may use again
            if (logCount < 100) {
              console.log("installing child ",k,"of parent ",x.__name,"grandparent",prx?prx.__name:"n o n e");
              logCount++;
            }
            */
            v.__name = k;
            installParentLinks1(x,v);
          }
        }
      }
    }
    if (prx) x.__parent = prx;
    
  }
}

var installParentLinks = function (x) {
  return installParentLinks1(null,x);
}


// dst is the tree into which this is being internalized
// iroot is the root of this internalization;
// we are building the chain for x
// prx is x's parent
// "__prototypev" is the value of the __prototype path

// the chain[0] is the object outside the iroot from which the internalized part of the chain starts
// for an object in iroot which has no __prototype or __protoChild, chain[0] is null, meaning inherit from om.DNode only

// the result returned by buildEchain is wrapped in [] if it is external
    

var buildEChain = function (x) {
  var ptp = x.__prototype;
  var cch = x.__chain;
  if (ptp) {
    // this might be a path within the internalized object, or somewhere in the
    // existing tree.
    var pr = resolveReference(ptp);
   // var pr = om._evalPath(iroot,ppth,dst);
    if (!pr) {
      om.error("Missing path in internalize ",ptp);
    }
    om.log("untagged",'setting prototypev for ',ptp);
    x.__prototypev = pr;
    
    if (ptp[0] === ".") { // starts with ".", ie the prototype is within iroot
      var rs = buildEChain(pr);
      if (!rs) rs = [null,pr]; // explained above
      rs.push(x);
    } else {// pr is outside of the iroot
      var rs = [pr,x];
    }
    x.__chain = rs;
    return rs;
  }
  if (x.__protoChild) {
    var prx = x.__parent;
    if (!prx) om.error("__protoChild root of serialization not handled yet");
    // to deal with this, put in __prototype link instead, when serializing
    var prp = prx.__prototypev;
    if (!prp) {
      om.error("Missing __prototypev");// this should not happen
     // prx is external to iroot - already internalized. So the start of the child's prototype chain is prx's own child named x.__name
     var pr = prx[x.__name];
     var rs = [pr];
    } else {
      var pr = prp[x.__name];
      if (pr) {
        var rs = buildEChain(pr);
      } else {
        rs = undefined;
      }
    // watch out.  maybe pr is external
      if (!rs) {
      // this will happen only when pr is external to iroot
        rs = [pr];
      }
    }
    rs.push(x);
    x.__chain = rs;
    x.__prototypev = pr;
    return rs;      
  }
}

var recurseExclude = {__v:1,__prototype:1,__function:1,__prototypev:1,__parent:1,__name:1,__chain:1,__reference:1};

var buildEChains = function (ix) {
  if (ix) {
    var x = ix;
  } else {
    x = iroot;      
  }
  buildEChain(x);
  for (var k in x) {
    if (x.hasOwnProperty(k) && (!recurseExclude[k])) {
      var v = x[k];
      if (v && (typeof v === "object")) {
        buildEChains(v);
      }
    }
  }
}


var allChains = [];
var allLNodes = []; // these need fixing; first els contain xform


var collectEChains = function (x) {
  var ch = x.__chain;
  if (ch && (!ch.__collected)) {
    allChains.push(ch);
    ch.__collected = true;
  }
  for (var k in x) {
    if (x.hasOwnProperty(k) && (!recurseExclude[k])) {
      var v = x[k];
      if (v && (typeof v === "object")) {
        collectEChains(v);
      }
    }
  }
}

// build the objects with __proto__s
// put names here for debugging; could happen at a later stage
var buildObjectsForChain = function (ch) {
  var ln = ch.length;
  if (ch[0]) { // a prototype external to the internlization
    var pr = ch[0];
  } else {
    pr = om.DNode.mk();
  }
  for (var i=1;i<ln;i++) {
    var co = ch[i];
    var v = co.__v;
    if (!v) {    
      v = Object.create(pr);
      v.__name = co.__name;
      co.__v =v;
    }
    pr = v;
  }
  if (v.__name === "e0") {
    var z = 22;
  }  
}

var buildObjectsForChains = function () {
  allChains.forEach(function (v) {
    buildObjectsForChain(v);
  })
}

var buildObjectsForTree = function (x) {
  var v;
  if (!x.__v) {
    var isArray=Array.isArray(x);
    if (isArray) {
      v = om.LNode.mk();
    } else {
      v = om.DNode.mk();
    }
    x.__v = v;
  }
  var buildForChild= function (k) {
    var v = x[k];
    if (v) {
      var tpv = typeof(v);
      if (tpv === "object") {
        if (!v.__reference) {
          buildObjectsForTree(v);
        }
      }
    }
  }
  if (isArray) {
    var ln=x.length;
    for (var i=0;i<ln;i++) {
      buildForChild(i);
    }
  } else {
    for (var k in x) {
      if (x.hasOwnProperty(k) && !recurseExclude[k]) {
        buildForChild(k);
      }
    }
  }
  
}

var referencesToResolve;

var stitchTogether = function (x) {
  // put in the __properties
  var xv = x.__v;
  if (xv === undefined) {
    om.error('internal');
  }
  if (Array.isArray(x)) {
    var first = 1;;
    x.forEach(function (v,n) {
      if (first && v && (typeof(v) === "object") && (v.__props)) {
        xv.__setIndex = v.__setIndex; // later this technique might be used for other __properties of LNodes
        first = 0;
        return;
      }
      first = 0;
 //     if (v && ((typeof(v) === "object")||(typeof(v)==="function"))) {
      if (v && ((typeof(v) === "object"))) {
        stitchTogether(v);
        var iv = v.__v;
        xv.push(iv);
      } else {
        xv.push(v);
      }
    });
  } else {
    for (var k in x) {
      if (x.hasOwnProperty(k) && !recurseExclude[k]) {
        var v = x[k];
        
        if (v && (typeof(v) === "object")) {
          if (v.__reference) {
            referencesToResolve.push([xv,k,v.__reference]);
          } else {
            xv[k] = v.__v;
            stitchTogether(v);
          }
        } else {
          xv[k] = v;
        }
      }
    }
  }
  xv.__name = x.__name
  var pr = x.__parent;
  if (pr) {
    xv.__parent = pr.__v;
  }
}

// first argument can be either the item, or the component array
om.getComponentFromArray = function (cms,nm) {
  var rs;
  cms.some(function (c) {
    if (c.name===nm) {
      rs = c;
      return 1;
    }
  });
  return rs;
}
  
om.getComponent = function (itm,nm) {
  var cms = itm.__requires;
  if (cms) return om.getComponentFromArray(cms,nm);
}
// next 2 functions used only youtside of internalize, but included here because of related code
om.getComponentUrl =  function (itm,nm) {
  if (typeof nm === "string") {
    var cm = om.getComponent(itm,nm);
  } else {
    cm = nm;
  }
  if (cm) {
    var rp = cm.repo==="."?itm.__sourceRepo:cm.repo;
    var u = rp + "/" + cm.path;
    return u;
  }
}

om.getComponentValue = function (itm,nm) {
  var u = om.getComponentUrl(itm,nm);
  if (u) {
    return om.installedItems[u];
  }
}

// r will have one of the forms componentName/a/b/c, /builtIn/b , ./a/b The last means relative to the root of this internalization
var resolveReference = function (r) {
  var rsp = r.split("/");
  var rln = rsp.length;
  if (rln === 0) return undefined;
  var r0 = rsp[0];
  if (r0 === "") {// builtin
    var stv = pj;
    var sti = 1;
  } else  if (r0 === ".") { // relative to the top
    stv = iroot.__v;
    if (stv === undefined) {
      stv = iroot;
    }
  } else { // relative to a component
    var cm = om.getComponent(iroot,r0);
    var rp = cm.repo==="."?irepo:cm.repo;
    var u = rp + "/" + cm.path;
    var stv = om.installedItems[u];
  }
  var cv = stv;
  for (var i=1;i<rln;i++) {
    if (cv && (typeof cv==="object")) {
      cv = cv[rsp[i]];
    } else {
      return undefined; 
    }
  }
  return cv;
}
// rt "resolve triple" of the form [parent,property,reference]
var resolveReferences = function () {
  referencesToResolve.forEach(function (rt) {
    var rr = resolveReference(rt[2]);
    rt[0][rt[1]] = rr;
  });
}



var cleanupAfterInternalize = function (nd) {
  om.deepDeleteProps(nd,["__prototypev","__protoChild","__prototype"]);
}
// if pth is a url (starting with http), then put this at top
// if x has components, the components mighe be repo-relative (ie c.repo = "."). In this case, we need the repo argument to find them in the installedItems
om.internalize = function (x,repo) {
  //om.repo = om.repoNodeFromPath(pth);
  irepo = repo;
  iroot = x;
  referencesToResolve = [];
  installParentLinks(x);
  buildEChains(x);
  collectEChains(x);
  buildObjectsForChains();
  buildObjectsForTree(x);
  stitchTogether(x);
  var rs = x.__v;
  resolveReferences();
  cleanupAfterInternalize(rs);
  return rs;
}


//end extract
})(prototypeJungle);