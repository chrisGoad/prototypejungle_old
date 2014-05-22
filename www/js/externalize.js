(function (__pj__) {
  var om = __pj__.om;
  //var _draw = __pj__._draw;
  var page = __pj__.page;
  
  
  // a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
  // theory of the namespaces
  // pj ends up being one big tree.  Its structure is pj/om pj/geom etc for the core modules.
  // the rest of the world exists under  pj/x. Eg pj/x/sys/repo0/chart. Later, when things can be at any url: pj/u/domain/...
  // pj.r is predefined to point to the current repo.
  
  
  om.DNode._isProtoChild = function () {
    var prt = Object.getPrototypeOf(this);    
    if (!prt) return false;
    var pr = this._get("_parent");
    if (!pr) return false;
    var pprt = Object.getPrototypeOf(pr);
    if (!om.DNode.isPrototypeOf(pprt)) return false;
    var nm = this._name;
    var pvl = pprt[nm];
    return (pvl === prt);
  }
  
    
  
  Function.prototype._isProtoChild = function () {return false;}

  // rti is the root of the externalization, or null, if this is the root
  var exRecursionExclude = {_prototype:1,_name:1,_typePrototype:1,_parent:1,widgetDiv:1} //@todo rename widgetDiv
    
 
  om.externalizedAncestor = function (x) {
    if (om.getval(x,"_external")) { // all externalized fellows have this property
      return x;
    } else {
      var pr = om.getval(x,"_parent");
      if (pr) {
        return om.externalizedAncestor(pr);
      } else {
        return undefined;
      }
      
    }
  }
  
  om.refCount = 0;
  om.refPath = function (x,rt) {
    om.refCount++;
    var pth = x._pathOf(rt);
    if (pth) {
      var rf = om.pathToString(pth);
      //rf = om.relativizeReference(rf,fullRepo);
      var rf0 = rf[0];
      if (rf[0] === "/") { // this is an external reference- outside of the thing being externalized
        var rfo = x;
        var ans = om.externalizedAncestor(rfo);
        if (!ans) {
          om.error("External dependency "+rf+" has not been saved");
        }
      }
      return rf;
    }
  }
  
    
  om.DNode._externalize = function (rti) {
    if (rti) {
      var rt = rti;
    } else {
      rt = this;
    }
    var rs = {};
    
  
    var ispc = this._isProtoChild();
    if (ispc) { // in this case, when internalize, we can compute the value of _prototype from the parent and its prototype
      rs._protoChild = 1;
    } else {
      var pr =  Object.getPrototypeOf(this);
      var rf = om.refPath(pr,rt);
      if (rf) {
        rs._prototype = rf;
       
      }
    }
    var thisHere = this;      
      this._iterItems(function (v,k) {
      if (!om.treeProperty(thisHere,k)) {
        if (k==="_externalReferences") { // these are not needed after bringing something in, but easier to ignore on resave than _remove
          return;
        }
        var rf = om.refPath(v,rt);
        if (rf) rs[k] = {_reference:rf};
        return; // for now; these are references
      }
      if (!exRecursionExclude[k]) {
        if (om.isNode(v)) {
          var srs = v._externalize(rt);
          rs[k] = srs;
        } else {
           rs[k] = v;
        } 
      }
      });
    return rs;
    }
   
    // _properties of the LNode are placed in the first element of the form {_props:1,,,
    om.LNode._externalize = function (rti) {
      if (rti) {
        var rt = rti;
      } else {
        rt = this;
      }
      var sti = this._setIndex;
      if (sti !== undefined) {
        var rs = [{_props:1,_setIndex:sti}];
      } else {
        rs = [];
      }
      var ln = this.length;
      for (var i=0;i<ln;i++) {
        var v = this[i];
        if (om.isNode(v)) {
          var srs = v._externalize(rt);
        } else {
          srs = v;
        }
        rs.push(srs);
      }
      return rs;
    }
  
  /* algorithm for internalization, taking prototypes into account.
    recurse from top of tree down.
    when _prototype is found, compute the prototype chain, and attach it to the nodes
    in the chain.
    when _protoChild_ is found, do the same thing, which will be possible
    because the parent chain will already exist.
    
    next, is the object creation phase. First build the objects for the chains. Attach these  at _v
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
            if (!v._reference) {
              /* bug catching; may use again
              if (logCount < 100) {
                console.log("installing child ",k,"of parent ",x._name,"grandparent",prx?prx._name:"n o n e");
                logCount++;
              }
              */
              v._name = k;
              om.installParentLinks1(x,v);
            }
          }
        }
      }
      if (prx) x._parent = prx;
      
    }
  }
  
  om.installParentLinks = function (x) {
    return om.installParentLinks1(null,x);
  }

  
 // dst is the tree into which this is being internalized
  // iroot is the root of this internalization;
  // we are building the chain for x
  // prx is x's parent
  // "_prototypev" is the value of the _prototype path
  
  // the chain[0] is the object outside the iroot from which the internalized part of the chain starts
  // for an object in iroot which has no _prototype or _protoChild, chain[0] is null, meaning inherit from om.DNode only
  
  // the result returned by buildEchain is wrapped in [] if it is external
      
  
  om.buildEChain = function (dst,iroot,x) {
    if (!x) {
      debugger;
    }
    var ptp = x._prototype;
    var cch = x._chain;
    if (ptp) {
      // this might be a path within the internalized object, or somewhere in the
      // existing tree.
      var ppth = ptp.split("/");
      var pr = om._evalPath(iroot,ppth,dst);
      if (!pr) {
        om.error("Missing path in internalize ",om.pathToString(ppth));
      }
      om.log("untagged",'setting prototypev for ',ptp);
      x._prototypev = pr;
      
      if (ppth[0] === "") { // starts with "/", ie from dst
        var rs = [pr,x];
      } else {
        var rs = om.buildEChain(dst,iroot,pr);
        if (!rs) rs = [null,pr]; // explained above
        rs.push(x);
      }
      x._chain = rs;
      return rs;
    }
    if (x._protoChild) {
      var prx = x._parent;
      if (!prx) om.error("_protoChild root of serialization not handled yet");
      // to deal with this, put in _prototype link instead, when serializing
      var prp = prx._prototypev;
      if (!prp) {
        om.error("Missing _prototypev");// this should not happen
       // prx is external to iroot - already internalized. So the start of the child's prototype chain is prx's own child named x._name
       var pr = prx[x._name];
       var rs = [pr];
      } else {
        var pr = prp[x._name];
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
      x._chain = rs;
      x._prototypev = pr;
      return rs;      
    }
  }
  
  var recurseExclude = {_v:1,_prototype:1,_function:1,_prototypev:1,_parent:1,_name:1,_chain:1,_reference:1};

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
    var ch = x._chain;
    if (ch && (!ch._collected)) {
      om.allChains.push(ch);
      ch._collected = true;
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
      var v = co._v;
      if (!v) {
        var fn = co._function;
        if (fn) {
          error('Obsolete I think');
          var v = om.parseFunctionText(fn);
        } else {
          v = Object.create(pr);
          v._name = co._name;
        }
        co._v =v;
      }
      pr = v;
    }
    if (v._name === "e0") {
      var z = 22;
    }  
  }
  
  om.buildObjectsForChains = function () {
    om.allChains.forEach(function (v) {
      om.buildObjectsForChain(v);
    })
  }
  
  om.buildObjectsForTree = function (x) {
    if ( !x._v) {
      var fn = x._function;
      if (fn) {
        var v = om.parseFunctionText(fn);
      } else {
        if (Array.isArray(x)) {
          v = om.LNode.mk();
        } else {
          v = om.DNode.mk();
        }
      }
      x._v = v;
    }
    for (var k in x) {
      if (x.hasOwnProperty(k) && !recurseExclude[k]) {
        var v = x[k];
        if (v && (typeof(v) === "object")) {
          if (!v._reference) {
            om.buildObjectsForTree(v);
          }
        }
      }
    }
  }
  
  var referencesToResolve;

  om.stitchTogether = function (x) {
    // put in the _properties
    var xv = x._v;
    if (Array.isArray(x)) {
      var first = 1;;
      x.forEach(function (v,n) {
        if (first && v && (typeof(v) === "object") && (v._props)) {
          xv._setIndex = v._setIndex; // later this technique might be used for other _properties
          first = 0;
          return;
        }
        first = 0;
        if (v && ((typeof(v) === "object")||(typeof(v)==="function"))) {
          om.stitchTogether(v);
          var iv = v._v;
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
            if (v._reference) {
              referencesToResolve.push([xv,k,v._reference]);
            } else {
              xv[k] = v._v;
              om.stitchTogether(v);
            }
          } else {
            xv[k] = v;
          }
        }
      }
    }
    xv._name = x._name
    var pr = x._parent;
    if (pr) {
      xv._parent = pr._v;
    }
  }
  
  om.resolveReference = function (dst,iroot,r) {
    var pr = r[0];
    var prop = r[1];
    var rf = r[2];;
    var rs= om._evalPath(iroot,rf,dst);
    pr[prop] = rs;
    return rs;
  }
  
  om.resolveReferences = function (dst,iroot) {
    referencesToResolve.forEach(function (r) {
      om.resolveReference(dst,iroot,r);
    });
  }

  

