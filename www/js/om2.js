(function (__pj__) {
  
  var om = __pj__.om;

  // the next 2 functions are for debugging
  
  om.findComputed = function (rt) {
    if (!rt) rt = om.root;
    var rs = [];
    var r = function (nd) { //the recursor
      if (nd.computed) {
        rs.push(nd);
      } else {
        nd.__iterTreeItems(function (nd) {
          r(nd);
        },true); 
      }
    }
    r(nd);
    return rs;
  }
  
  om.showComputed = function () {
    om.root.__removeComputed();
    __pj__.svg.refresh();
    setTimeout(function () {
      om.root.deepUpdate(null,om.overrides);
      __pj__.svg.refresh();
    },2000);
  }
    
  om.nodeMethod("__removeComputed",function () {
    var thisHere = this;
    if (this.computed) {
      console.log("removing ",this.__name);
      this.remove();
    } else {
      this.__iterTreeItems(function (nd,k) {
        if (nd && (typeof nd ==="object")) {
          nd.__removeComputed();
        } else if (thisHere._getTransient(k)) {
          delete thisHere[k]
        }
      },false);  
    }
  });


  om.removeValues =  function (x) {
    x.__deepApplyMeth("removeValue",null,true); // true means dont stop - recurse past where removeValue works
  }  
  
 
  
  om.arrayToDict = function (a) {
    var rs = {};
    a.forEach(function (k) {rs[k] = 1;});
    return rs;
  }
  
  // doesn't set if not defined
  om.DNode.__xferProperty = function (p,src) {
    var v = src[p];
    if (v===undefined) return undefined;
    this[p] = v;
    return v;
  }
  
  
  // if autoConvert then ordinary objects eg {a:1,b:2} are converted to nodes
  // computed fields in their external representation [fn] are always conversted
  om.DNode.__setProperties = function (src,props,status,noConvert) {
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
            existingVal.__setProperties(val,props,status,noConvert);
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
  
  // used in new<T>type; converts property __values to nodes when appropriate
  
  om.DNode.__setPropertiesN= function (src,props,status) {
    return this.__setProperties(src,props,status,1);
  }
  
  // used in new<T>type ; converts property __values to nodes when appropriate
  
  // check that a tree with correct parent pointers and names descends from this node. For debugging.
  om.nodeMethod("__checkTree",function () {
    var thisHere = this;
    this.__iterTreeItems(function (v,k) {
      if ((v.__parent) !== thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name) !== k) om.error(thisHere,v,"bad name");
      v.__checkTree();
    },true);
  });
  
  om.nodeMethod("__checkAncestry1",function () {
    var pr = this.__get("__parent");
    if (!pr) return;
    var nm = this.__name;
    if  (pr.__get(nm) === this) {
      return pr.__checkAncestry1();
    } else {
      return this;
    }
  });
  
  om.checkAncestry = function (x) {
    if (om.isNode(x)) {
      return x.__checkAncestry1();
    }
  }
  
  
  
  // gets rid of __parent pointers, brings atomic data over from prototypes; no functions
  om.DNode.__stripOm = function () {
    var rs = {};
    for (var k in this) {
      if (this.__nonAtomicTreeProperty(k)) {
        var kv = this[k];
        rs[k] = kv.__stripOm();
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
  
   om.LNode.__stripOm = function () {
    var rs = [];
    var ln = this.length;
    for (var i=0;i<ln;i++) {
      if (this.__nonAtomicTreeProperty(i)) {
        var kv = this[i];
        rs.push(kv.__stripOm());
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
// so that we can __get the effect of new Function with an arbitrary number of arguments
  om.createJsFunctionObsolete= (function() {
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
   om.DNode.__installType = function (nm,ipr) {
    if (!ipr) {
      var pr = om.DNode.mk();
    } else {
      pr = ipr;
    }
    pr.__isType = 1;
    this.set(nm,pr);
    return pr;
    
  }
  
  
  
  om.DNode.namedType = function () { // shows up in the inspector
    this.__isType = 1;
    return this;
  }

  // the path of the proto of this fellow
  // if the proto is inside rt, return eg a/b/c ow return /a/b/c
  
  
  om.DNode.__protoPath = function (rt) {
    var pr = Object.getPrototypeOf(this);
    var ppr = om.getval(pr,"__parent");
    if (!ppr) return undefined;
    var rs = om.__pathOf(pr,rt);
    return rs;
  }
  
 
  om.DNode.__findInheritors = function (iroot) {
    var root=iroot?iroot:om.root;
    var thisHere = this;
    var rs = [];
    function r(d) { // the recursor 
      if (thisHere.isPrototypeOf(d)) {
        rs.push(d);
      }
      d.__iterTreeItems(r,true);
    }
    r(root);
    return rs;
  }
  
  om.nodeMethod("__get",function (k) { // __get without inheritance from proto
    if (this.hasOwnProperty(k)) {
      return this[k];
    }
    return undefined;
  });
  
 

// might be itself
om.DNode.__lastProtoInTree = function () {
  var p = Object.getPrototypeOf(this);
  var pr = p.__parent; 
  if (!pr) return this;
  return p.__lastProtoInTree();
}


// __get the name of the nearest proto declared as atyhpe
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
  
  
  
  
  om.nodeMethod("__deepApplyFun", function (fn) {
    fn(this);
    this.__iterTreeItems(function (c) {
      c.__deepApplyFun(fn);
    },true);
  });
  
  om.__deepApplyFun = function (nd,fn) {
    fn(nd);
    om.__iterTreeItems(nd,function (c) {
      om.__deepApplyFun(c,fn);
    },true);
  }
    
  
  om.nodeMethod("__applyFunToAncestors",function (fn,stopAt) {
    fn(this);
    if (this === stopAt) return;
    var pr = this.__parent;
    if (pr) {
      pr.__applyFunToAncestors(fn,stopAt);
    }
  });
  
  


  om.nodeMethod("__deepApplyMeth",function (mth,args,dontStop) { // dontstop recursing once the method applies
    var mthi = om.__getMethod(this,mth);
    var keepon = true;
    if (mthi) {
      mthi.apply(this,args);
      if (!dontStop) keepon = false;
    }
    if (keepon) {
      this.__iterTreeItems(function (c) {
        c.__deepApplyMeth(mth,args,dontStop);
      },true);
    }
  });
   
  
  om.nodeMethod("__deepSetProp",function (p,v) {
    this.__deepApplyFun(function (nd) {nd[p]=v;});
  });
  
  
  
  om.nodeMethod("__deepDeleteProps",function (props) {
    this.__deepApplyFun(function (nd) {
      props.forEach(function (p) {
        delete nd[p];
      });
    });
  });
  
  
  
  om.nodeMethod("__deepDeleteProp",function (prop) {
    this.__deepApplyFun(function (nd) {
      delete nd[prop]
    });
  });
  
  
  om.nodeMethod("__setPropForAncestors",function (p,v,stopAt) {
    this.__applyFunToAncestors(function (nd) {nd[p]=v;},stopAt);
  });
  
    
  om.findAncestor = function (nd,fn,rt) {
    if (!rt) rt = om.root;
    if (fn(nd)) return nd;
    if (nd===rt) return undefined;
    var pr = nd.__parent;
    return om.findAncestor(pr,fn,rt);
  }
  
  // figure out which immediate subtree of the ancestor this belongs to
  om.nodeMethod("__findWhichSubtree",function (ancestor) {
    om.error("Obsolete");
    var pr = this.__parent;
    if (pr === __pj__) {
      return undefined;
    }
    if (pr === ancestor) {
      return this;
    }
    return pr.__findWhichSubtree(ancestor);
  });
    
  
  om.ancestorWithMethod = function (nd,m) {
    return om.findAncestor(nd,function (nd) {
      return om.hasMethod(nd,m);
    });
  }
  
  
  om.nodeMethod("__ancestorWithProperty",function (p) {
    return om.findAncestor(this,function (nd) {
      return !!nd[p];
    });
  });
  

  // enabling communication around the tree
  om.DNode.callAncestorMethod, function (meth,args) {
    var a = om.ancestorWithMethod(this,meth);
    if (a) {
      var mim = a[meth];
      return mem.apply(a,args);
    }
  }
  // max,min value of c[fld] for __children of this
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
  om.nodeMethod("__funstring1",function (sf,whr) {
    this.__iterTreeItems(function (v,k) {
      if (om.isNode(v)) {
        var nwhr = (typeof k=="number")?whr+"["+k+"]":whr+"."+k;
        v.__funstring1(sf,nwhr);
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
  
  om.nodeMethod("__funstring",function (forAnon) {
    if (forAnon) {
      om.error("OBSOLETE");
      var whr = "prototypeJungle.anon.";
    } else {
      var p = this.__pathOf(__pj__);
      var whr ="prototypeJungle"+om.mkExecutablePath(p);
    }
    var rs = ["\n(function () {\nvar item = "+whr+";\n"];
    this.__funstring1(rs,"item");
    var rss = rs[0];
    var ps = "/"+p.join("/");
    rss+='prototypeJungle.om.assertCodeLoaded("'+ps+'");\n';
    rss+="})()\n"
    return rss;
  });
  
  
  // assumed: this[k] is defined. Which proto did the value of k come from? 
  om.DNode.__findOwner = function (k) {
    var cv = this;
    while (cv) {
      if (cv.hasOwnProperty(k)) return cv;
      cv = Object.getPrototypeOf(cv);
    }
  }
    
  
  // is the value of this[p] inherited from nd[p]?
  om.DNode.__inheritsPropertyFrom = function( nd,p) {
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
  
  
  om.LNode.__inheritsPropertyFrom = function( nd,p) {
    return false;// no inheritance for LNodes
  }
  
  //does any node in the tree descending from this inherit a property value from nd[p]?
  om.nodeMethod("__treeInheritsPropertyFrom",function (nd,p) {
    if (this.__inheritsPropertyFrom(nd,p)) return true;
    for (var k in this) {
    if (om.treeProperty(this,k,true))  {
      var v = this[k];
      if (v.__treeInheritsPropertyFrom(nd,p)) return true;
        //code
      }
    }
    return false;
  });
  

  
  // is the value of this[p] inherited from nd[p]?
  
  // is some property among props (an object which has p:1 for each prop p) inherited from nd?
  om.DNode.__inheritsSomePropertyFrom = function( nd) {
    // first compute the candidate __properties for inheritance.
    if (this===nd) return true;
    if (!nd.isPrototypeOf(this)) return false;
    var props = Object.getOwnPropertyNames(nd);
    var ln = props.length;
    for (var i=0;i<ln;i++) {
      var p = props[i];
      if (!om.internal(p)) {
        if (this.__inheritsPropertyFrom(nd,p)) return true;
      }
    }
    return false;
  }

  om.LNode.__inheritsSomePropertyFrom = function () {return false;}
  
  om.nodeMethod("__treeInheritsSomePropertyFrom",function (nd,p) {
    if (this.__inheritsSomePropertyFrom(nd,p)) return true;
    for (var k in this) {
      if (om.treeProperty(this,k,true))  {
        var v = this[k];
        if (v.__treeInheritsSomePropertyFrom(nd,p)) return true;
      }
    }
    return false;
  });
  
  // so LNodes can be included as raw data, in a slot where an evaluatable object might appear instead
  om.LNode.eval = function () {
    return this;
  }
  
  
  om.DNode.__createChild = function (k,initFun){
    var rs = this[k];
    if (rs) return rs;
    rs = initFun();
    this.set(k,rs);
    return rs;
  }
  
  

  
  om.defineFieldAnnotation = function (functionName,fieldName) {
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
  
  

  om.defineFieldAnnotation("Note","__note");
    om.defineFieldAnnotation("Transient","__transient__");// set by update, or otherwise not worth saving 

  om.defineFieldAnnotation("FieldType","__fieldType");

  om.defineFieldAnnotation("FieldStatus","__status");
  // functions are invisible in the browser by default
    om.defineFieldAnnotation("vis","__visible");
  om.defineFieldAnnotation("RequiresUpdate","__requiresUpdate");
  
  om.DNode.__requiresUpdate = function (k) {
    if (typeof k === "string") {
      this.__setRequiresUpdate(k,1);
    } else {
      var thisHere = this;
      k.forEach(function (j) {
        thisHere.__setRequiresUpdate(j,1);
      });
    }
  }
  
  om.DNode.Iwatch = om.DNode.__requiresUpdate;
  
  om.DNode.setNote = om.DNode.__setNote;
  
  // lib is the library where defined, fn is the function name
  // optionally evName is the name of the event to report up th
  om.DNode.__setInputF = function (k,lib,fn,eventName) {
    // two schemes. The input function might be in one of the standard libraries like geom, and then lib is the path of the library
    // and fn is the name of the function.
    // Or the function itself might appear as the value. This second scheme is not fully implemented, and not yet in use.
  
    var nm = "_inputFunction_"+k;
    if (arguments.length>=3) {
      var pth = om.pathToString(lib.__pathOf(__pj__));

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
  
  om.DNode.__applyInputF = function(k,vl) {
    var nm = "_inputFunction_"+k;
    var pth = this[nm];
    if (pth) {
      if (typeof pth==="string") {
        var eventName = om.afterChar(pth,".");
        if (eventName) {
          var fpath = om.beforeChar(pth,".");
        } else {
          fpath = pth;
        }
        var fn = om.__evalPath(__pj__,fpath);
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
  
  
  
  om.DNode.__setOutputF = function (k,lib,fn) {
    var nm = "_outputFunction_"+k;
    var pth = om.pathToString(lib.__pathOf(__pj__));
    var fpth = pth+"/"+fn;    
    this[nm] = fpth;
  }
  
  
  
  om.DNode.__getOutputF = function (k) {
    var nm = "_outputFunction_"+k;
    var pth = this[nm];
    if (pth) return om.__evalPath(__pj__,pth);
  }
  
  om.LNode.__getOutputF = function (k) {
    return undefined;
  }
  
 
  // __get from the prototype chain, but before you hit DNode itself
  
  om.DNode.__getBeforeDNode = function (k) {
    if (this === om.DNode) return undefined;
    var rs = this.__get(k);
    if (rs !== undefined) return rs;
    var p = Object.getPrototypeOf(this);
    return p.__getBeforeDNode(k);
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
  
 
 
 // rules for update. What we want is that when the user modifies things by hand, they should not be overwrittenn by update. Also, manual overrides
 // should be saved so that they can be reinstalled. Generally update operations should only create nodes if they are not already present,
 // and only set those fields as necessary.  Every node that is created by update should be marked computed (or should have an ancestor marked computed).
 // A node that is not open to manipulation by hand should be marked __mfrozen (or should have an ancestor marked __mfrozen).
 // If only some fields of a node are to be shielded from manipulation, they should be mfrozen via the operation .__setFieldStatus(fieldName,"mfrozen")
  
  
  om.nodeMethod("__isComputed",function () {
   if (this.computed) return true;
   if (this === __pj__) return false;
   return this.__parent.__isComputed();
  });
  
  
  om.nodeMethod("__isMfrozen",function () {
   if (this.__mfrozen) return true;
   if (this === __pj__) return false;
   return this.__parent.__isMfrozen();
  });
  
 
  
 
  
 // the form of status might be "mfrozen <function that did the setting>"
  om.DNode.__fieldIsFrozen = function (k) {
    if (this.__isMfrozen()) return true;
    var status = this.__getFieldStatus(k);
    return status && (status.indexOf('mfrozen') === 0);
  }
  
  
  om.LNode.__fieldIsFrozen  = function (){return false;}
 
 
  
  // hidden in the tree browser
  om.nodeMethod("__isThidden",function () {
   if (this.__tHidden) return true;
   if (this === __pj__) return false;
   return this.__parent.__isThidden();
  });
  
   om.DNode.__fieldIsThidden = function (k) {
    if (this.__isThidden()) return true;
    var status = this.__getFieldStatus(k);
    return status  === "tHidden";
  }
  
    om.LNode.fieldIsHidden  = function (){return false;}

  
 // When a computed node nd is modified by hand, nd.set
 // the fields of an object might have a status. The possibilities are "mfrozen" "computed" "overridden"
 // For the case of mfrozen and computed, the value of the field has been set by the update operation. In
 // the former case the intention is that it never be manually overriden,  and the latter that it is open to this.
 // "overriden" is the status of a field that has been subject to a manual override. Updates don't touch overriden fields
 
 // Here are the detailed rules. The update computation can mark whole objects as __mfrozen. If it marks them as computed
 // this means that when its descendant fields are edited manually, those fields are marked as "overridden", and protected
 // from later interference by update, and also saved off amont the overrides when the item is saved (the overrid)

  
  
  
  
  // overrides sometimes need to be installed via running an update in their nearest parent with this method
  var updateParents = {};
  var installOverridesTop; // the top level node upon which this method is called
  om.nodeMethod("__installOverrides",function (ovr,notTop) {
    if (!notTop) {
      installOverridesTop = this;
      updateParents = {};
    }
    for (var k in ovr) {
      var v = ovr[k];
      if (om.isObject(v)) {
        var nv = this.__get(k);
        if (om.isNode(nv)) {
          nv.__installOverrides(v,1);
        }
      } else {
        this[k] = v;
        var upd = om.ancestorWithMethod(this,"update");
        if (upd && (upd !== installOverridesTop)) {
          var p = upd.__pathOf(installOverridesTop).join("/");
          updateParents[p] = 1;
        }
      }
    }
    if (!notTop) {
      console.log("UPDATE PARENTS",updateParents);
      for (var pth in updateParents) {
        var und = this.__evalPath(pth);
        console.log(und);
        und.update();
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
  
  om.changeReporter = function (vl,nd,k,eventName) { // this is attached using __setInputF
    var evn = eventName?eventName:k;
    var nm = evn;
    var anc = nd.__ancestorWithProperty("__listeners");
    if (anc) {
      var chi = nd.__ancestorWithProperty("changeIdentifier");
      if (chi) {
        var ch = chi.changeIdentifier(nd,eventName);
      } else {
        ch = nd;
      }
      var fns = anc.__listeners[nm];
      for (var j in fns) { //@todo this should not include props from standard modules, but harmless because of the __v check
        if (om.beginsWith(j,"__v")) {
          var fn = fns[j];
          fn(anc,ch,vl,eventName);
        }
      }
    }
    return vl;
  }
 
  om.DNode.__reportChange = function (k,eventName) {
    this.__setInputF(k,om,"changeReporter",eventName);
  }
  
  om.DNode.__setListener = function (evn,fn) {
    var lst = this.__setIfMissing("__listeners");
    lst.set(evn,om.lift({"__v__0":fn}));
  }
  
  
  
  om.onChangeAction = function (vl,nd,k,methodName) { // this is attached using __setInputF
    var mth = nd[methodName];
    if (!mth) return vl;
    nd[k] = vl;
    mth.call(nd,k);
    return vl;
  }
  
 
  
  om.DNode.__onChange = function (k,methodName) {
    this.__setInputF(k,om,"onChangeAction",methodName);
  }
  
  // a set of objects, each associated with data.  The members might be an LNode or a DNode
  
  om.DNode.__setIfExternal = function (nm,vl) { // adopts vl below this if it is not already in the pj tree,ow just refers
    var tp = typeof vl;
    if ((tp === "object") && vl && vl.__get("__parent")) {
      this[nm] = vl;
    } else {
      this.set(nm,vl);
    }
    return vl;
  }
  
  
  __pj__.callback = function (rs) {
    om.loadDataCallback(rs);
    } 
  
  om.loadData = function(iurl,cb) {// __get the static list for the pj tree
    debugger;
    om.tlog("starting load of data from "+url);
    var thisHere = this;
    om.loadDataCallback = cb;
    var url = om.toItemDomain(iurl);
    om.tlog("starting load of data from "+url);
    /*
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    var errf = function(rq) {
      om.log("load","Failed load data  of ",url," status ",rq.status);
      missingItem = 1;
      om.doneLoadingItems();
    }
    request.onload = function () {
      if (request.status >= 200 && request.status < 400){
        om.tlog("done loading data");
        resp = request.responseText;
        cb(undefined,resp);
      } else {
        if (request.status === 404) {
          request.message = "404 Not Found";
        } else {
          request.message = request.statusText;
        }
        om.log("loadData",request.message);

      }
    }
    //request.onerror = errf;
    request.send();
    return;
    */
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
    // the __lnodeIndex of an item is its index in the nearest containing LNode

  om.DNode.__lnodeIndex = function () {
    var pr = this.__parent;
    if (!pr || (pr === __pj__)) {
      return;
    }
    if (om.LNode.isPrototypeOf(pr)) {
      return this.__name;
    }
    if (pr) {
      return pr.__lnodeIndex();
    }
  }

  //om.DNode.update = function () {} //bac
  
  om.nodeMethod("__inWs",function () {
    if (this === om.root) return true;
    var pr = this.__get("__parent");
    if (!pr) return false;
    return pr.__inWs();
  });
  
  om.nodeMethod("__nthAncestor",function (n) {
    var cv = this;
    for (var i=0;i<n;i++) {
      var cv = cv.__parent;
      if (!cv) return undefined;
    }
    return cv;
  });
  
  
  om.nodeMethod("__treeSize",function (excludeProperties) {
    var rs = 1;
    this.__iterTreeItems(function (x) {
      if (x && (typeof x==="object")) {
        if (x.__treeSize) {
          rs = rs + x.__treeSize() + 1;
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
    om.root.__objectsModified = 1;
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

