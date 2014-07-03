// extensions of om for prototypejungle  (beyond pjcs)
(function (pj) {
  "use strict";
  var  om = pj.om;
  var ui = pj.ui;
  pj.set("page",Object.create(om.DNode));
  
  ui.toItemDomain = function (url) {
    if (ui.useCloudFront || ui.useS3) {
      var dm = ui.useCloudFront?ui.cloudFrontDomain:ui.s3Domain;
      return url.replace("prototypejungle.org",dm);
    } else {
      return url;
    }
  }
  //ui.itemHost = "http://"+ui.s3Domain;//"http://prototypejungle.org";
  ui.itemHost = "http://"+ui.itemDomain;//"http://prototypejungle.org";
// this is used in install 
  om.urlMap = function (u) {return u.replace(ui.itemDomain,ui.s3Domain);}
  om.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}


  ui.defineFieldAnnotation = function (functionName,fieldName) {
    om.DNode["__get"+functionName] = function (k) {
      var nm = fieldName+k;
      return this[nm];
    };
    om.DNode["__set"+functionName] = function (k,v) {
      if (Array.isArray(k)) {
        var thisHere = this;
        k.forEach(function (ik) {
          var nm = fieldName+ik;
          thisHere[nm] = v;
        });
      } else {
        var nm = fieldName+k;
        this[nm] = v;
        return v;
      }
    };
    om.LNode["__get"+functionName] = function (k){}
  }
  
  /*
  om.IfreezeField(item,"adjustScaling");
om.Ifreeze(item.TextP,"text");
  */
  

  ui.defineFieldAnnotation("Note","__note__");
  
  ui.setNote = function (nd,prop,nt) {
    nd.__setNote(prop,nt);
  }



    //om.defineFieldAnnotation("Transient","__transient__");// set by update, or otherwise not worth saving 

  ui.defineFieldAnnotation("FieldType","__fieldType__");

  
  ui.defineFieldAnnotation("FieldStatus","__status__");
  // functions are invisible in the browser by default
  ui.defineFieldAnnotation("vis","__visible__");
  ui.defineFieldAnnotation("RequiresUpdate","__requiresUpdate__");
  
  ui.watch = function (nd,k) {
    if (typeof k === "string") {
      nd.__setRequiresUpdate(k,1);
    } else {
      k.forEach(function (j) {
        nd.__setRequiresUpdate(j,1);
      });
    }
  }
  
  
 

  
  om.DNode.__fieldIsThidden = function (k) {
    if (om.ancestorHasOwnProperty(this,"__isThidden")) return true;
    var status = this.__getFieldStatus(k);
    return status  === "tHidden";
  }
  
 // the form of status might be "mfrozen <function that did the setting>"
  om.DNode.__fieldIsFrozen = function (k) {
    if (om.ancestorHasOwnProperty(this,"__mfrozen")) return true;
    var status = this.__getFieldStatus(k);
    return status && (status.indexOf('mfrozen') === 0);
  }
  
  
 /* om.nodeMethod("__mfreeze",function (k) {
    if (typeof k === "string") {
      this.__setFieldStatus(k,"mfrozen");
    } else {
      this.__mfrozen=1;
    }
    return this;
  });
  
  */
 
 
  ui.freeze = function (nd,flds) {
    var tpf = typeof flds;
    if (tpf==="undefined") {
      nd.__mfrozen__ = 1;
    } else if (tpf==="string") {
      nd.__setFieldStatus(flds,"mfrozen");
    } else {
      flds.forEach(function (k) {
        nd.__setFieldStatus(k,"mfrozen");
     });
    }
  }
  
  
  
  
  
  ui.hide = function (nd,flds) {
    if (typeof flds === "string") {
      nd.__setFieldStatus(flds,"tHidden");
    } else {
      flds.forEach(function (k) {
        nd.__setFieldStatus(k,"tHidden");
     });
    }
  }
  
  
  om.DNode.__setOutputF = function (k,lib,fn) {
    var nm = "__outputFunction__"+k;
    var pth = om.pathToString(lib.__pathOf(__pj__));
    var fpth = pth+"/"+fn;    
    this[nm] = fpth;
  }
  
  
  om.DNode.__getOutputF = function (k) {
    var nm = "__outputFunction__"+k;
    var pth = this[nm];
    if (pth) return om.__evalPath(__pj__,pth);
  }
  
  om.LNode.__getOutputF = function (k) {
    return undefined;
  }
  
  
  om.DNode.__applyOutputF = function(k,v) {
    var outf = this.__getOutputF(k);
    if (outf) {
      return outf(v,this);
    } else {
      return v;
    }
  }
  
  om.LNode.__applyOutputF  = function (k,v) { return v;}
  
  
  om.DNode.__setInputF = function (k,lib,fn,eventName) {
    // This registers lib.fn eg "om.reportChange" to be called when the this[k] changes.
    // Eventname is remembered too, if supplied, and passed to fn when there is a change.
  
    var nm = "__inputFunction__"+k;
    var fpth = lib+"/"+fn;
    if (eventName) {
      fpth += "."+eventName;
    }
    this[nm] = fpth;
  }
  
  om.DNode.__applyInputF = function(k,vl) {
    var nm = "__inputFunction__"+k;
    var pth = this[nm];
    if (pth) {
      if (typeof pth==="string") {
        var eventName = om.afterChar(pth,".");
        if (eventName) {
          var lib = om.beforeChar(pth,".");
        } else {
          lib = pth;
        }
        var fn = pj[lib][fn];
        if (fn) {
          return fn(vl,this,k,eventName);
        }
      }
    }
    return undefined;
  }
  
  
  ui.objectsModifiedCallbacks = [];
  
  ui.objectsModified = function() {
    ui.root.__objectsModified = 1;
    ui.objectsModifiedCallbacks.forEach(function (fn) {fn()});
  }
  
  
  //   from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
  ui.parseQuerystring = function(){
    var nvpair = {};
    var qs = window.location.search.replace('?', '');
    var pairs = qs.split('&');
    pairs.forEach(function(v){
      var pair = v.split('=');
      if (pair.length>1) {
        nvpair[pair[0]] = pair[1];
      }
    });
    return nvpair;
  }
  
  
  // n = max after decimal place; @todo adjust for .0000 case
  om.nDigits = function (n,d) {
    if (typeof n !=="number") return n;
    var ns = String(n);
    var dp = ns.indexOf(".");
    if (dp < 0) return ns;
    var ln = ns.length;
    if ((ln - dp -1)<=d) return ns;
    var bd = ns.substring(0,dp);
    var ad = ns.substring(dp+1,dp+d+1)
    return bd + "." + ad;
  }
  
  
  ui.disableBackspace = function () {
    //from http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
    var rx = /INPUT|SELECT|TEXTAREA/i;
    $(document).bind("keydown keypress", function(e){
      if( e.which === 8 ){ // 8 === backspace
        if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
          e.preventDefault();
        }
      }
    });
  }
  
  
   // name of the ancestor just below __pj__; for tellling which top level library something is in 
  om.nodeMethod("__topAncestorName",function (rt) {
    if (this === rt) return undefined;
    var pr = this.__get("__parent");
    if (!pr) return undefined;
    if (pr === rt) return this.__name;
    return pr.__topAncestorName(rt);
  });
  
  //var stdLibs = {om:1,geom:1};
  /*
   var stdLibs = {om:1,svg:1,dom:1,geom:1};
  
  om.inStdLib = function (x) {
    var nm = x.__topAncestorName(pj);
    return stdLibs[nm];
  }
  */
  
  // used eg for iterating through styles. Follows the prototype chain, but stops at objects in the core
  // sofar has the properties where fn has been called so far
  om.DNode.__iterAtomicNonstdProperties = function (fn,allowFunctions,isoFar) {
    var soFar = isoFar?isoFar:{};
    if (!this.__inCore || this.__inCore()) return;
    var op = Object.getOwnPropertyNames(this);
    var thisHere = this;
    op.forEach(function (k) {
      if (om.internal(k) || soFar[k]) return;
      soFar[k] = 1;
      var v = thisHere[k];
      var tpv = typeof v;
      if (v && (tpv === "object" )||((tpv==="function")&&!allowFunctions)) return;
      fn(v,k);
    });
    var pr = Object.getPrototypeOf(this);
    if (pr && pr.__iterAtomicNonstdProperties) {
      pr.__iterAtomicNonstdProperties(fn,allowFunctions,soFar);
    }
  }
  
   // an atomic non-internal property, or tree property
  var properProperty = function (nd,k,knownOwn) {
    if (!knownOwn &&  !nd.hasOwnProperty(k)) return false;
    if (om.internal(k)) return false;
    var v = nd[k];
    var tp = typeof v;
    if ((tp === "object" ) && v) {
      return om.isNode(v) && (v.__parent === nd)  && (v.__name === k);
    } else {
      return true;
    }
  };
  
  // only include atomic properties, or __properties that are proper treeProperties (ie parent child links)
  // exclude internal names too
  om.ownProperProperties = function (rs,nd) {
    var nms = Object.getOwnPropertyNames(nd);
    nms.forEach(function (nm) {
      if (properProperty(nd,nm,true)) rs[nm] = 1;
    });
    return rs;
  }
  
  // this stops at the core modules (immediate descendants of pj)
  function inheritedProperProperties(rs,nd) {
    if (!nd.__inCore || nd.__inCore()) return;
    //var pr = nd.__get("__parent");
   // if (pr && pr.__builtIn) {
    //  return;
   // }
    //var nms = Object.getOwnPropertyNames(nd);
    var nms = om.ownProperProperties(rs,nd);
    inheritedProperProperties(rs,Object.getPrototypeOf(nd));
  }
 
 
  
  om.DNode.__iterInheritedItems = function (fn,includeFunctions,alphabetical) {
    var thisHere = this;
    function perKey(k) {
      var kv = thisHere[k];
      if ((includeFunctions || (typeof kv != "function")) ) {
        fn(kv,k);
      }
    }
    var ip = {};
    inheritedProperProperties(ip,this);
    var keys = Object.getOwnPropertyNames(ip);
    if (alphabetical) {
      keys.sort();
    }
    keys.forEach(perKey);
    return this;
  }
  
  
  
  om.LNode.__iterInheritedItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
   // is this a property defined in the core modules. 
  om.DNode.__coreProperty = function (p) {
    if (om.ancestorHasOwnProperty(this,"__builtIn")) {
      return 1;
    }
    if (this.hasOwnProperty(p)) return 0;
    var proto = Object.getPrototypeOf(this);
    var crp = proto.__coreProperty;
    if (crp) {
      return proto.__coreProperty(p);
    }
  }
  
  om.LNode.__coreProperty = function (p) {}

  
  om.nodeMethod("__inWs",function () {
    if (this === ui.root) return true;
    var pr = this.__get("__parent");
    if (!pr) return false;
    return pr.__inWs();
  });
  
  
  om.nodeMethod("__treeSize",function () {
    var rs = 1;
    om.forEachTreeProperty(this,function (x) {
      if (x && (typeof x==="object")) {
        if (x.__treeSize) {
          rs = rs + x.__treeSize() + 1;
        } 
      } else {
        rs++;
      }
    });
    return rs;
  });
  
  
