(function (__pj__) {
  var om = __pj__.om;
  //var draw = __pj__.draw;
  var page = __pj__.page;
  
  
  // a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
  // theory of the namespaces
  // pj ends up being one big tree.  Its structure is pj/om pj/geom etc for the core modules.
  // the rest of the world exists under  pj/x. Eg pj/x/sys/repo0/chart. Later, when things can be at any url: pj/u/domain/...
  // pj.r is predefined to point to the current repo.
  
  
  om.DNode.isProtoChild = function () {
    var prt = Object.getPrototypeOf(this);    
    if (!prt) return false;
    var pr = this.get("__parent__");
    if (!pr) return false;
    var pprt = Object.getPrototypeOf(pr);
    if (!om.DNode.isPrototypeOf(pprt)) return false;
    var nm = this.__name__;
    var pvl = pprt[nm];
    return (pvl === prt);
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
        if ((x.indexOf("http:")===0)||(x.indexOf("https:")===0)) {
          om.error('unexpected');
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
    if (om.getval(x,"__external__")) { // all externalized fellows have this property
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
  
  om.refCount = 0;
  om.refPath = function (x,rt,fullRepo) {
    om.refCount++;
    var pth = x.pathOf(rt);
    if (pth) {
      var rf = om.pathToString(pth);
      //rf = om.relativizeReference(rf,fullRepo);
      var rf0 = rf[0];
      if (rf[0] === "/") { // this is an external reference- outside of the thing being externalized
        var rfo = x;
        var ans = om.externalizedAncestor(rfo);
        if (ans) {
          var epth = ans.pathOf(__pj__);
          
          var epths = om.pathToString(epth);
          if (epths[0] !== "/") {
            epths = "/" + epths;
          }
          //epths = om.relativizeReference(epths,fullRepo);
          var erefs = om.externalReferences;
          console.log("Added External Reference",epths);

          erefs[epths] = 1;
        } else {
          om.error("External dependency "+rf+" has not been saved");
        }
      }
      return rf;
    }
  }
    
  om.DNode.externalize = function (rti,fullRepo) {
    if (rti) {
      var rt = rti;
    } else {
      rt = this;
    }
    var rs = {};
    
    /* figure out the prototype status; either from a function prototype, a proto child, or top-level prototype
    function rrefPath(x,rt) {
      var pth = x.pathOf(rt);
      if (pth) {
        var rf = om.pathToString(pth);
        if (rf[0] === "/") { // this is an external reference- outside of the thing being externalized
          var rfo = x;//om.evalPath(__pj__,pth);
          var ans = om.externalizedAncestor(rfo);
          if (ans) {
            var epth = ans.pathOf(__pj__);
            var epths = "/" + om.pathToString(epth);
            console.log("Added External Reference",epths);
            var erefs = om.externalReferences;
            erefs[epths] = 1;
          }
        }
        return rf;
      }
    }
    */
    var ispc = this.isProtoChild();
    if (ispc) { // in this case, when internalize, we can compute the value of __prototype__ from the parent and its prototype
      rs.__protoChild__ = 1;
    } else {
      var pr =  Object.getPrototypeOf(this);
      var rf = om.refPath(pr,rt,fullRepo);
      if (rf) {
        rs.__prototype__ = rf;
       
      }
    }
    var thisHere = this;      
      this.iterItems(function (v,k) {
      if (!thisHere.treeProperty(k)) {
        if (k==="__externalReferences__") { // these are not needed after bringing something in, but easier to ignore on resave than remove
          return;
        }
        var rf = om.refPath(v,rt,fullRepo);
        if (rf) rs[k] = {__reference__:rf};
        return; // for now; these are references
      }
      if (!exRecursionExclude[k]) {
        if (om.isNode(v)) {
          var srs = v.externalize(rt,fullRepo);
          rs[k] = srs;
        } else {
           rs[k] = v;
        } 
      }
      });
    return rs;
    }
   
    
    om.LNode.externalize = function (rti,fullRepo) {
      if (rti) {
        var rt = rti;
      } else {
        rt = this;
      }
      var rs = [];
      var ln = this.length;
      for (var i=0;i<ln;i++) {
        var v = this[i];
        if (om.isNode(v)) {
          var srs = v.externalize(rt,fullRepo);
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
  //var logCount = 0;
  om.installParentLinks1 = function (prx,x) {
    if (x && (typeof x === "object")) {
      for (var k in x) {
        if (x.hasOwnProperty(k)) {
          var v = x[k];
          if (v && (typeof v === "object")) {
            if (!v.__reference__) {
              /* bug catching; may use again
              if (logCount < 100) {
                console.log("installing child ",k,"of parent ",x.__name__,"grandparent",prx?prx.__name__:"n o n e");
                logCount++;
              }
              */
              v.__name__ = k;
              om.installParentLinks1(x,v);
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
    var cch = x.__chain__;
    if (ptp) {
      // this might be a path within the internalized object, or somewhere in the
      // existing tree.
      var ppth = ptp.split("/");
      var pr = om.evalPath(iroot,ppth,dst);
      if (!pr) {
        om.error("Missing path in internalize ",om.pathToString(ppth));
      }
      om.log("untagged",'setting prototypev for ',ptp);
      x.__prototypev__ = pr;
      
      if (ppth[0] === "") { // starts with "/", ie from dst
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
        if (pr) {
          var rs = om.buildEChain(dst,iroot,pr);
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
        if (v && (typeof v === "object")) {
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
        if (v && (typeof v === "object")) {
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
    if (v.__name__ === "e0") {
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
        if (v && (typeof(v) === "object")) {
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
        if (v && ((typeof(v) === "object")||(typeof(v)==="function"))) {
          om.stitchTogether(v);
          var iv = v.__v__;
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
    //om.repo = om.repoNodeFromPath(pth);
    referencesToResolve = [];
    om.installParentLinks(x);
    om.buildEChains(dst,x);
    om.collectEChains(x);
    om.buildObjectsForChains();
    om.buildObjectsForTree(x);
    om.stitchTogether(x);
    om.log("untagged",referencesToResolve);
    var rs = x.__v__;
    om.resolveReferences(dst,rs);
    if ((pth.indexOf("http:")===0)||(pth.indexOf("https:")===0)) {
      dst.set("anon",rs);
    } else {
      dst.set(pth,rs);
    }
    rs.cleanupAfterInternalize();
    return rs;

  }

 // relativeize a reference to the current repo, if it is in the current repo
  om.relativizeReference = function (path,fullRepo) {
    return path;
    if (om.beginsWith(path,fullRepo)) {
      return  "." + path.substr(fullRepo.length);
    } else {
      return path;
    }
  }
  om.relativizeReferences = function (paths,fullRepo) {
    return paths;
    var rs = [];
    paths.forEach(function (p) {
      if (om.beginsWith(p,fullRepo)) {
        rs.push( "." + p.substr(fullRepo.length));
      } else {
        rs.push(p);
      }
    });
    return rs;
  }
  
  om.derelativizeReferences = function (paths,fullRepo) {
    var rs = [];
    paths.forEach(function (p) {
      if (om.beginsWith(p,".")) {
        rs.push( fullRepo + p.substr(1));
      } else {
        rs.push(p);
      }
    });
    return rs;
  }
  

  om.addExtrefs = function (dnode,unpacked) {
    om.externalReferences = {};
    var fp = "/x/"+unpacked.handle+"/"+unpacked.repo;
    om.repoPath = fp;
    //om.repo = unpacked.repoNode();
    var x = dnode.externalize(dnode,fp);
    /*
    var erefs = Object.keys(om.externalReferences);
    var eerefs = dnode.__externalReferences__;
    dnode.__externalReferences__ = eerefs?eerefs.concat(erefs):erefs;
    var exr = om.computeAllExternalReferences(dnode);
    var allErefs = om.relativizeReferences(exr[0],fp);
    var rErefs = om.relativizeReferences(erefs,fp);
    var pathMap = exr[1];
    //var cntr = {directExternalReferences:rErefs,allExternalReferences:allErefs,pathMap:pathMap,value:x};
    var cntr = {directExternalReferences:rErefs,allExternalReferences:allErefs,value:x};
   */
    var cntr = {value:x};
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


// machinery for installing items

// the item indicator (ii)  which is input to install might be the raw internal path of the item ("/chart/Chart") or
// might be the url of the item, such as http://s3.prototypejungle.org/prototypejungle/item/11/anon.997752072 

// so you can load by internal paths, or by url.  The former items are loaded from repos, and currently there is just one: http://prototypejungle.com/item

// the urls for data are then eg http://<host>/item/chart/data/Chart.js  
// and for code: http://<host>/item/chart/code/Chart.js  

// om.grabbed gives the items grabbed so far by path
// om.urlsGrabbed gives what has been grabbed by url

// items are denoted by their full paths beneath pj (eg /x/handle/repo)
// The following variables are involved

om.activeConsoleTags.push("load");
  om.itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A
  om.itemsLoaded  = {};  // paths-> noninternalized values
  om.itemLoadPending = {};
  om.codeLoaded = {}; // path->1 if code for path is loaded
  om.itemsToRestore = []; // the items requested in the top level call (does not include components/dependency tree)
  var topPath;
  
  om.resetLoadVars = function () {
    om.itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A
    om.itemsLoaded  = {};  // paths-> noninternalized values
    om.itemLoadPending = {};
    om.codeLoaded = {}; // path->1 if code for path is loaded
    om.itemsToRestore = []; // the items requested in the top level call (does not include components/dependency tree)
    om.internalizedItems = {};
    badItem = 0;
  }

  
  var allItemsLoaded1 = function (lda) {
    var ln = om.itemsToLoad.length;
    for (var i=0;i<ln;i++) {
      var itm = om.itemsToLoad[i];
      if (!lda[itm]) {
        return 0;
      }
    }
    return 1;
  }
      
      
  om.allItemsLoaded = function () {
    return allItemsLoaded1(om.itemsLoaded);
  }
      
      
  om.allCodeLoaded = function () {
    return allItemsLoaded1(om.codeLoaded);
  }
      
  
  // for things in the repo at prototypejungle, where urls derive directly from paths
  
  
  
  om.pathToUrl = function (s) { // s might already be a url.
   if ((s.indexOf("http:")===0)||(s.indexOf("https:")===0)) {
      return s;
    } else {
      return "http://prototypejungle.org"+s.substr(2);
    }
  }
  
  om.urlToPath = function (url) {
    if (url.indexOf("http")===0) {
      return "/x"+url.substr(26);
    } else {
      return url;
    }
  }

  
   
  
  // the data file uses the JSONP pattern, calling loadFuntion.  The data file also says of itself what it's own url is, and what path it should be loaded into within
  // the jungle
  
  om.allInstalls = [];
  
  // called jsonp style when main item is loaded
  var badItem = 0;
  var topUrl;
  om.loadFunction = function (x) {
    om.log("load","done loading ",x);
    if (x===undefined) { // something went wrong
      om.itemsLoaded[topPath] = "badItem";
      om.log("bad item ");
      debugger;
      badItem = 1;
      om.doneLoadingItems();
      return;
    }
    var pth = x.path;
    //  path is relative to pj; always of the form /x/handle/repo...
    var vl = x.value;
    if (vl=="unbuilt") {
      vl = {unbuilt:1};
    }
  
    var cmps = x.components;
    if (cmps) {
      vl.__components__ =cmps;
      cmps.forEach(function (c) {
        var p = c.path;
        if (om.itemsToLoad.indexOf(p) < 0) {
          om.itemsToLoad.push(p);
        }
      });
    }
    om.itemsLoaded[pth] = vl;
    delete om.itemLoadPending[pth];
    om.loadMoreItems();
   
   
  }
  
  
  om.grab = function (url) {
    om.log("load","starting load of ",url);
    $.ajax({
              type:"GET",
              dataType: "script",
              url: url
          });
  }
  
  om.loadMoreItems  = function () {
    var ln = om.itemsToLoad.length;
    var pending = 0;
    for (var i=0;i<ln;i++) {
      var ci = om.itemsToLoad[i];
      if ((!om.itemsLoaded[ci]) && (!om.itemLoadPending[ci])) {
        pending = 1;
        om.itemLoadPending[ci] = 1;
        var url = om.pathToUrl(ci) +"/item.js";
        om.grab(url);
        // take out this return to launch mutiple grabs
        return;
        
      }
    }
    if (!pending) {
      om.doneLoadingItems();
    }
  }


// NOT YET IN USE; but in future it will be good to verify a successful load for better error reporting
//intention: will be called when code is loaded
  
  om.assertCodeLoaded = function (pth) {
    debugger;
    om.log("load","finished loading code for ",pth);
    om.codeLoaded[pth] = 1;
    if (om.allCodeLoaded()) {
      if (om.whenRestoreDone) {
        om.log("load","RESTORE DONE");
        debugger;
        var rits = om.itemsToRestore.map(function (p) {
          return om.internalizedItems[p]
        });
        om.whenRestoreDone(rits);
        
      }
    }
  }
  
  
  om.loadTheCode = function () {
    om.itemsToLoad.forEach(function (itm) {
      var url = om.pathToUrl(itm)+"/code.js";
      om.grab(url);
    });
  }
  
  
  om.internalizeLoadedItem = function (pth) {
      debugger;
      var cntr = om.itemsLoaded[pth];
      if (!cntr) {
        om.error("Failed to load "+pth);
        return;
      }
      //var idt = cntr.__iData__;
      var cmps = cntr.__components__;
      var cg;
      if (cntr.unbuilt) {
        cg = om.mkRoot();
        cg.unbuilt = 1;
      }  else {
        var vl = cntr.value;
        cg = om.internalize(__pj__,pth,vl);
        cg.__external__ = 1;
//        cg.__externalReferences__ = om.derelativizeReferences(cntr.directExternalReferences,fp);
        cg.__overrides__ = cntr.overrides;
      }
      //if (idt) {
      //  cg.__iData__ = idt;
      //}
      if (cmps) {
        cg.set("__components__",om.lift(cmps));
      }
      om.internalizedItems[pth] = cg;
  }
  
  om.internalizeLoadedItems = function () {
    var ln = om.itemsToLoad.length;
    for (var i = ln-1;i>=0;i--) {
      om.internalizeLoadedItem(om.itemsToLoad[i]);
    }
  }
  
  om.doneLoadingItems = function () {
    if (badItem) {
      om.whenRestoreDone([om.mkRoot()]);
    } else {
      om.internalizeLoadedItems();
      om.loadTheCode();
    }
  }

  
 
 
 //url might be an array or urls, or a url 
 om.restore = function (url,cb) {
  debugger;
   om.resetLoadVars();
   om.whenRestoreDone = cb;
   
   var cntr,missing;
   if ((!url) || (url.length===0)) {
     cb();
     return;
    }
    if (url instanceof Array) {
      var multi = 1;
      om.itemsToRestore = [];
      // set up load for those that have not been loaded
      url.forEach(function (u) {
        var p = om.urlToPath(u);
        om.itemsToRestore.push(p);
        var vl = om.evalPath(__pj__,p);
        if (!vl) {
          om.itemsToLoad.push(p);
        }
      });
      if (om.itemsToLoad.length === 0) {
        cb();
        return;
      }
   
    } else {
     multi = 0;
     
     var p = om.urlToPath(url);
     topPath = p;
     om.itemsToLoad.push(p);
     om.itemsToRestore.push(p);
     om.topr
     
   }
   om.loadMoreItems();
  return;
   function internalizeIt(url) {
     //var url = om.iiToDataUrl(ii);
    var cg = undefined;
    function theWork() {
      var pth = om.toPath(url);
      cntr = om.grabbed[pth];
      if (!cntr) {
        om.error("Failed to load "+url);
        return;
      }
      //var idt = cntr.__iData__;
      var cmps = cntr.__components__;
      var ld = om.nowLoading;
      var fp = ld.path.split('/').slice(0,4).join("/");
     // var fp = "/x/"+ld.repo;
      if (cntr.unbuilt) {
        cg = om.mkRoot();
        cg.unbuilt = 1;
      }  else {
        var vl = cntr.value;
        cg = om.internalize(__pj__,pth,vl);
//        cg.__externalReferences__ = om.derelativizeReferences(cntr.directExternalReferences,fp);
        cg.__overrides__ = cntr.overrides;
      }
      //if (idt) {
      //  cg.__iData__ = idt;
      //}
      if (cmps) {
        cg.set("__components__",om.lift(cmps));
      }
      
      //if (url !== topUrl) cg = cg.instantiate();// mod 11/14/13
      //debugger;
      
      //cg.__from__ = url;
      om.allInstalls.push(cg);
    }
    if (1) {
      theWork();
    } else {
      try {
        theWork();
      } catch(e) {
        var ier = "Install failed for "+url;
        om.installErrors.push(ier);
        om.log("installError",ier); 
      }
    }
    return cg;
   }
   
   
   function afterGrabDeps(missing) {
    if (badItem) {
      var codeToLoad = [];
      var ci = [undefined];
    } else {
      missing.forEach(function (v) {internalizeIt(v)}); // v will be a path in this case (ie an in-repo ii)
      if (multi) {
        var ci = [];
        var ln = url.length;
        for (var i=0;i<ln;i++) {
          ci.push(internalizeIt(url[i]));
        }
      } else {
        var ci = [internalizeIt(url)];
      }
      // now snag the code
      var allGrabbed = Object.keys(om.urlsGrabbed);
      var codeToLoad = allGrabbed;
    }
    om.grabM(codeToLoad,function () {
       //  and load the code
      debugger;
      /*
      ci.forEach(function (cit) {
        if (!cit) return;
            var cmps = cit.__components__;
        if (cmps) {
          cmps.forEach(function (c) {
            var p = c.path;
            var pv = om.evalPath(__pj__,'/x'+p);
            if (pv) {
              var ipv = pv.instantiate();
              cit.set(c.name,ipv);
            } else {
              console.log("Missing component",p);
            }
          });
        }
        
      });
    */
       cb(multi?undefined:ci);
       },true);
   }
   /*
   function addDeps(url,missing) {
     var ld = om.nowLoading;
     var fp = ld.path.split('/').slice(0,4).join("/");

     // var fp = "/x/"+ld.repo;

     var cntr = om.urlsGrabbed[url];
     var cexts = cntr.allExternalReferences;
     if (!cexts) return;
     var aexts = om.derelativizeReferences(cexts,fp);
     if (aexts) {
      aexts.forEach(function (v) {
       if (om.evalPath(__pj__,v) === undefined) {
         missing.push(v);
       }
     });
     }
   }
   
   */
  function addDeps(url,missing) {
     var ld = om.nowLoading;
     var fp = ld.path.split('/').slice(0,4).join("/");

     // var fp = "/x/"+ld.repo;

     var cntr = om.urlsGrabbed[url];
     var cexts = cntr.__components__;
     if (!cexts) return;
     //var aexts = om.derelativizeReferences(cexts,fp);
     cexts.forEach(function (c) {
       if (om.evalPath(__pj__,c.path) === undefined) {
         missing.push(c.path);
       }
     });
    }
   
   function afterGrab() {
    if (badItem) {
      afterGrabDeps([]);
    } else {
     var missing = [];
     addDeps(url,missing);
     om.grabM(missing,function () {afterGrabDeps(missing)});
    }
   }
   
   function afterGrabM() {
      var missing = [];
      url.forEach(function (p) {
       addDeps(p,missing);
     });
     om.grabM(missing,function () {afterGrabDeps(missing)});
   }
   if (multi) {
     om.grabM(url,afterGrabM);
   } else {
     om.grabOne(url,afterGrab)
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
  
  om.UnpackedUrl = {};
  
  om.UnpackedUrl.mk = function (handle,repo,path) {
    var rs = Object.create(om.UnpackedUrl);
    var spath  = "/" + handle + "/" + repo + path;
    var url = om.itemHost + spath;
    rs.url = url;
    rs.host = om.itemHost;
    rs.handle = handle;
    rs.repo = repo;
    rs.path = "/x"+spath;
    rs.spath = spath;
    rs.name = om.afterLastChar(path,"/");
    return rs;
  }
  
// if variant, then the path does not include the last id, only the urls do
// path 
  om.unpackUrl = function (url) {
    if (!url) return;
    if (om.beginsWith(url,"http:")) {
      var r = /(http\:\/\/[^\/]*)\/([^\/]*)\/([^\/]*)\/(.*)$/
      var idx = 1;
    } else {
       r = /\/([^\/]*)\/([^\/]*)\/(.*)$/
       idx = 0;
    }
    var m = url.match(r);
    if (!m) return;
    //var nm = m[5];
    var handle = m[idx+1];
    var repo = m[idx+2];
    var path = "/"+m[idx+3];
    return om.UnpackedUrl.mk(handle,repo,path);
  }
  
  
  om.repoNode1 = function (hs,rs) {
    var x = pj.x;
    if (x) {
      var h = x[hs];
      if (h) {
        return h[rs];
      }
    }
    return undefined;
  }
  
  om.UnpackedUrl.repoNode1 = function () {
    return om.repoNode1(this.handle,this.repo);
  }
  
  om.repoNodeFromPath = function (p) {
    var sp = p.split("/");
    return om.repoNode1(sp[2],sp[3]);
  }
   
    
  
  var s3SaveState;// retains state while waiting for the save to complete
 
  page.messageCallbacks.s3Save = function (rs) {
      var x = s3SaveState.x;
      var cb = s3SaveState.cb;
      var built = s3SaveState.built;
      var cxD = s3SaveState.cxD;
      var cmps = s3SaveState.cmps;
      //var iData = s3SaveState.iData;
      var surrounders = s3SaveState.surrounders;
      if (built) x.restoreData();
      if (0 && cxD) {
        x.__currentXdata__ = cxD;
        //code
      }
      //if (iData) {
      //  x.__iData__ = iData;
      //}
      if (cmps) {
        x.set("__components__",cmps);
        //code
      }
      //if (x.update) {
      //  x.update();
      //}
    
      //om.root.installOverrides(om.overrides);
      //x.deepUpdate(); 
      if (cb) {
        cb(rs);
      }
  }
 
  var s3SaveUseWorker = 1;
  // note xData and components are moved from outside of the value to the container for storage.
  // this is for consistency for unbuilt items, in which the value is just "ubuilt".
  om.s3Save = function (x,unpacked,cb,unbuilt) {
    // if x is unbuilt, it still might have __xData__,__currentXdata__, and __component__ fields
    var built = !unbuilt;
    if (built) {
  //    om.unselect();
      if (x.__saveCount__) {
        var kind = "variant";
      } else {
        kind = "codebuilt"
      }
      var ovr = om.overrides;
      x.stashData();
      x.removeComputed();
      x.removeDom();
      delete x.__objectsModified__;
    }
    var cxD = x.__currentXdata__;
    if (cxD) {
      delete x.__currentXdata__;
    }
    //var iData = x.__iData__;
    //iData = "TESTING IDATA";
    var cmps = x.__components__;
    delete x.__components__;
    var surrounders = x.surrounders;
    delete x.surrounders;
   //delete x.__iData__;
    if (built) {
      var er = om.addExtrefs(x,unpacked); // this does the actual externalization
      er.overrides = ovr;
      var code = x.funstring();
      if (code === '') {
        code = "//No JavaScript was defined for this item"
      }
    } else {
      er = "unbuilt";
      code = "//Unbuilt";
    }
 //  OV var anx = {value:er,url:unpacked.url,path:unpacked.path,repo:(unpacked.handle+"/"+unpacked.repo)}; // url so that the jsonp call back will know where this came 
    var anx = {value:er,path:unpacked.path}; // path so that the jsonp call back will know where this came 
    //anx.test = 99;
   // if (iData) {
   //   anx.data = iData;
   // }
    if (cmps) {
      anx.components = cmps.fromNode();
    }
    //var dt = {path:unpacked.spath,tree:"prototypeJungle.om.loadFunction("+JSON.stringify(anx)+")",code:code,kind:kind};
    var dt = {path:unpacked.spath,data:anx,code:code,kind:kind};
   
   
    s3SaveState = {x:x,cb:cb,built:built,cxD:cxD,cmps:cmps,surrounders:surrounders};
    if (s3SaveUseWorker) {
      page.sendWMsg(JSON.stringify({apiCall:"/api/toS3",postData:dt,opId:"s3Save"}));
      return;
    } else {
      om.ajaxPost(apiCall,dt,page.messageCallbacks.s3Save);
    }
  }

 
  om.save = function (x) {
    var cs = om.customSave; // used in build
    if (cs) {
      cs(x);
    } else {
      alert('Save executed from an unexpected context');
    }
  }
  
})(prototypeJungle);
  
  
  