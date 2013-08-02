(function (__pj__) {
  var om = __pj__.om;
  var draw = __pj__.draw;
  // a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
  om.DNode.isProtoChild = function () {
    var prt = Object.getPrototypeOf(this);    
    if (!prt) return false;
    var pr = this.get("__parent__");
    if (!pr) return false;
    var pprt = Object.getPrototypeOf(pr);
    if (!om.DNode.isPrototypeOf(pprt)) return false;
    var nm = this.__name__;
    var pvl = pprt[nm];
    return (pvl == prt);
  }
  
    
  
    Function.prototype.isProtoChild = function () {return false;}

  // rti is the root of the externalization, or null, if this is the root
  var exRecursionExclude = {__prototype__:1,__name__:1,__typePrototype__:1,__parent__:1,widgetDiv:1} //@todo rename widgetDiv
    
    
  om.DNode.assertExternalReferences = function (refs) {
    var  extrefs = this.__externalReferences__;
    if ( !extrefs) extrefs = [];
    this.__externalReferences__ = extrefs.concat(refs);
  }

  om.externalReferences = {};
  
  // recursively gathers direct and indirect depedendencies
  om.computeAllExternalReferences = function (nd) {
    var pathMap = {};
    var extrefs = nd.__externalReferences__;
    if (extrefs) {
      // extrefs might be paths like /chart/Linear, or item indicators like
      // http://example.com/.../chart/Linear
      // this routine also computes a pathMap, a map from paths to item indicators, telling where to go to get the items
      var rs = [];
      extrefs.forEach(function (x) {
        if ((x.indexOf("http:")==0)||(x.indexOf("https:")==0)) {
          var p = om.urlToPath[x];
          pathMap[p] = x;
        } else {
          p = x;
          var u = om.pathMap[p];
          if (u) {
            pathMap[p] = u;
          }
        }
        var pv = om.evalPath(__pj__,p);
        var pvr = om.computeAllExternalReferences(pv);
        
        rs = rs.concat(pvr[0]);
        $.extend(pathMap,pvr[1]);
      });
      rs = rs.concat(extrefs);
      var frs = om.removeDups(rs);
      return [frs,pathMap];
    } else {
      return [];
    }
  }
  om.externalizedAncestor = function (x) {
    if (om.getval(x,"__externalReferences__")) { // all externalized fellows have this property, though it might be an empty array
      return x;
    } else {
      var pr = om.getval(x,"__parent__");
      if (pr) {
        return om.externalizedAncestor(pr);
      } else {
        return undefined;
      }
      
    }
  }
  
     om.refPath = function (x,rt) {
      
      var pth = x.pathOf(rt);
      if (pth) {
        var rf = om.pathToString(pth);
        if (rf[0] == "/") { // this is an external reference- outside of the thing being externalized
          var rfo = x;
          var ans = om.externalizedAncestor(rfo);
          if (ans) {
            var epth = ans.pathOf(__pj__);
            var epths = "/" + om.pathToString(epth);
            var erefs = om.externalReferences;
            erefs[epths] = 1;
          } else {
            om.error("External dependency "+rf+" has not been saved");
          }
        }
        return rf;
      }
    }
    
  om.DNode.externalize = function (rti) {
    if (rti) {
      var rt = rti;
    } else {
      rt = this;
    }
    //@todo obsolete
    var istype = om.getval(this,'__isType__');
    if ((!istype) && (typeof this == "function")) {
         var rs = {__function__:this.toString()};
        return rs;
    }
    var rs = {};
    // figure out the prototype status; either from a function prototype, a proto child, or top-level prototype
    function rrefPath(x,rt) {
      var pth = x.pathOf(rt);
      if (pth) {
        var rf = om.pathToString(pth);
        if (rf[0] == "/") { // this is an external reference- outside of the thing being externalized
          var rfo = x;//om.evalPath(__pj__,pth);
          var ans = om.externalizedAncestor(rfo);
          if (ans) {
            var epth = ans.pathOf(__pj__);
            var epths = "/" + om.pathToString(epth);
            var erefs = om.externalReferences;
            erefs[epths] = 1;
          }
        }
        return rf;
      }
    }
    var ispc = this.isProtoChild();
    if (ispc) { // in this case, when internalize, we can compute the value of __prototype__ from the parent and its prototype
      rs.__protoChild__ = 1;
    } else {
      var pr =  Object.getPrototypeOf(this);
      var rf = om.refPath(pr,rt);
      if (rf) {
        rs.__prototype__ = rf;
       
      }
    }
    var thisHere = this;      
      this.iterItems(function (v,k) {
      if (!thisHere.treeProperty(k)) {
        var rf = om.refPath(v,rt);
        if (rf) rs[k] = {__reference__:rf};
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
    return rs;
  }
 
  om.transformsForLNodes = 0;
  
  om.LNode.externalize = function (rti) {
    if (rti) {
      var rt = rti;
    } else {
      rt = this;
    }
    if (om.transformsForLNodes) {
      var xf = this.transform; // the only propery of these fellows, for now, that needs externalization
      if (xf) {
        var fe = {transform:xf.externalize(rt)};
      } else {
        fe = null;
      }
      var rs = [fe];
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
  
  /* algorithm for internalization, taking prototypes into account.
    recurse from top of tree down.
    when __prototype__ is found, compute the prototype chain, and attach it to the nodes
    in the chain.
    when _protoChild_ is found, do the same thing, which will be possible
    because the parent chain will already exist.
    
    next, is the object creation phase. First build the objects for the chains. Attach these  at __v__
    then build the rest. finally stitch together.
  */
  
  om.allEChains = [];
  // the last element of a chain is either null
  // for chains that terminate inside the object being internalized,
  // or an externap pre-existing thing.
  
  om.installParentLinks1 = function (prx,x) {
    if (x && (typeof x == "object")) {
      for (var k in x) {
        if (x.hasOwnProperty(k)) {
          var v = x[k];
          if (v && (typeof v == "object")) {
            if (!v.__reference__) {
              om.installParentLinks1(x,v);
              v.__name__ = k;
            }
          }
        }
      }
      if (prx) x.__parent__ = prx;
      
    }
  }
  
  om.installParentLinks = function (x) {
    return om.installParentLinks1(null,x);
  }

  
 // dst is the tree into which this is being internalized
  // iroot is the root of this internalization;
  // we are building the chain for x
  // prx is x's parent
  // "__prototypev__" is the value of the __prototype__ path
  
  // the chain[0] is the object outside the iroot from which the internalized part of the chain starts
  // for an object in iroot which has no __prototype__ or __protoChild__, chain[0] is null, meaning inherit from om.DNode only
  
  // the result returned by buildEchain is wrapped in [] if it is external
      
  
  om.buildEChain = function (dst,iroot,x) {
    if (!x) {
      debugger;
    }
    var ptp = x.__prototype__;
    if (ptp == "/geom/XForm") {
      ptp = "/geom/Transform"; //backward compatibility
      om.log("untagged","FIXED XFORM");
    }
    var cch = x.__chain__;
    if (ptp) {
      // this might be a path within the internalized object, or somewhere in the
      // existing tree.
      var ppth = ptp.split("/");
      //var pr = om.evalPath(dst,ppth,iroot);
      var pr = om.evalPath(iroot,ppth,dst);
      om.log("untagged",'setting prototypev for ',ptp);
      if (!pr) {
        debugger;
        
      }
      x.__prototypev__ = pr;
      
      if (ppth[0] == "") { // starts with "/", ie from dst
        var rs = [pr,x];
      } else {
        var rs = om.buildEChain(dst,iroot,pr);
        if (!rs) rs = [null,pr]; // explained above
        rs.push(x);
      }
      x.__chain__ = rs;
      return rs;
    }
    if (x.__protoChild__) {
      var prx = x.__parent__;
      if (!prx) om.error("__protoChild__ root of serialization not handled yet");
      // to deal with this, put in __prototype__ link instead, when serializing
      var prp = prx.__prototypev__;
      if (!prp) {
        om.error("Missing __prototypev__");// this should not happen
       // prx is external to iroot - already internalized. So the start of the child's prototype chain is prx's own child named x.__name__
       var pr = prx[x.__name__];
       var rs = [pr];
      } else {
        var pr = prp[x.__name__];
        var rs = om.buildEChain(dst,iroot,pr);
      // watch out.  maybe pr is external
        if (!rs) {
        // this will happen only when pr is external to iroot
          rs = [pr];
        }
      }
      rs.push(x);
      x.__chain__ = rs;
      x.__prototypev__ = pr;
      return rs;      
    }
  }
  
  var recurseExclude = {__v__:1,__prototype__:1,__function__:1,__prototypev__:1,__parent__:1,__name__:1,__chain__:1,__reference__:1};

  om.buildEChains = function (dst,iroot,ix) {
    if (ix) {
      var x = ix;
    } else {
      x = iroot;      
    }
    om.buildEChain(dst,iroot,x);
    for (var k in x) {
      if (x.hasOwnProperty(k) && (!recurseExclude[k])) {
        var v = x[k];
        if (v && (typeof v == "object")) {
          om.buildEChains(dst,iroot,v);
        }
      }
    }
  }
 
 
  om.allChains = [];
  om.allLNodes = []; // these need fixing; first els contain xform
  
  
  om.collectEChains = function (x) {
    var ch = x.__chain__;
    if (ch && (!ch.__collected__)) {
      om.allChains.push(ch);
      ch.__collected__ = true;
    }
    for (var k in x) {
      if (x.hasOwnProperty(k) && (!recurseExclude[k])) {
        var v = x[k];
        if (v && (typeof v == "object")) {
          om.collectEChains(v);
        }
      }
    }
  }
  
  // build the objects with __proto__s
  // put names here for debugging; could happen at a later stage
  om.buildObjectsForChain = function (ch) {
    var ln = ch.length;
    if (ch[0]) { // a prototype external to the internlization
      var pr = ch[0];
    } else {
      pr = om.DNode.mk();
    }
    for (var i=1;i<ln;i++) {
      var co = ch[i];
      var v = co.__v__;
      if (!v) {
        var fn = co.__function__;
        if (fn) {
          error('Obsolete I think');
          var v = om.parseFunctionText(fn);
        } else {
          v = Object.create(pr);
          v.__name__ = co.__name__;
        }
        co.__v__ =v;
      }
      pr = v;
    }
    if (v.__name__ == "e0") {
      var z = 22;
    }  
  }
  
  om.buildObjectsForChains = function () {
    om.allChains.forEach(function (v) {
      om.buildObjectsForChain(v);
    })
  }
  
  om.buildObjectsForTree = function (x) {
    if ( !x.__v__) {
      var fn = x.__function__;
      if (fn) {
        var v = om.parseFunctionText(fn);
      } else {
        if (Array.isArray(x)) {
          v = om.LNode.mk();
        } else {
          v = om.DNode.mk();
        }
      }
      x.__v__ = v;
    }
    for (var k in x) {
      if (x.hasOwnProperty(k) && !recurseExclude[k]) {
        var v = x[k];
        if (v && (typeof(v) == "object")) {
          if (!v.__reference__) {
            om.buildObjectsForTree(v);
          }
        }
      }
    }
  }
  
  om.stitchTogether = function (x) {
    // put in the properties
    var xv = x.__v__;
    if (Array.isArray(x)) {
    
      x.forEach(function (v,n) {
        if (v && ((typeof(v) == "object")||(typeof(v)=="function"))) {
          om.stitchTogether(v);
          var iv = v.__v__;
          if (om.transformsForLNodes && (n == 0)) { // additional properties (other than indices) of the array are stored at 0 externally. only used for transform now.
            var xf = iv.transform;
            if (!xf) {
              xf = iv.__xform__;//backward compatability
              if (xf) {
                iv.transform = xf;
              }
            }
            if (xf) {
              xv.transform = xf;
              xf.__parent__ = xv;
            }
          } else {
            xv.pushChild(iv);
          }
        } else {
          if (n > 0 || (!om.transformsForLNodes)) {
            xv.push(v);
          }
       }
      });
    } else {
      for (var k in x) {
        if (x.hasOwnProperty(k) && !recurseExclude[k]) {
          var v = x[k];
          
          if (v && (typeof(v) == "object")) {
            if (v.__reference__) {
              referencesToResolve.push([xv,k,v.__reference__]);
            } else {
              xv[k] = v.__v__;
              om.stitchTogether(v);
            }
          } else {
            xv[k] = v;
          }
        }
      }
    }
    xv.__name__ = x.__name__
    var pr = x.__parent__;
    if (pr) {
      xv.__parent__ = pr.__v__;
    }
  }
  
  referencesToResolve = [];
  om.resolveReference = function (dst,iroot,r) {
    var pr = r[0];
    var prop = r[1];
    var rf = r[2];;
    var rs= om.evalPath(iroot,rf,dst);
    pr[prop] = rs;
    return rs;
  }
  
  om.resolveReferences = function (dst,iroot) {
    referencesToResolve.forEach(function (r) {
      om.resolveReference(dst,iroot,r);
    });
  }
  

om.DNode.cleanupAfterInternalize = function () {
  this.deepDeleteProps(["__prototypev__","__protoChild__","__prototype__"]);
}
// if pth is a url (starting with http), then put this at top
  om.internalize = function (dst,pth,x) {
    om.installParentLinks(x);
    om.buildEChains(dst,x);
    om.collectEChains(x);
    om.buildObjectsForChains();
    om.buildObjectsForTree(x);
    om.stitchTogether(x);
    om.log("untagged",referencesToResolve);
    var rs = x.__v__;
    om.resolveReferences(dst,rs);
    if ((pth.indexOf("http:")==0)||(pth.indexOf("https:")==0)) {
      dst.set("anon",rs);
    } else {
      dst.set(pth,rs);
    }
    rs.cleanupAfterInternalize();
    return rs;

  }
  


om.addExtrefs = function (dnode) {
  om.externalReferences = {};
  var x = dnode.externalize(dnode);
  var erefs = Object.keys(om.externalReferences);
  var eerefs = dnode.__externalReferences__;
  dnode.__externalReferences__ = eerefs?eerefs.concat(erefs):erefs;
  var exr = om.computeAllExternalReferences(dnode);
  var allErefs = exr[0];
  var pathMap = exr[1];
  var cntr = {directExternalReferences:erefs,allExternalReferences:allErefs,pathMap:pathMap,value:x};
  return cntr;
  var xj = JSON.stringify(cntr);
  return xj;
}


om.getFile = function (pth,cb) {
  var dt = {path:pth}
  om.ajaxPost("/api/getFile",dt,function (rs) {
    cb(rs);
  });
}
/*
om.pathLast = function (p) {
  if (typeof p == "string") {
    var pth = p.split("/");
  } else {
    pth = p;
  }
  var ln = pth.length;
  if (ln==0) {
     return "";
  } else {
    return pth[ln-1];
  }
}
// if "where" is missing, install at root under the last element of the path
*/


// machinery for installing items

// the item indicator (ii)  which is input to install might be the raw internal path of the item ("/chart/Chart") or
// might be the url of the item, such as http://s3.prototypejungle.org/prototypejungle/item/11/anon.997752072 

// so you can load by internal paths, or by url.  The former items are loaded from repos, and currently there is just one: http://prototypejungle.com/item

// the urls for data are then eg http://<host>/item/chart/data/Chart.js  
// and for code: http://<host>/item/chart/code/Chart.js  

// om.grabbed gives the items grabbed so far by path
// om.urlsGrabbed gives what has been grabbed by url
om.grabbed = {};  
om.pathMap = {};
om.urlToPath = {};
om.urlsGrabbed = {};



// has an item indicator of either kind been grabbed?
om.iiGrabbed = function (s) {
  var rs = om.grabbed[s];
  if (!rs) {
    rs = om.urlsGrabbed[s];
  }
  return rs;
}

// for things in the repo at prototypejungle, where urls derive directly from paths

om.repoUrl = function (p) {
  var host = location.host;
  if (host == "s3.prototypejungle.org") {
    host = "prototypejungle.org";
  }
  url = "http://"+host+"/item"+p;
  return url;
}

om.toUrl = function (s) { // s might already be a url
 if ((s.indexOf("http:")==0)||(s.indexOf("https:")==0)) {
    var url = s;
  } else {
    url = om.pathMap[s];
    if (!url) {
      url = om.repoUrl(s);
      om.pathMap[s] = url;
    }
  }
  return url;
}



om.toPath = function (s) { // s might already be a path
 if ((s.indexOf("http:")==0)||(s.indexOf("https:")==0)) {
    var p = om.urlToPath[s];
    if (!p) {
      om.error("No path for "+s);
      throw "noPath";
    }
    return  p;
  }
  return s;
}

// now go from the generic url to the code or data urls
om.iiToUrl = function (ii,kind) {
  var url = om.toUrl(ii);
  var nm = om.pathLast(url);
  var dr = om.pathExceptLast(url);
  var rs = dr + kind+ "/"+nm+".js";
  return rs;
}


om.iiToCodeUrl = function (pth) {
  return om.iiToUrl(pth,'code');
}
om.iiToDataUrl = function (pth) {
  return om.iiToUrl(pth,'data');
}

 

// the data file uses the JSONP pattern, calling loadFuntion.  The data file also says of itself what it's own url is, and what path it should be loaded into within
// the jungle

om.allInstalls = [];


// called jsonp style when main item is loaded

om.loadFunction = function (x) {
  var pth = x.path;
  var vl = x.value;
  var url = x.url; // this will be present for non-repo items
  
  om.log("untagged","LoadFunction  path ",pth," url ",url);
  if (!url) { // a repo item; compute the url
    url = om.iiToDataUrl(pth);
  }
  om.grabbed[pth] = vl;
  om.urlsGrabbed[url] = vl;
  om.pathMap[pth] = url;
  om.urlToPath[url] = pth;
  $.extend(om.pathMap,vl.pathMap);

  var cb = om.grabCallbacks[url];
  if (!cb) {
    cb = om.grabCallbacks[pth];
  }
    om.log("untagged","looked up grabCallback of ",url,pth," found? ",cb?"yes":"no");

  if (cb) cb(vl); // simulatewha
 
}


// called when code is loaded
/* not needed after all $.ajax with type script does the trick, and invokes the callback as it should*/
om.loadCodeFunction = function (pth) {
  return;
  var cb = om.grabCodeCallbacks[pth];
  if (cb) cb(vl); // simulatewha
 
}

om.grabCallbacks = {};
om.grabCodeCallbacks = {};



om.grabCode = function (ii,cb) {
  var url = om.toUrl(ii);
  var curl = om.iiToCodeUrl(url);
  $.ajax({
            crossDomain: true,
            dataType: "script",
            url: curl,
            success: function(){
              if (cb) cb();              
            }
        });
}
om.grabTimeout = 3000;


om.grabError = function (path,url) {
  __pj__.page.genError("<span class='errorTitle'>Error:</span> Could not load url "+url+" path "+path);
}

om.grabOne = function (pth,cb) {
  var url = om.toUrl(pth);
 
  var durl = om.iiToDataUrl(url);
  var afterTimeout = function () {
    if (!(om.urlsGrabbed[url] || om.grabbed[pth])) {
          om.grabError(pth,url);      
    }
    om.log("untagged","timout with no error for url ",url," path",pth)
  }
  om.grabCallbacks[url] = cb; //  list by path and url
  om.grabCallbacks[pth] = cb; //  list by path and url
  setTimeout(afterTimeout,om.grabTimeout);
  $.ajax({
        crossDomain: true,
        dataType: "jsonp",
        url: durl
        
     
    });
}
  

// prototypes' paths with datamutt are the same as those externally.  The workspace can be filled in from anywhere
om.grabM = function (paths,cb,grabCode) {// in the grabCode case,topPath is what to install at iwh
  var ln = paths.length;
  if (ln==0) {
    if (cb) cb();
    return;
  }
  var errors = [];
  var numInstalled = 0;
  var cbi = function (rs) {
    numInstalled++;
    om.log("untagged","numInstalled",numInstalled);
    if (numInstalled==ln) {
      if (cb) cb(errors);
    }
  }
  for (var i=0;i<ln;i++) {
    var pth = paths[i];
    if (grabCode) {
      om.grabCode(pth,cbi);
    } else {
      om.grabOne(pth,cbi);
    }
  }
}


om.stripToItemPath = function (url) {
  var itmp = url.indexOf("/item/");
   var rs = url.substring(itmp);
   return rs;
}
/*
 om.install('http://s3.prototypejungle.org/prototypejungle/item/anon.924624375',function (){
  om.log("untagged",'done');
 });
 om.install('http://s3.prototypejungle.org/prototypejungle/item/anon.690736299',function (){
  om.log("untagged",'done');
 });
 om.install('/examples/TwoR',function (){
  om.log("untagged",'done');
 });
 
 om.install('/chart/Axes',function (){om.log("untagged",'done');});
  om.install('/chart/Chart',function (){om.log("untagged",'done');});

 
 /examples/TwoR
 */

 
 // 
//pth might be an array, or a url 
om.restore = function (pth,cb) {
  var cntr,missing;
  if ((!pth) || (pth.length==0)) {
    cb();
    return;
  }
  if (pth instanceof Array) {
    var multi = 1;
  } else {
    multi = 0;
  }
  om.grabbed = {};
  om.grabFullUrl = {};
  function internalizeIt(ii) {
    //var url = om.iiToDataUrl(ii);
    var cntr = om.urlsGrabbed[ii]; 
    if (!cntr) {
      cntr = om.grabbed[ii];
    }
    if (!cntr) {
      om.error("Failed to load "+ii);
    }
    var p = om.toPath(ii);
    // backward compatibily
   
    var cg = om.internalize(__pj__,p,cntr.value);
    cg.__externalReferences__ = cntr.directExternalReferences;
    cg.__overrides__ = cntr.overrides;
    om.allInstalls.push(cg);
    return cg;
  }
  function afterGrabDeps(missing) {
    missing.forEach(function (v) {internalizeIt(v)}); // v will be a path in this case (ie an in-repo ii)
    if (multi) {
      var ln = pth.length;
      for (var i=0;i<ln-1;i++) {
        internalizeIt(pth[i]);
      }
      var ci = internalizeIt(pth[ln-1]);
    } else {
      var ci = internalizeIt(pth);
    }
    // now snag the code
    var allGrabbed = Object.keys(om.urlsGrabbed);
    var codeToLoad = allGrabbed;
    om.grabM(codeToLoad,function () {
      //  and load the data, if any
      om.loadTheDataSources(ci,function () {
        __pj__.cleanupAfterInternalize();
        cb(ci)})},
      true);
  }
  function addDeps(p,r) {
    //var url = om.iiToDataUrl(p);
    var cntr = om.iiGrabbed(p);
    var aexts = cntr.allExternalReferences;
    aexts.forEach(function (v) {
      if (om.evalPath(__pj__,v) === undefined) {
        r.push(v);
      }
    });
  }
  function afterGrab() {
    var missing = [];
    addDeps(pth,missing);
    om.grabM(missing,function () {afterGrabDeps(missing)});
  }
  function afterGrabM() {
     var missing = [];
     pth.forEach(function (p) {
      addDeps(p,missing);
    });
    om.grabM(missing,function () {afterGrabDeps(missing)});
  }
  if (multi) {
    om.grabM(pth,afterGrabM);
  } else {
    om.grabOne(pth,afterGrab)
  }
}

om.install = om.restore; // the old name

// how many days since 7/19/2013
om.dayOrdinal = function () {
  var d = new Date();
  var o = Math.floor(d.getTime()/ (1000 * 24 * 3600));
  return o - 15904;
}

om.numToLetter = function (n,letterOnly) {
  // numerals and lower case letters
  if (n < 10) {
    if (letterOnly) {
      a = 97+n;
    } else {
      var a = 48 + n;
    }
  } else  {
    a = 87 + n;
  }
  return String.fromCharCode(a);
}
om.randomName  = function () {
  var rs = "i";
  for (var i=0;i<9;i++) {
    rs += om.numToLetter(Math.floor(Math.random()*35),1);
  }
  return rs;
}


om.generalSave = function (x,cb,toS3,removeComputed) {
  om.unselect();
  var ptha = x.pathOf();
  pth = om.pathToString(ptha);
  /*
  if (toS3) {
    
    var nm = om.randomName();
    var pth = "/item/"+nm;
    var dpth = "/item"
  } else {
   
    nm = ptha.pop();
    var dpth = om.pathToString(ptha); // the path without the terminal name; the directory path
  }
  */
  if (toS3) {
    var nm = om.randomName();
    var dord = om.dayOrdinal();
    var dir = "/item/" + dord;
    var host = "http://s3.prototypejungle.org"
  } else {
    nm = ptha.pop();
    dir = om.pathToString(ptha);
    var host = "http://"+(location.host)+"/item";
    // was host = ""
  }
  
  var dataPath = dir+"/data/"+nm+".js";
  var codePath =  dir+"/code/"+nm+".js";
  var dataUrl = host+dataPath;
  var itemUrl = host + dir + "/" + nm;
  var codeUrl = host+codePath; // not used yet,but I should put a done call in the code file
  var ovr = __pj__.draw.overrides;
  if (removeComputed) {
    x.removeComputed();
  }
  var er = om.addExtrefs(x);
  er.overrides = ovr;
  var code = x.funstring();//toS3);  formerly: s3 items will be installed into __pj__.anon
  var anx = {value:er,path:pth}; // path so that the jsonp call back will know where this came from
 // if (toS3) {
    anx.url = itemUrl;
//  }
  var dt = {pw:om.pw,path:dir+"/data/"+nm+".js",value:"__pj__.om.loadFunction("+JSON.stringify(anx)+")",isImage:0,url:dataUrl}
  //if (removeComputed) { // indicates that a view file is worthwhile too
  dt.viewFile = dir + "/" + nm;
  var cdt = {path:dir+"/code/"+nm+".js",value:code,pw:om.pw,isImage:0,url:codeUrl}
  if (toS3) {
    
    var apiCall = "/api/toS3";
  } else {
    apiCall = "/api/putFile";
  }
  om.ajaxPost(apiCall,dt,function (rs) {
    om.ajaxPost(apiCall,cdt,function (rs) {
      if (removeComputed) {
        x.deepUpdate(); // restore
      }
      if (cb) {
        if (rs.status == "fail") {
          cb('busy');
        } else if ((rs.value) == 'True') {
          cb('collision'); // the write failed, the file already exists
        } else {
          
          cb(nm,dord);
        }
      }
    })
  });
}

om.s3Save = function (x,cb,removeComputed) {
  om.generalSave(x,cb,true,removeComputed);
}

om.localSave = function (x ,cb) {
  om.generalSave(x,cb,false,false);
}


 
  om.save = function (x,local,cb) {
    var pth = om.pathToString(x.pathOf(__pj__));
    var cs = om.customSave; // used in build
    if (cs) {
      cs(x,local);
    } else {
      if (local) {
        om.localSave(x,cb);
      } else {
        om.s3Save(x,cb);
      }
    }
  }
  
})(__pj__);
  
  
  