om.DNode._cleanupAfterInternalize = function () {
  this._deepDeleteProps(["_prototypev","_protoChild","_prototype"]);
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
    var rs = x._v;
    om.resolveReferences(dst,rs);
    if ((pth.indexOf("http:")===0)||(pth.indexOf("https:")===0)) {
      dst.set("anon",rs);
    } else {
      dst.set(pth,rs);
    }
    rs._cleanupAfterInternalize();
    return rs;
  }

  om.addExtrefs = function (dnode,unpacked) {
    var x = dnode._externalize(dnode);
    var cntr = {value:x};
    return cntr;
  }
  
  
  om.getFile = function (pth,cb) {
    var dt = {path:pth}
    om.ajaxPost("/api/getFile",dt,function (rs) {
      cb(rs);
    });
  }


// machinery for installing items


// items are denoted by their full paths beneath pj (eg /x/handle/repo)
// The following variables are involved

//om.activeConsoleTags.push("load");
  
  var topPath;
  var variantOf;
  var variantOf; //  if the top level restore is a variant, this is the path of the item of which it is a variant
var badItem,missingItem,loadFailed,codeBuilt;
  
  om.resetLoadVars = function () {
    om.itemsToLoad = []; // a list in dependency order of all items to grab - if A depends on B, then B will appear after A
    om.itemsLoaded  = {};  // paths-> noninternalized _values
    om.itemLoadPending = {};
    om.codeLoaded = {}; // path->1 if code for path is loaded
    om.itemsToRestore = []; // the items requested in the top level call (does not include components/dependency tree)
    om.internalizedItems = {};
    badItem = 0;
    missingItem = 0;
    loadFailed = 0;
    codeBuilt = 0;
    variantOf = undefined;
    topPath = undefined;
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
        
  
  
  om.pathToUrl = function (s) { // s might already be a url.
   if ((s.indexOf("http:")===0)||(s.indexOf("https:")===0)) {
      return s;
    } else {
      return "http://"+om.itemDomain+s.substr(2);
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
  
  
  om.assertItemLoaded = function (x) {
    om.log("load","done loading ",x);
    if (x===undefined) { // something went wrong
      om.itemsLoaded[topPath] = "badItem";
      om.log("bad item ");
      badItem = 1;
      om.doneLoadingItems();
      return;
    }
    var pth = x.path;
    //  path is relative to pj; always of the form /x/handle/repo...
    var vl = x.value;
    var cmps = x.components;
    if (cmps) {
      vl._components =cmps;
      cmps.forEach(function (c) {
        var p = c.path;
        if (c.name === "_variantOf") {
          variantOf = p;
        }
        if (om.itemsToLoad.indexOf(p) < 0) {
          om.itemsToLoad.push(p);
        }
      });
    }
    om.itemsLoaded[pth] = x;
    delete om.itemLoadPending[pth];
    om.loadMoreItems();
   
   
  }
  
    om.loadFunction = om.assertItemLoaded; // old name

  om.loadException = {};
  
  om.mkLoadException = function (msg) {
    var rs = Object.create(om.loadException);
    rs.message = msg;
    return rs;
  }
  
  om.grab = function (iurl) {
    var url = om.toItemDomain(iurl);
    om.log("load","starting load of ",url);
    $.ajax({
              type:"GET",
              dataType: "script",
              url: url,
              error:function (xhr,status,ert) {
                missingItem = 1;
                om.doneLoadingItems();
              }
          });
  }
  
  om.loadMoreItems  = function () {
    var ln = om.itemsToLoad.length;
    var pending = 0;
    for (var i=0;i<ln;i++) {
      var ci = om.itemsToLoad[i];
      if (!om.itemsLoaded[ci]) {
        pending = 1;
        if (!om.itemLoadPending[ci]) {
          om.itemLoadPending[ci] = 1;
          var url = om.pathToUrl(ci) +"/item.js";
          om.grab(url);
        }
      }
    }
    if (!pending) {
      om.doneLoadingItems();
    }
  }


  om.lastRestoreStep = function () {
    
    if (om.whenRestoreDone) {
      if (loadFailed) {
        debugger;
        om.whenRestoreDone(codeBuilt+loadFailed);
        return;
      }
      var rits = om.itemsToRestore.map(function (p) {
        return om.internalizedItems[p]
      });
      om.tlog("load","RESTORE DONE");

      om.whenRestoreDone(rits);
    }
  }
  
  
  om.assertCodeLoaded = function (pth) {
    om.log("load","finished loading code for ",pth);
    om.codeLoaded[pth] = 1;
    if (om.allCodeLoaded()) {
      om.lastRestoreStep();
    }
  }
  
  
  om.loadTheCode = function () {
    if (loadFailed) {
      debugger;
      om.lastRestoreStep();
    }
    om.itemsToLoad.forEach(function (itm) {
      var url = om.pathToUrl(itm)+"/code.js";
      om.grab(url);
    });
  }
  
  om.internalizeLoadedItem = function (pth) {
    var isTop=om.itemsToRestore.indexOf(pth) >=0;
    var cntr = om.itemsLoaded[pth];
    if (!cntr) {
      om.error("Failed to load "+pth);
      return;
    }
    var cmps = cntr._components;
    var vl = cntr.value;
    var cg;
    if (vl==="unbuilt") {
      cg = om.mkRoot();
      cg.unbuilt = 1;
    } else {
      if (isTop && !vl._saveCount) {
        codeBuilt = 1;
      }
      try {
        cg = om.internalize(__pj__,pth,vl);
      } catch(e) {
        loadFailed = pth;
        return;
      }
     
      cg._external = 1;
      cg._overrides = cntr.overrides;
      if (!isTop  && pth !== variantOf) {
        if (cg._hide) cg._hide();
      }
    }
    if (cmps) {
      cg.set("_components",om.lift(cmps));
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
    if (badItem || missingItem) {
      //om.whenRestoreDone([om.mkRoot()]);
      om.whenRestoreDone("missing");
    } else {
      om.internalizeLoadedItems();
      om.loadTheCode();
    }
  }

 
 //url might be an array or urls, or a url 
 om.restore = function (url,cb) {
  om.tlog("Starting Restore");
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
        var vl = om._evalPath(__pj__,p);
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
     
   }
   om.loadMoreItems();

  return;
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
    var surrounders = s3SaveState.surrounders;
    if (built) x._restoreData();
    if (cmps) {
      x.set("_components",cmps);
    }
    if (cb) {
      cb(rs);
    }
  }
  
 
  var s3SaveUseWorker = 1;
  // note xData and components are moved from outside of the value to the container for storage.
  // this is for consistency for unbuilt items, in which the value is just "ubuilt".
  om.s3Save = function (x,unpacked,cb,unbuilt) {
    // if x is unbuilt, it still might have __xData__,_currentXdata, and __component__ fields
    var built = !unbuilt;
    if (built) {
      if (x._saveCount) {
        var kind = "variant";
      } else {
        kind = "codebuilt"
      }
      var ovr = om.overrides;
      x._stashData();
      x._removeComputed();
      x._removeDom();
      delete x._objectsModified;
    }
    var cxD = x._currentXdata;
    if (cxD) {
      delete x._currentXdata;
    }
    var cmps = x._components;
    var vOf = om.componentByName(x,"_variantOf");
    delete x._components;
    var surrounders = x.surrounders;
    delete x.surrounders;
    if (built) {
      var er = om.addExtrefs(x,unpacked); // this does the actual externalization
      er.overrides = ovr;
      var code = x._funstring();
      if (code === '') {
        code = "//No JavaScript was defined for this item"
      }
    } else {
      er = "unbuilt";
      code = "//Unbuilt";
    }
    // path so that the jsonp call back will know where this came from
    er.path = unpacked.path;
 
    if (cmps) {
      er.components = cmps._fromNode();
    }
    var dt = {path:unpacked.spath,data:er,code:code,kind:kind};
    var svf = x.savedFrom;
    if (svf && !x.dataSource ) {
      dt.savedFrom = svf;
      dt.ownDataSource = 1;
    }
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
  
  
  