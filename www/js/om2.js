(function (__pj__) {
  
  var om = __pj__.om;

  // the next 2 functions are for debugging
  
  om.findComputed = function (rt) {
    if (!rt) rt = om.root;
    var rs = [];
    var r = function (nd) { //the recursor
      if (nd.__computed__) {
        rs.push(nd);
      } else {
        nd.iterTreeItems(function (nd) {
          r(nd);
        },true); 
      }
    }
    r(nd);
    return rs;
  }
  
  om.showComputed = function () {
    om.root.removeComputed();
    __pj__.svg.refresh();
    setTimeout(function () {
      om.root.deepUpdate(null,om.overrides);
      __pj__.svg.refresh();
    },2000);
  }
    
  om.nodeMethod("removeComputed",function () {
    var thisHere = this;
    if (this.__computed__) {
      console.log("removing ",this.__name__);
      this.remove();
    } else {
      this.iterTreeItems(function (nd,k) {
        if (nd && (typeof nd ==="object")) {
          nd.removeComputed();
        } else if (thisHere.getTransient(k)) {
          delete thisHere[k]
        }
      },false);  
    }
  });


  om.removeValues =  function (x) {
    x.deepApplyMeth("removeValue",null,true); // true means dont stop - recurse past where removeValue works
  }  
  
 
  
  om.arrayToDict = function (a) {
    var rs = {};
    a.forEach(function (k) {rs[k] = 1;});
    return rs;
  }
  
  // doesn't set if not defined
  om.DNode.xferProperty = function (p,src) {
    var v = src[p];
    if (v===undefined) return undefined;
    this[p] = v;
    return v;
  }
  
  
  // if autoConvert then ordinary objects eg {a:1,b:2} are converted to nodes
  // computed fields in their external representation [fn] are always conversted
  om.DNode.setProperties = function (src,props,status,noConvert) {
    if (!src) return;
    if (props) {
      var pd = om.arrayToDict(props);
    }
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        if (props) {
          if (pd[k]===undefined) continue;
        }
        var val = src[k];
        var existingVal = this[k];
        if (existingVal) { // merge if existingVal is a DNode; replace otherwise
          if (om.DNode.isPrototypeOf(existingVal)) {
            existingVal.setProperties(val,props,status,noConvert);
            continue;
          }
        }
        if (val === undefined) continue;
        if (!noConvert) {
          val = om.toNode(val);
        }
        this.set(k,val,status);
      }
    }
    return this;
  }
  
  // used in new<T>type; converts property values to nodes when appropriate
  
  om.DNode.setPropertiesN= function (src,props,status) {
    return this.setProperties(src,props,status,1);
  }
  
  // used in new<T>type ; converts property values to nodes when appropriate
  
  // check that a tree with correct parent pointers and names descends from this node. For debugging.
  om.nodeMethod("checkTree",function () {
    var thisHere = this;
    this.iterTreeItems(function (v,k) {
      if ((v.__parent__) !== thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name__) !== k) om.error(thisHere,v,"bad name");
      v.checkTree();
    },true);
  });
  
  om.nodeMethod("checkAncestry1",function () {
    var pr = this.get("__parent__");
    if (!pr) return;
    var nm = this.__name__;
    if  (pr.get(nm) === this) {
      return pr.checkAncestry1();
    } else {
      return this;
    }
  });
  
  om.checkAncestry = function (x) {
    if (om.isNode(x)) {
      return x.checkAncestry1();
    }
  }
  
  
  
  // gets rid of __parent__ pointers, brings atomic data over from prototypes; no functions
  om.DNode.stripOm = function () {
    var rs = {};
    for (var k in this) {
      if (this.nonAtomicTreeProperty(k)) {
        var kv = this[k];
        rs[k] = kv.stripOm();
      } else {
        kv = this[k];
        var tp = typeof kv;
        if (kv && (tp !== "object") && (tp !== "function")) {
          rs[k] = kv;
        }
      }
    }
    return rs;
  }
  
   om.LNode.stripOm = function () {
    var rs = [];
    var ln = this.length;
    for (var i=0;i<ln;i++) {
      if (this.nonAtomicTreeProperty(i)) {
        var kv = this[i];
        rs.push(kv.stripOm());
      } else {
        kv = this[i];
        var tp = typeof kv;
        if (kv && (tp !== "object") && (tp !== "function")) {
          rs.push(kv);
        }
      }
    }
    return rs;
  }
  
  
  // this functxion stuff is obsolete, I think