// __get the name of the nearest proto declared as a tyhpe for use in tree browser
  om.DNode.__protoName = function () {
    var p = Object.getPrototypeOf(this);
    var pr = p.__parent; 
    if (!pr) return "";
    if (p.__get('__isType')) {
      var nm = p.__name;
      return nm?nm:"";
    }
    return p.__protoName();
  }

  
  om.LNode.__protoName = function () {
    return "LNode";
  }

 
 
  om.DNode.__hasTreeProto = function () {
   var pr = Object.getPrototypeOf(this);
   return pr && (pr.__parent);
  }
 
  Function.prototype.__hasTreeProto = function () {return false;}
 
  om.LNode.__hasTreeProto = function () {
    return false;
  }
  
  
  
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
  
  ui.UnpackedUrl = {};
  
  ui.UnpackedUrl.mk = function (handle,repo,path) {
    var rs = Object.create(ui.UnpackedUrl);
    var spath  = "/" + handle + "/" + repo + "/" + path;
    var url = ui.itemHost + spath;
    rs.url = url;
    rs.host = ui.itemHost;
    rs.handle = handle;
    rs.repo = repo;
    rs.fullRepo = ui.itemHost+"/"+handle+"/"+repo; // this is the repo used at the install level; its full url
    rs.path = path;
    rs.fullPath = spath;
    rs.name = om.afterLastChar(path,"/");
    return rs;
  }
  
