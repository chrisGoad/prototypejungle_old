

(function (pj) {
"use strict";

var dom = pj.dom;
var ui = pj.ui;
var geom  = pj.geom;
var dat = pj.data;
var svg = pj.svg;
var html = pj.html;
var fb = pj.fb;

// This is one of the code files assembled into pjui.js. 

pj.defineFieldAnnotation("Note");

ui.setNote = function (nd,prop,nt) {
  nd.__setNote(prop,nt);
}



pj.defineFieldAnnotation("FieldType");

pj.defineFieldAnnotation('UIStatus'); // the status of this field
pj.defineFieldAnnotation('InstanceUIStatus');// the status of fields that inherit from this one - ie properties of instances.
pj.defineFieldAnnotation("UIWatched");
  
 
  
// when a mark is instantiated, some of its fields are should not be modified in the instance,
// though they may be in the prototype
  
pj.Object.__fieldIsHidden = function (k) {
  var status,proto,istatus;
  if (pj.ancestorHasOwnProperty(this,"__hidden")) return true;
  if (this.__mark) {
    proto = Object.getPrototypeOf(this);
    istatus = proto.__getInstanceUIStatus(k);
    if (istatus === 'hidden') return true;
    if (istatus !== undefined) return false;
  }
  status = this.__getUIStatus(k);
  return status  === "hidden";
}

pj.Object.__fieldIsFrozen = function (k) {
  var status,proto;
  if (ui.devNotSignedIn) {  // dev mode, no draw, no edit either 
    return true;
  }
  if (pj.ancestorHasOwnProperty(this,"__frozen")) return true;
  status = this.__getUIStatus(k);
  if (status === "liquid") {
    return false;
  }
  if (k && (!this.__mark)&& (!this.__markProto) && pj.isComputed(this,k)) {
    return true;
  }
  if (status === "frozen") {
    return true;
  }
  proto = Object.getPrototypeOf(this);
  status = proto.__getInstanceUIStatus(k);
  return (status === 'frozen');
}
 
/* a field can be frozen, liquid, hidden, (or neither).  Hidden fields do not even appear in the UI.
*  frozen fields cannot be modified from the UI. liquid fields can be modified
*  from the UI even if they are fields of computed values.
*/
  
ui.freeze = function (nd,flds) {
  var tpf = typeof flds;
  if (tpf==="undefined") {
    nd.__frozen__ = true;
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
    nd.__frozen__ = true;
  } else if (tpf==="string") {
    nd.__setInstanceUIStatus(flds,"frozen");
  } else {
    flds.forEach(function (k) {
      nd.__setInstanceUIStatus(k,"frozen");
   });
  }
}
/*
 * melt is used to allow access to properties of marks, all of whose properties are
 * frozen by default (since they are computed)
 */
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


ui.show = function (nd,flds) {
  if (typeof flds === "string") {
    nd.__setUIStatus(flds,"shown");
  } else {
    flds.forEach(function (k) {
      nd.__setUIStatus(k,"shown");
   });
  }
}

var propertiesExcept = function (nd,flds) {
  var fob = {};
  var allProps = pj.treeProperties(nd,true);
  var rs = [];
  flds.forEach(function (f) {
    fob[f] = true;
  })
  allProps.forEach(function (p) {
    if (!fob[p]) {
      rs.push(p);
    }
  });
  return rs;
}
ui.hideExcept = function (nd,flds) {
  ui.hide(nd,propertiesExcept(nd,flds));
}

ui.freezeExcept = function (nd,flds) {
  ui.freeze(nd,propertiesExcept(nd,flds));
}
  
  
ui.hideInInstance = function (nd,flds) {
  var tpf = typeof flds;
  if (tpf==="undefined") {
    nd.__frozen__ = true;
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
  var pth = pj.pathToString(lib.__pathOf(pj));
  var fpth = pth+"/"+fn;
  this.__setOutF(k,fpth);
}


pj.Object.__getOutputF = function (k) {
  var pth = this.__getOutF(k);
  if (pth) return pj.__evalPath(pj,pth);
}

pj.Array.__getOutputF = function (k) {
  return undefined;
}
  
  
pj.applyOutputF = function(nd,k,v) {
  var outf,ftp;
  if (pj.Array.isPrototypeOf(nd)) {
    return v;
  }
  outf = nd.__getOutputF(k);
  if (outf) {
    return outf(v,nd);
  } else {
    ftp = nd.__getFieldType(k);
    return v;
  }
}

pj.applyInputF = function(nd,k,vl) {
  var ftp = nd.__getFieldType(k);
  var cv,n;
  if (ftp === 'boolean') { 
    if ((typeof vl === "string") && ($.trim(vl) === 'false')) {
      return false;
    }
    return Boolean(vl);
  }
  cv = nd[k];  
  if (typeof cv === "number") {
    n = parseFloat(vl);
    if (!isNaN(n)) {
      return n;
    }
  }
  return vl;
}
  
  
  
  ui.objectsModifiedCallbacks = [];
  
  ui.assertObjectsModified = function() {
    pj.root.__objectsModified = true;
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
   var pr;
   if (this === rt) return undefined;
   pr = this.__get('__parent');
   if (!pr) return undefined;
   if (pr === rt) return this.name;
   return pr.__topAncestorName(rt);
 });
 
  
// used eg for iterating through styles. Follows the prototype chain, but stops at objects in the core
// sofar has the properties where fn has been called so far
pj.Object.__iterAtomicNonstdProperties = function (fn,allowFunctions,isoFar) {
  var soFar = isoFar?isoFar:{};
  var op,thisHere,pr;
  if (!this.__inCore || this.__inCore()) return;
  op = Object.getOwnPropertyNames(this);
  var thisHere = this;
  forEach(function (k) {
    var v,tpv;
    if (pj.internal(k) || soFar[k]) return;
    soFar[k] = true;
    v = thisHere[k];
    tpv = typeof v;
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
   var v,tp;
   if (!knownOwn &&  !nd.hasOwnProperty(k)) return false;
   if (pj.internal(k)) return false;
   v = nd[k];
   tp = typeof v;
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
  var nms;
  if (!nd.__inCore || nd.__inCore()) return;
  nms = pj.ownProperProperties(rs,nd);
  inheritedProperProperties(rs,Object.getPrototypeOf(nd));
}
 
 
  
pj.Object.__iterInheritedItems = function (fn,includeFunctions,alphabetical) {
  var thisHere = this,ip,keys;
  function perKey(k) {
    var kv = thisHere[k];
    if ((includeFunctions || (typeof kv != "function")) ) {
      fn(kv,k);
    }
  }
  ip = {};
  inheritedProperProperties(ip,this);
  keys = Object.getOwnPropertyNames(ip);
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
   var proto,crp;
   if (pj.ancestorHasOwnProperty(this,"__builtIn")) {
     return true;
   }
   if (this.hasOwnProperty(p)) return false;
   proto = Object.getPrototypeOf(this);
   crp = proto.__coreProperty;
   if (crp) {
     return proto.__coreProperty(p);
   }
 }
 
 pj.Array.__coreProperty = function (p) {}

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
  var rs,nm;
  if (!pr) return "";
  if (p.__get('__isType')) {
    var nm = p.__name;
    rs = nm?nm:"";
  } else {
    rs = p.__protoName();
  }
  return rs;

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
  var a;
  if (n < 10) {
    if (letterOnly) {
      a = 97+n;
    } else {
      a = 48 + n;
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
  var rs,ln,rs,e;
  if (!sep) sep = "/";
  ln = p.length;
  if (sep===".") {
    rs = p[0];
    for (var i=1;i<ln;i++) {
      e = p[i];
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
  var i;
  if (ln > b.length) return false;
  for (i=0;i<ln;i++) {
    if (a[i]!==b[i]) return false;
  }
  return true;
}
  
    
ui.stripDomainFromUrl = function (url) {
  var r = /^http\:\/\/[^\/]*\/(.*)$/
  var m = url.match(r);
  return m?m[1]:m;
}

ui.stripPrototypeJungleDomain = function (url) {
  if (pj.beginsWith(url,'http://')) {
    if (pj.beginsWith(url,'http://prototypejungle.org/')) {
      return url.substr(26);
    }  else {
      return undefined;
    }
  } else {
    return url;
  }
}

ui.displayMessage = function (el,msg,isError){
  el.$show();
  el.$css({color:isError?"red":(msg?"black":"transparent")});
  el.$html(msg);
}


ui.displayError = function(el,msg){
  ui.displayMessage(el,msg,true);
}

ui.displayTemporaryError = function(el,msg,itimeout) {
  var timeout = itimeout?itimeout:2000;
  ui.displayMessage(el,msg,true);
  window.setTimeout(function () {el.$hide();},timeout);
}