// so that we can get the effect of new Function with an arbitrary number of arguments
  om.createJsFunction = (function() {
    function F(args) {
        return Function.apply(this, args);
    }
    F.prototype = Function.prototype;

    return function(args) {
        return new F(args);
    }
})();

  
  om.pw = "vMfm7i1r";
  

  om.parseFunctionText = function (x) {
    xnc = x;
    var r = /\s*function\s*\w*\s*\(([^\)]*)\)/
    var m = xnc.match(r);
    var args = m[1].split(",");
    var idx = xnc.indexOf(")");
    var body = xnc.substring(idx+1);
    var bidx = body.indexOf("{");
    var lbidx = body.lastIndexOf("}");
    var sbd = body.slice(bidx+1,lbidx);
   var allArgs = args.concat(sbd);
    var rs =om.createJsFunction(allArgs);
    return rs;
  }
  
  om.toFunction = function (f) {
    if (typeof(f) !== "function") om.error("Expected function");
    var pt = om.parseFunctionText(f.toString());
    return new om.Function(pt);
  }
  
   // declares something as a type. This makes no difference to anything, except displaying the type of an object in the tree browser
   om.DNode.installType = function (nm,ipr) {
    if (!ipr) {
      var pr = om.DNode.mk();
    } else {
      pr = ipr;
    }
    pr.__isType__ = 1;
    this.set(nm,pr);
    return pr;
    
  }
  
  
  
  om.DNode.namedType = function () { // shows up in the inspector
    this.__isType__ = 1;
    return this;
  }

  // the path of the proto of this fellow
  // if the proto is inside rt, return eg a/b/c ow return /a/b/c
  
  
  om.DNode.protoPath = function (rt) {
    var pr = Object.getPrototypeOf(this);
    var ppr = om.getval(pr,"__parent__");
    if (!ppr) return undefined;
    var rs = om.pathOf(pr,rt);
    return rs;
  }
  
 
  om.DNode.findInheritors = function (iroot) {
    var root=iroot?iroot:om.root;
    var thisHere = this;
    var rs = [];
    function r(d) { // the recursor 
      if (thisHere.isPrototypeOf(d)) {
        rs.push(d);
      }
      d.iterTreeItems(r,true);
    }
    r(root);
    return rs;
  }
  
  om.nodeMethod("get",function (k) { // get without inheritance from proto
    if (this.hasOwnProperty(k)) {
      return this[k];
    }
    return undefined;
  });
  
 

// might be itself
om.DNode.lastProtoInTree = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return this;
  return p.lastProtoInTree();
}