// if variant, then the path does not include the last id, only the urls do
// path
/*
  ui.unpackUrl = function (url) {
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
    var path = m[idx+3];
    return ui.UnpackedUrl.mk(handle,repo,path);
  }
  
  */
  ui.repoNode1 = function (hs,rs) {
    var x = pj.x;
    if (x) {
      var h = x[hs];
      if (h) {
        return h[rs];
      }
    }
    return undefined;
  }
  
  ui.UnpackedUrl.repoNode1 = function () {
    return ui.repoNode1(this.handle,this.repo);
  }
  
  ui.repoNodeFromPath = function (p) {
    var sp = p.split("/");
    return ui.repoNode1(sp[2],sp[3]);
  }
   
   
// omits initial "/"s. Movethis?
om.pathToString = function (p,sep) {
  var rs;
  if (!sep) sep = "/";
  var ln = p.length;
  if (sep===".") {
    var rs = p[0];
    for (var i=1;i<ln;i++) {
      var e = p[i];
      if (typeof e==="number") {
        rs = rs+"["+e+"]";
      } else {
        rs = rs +"."+e;
      }
    }
  } else {
    rs = p.join(sep);
  }
  if (ln>0) {
    if (p[0]===sep) return rs.substr(1);
  }
  return rs;
}


  om.matchesStart = function (a,b) {
    var ln = a.length;
    if (ln > b.length) return false;
    for (var i=0;i<ln;i++) {
      if (a[i]!==b[i]) return false;
    }
    return true;
  }
  
  // For the UI, all installed items are listed under pj.x, treewise, allowing path machinery to work on all items
  /*
  om.xferInstalledItemsToX = function () {
    var x=pj.x;
    if (!x) {
      x = pj.set("x",om.DNode.mk());
    }
    var iurls = Object.getOwnPropertyNames(om.installedItems);
    iurls.forEach(function (u) {
      // do it by hand so as to avoid the name checking
      var itm = om.installedItems[u];
      x[u] = itm;
      itm.__name = u;
      itm.__parent = x;
    });
  }
  
  */
    
    
  ui.stripDomainFromUrl = function (url) {
    var r = /^http\:\/\/[^\/]*\/(.*)$/
    var m = url.match(r);
    if (m) {
      return m[1];
    }
  }
  
 
})(prototypeJungle);