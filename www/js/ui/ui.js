// extensions of pj for prototypejungle  (beyond pjcs)
(function (pj) {
  "use strict";
  var ui = pj.ui;
  
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly

//start extract

  
  ui.toItemDomain = function (url) {
    if (ui.useCloudFront || ui.useS3) {
      var dm = ui.useCloudFront?ui.cloudFrontDomain:ui.s3Domain;
      return url.replace("prototypejungle.org",dm);
    } else {
      return url;
    }
  }
  ui.itemHost = "http://"+ui.itemDomain;//"http://prototypejungle.org";
// this is used in install when the s3Domain is wanted
  pj.urlMap = function (u) {
    return u.replace(ui.itemDomain,ui.s3Domain);
  }
  pj.inverseUrlMap = function (u) {return u.replace(ui.s3Domain,ui.itemDomain);}
/*

  ui.defineFieldAnnotation = function (functionName) {
    var annotationsName = "__"+functionName;
    pj.Object["__get"+functionName] = function (k) {
      var annotations = this[annotationsName];
      if (annotations === undefined) {
        return undefined;
      }
      return annotations[nm];
    };
    pj.Object["__set"+functionName] = function (k,v) {
      var annotations = this[annotationsName];
      if (annotations === undefined) {
        annotations = this.set(annotationsName,pj.Object.mk());
      }
      if (Array.isArray(k)) {
        var thisHere = this;
        k.forEach(function (ik) {
          annotations[ik] = v;
        });
      } else {
        annotations[k] = v;
        return v;
      }
    };
    pj.Array["__get"+functionName] = function (k){}
  }
*/  

/*
  ui.defineFieldAnnotation = function (functionName,fieldName) {
    pj.Object["__get"+functionName] = function (k) {
      var nm = fieldName+k;
      return this[nm];
    };
    pj.Object["__set"+functionName] = function (k,v) {
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
    pj.Array["__get"+functionName] = function (k){}
  }
  */
  pj.defineFieldAnnotation("Note");//,"__note__");
  
  ui.setNote = function (nd,prop,nt) {
    nd.__setNote(prop,nt);
  }



  pj.defineFieldAnnotation("FieldType");

  pj.defineFieldAnnotation('UIStatus'); // the status of this field
  pj.defineFieldAnnotation('InstanceUIStatus');// the status of fields that inherit from this one - ie properties of instances.
  
  //pj.defineFieldAnnotation("FieldStatus","__status__");
  // functions are invisible in the browser by default
  //pj.defineFieldAnnotation("vis","__visible__");
  //pj.defineFieldAnnotation("RequiresUpdate","__requiresUpdate__");
  pj.defineFieldAnnotation("UIWatched");

  ui.watch = function (nd,k) {
    if (typeof k === "string") {
      nd.__setUIWatched(k,1);
    } else {
      k.forEach(function (j) {
        nd.__setUIWatched(j,1);
      });
    }
  }
  
  /*
  ui.watch = function (nd,k) {
    if (typeof k === "string") {
      nd.__setRequiresUpdate(k,1);
    } else {
      k.forEach(function (j) {
        nd.__setRequiresUpdate(j,1);
      });
    }
  }
  */
  
  // when a mark is instantiated, some of its fields are should not be modified in the instance,
  // though they may be in the prototype
  //pj.defineFieldAnnotation("frozenInInstance");
  
  pj.Object.__fieldIsHidden = function (k) {
    if (pj.ancestorHasOwnProperty(this,"__hidden")) return true;
    if (this.__mark) {
      var proto = Object.getPrototypeOf(this);
      var istatus = proto.__getInstanceUIStatus(k);
      if (istatus === 'hidden') return 1;
      if (istatus !== undefined) return 0;
    }
    var status = this.__getUIStatus(k);
    return status  === "hidden";
  }
/*
 ui.mustRemainComputed = function (node) {
  if (!node) return false;
  if (ui.mustRemainComputed(node.__get('__parent'))) return true;
  if (node.__computed && !node.__allowBaking) return true;
  return false;
 }
 
  ui.bake = function (node) {
    if (!node) return;
    if (node.__computed) {
      delete node.__computed;
    }
    ui.bake(node.__get('__parent'));
  }
  */

  pj.Object.__fieldIsFrozen = function (k) {
    if (ui.devNotSignedIn) {  // dev mode, no draw, no edit either 
      return true;
    }
    if (pj.ancestorHasOwnProperty(this,"__frozen")) return true;
    var status = this.__getUIStatus(k);
    if (status === "liquid") {
      return false;
    }
    if (k && (!this.__mark)&& pj.isComputed(this,k)) {
      return true;
    }
    //if (k && this.__getcomputed(k)) { 
    //  return true;  
    //}
    if (status === "frozen") {
      return true;
    }
    //if (ui.mustRemainComputed(this)) return true;
    var proto = Object.getPrototypeOf(this);
    status = proto.__getInstanceUIStatus(k);
    return (status === 'frozen');
  }
 
// a field can be frozen, liquid, hidden, (or neither).  Hidden fields do not even appear in the UI.
  // Frozen fields cannot be modified from the UI. liquid fields can be modified
  // from the UI even if they are fields of computed values.
  
  ui.freeze = function (nd,flds) {
    var tpf = typeof flds;
    if (tpf==="undefined") {
      nd.__frozen__ = 1;
    } else if (tpf==="string") {
      nd.__setUIStatus(flds,"frozen");
    } else {
      flds.forEach(function (k) {
        nd.__setUIStatus(k,"frozen");
     });
    }
  }
  
  
  ui.freezeInInstance = function (nd,flds) {
    var tpf = typeof flds;
    if (tpf==="undefined") {
      nd.__frozen__ = 1;
    } else if (tpf==="string") {
      nd.__setInstanceUIStatus(flds,"frozen");
    } else {
      flds.forEach(function (k) {
        nd.__setInstanceUIStatus(k,"frozen");
     });
    }
  }
  
  ui.melt = function (nd,flds) {
    var tpf = typeof flds;
    if (tpf==="string") {
      nd.__setUIStatus(flds,"liquid");
    } else {
      flds.forEach(function (k) {
        nd.__setUIStatus(k,"liquid");
     });
    }
  }
  
  
  
  ui.hide = function (nd,flds) {
    if (typeof flds === "string") {
      nd.__setUIStatus(flds,"hidden");
    } else {
      flds.forEach(function (k) {
        nd.__setUIStatus(k,"hidden");
     });
    }
  }
  
  
  ui.hideInInstance = function (nd,flds) {
    var tpf = typeof flds;
    if (tpf==="undefined") {
      nd.__frozen__ = 1;
    } else if (tpf==="string") {
      nd.__setInstanceUIStatus(flds,"hidden");
    } else {
      flds.forEach(function (k) { 
        nd.__setInstanceUIStatus(k,"hidden");
     });
    }
  }
  
  
  pj.defineFieldAnnotation('OutF');

  
  pj.Object.__setOutputF = function (k,lib,fn) {
    //var nm = "__outputFunction__"+k;
    var pth = pj.pathToString(lib.__pathOf(pj));
    var fpth = pth+"/"+fn;
    this.__setOutF(k,fpth);
    //this[nm] = fpth;
  }
  
  
  pj.Object.__getOutputF = function (k) {
    //var nm = "__outputFunction__"+k;
    var pth = this.__getOutF(k);
    if (pth) return pj.__evalPath(pj,pth);
  }
  
  pj.Array.__getOutputF = function (k) {
    return undefined;
  }
  
  
  pj.applyOutputF = function(nd,k,v) { 
    if (pj.Array.isPrototypeOf(nd)) {
      return v;
    }
    var outf = nd.__getOutputF(k);
    if (outf) {
      return outf(v,nd);
    } else {
      var ftp = nd.__getFieldType(k);
      console.log('OUT FIELD TYPE',ftp);
     // if (ftp === 'Boolean') {
     //   return 
     // }
      return v;
    }
  }
  
  
  /*
  pj.Object.__setInputF = function (k,lib,fn,eventName) {
    // This registers lib.fn eg "pj.reportChange" to be called when the this[k] changes.
    // Eventname is remembered too, if supplied, and passed to fn when there is a change.
  
    var nm = "__inputFunction__"+k;
    var fpth = lib+"/"+fn;
    if (eventName) {
      fpth += "."+eventName;
    }
    this[nm] = fpth;
  }
  */
  pj.applyInputF = function(nd,k,vl) {
    /*
    var nm = "__inputFunction__"+k;
    var pth = nd[nm];
    if (pth) {
      if (typeof pth==="string") {
        var eventName = pj.afterChar(pth,".");
        if (eventName) {
          var lib = pj.beforeChar(pth,".");
        } else {
          lib = pth;
        }
        var fn = pj[lib][fn];
        if (fn) {
          return fn(vl,nd,k,eventName);
        } 
      }
    }*/
    var ftp = nd.__getFieldType(k); 
    console.log('INPUT FIELD TYPE',ftp,' for ',k);
    if (ftp === 'boolean') { 
      if ((typeof vl === "string") && ($.trim(vl) === 'false')) {
        return false;
      }
      return Boolean(vl);
    }
    var cv = nd[k];  
    if (typeof cv === "number") {
      var n = parseFloat(vl);
      if (!isNaN(n)) {
        return n;
      }
    }
    return vl;
  }
  
  
  
  ui.objectsModifiedCallbacks = [];
  
  ui.assertObjectsModified = function() {
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
  pj.nDigits = function (n,d) {
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
  
  
   // name of the ancestor just below pj; for tellling which top level library something is in 
  pj.nodeMethod("__topAncestorName",function (rt) {
    if (this === rt) return undefined;
    var pr = this.__get('__parent');
    if (!pr) return undefined;
    if (pr === rt) return this.name;
    return pr.__topAncestorName(rt);
  });
  
  
  // used eg for iterating through styles. Follows the prototype chain, but stops at objects in the core
  // sofar has the properties where fn has been called so far
  pj.Object.__iterAtomicNonstdProperties = function (fn,allowFunctions,isoFar) {
    var soFar = isoFar?isoFar:{};
    if (!this.__inCore || this.__inCore()) return;
    var op = Object.getOwnPropertyNames(this);
    var thisHere = this;
    op.forEach(function (k) {
      if (pj.internal(k) || soFar[k]) return;
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
    if (pj.internal(k)) return false;
    var v = nd[k];
    var tp = typeof v;
    if ((tp === "object" ) && v) {
      return pj.isNode(v) && (v.__parent === nd)  && (v.__name === k);
    } else {
      return true;
    }
  };
  
  // only include atomic properties, or __properties that are proper treeProperties (ie parent child links)
  // exclude internal names too
  pj.ownProperProperties = function (rs,nd) {
    var nms = Object.getOwnPropertyNames(nd);
    nms.forEach(function (nm) {
      if (properProperty(nd,nm,true)) rs[nm] = 1;
    });
    return rs;
  }
  
  // this stops at the core modules (immediate descendants of pj)
  function inheritedProperProperties(rs,nd) {
    if (!nd.__inCore || nd.__inCore()) return;
    var nms = pj.ownProperProperties(rs,nd);
    inheritedProperProperties(rs,Object.getPrototypeOf(nd));
  }
 
 
  
  pj.Object.__iterInheritedItems = function (fn,includeFunctions,alphabetical) {
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
  
  
  
  pj.Array.__iterInheritedItems = function (fn) {
    this.forEach(fn);
    return this;
  }
  
   // is this a property defined in the core modules. 
  pj.Object.__coreProperty = function (p) {
    if (pj.ancestorHasOwnProperty(this,"__builtIn")) {
      return 1;
    }
    if (this.hasOwnProperty(p)) return 0;
    var proto = Object.getPrototypeOf(this);
    var crp = proto.__coreProperty;
    if (crp) {
      return proto.__coreProperty(p);
    }
  }
  
  pj.Array.__coreProperty = function (p) {}

  
  pj.nodeMethod("__inWs",function () {
    if (this === ui.root) return true;
    var pr = this.__get('__parent');
    if (!pr) return false;
    return pr.__inWs();
  });
  
  
  pj.nodeMethod("__treeSize",function () {
    var rs = 1;
    pj.forEachTreeProperty(this,function (x) {
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
  pj.Object.__protoName = function () {
    var p = Object.getPrototypeOf(this);
    var pr = p.__parent; 
    if (!pr) return "";
    if (p.__get('__isType')) {
      var nm = p.name;
      return nm?nm:"";
    }
    return p.__protoName();
  }

  
  pj.Array.__protoName = function () {
    return "Array";
  }

 
 
  pj.Object.__hasTreeProto = function () {
   var pr = Object.getPrototypeOf(this);
   return pr && (pr.__parent);
  }
 
  Function.prototype.__hasTreeProto = function () {return false;}
 
  pj.Array.__hasTreeProto = function () {
    return false;
  }
  
  
  
  // how many days since 7/19/2013
  pj.dayOrdinal = function () {
    var d = new Date();
    var o = Math.floor(d.getTime()/ (1000 * 24 * 3600));
    return o - 15904;
  }
  
  pj.numToLetter = function (n,letterOnly) {
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
  pj.randomName  = function () {
    var rs = "i";
    for (var i=0;i<9;i++) {
      rs += pj.numToLetter(Math.floor(Math.random()*35),1);
    }
    return rs;
  }
 
// omits initial "/"s. Movethis?
pj.pathToString = function (p,sep) {
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


  pj.matchesStart = function (a,b) {
    var ln = a.length;
    if (ln > b.length) return false;
    for (var i=0;i<ln;i++) {
      if (a[i]!==b[i]) return false;
    }
    return true;
  }
    
    
  ui.stripDomainFromUrl = function (url) {
    var r = /^http\:\/\/[^\/]*\/(.*)$/
    var m = url.match(r);
    if (m) {
      return m[1];
    }
  }


ui.displayMessage = function (el,msg,isError){
  el.$show();
  el.$css({color:isError?"red":(msg?"black":"transparent")});
  el.$html(msg);
}


ui.displayError = function(el,msg){
  ui.displayMessage(el,msg,1);
}


ui.displayTemporaryError = function(el,msg,itimeout) {
  var timeout = itimeout?itimeout:2000;
  ui.displayMessage(el,msg,1);
  window.setTimeout(function () {el.$hide();},timeout);
}

//end extract

})(prototypeJungle);