// get the name of the nearest proto declared as atyhpe
 om.DNode.protoName = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent__; 
  if (!pr) return "";
  if (p.get('__isType__')) {
    var nm = p.__name__;
    return nm?nm:"";
  }
  return p.protoName();
  
}



 om.LNode.protoName = function () {
  return "LNode";
 }

 
 
 om.DNode.hasTreeProto = function () {
   var pr = Object.getPrototypeOf(this);
   return pr && (pr.__parent__);
 }
 
 Function.prototype.hasTreeProto = function () {return false;}
 
  om.LNode.hasTreeProto = function () {
    return false;
  }
  
  
  
  
  om.nodeMethod("deepApplyFun", function (fn) {
    fn(this);
    this.iterTreeItems(function (c) {
      c.deepApplyFun(fn);
    },true);
  });
  
  
  
  om.nodeMethod("applyFunToAncestors",function (fn,stopAt) {
    fn(this);
    if (this === stopAt) return;
    var pr = this.__parent__;
    if (pr) {
      pr.applyFunToAncestors(fn,stopAt);
    }
  });
  
  


  om.nodeMethod("deepApplyMeth",function (mth,args,dontStop) { // dontstop recursing once the method applies
    var mthi = om.getMethod(this,mth);
    var keepon = true;
    if (mthi) {
      mthi.apply(this,args);
      if (!dontStop) keepon = false;
    }
    if (keepon) {
      this.iterTreeItems(function (c) {
        c.deepApplyMeth(mth,args,dontStop);
      },true);
    }
  });
   
  
  om.nodeMethod("deepSetProp",function (p,v) {
    this.deepApplyFun(function (nd) {nd[p]=v;});
  });
  
  
  
  om.nodeMethod("deepDeleteProps",function (props) {
    this.deepApplyFun(function (nd) {
      props.forEach(function (p) {
        delete nd[p];
      });
    });
  });
  
  
  
  om.nodeMethod("deepDeleteProp",function (prop) {
    this.deepApplyFun(function (nd) {
      delete nd[prop]
    });
  });
  
  
  om.nodeMethod("setPropForAncestors",function (p,v,stopAt) {
    this.applyFunToAncestors(function (nd) {nd[p]=v;},stopAt);
  });
  
    
  om.nodeMethod("findAncestor",function (fn,rt) {
    if (!rt) rt = om.root;
    if (fn(this)) return this;
    if (this===rt) return undefined;
    var pr = this.__parent__;
    return pr.findAncestor(fn,rt);
  });
  
  // figure out which immediate subtree of the ancestor this belongs to
  om.nodeMethod("findWhichSubtree",function (ancestor) {
    var pr = this.__parent__;
    if (pr === __pj__) {
      return undefined;
    }
    if (pr === ancestor) {
      return this;
    }
    return pr.findWhichSubtree(ancestor);
  });
    
  
  om.nodeMethod("ancestorWithMethod",function (m) {
    return this.findAncestor(function (nd) {
      return om.hasMethod(nd,m);
    });
  });
  
  
  om.nodeMethod("ancestorWithProperty",function (p) {
    return this.findAncestor(function (nd) {
      return !!nd[p];
    });
  });
  
  om.DNode.ancestorSelect = function (p) {
    var anc = this.ancestorWithProperty(p);
    if (anc) {
      return anc[p];
    }
  }
      //code
  // enabling communication around the tree
  om.DNode.callAncestorMethod, function (meth,args) {
    var a = this.ancestorWithMethod(meth);
    if (a) {
      var mim = a[meth];
      return mem.apply(a,args);
    }
  }
  // max,min value of c[fld] for children of this
  om.LNode.maxOrMin= function (fld,isMax) {
    var rs = isMax?-Infinity:Infinity;
    this.forEach(function (v) {
      var f = v[fld];
      if (typeof rs === "number") {
        rs = isMax?Math.max(rs,f):Math.min(rs,f)
      }
    });
    return rs;
  }
  
  
  om.LNode.min = function (fld) {
    return this.maxOrMin(fld,false);
  }
  
  
  
  om.LNode.max = function (fld) {
    return this.maxOrMin(fld,true);
  }
  
  // collect function definitions below this
  om.nodeMethod("funstring1",function (sf,whr) {
    this.iterTreeItems(function (v,k) {
      if (om.isNode(v)) {
        var nwhr = (typeof k=="number")?whr+"["+k+"]":whr+"."+k;
        v.funstring1(sf,nwhr);
      } else {
        if (typeof v === "function") {
          var s = sf[0];
          var fnc = v.toString();//.replace(/(;|\{|\})/g,"$&\n");
          if (typeof k == "number") {
            s += whr+"["+k+"]="+fnc;
          } else {
            s += whr+"."+k+"=" + fnc;
          }
          s += ";\n";
          sf[0] = s;
        }
      }
    })
  });
  
  
  om.mkExecutablePath = function (pth) {
    var rs = "";
    pth.forEach(function (sl) {
      if (typeof sl=="number") {
        rs+="["+sl+"]";
      } else {
        rs += "."+sl;
      }
    });
    return rs;
  }
  
  om.nodeMethod("funstring",function (forAnon) {
    if (forAnon) {
      om.error("OBSOLETE");
      var whr = "prototypeJungle.anon.";
    } else {
      var p = this.pathOf(__pj__);
      var whr ="prototypeJungle"+om.mkExecutablePath(p);
    }
    var rs = ["\n(function () {\nvar item = "+whr+";\n"];
    this.funstring1(rs,"item");
    var rss = rs[0];
    var ps = "/"+p.join("/");
    rss+='prototypeJungle.om.assertCodeLoaded("'+ps+'");\n';
    rss+="})()\n"
    return rss;
  });
  
  
  // assumed: this[k] is defined. Which proto did the value of k come from? 
  om.DNode.findOwner = function (k) {
    var cv = this;
    while (cv) {
      if (cv.hasOwnProperty(k)) return cv;
      cv = Object.getPrototypeOf(cv);
    }
  }
    
  
  // is the value of this[p] inherited from nd[p]?
  om.DNode.inheritsPropertyFrom = function( nd,p) {
    var would = true; // at the moment, we only care if this[p] would be inherited from nd[p], not if it actually does
    if (this === nd) {
      return this.hasOwnProperty(p);
    }
    if (!nd.isPrototypeOf(this)) return false;
    var v = nd[p];
    if (v === undefined) {
      return false;
    }
    var cpr = this;
    while (true) {
      var npr =  Object.getPrototypeOf(cpr);
      if (npr === nd) {
        if (would) {  // this would inherit  from this slot, if it were defined
          return true;
        } else {
          return npr.hasOwnProperty(p);
        }
      }
      cpr = npr;
    }
  }
  
  
  om.LNode.inheritsPropertyFrom = function( nd,p) {
    return false;// no inheritance for LNodes
  }
  
  //does any node in the tree descending from this inherit a property value from nd[p]?
  om.nodeMethod("treeInheritsPropertyFrom",function (nd,p) {
    if (this.inheritsPropertyFrom(nd,p)) return true;
    for (var k in this) {
    if (this.treeProperty(k,true))  {
      var v = this[k];
      if (v.treeInheritsPropertyFrom(nd,p)) return true;
        //code
      }
    }
    return false;
  });
  

  
  // is the value of this[p] inherited from nd[p]?
  
  // is some property among props (an object which has p:1 for each prop p) inherited from nd?
  om.DNode.inheritsSomePropertyFrom = function( nd) {
    // first compute the candidate properties for inheritance.
    if (this===nd) return true;
    if (!nd.isPrototypeOf(this)) return false;
    var props = Object.getOwnPropertyNames(nd);
    var ln = props.length;
    for (var i=0;i<ln;i++) {
      var p = props[i];
      if (!om.internal(p)) {
        if (this.inheritsPropertyFrom(nd,p)) return true;
      }
    }
    return false;
  }

  om.LNode.inheritsSomePropertyFrom = function () {return false;}
  
  om.nodeMethod("treeInheritsSomePropertyFrom",function (nd,p) {
    if (this.inheritsSomePropertyFrom(nd,p)) return true;
    for (var k in this) {
      if (this.treeProperty(k,true))  {
        var v = this[k];
        if (v.treeInheritsSomePropertyFrom(nd,p)) return true;
      }
    }
    return false;
  });
  
  // so LNodes can be included as raw data, in a slot where an evaluatable object might appear instead
  om.LNode.eval = function () {
    return this;
  }
  
  
  om.DNode.createChild = function (k,initFun){
    var rs = this[k];
    if (rs) return rs;
    rs = initFun();
    this.set(k,rs);
    return rs;
  }
  
  

  om.defineFieldAnnotation = function (functionName,fieldName) {
    om.DNode["get"+functionName] = function (k) {
      var nm = fieldName+k;
      return this[nm];
    };
    om.DNode["set"+functionName] = function (k,v) {
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
    om.LNode["get"+functionName] = function (k){}
  }
  
  
  om.defineFieldAnnotation("Note","__note__");
    om.defineFieldAnnotation("Transient","__transient__");// set by update, or otherwise not worth saving 

  om.defineFieldAnnotation("FieldType","__fieldType__");

  om.defineFieldAnnotation("FieldStatus","__status__");
// functions are invisible in the browser by default
    om.defineFieldAnnotation("vis","__visible__");
  om.defineFieldAnnotation("RequiresUpdate","__requiresUpdate__");
  

  // lib is the library where defined, fn is the function name
  // optionally evName is the name of the event to report up th
  om.DNode.setInputF = function (k,lib,fn,eventName) {
    // two schemes. The input function might be in one of the standard libraries like geom, and then lib is the path of the library
    // and fn is the name of the function.
    // Or the function itself might appear as the value. This second scheme is not fully implemented, and not yet in use.
  
    var nm = "__inputFunction__"+k;
    if (arguments.length>=3) {
      var pth = om.pathToString(lib.pathOf(__pj__));

      var fpth = pth+"/"+fn;
      if (eventName) {
        fpth += "."+eventName;
      }
      this[nm] = fpth;
    } else {// this scheme is not fully implemented, and not yet in use
      //lib is the fn;
      this[nm] = lib;
    }
  }
  
  om.DNode.applyInputF = function(k,vl) {
    var nm = "__inputFunction__"+k;
    var pth = this[nm];
    if (pth) {
      if (typeof pth==="string") {
        var eventName = om.afterChar(pth,".");
        if (eventName) {
          var fpath = om.beforeChar(pth,".");
        } else {
          fpath = pth;
        }
        var fn = om.evalPath(__pj__,fpath);
        if (fn) {
          return fn(vl,this,k,eventName);
        }
      }
    }
    return pth;
  }
  
  
  om.LNode.getInputF = function (k) {
    return undefined;
  }
  
  
  
  om.DNode.setOutputF = function (k,lib,fn) {
    var nm = "__outputFunction__"+k;
    var pth = om.pathToString(lib.pathOf(__pj__));
    var fpth = pth+"/"+fn;    
    this[nm] = fpth;
  }
  
  
  
  om.DNode.getOutputF = function (k) {
    var nm = "__outputFunction__"+k;
    var pth = this[nm];
    if (pth) return om.evalPath(__pj__,pth);
  }
  
  om.LNode.getOutputF = function (k) {
    return undefined;
  }
  
 
  // get from the prototype chain, but before you hit DNode itself
  
  om.DNode.getBeforeDNode = function (k) {
    if (this === om.DNode) return undefined;
    var rs = this.get(k);
    if (rs !== undefined) return rs;
    var p = Object.getPrototypeOf(this);
    return p.getBeforeDNode(k);
  }
  
  
  
  

  
  om.DNode.applyOutputF = function(k,v) {
    var outf = this.getOutputF(k);
    if (outf) {
      return outf(v,this);
    } else {
      return v;
    }
  }
  
  om.LNode.applyOutputF  = function (k,v) { return v;}
  
 
 
 // rules for update. What we want is that when the user modifies things by hand, they should not be overwrittenn by update. Also, manual overrides
 // should be saved so that they can be reinstalled. Generally update operations should only create nodes if they are not already present,
 // and only set those fields as necessary.  Every node that is created by update should be marked __computed__ (or should have an ancestor marked __computed__).
 // A node that is not open to manipulation by hand should be marked __mfrozen__ (or should have an ancestor marked __mfrozen__).
 // If only some fields of a node are to be shielded from manipulation, they should be mfrozen via the operation .setFieldStatus(fieldName,"mfrozen")
  
  
  om.nodeMethod("isComputed",function () {
   if (this.__computed__) return true;
   if (this === __pj__) return false;
   return this.__parent__.isComputed();
  });
  
  
  om.nodeMethod("isMfrozen",function () {
   if (this.__mfrozen__) return true;
   if (this === __pj__) return false;
   return this.__parent__.isMfrozen();
  });
  
 
  
 
  
 // the form of status might be "mfrozen <function that did the setting>"
  om.DNode.fieldIsFrozen = function (k) {
    if (this.isMfrozen()) return true;
    var status = this.getFieldStatus(k);
    return status && (status.indexOf('mfrozen') === 0);
  }
  
  om.LNode.fieldIsFrozen  = function (){return false;}
 
 
  
  // hidden in the tree browser
  om.nodeMethod("isThidden",function () {
   if (this.__tHidden__) return true;
   if (this === __pj__) return false;
   return this.__parent__.isThidden();
  });
  
   om.DNode.fieldIsThidden = function (k) {
    if (this.isThidden()) return true;
    var status = this.getFieldStatus(k);
    return status  === "tHidden";
  }
  
    om.LNode.fieldIsHidden  = function (){return false;}

  
 // When a computed node nd is modified by hand, nd.set
 // the fields of an object might have a status. The possibilities are "mfrozen" "computed" "overridden"
 // For the case of mfrozen and computed, the value of the field has been set by the update operation. In
 // the former case the intention is that it never be manually overriden,  and the latter that it is open to this.
 // "overriden" is the status of a field that has been subject to a manual override. Updates don't touch overriden fields
 
 // Here are the detailed rules. The update computation can mark whole objects as __mfrozen__. If it marks them as __computed__
 // this means that when its descendant fields are edited manually, those fields are marked as "overridden", and protected
 // from later interference by update, and also saved off amont the overrides when the item is saved (the overrid)

  
  
  
  
  
  om.nodeMethod("installOverrides",function (ovr) {
    for (var k in ovr) {
      var v = ovr[k];
      if (om.isObject(v)) {
        var nv = this[k];
        if (om.isNode(nv)) {
          nv.installOverrides(v);
        }
      } else {
        this[k] = v;
      }
    }
  });
  

  
  // change reporting mechanism: for reporting up the tree when a field changes. This function takes
  // a field name k, and an object containing the field , and sees if there a listener up the tree, fieldListers[k]
  // and if so invokes it
  // it might also be relevant to identify what is changed from the node in a way that the container knows how to do,
  // but the listerer. Doesn't. So, look for a changeIdentifier up the tree too, and apply that if found.
  // the changeName might be different from k, eg "colorChange" 
  
  // a listener set is a dnode, not an lnode, because we need it to inherit prototypically
  
  om.changeReporter = function (vl,nd,k,eventName) { // this is attached using setInputF
    var evn = eventName?eventName:k;
    var nm = evn;
    var anc = nd.ancestorWithProperty("__listeners__");
    if (anc) {
      var chi = nd.ancestorWithProperty("changeIdentifier");
      if (chi) {
        var ch = chi.changeIdentifier(nd,eventName);
      } else {
        ch = nd;
      }
      var fns = anc.__listeners__[nm];
      for (var j in fns) { //@todo this should not include props from standard modules, but harmless because of the __v__ check
        if (om.beginsWith(j,"__v__")) {
          var fn = fns[j];
          fn(anc,ch,vl,eventName);
        }
      }
    }
    return vl;
  }
 
  om.DNode.reportChange = function (k,eventName) {
    this.setInputF(k,om,"changeReporter",eventName);
  }
  
  om.DNode.setListener = function (evn,fn) {
    var lst = this.setIfMissing("__listeners__");
    lst.set(evn,om.lift({"__v__0":fn}));
  }
  
  
  
  om.onChangeAction = function (vl,nd,k,methodName) { // this is attached using setInputF
    var mth = nd[methodName];
    if (!mth) return vl;
    nd[k] = vl;
    mth.call(nd,k);
    return vl;
  }
  
 
  
  om.DNode.onChange = function (k,methodName) {
    this.setInputF(k,om,"onChangeAction",methodName);
  }
  
  // a set of objects, each associated with data.  The members might be an LNode or a DNode
  
  om.DNode.setIfExternal = function (nm,vl) { // adopts vl below this if it is not already in the pj tree,ow just refers
    var tp = typeof vl;
    if ((tp === "object") && vl && vl.get("__parent__")) {
      this[nm] = vl;
    } else {
      this.set(nm,vl);
    }
    return vl;
  }
  
  
  __pj__.callback = function (rs) {
    om.loadDataCallback(rs);
    } 
  
  om.loadData = function(iurl,cb) {// get the static list for the pj tree
    om.tlog("starting load of data from "+url);
    var thisHere = this;
    om.loadDataCallback = cb;
    var url = om.toItemDomain(iurl);
    om.tlog("starting load of data from "+url);

    $.ajax({
   type: 'GET',
    url: url,
    async: false,
    jsonpCallback: 'callback',
    contentType: "application/json",
    dataType: 'jsonp',
    success: function(json) {
      om.tlog("done loading data");
      cb(undefined,json);
    },
    error: function(e) {
      if (e.status === 404) {
        e.message = "404 Not Found";
      } else {
        e.message = e.statusText;
      }
      om.log("loadData",e.message);
      cb(e);
    }
  });
  }
 
  
  om.twoArraysForEach = function (a0,a1,f) {
    var ln = Math.min(a0.length,a1.length);
    for (var i=0;i<ln;i++) {
      f(a0[i],a1[i]);
    }
  }
    // the lnodeIndex of an item is its index in the nearest containing LNode

  om.DNode.lnodeIndex = function () {
    var pr = this.__parent__;
    if (!pr || (pr === __pj__)) {
      return;
    }
    if (om.LNode.isPrototypeOf(pr)) {
      return this.__name__;
    }
    if (pr) {
      return pr.lnodeIndex();
    }
  }

  om.DNode.update = function () {} //bac
  
  om.nodeMethod("inWs",function () {
    if (this === om.root) return true;
    var pr = this.get("__parent__");
    if (!pr) return false;
    return pr.inWs();
  });
  
  om.nodeMethod("nthAncestor",function (n) {
    var cv = this;
    for (var i=0;i<n;i++) {
      var cv = cv.__parent__;
      if (!cv) return undefined;
    }
    return cv;
  });
  
  
  om.nodeMethod("treeSize",function (excludeProperties) {
    var rs = 1;
    this.iterTreeItems(function (x) {
      if (x && (typeof x==="object")) {
        if (x.treeSize) {
          rs = rs + x.treeSize() + 1;
        } else {
          var hmmm = 1;
        }
      } else {
        rs++;
      }
    },false,excludeProperties);
    return rs;
  });
  
  
  
  om.objectsModifiedCallbacks = [];
  
  om.objectsModified = function() {
    om.root.__objectsModified__ = 1;
    om.objectsModifiedCallbacks.forEach(function (fn) {fn()});
  }
   
   // takes a path like sys/repo0/whatever or /sys/repo0/whatever and returns sys/repo 
  om.repoFromPath = function (path) {
    var sts = path[0]==='/';
    var sp = path.split("/");
    return sts?sp[1]+"/"+sp[2]:sp[0]+"/"+sp[1];
  }
  
  // assumes starts with /x/handle/repo ...
  
   om.repoFromPjPath = function (path) {
    var sp = path.split("/");
    return sp[2]+"/"+sp[3];
  }
  
  
})(prototypeJungle);

