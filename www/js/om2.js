(function (__pj__) {
  
  var om = __pj__.om;

  
    
  om.nodeMethod("removeComputed",function () {
    if (this.__computed__) {
      this.remove();
    } else {
      this.iterTreeItems(function (nd) {
        nd.removeComputed();
      },true);  
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
  om.DNode.setProperties = function (src,props,status,autoConvert) {
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
        if (val === undefined) continue;
        if (autoConvert) {
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
      if ((v.__parent__) != thisHere) om.error(thisHere,v,"bad parent");
      if ((v.__name__) != k) om.error(thisHere,v,"bad name");
      v.checkTree();
    },true);
  });
  
  
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
        if (kv && (tp != "object") && (tp != "function")) {
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
        if (kv && (tp != "object") && (tp != "function")) {
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
    if (typeof(f) != "function") om.error("Expected function");
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
    if (this == stopAt) return;
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
  
    
  
  // max,min value of c[fld] for children of this
  om.LNode.maxOrMin= function (fld,isMax) {
    var rs = isMax?-Infinity:Infinity;
    this.forEach(function (v) {
      var f = v[fld];
      if (typeof rs == "number") {
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
        v.funstring1(sf,whr+k+".");
      } else {
        if (typeof v == "function") {
          var s = sf[0];
          var fnc = v.toString();//.replace(/(;|\{|\})/g,"$&\n");
          s += whr+k+" = " + fnc;
          s += "\n\n";
          sf[0] = s;
        }
      }
    })
  });
  
  
  
  om.nodeMethod("funstring",function (forAnon) {
    if (forAnon) {
      om.error("OBSOLETE");
      var whr = "prototypeJungle.anon.";
    } else {
      var p = this.pathOf(__pj__);
      var whr ="prototypeJungle."+p.join(".")+".";
    }
    var rs = [""];
    this.funstring1(rs,whr);
    return rs[0];
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
    if (this == nd) {
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
      if (npr == nd) {
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
    if (this==nd) return true;
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
  
  
  
  om.DNode.setNote = function (k,note) {
    var notes = this.setIfMissing('__notes__');
    notes[k] = note;
  }
  
  // lib is the library where defined, fn is the function name
  om.DNode.setInputF = function (k,lib,fn) {
    var infs = this.setIfMissing('__inputFunctions__');
    var pth = om.pathToString(lib.pathOf(__pj__));
    var fpth = pth+"/"+fn;
    infs[k] = fpth;
  }
  /*
  om.DNode.setInputF = function (k,inf) {
    var infs = this.setIfMissing('__inputFunctions__');
    var pth = lib.patc
    infs[k] = inf;
  }
  */
  
  
  
  om.DNode.setOutputF = function (k,lib,fn) {
    var outfs = this.setIfMissing('__outputFunctions__');
    var pth = om.pathToString(lib.pathOf(__pj__));
    var fpth = pth+"/"+fn;    
    outfs[k] = fpth;
  }
  
  // get from the prototype chain, but before you hit DNode itself
  
  om.DNode.getBeforeDNode = function (k) {
    if (this == om.DNode) return undefined;
    var rs = this.get(k);
    if (rs !== undefined) return rs;
    var p = Object.getPrototypeOf(this);
    return p.getBeforeDNode(k);
  }
  
  om.DNode.getInputF = function (k) {
    var infs = this.__inputFunctions__;
    if (infs) {
      var pth = infs.getBeforeDNode(k);;
      return om.evalPath(__pj__,pth);
    }
  }
  
  om.LNode.getInputF = function (k) {
    return undefined;
  }
  
  
  
  om.DNode.getOutputF = function (k) {
    var outfs = this.__outputFunctions__;
    if (outfs) {
      var pth = outfs.getBeforeDNode(k);;
      return om.evalPath(__pj__,pth);
    }
  }
  
  om.LNode.getOutputF = function (k) {
    return undefined;
  }

  
  om.DNode.getNote = function (k) {
    var notes = this.__notes__;
    if (notes) return notes[k];
  }
  
  om.LNode.getNote = function (k) {
    return undefined;
  }
 
 
 // rules for update. What we want is that when the user modifies things by hand, they should not be overwrittenn by update. Also, manual overrides
 // should be saved so that they can be reinstalled. Generally update operations should only create nodes if they are not already present,
 // and only set those fields as necessary.  Every node that is created by update should be marked __computed__ (or should have an ancestor marked __computed__).
 // A node that is not open to manipulation by hand should be marked __mfrozen__ (or should have an ancestor marked __mfrozen__).
 // If only some fields of a node are to be shielded from manipulation, they should be mfrozen via the operation .setFieldStatus(fieldName,"mfrozen")
  
  
  om.nodeMethod("isComputed",function () {
   if (this.__computed__) return true;
   if (this == __pj__) return false;
   return this.__parent__.isComputed();
  });
  
  
  om.nodeMethod("isMfrozen",function () {
   if (this.__mfrozen__) return true;
   if (this == __pj__) return false;
   return this.__parent__.isMfrozen();
  });
  
 
  om.DNode.setFieldStatus = function (k,status) {
    var statuses = this.setIfMissing('__fieldStatus__');
    statuses[k] = status;
  }
  
  
  om.DNode.getFieldStatus = function (k) {
    var statuses = this.get('__fieldStatus__');
    if (statuses) {
      var stk = statuses[k]; // allow inheritance after all. Might it sometimes be useful to override a status, eg mfrozen?
      if (typeof stk=="string") { // but via inheritance, all the functions from DNode come back; this must be prevented
        return stk;
      }
    }
  }
  
 // the form of status might be "mfrozen <function that did the setting>"
  om.DNode.fieldIsFrozen = function (k) {
    if (this.isMfrozen()) return true;
    var status = this.getFieldStatus(k);
    return status && (status.indexOf('mfrozen') == 0);
  }
  
 
  
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
  
  
  
/* small version  
om.DNode.instantiate = function () {
  var rs = Object.create(this);
  var thisHere = this;
  this.iterTreeItems(function (v,k) {
    var cp = v.instantiate();
    cp.__parent__ = rs;
    cp.__name__= k;
    rs[k] = cp;
  },true);
  return rs;
}


// no prototype chains for LNodes
om.LNode.instantiate = function () {
  var rs = om.LNode.mk();
  this.forEach(function (v) {
    if (om.isNode(v)) {
      var cp = v.instantiate();
      rs.pushChild(cp);
    } else {
      rs.push(v);
    }
  });
  return rs;
}

*/


  om.installType("DataSource");
  
  om.DataSource.mk = function (url) {
    var rs = Object.create(om.DataSource);
    rs.url = url;
    rs.setf("link",""); // for display in the tree
   // rs.set("data",om.LNode.mk());
    rs.link = "<a href='"+url+"'>"+url+"</a>";
    rs.__current__ = 0;
    return rs;
  }
  
  om.loadDataErrors = [];
  
  om.DataSource.grabData = function(cb) {// get the static list for the pj tree
    var thisHere = this;
    var scb = function (rs) {
      om.log("loadData","successfully grabbed "+thisHere.url);
      thisHere.set("data", om.lift(rs));
      this.__current__ = 1;
      if (cb) cb(thisHere);
      

    }
    var ecb = function (rs) {
      var msg = "failure to load "+thisHere.url;
      om.loadDataErrors.push(msg);
      this.__current__ = 1;
      thisHere.error = "LoadFailure";
      if (cb) cb(thisHere);

    }
    var opts = {crossDomain: true,dataType:"json",url: this.url,success:scb,error:ecb};
    $.ajax(opts);

  }
  /*
   om = p.om;
   ds = om.DataSource.mk("http://s3.prototypejungle.org/sys/repo0/data/bardata00")
   
   ds.grabData();
   
  */
  
  
  om.dataSourceBeingLoaded = null;
  om.loadedData = [];
  om.loadDataTimeout = 2000;
  
  om.collectedDataSources = undefined;
  
  om.DataSource.collectThisDataSource = function () {
    //  uninherit link
    this.link = this.link;
    om.collectedDataSources.push(this);
  }
  
  // collect below x
  om.collectDataSources = function (x) {
    om.collectedDataSources = [];
    x.deepApplyMeth("collectThisDataSource");
    return om.collectedDataSources;
  }
  
  om.loadNextDataSource  = function (n,cb) {
    var ds = om.collectedDataSources;
    var ln = ds.length;
    if (n == ln) {
      cb();
      return;
    }
    var dts = ds[n];
    
    var afterLoad = function(vl) {
      om.loadNextDataSource(n+1,cb);
    }
    if (dts.__current__) { // already in loaded state
      om.loadNextDataSource(n+1,cb);
    } else {
      dts.grabData(afterLoad);
    }
  }
  
  
  
  om.loadTheDataSources = function (x,cb) {
    om.loadedData = [];
    x.forEach(function (itm) {
      om.collectDataSources(itm);
    });
    om.loadNextDataSource(0,cb);
  }
  
  om.newDataSource = function(url,dts) {
    dts.url = url;
    dts.__current__ = 0;
    var afterLoad = function(vl) {
      __pj__.tree.updateAndShow();
    }
    dts.grabData(afterLoad);
    return url;
  }
  
  
  om.setDataSourceLink = function(url,dts) {
    var durl = dts.url;
    dts.link = "<a href='"+durl+"'>"+durl+"</a>";
    return url;
  }
  om.DataSource.setInputF('url',om,'newDataSource');
  om.DataSource.setOutputF('url',om,'setDataSourceLink');
  
  // data should not be saved with items, at least most of the time (we assume it is never saved for now)
  // in the save process, a way is needed to remove data, and then restore it when the save is done
  om.stashedData = [];
  om.stashData = function () {
    om.stashedData = [];
    om.collectedDataSources.forEach(function (dt) {
      om.stashedData.push(dt.data);
      delete dt.data;
    });
  }
  
  om.restoreData = function () {
    var cl = om.collectedDataSources;
    var ln = cl.length;
    for (var i=0;i<ln;i++) {
      cl[i].data = om.stashedData[i];
    }
    om.stashedData = [];
  }
  
  om.DNode.ownProperties = function () {
    var nms = Object.getOwnPropertyNames(this);
    var rs = [];
    nms.forEach(function (nm) {
      if (!om.internal(nm)) rs.push(nm);
    });
    return rs;
  }
  
  function dnodeProperties(rs,nd,stopAt) {
    if (nd == stopAt) return;
    var nms = Object.getOwnPropertyNames(nd);
    nms.forEach(function (nm) {
      if (!om.internal(nm)) rs[nm]=1;
    });
    dnodeProperties(rs,Object.getPrototypeOf(nd),stopAt);
  }
  // properties from the prototype chain down until stopAt, which defaults to DNode
  om.DNode.properties = function (stopAt) {
    var rs = {};
    dnodeProperties(rs,this,stopAt?stopAt:om.DNode);
    var rsa = [];
    for (var k in rs) rsa.push(k);
    return rsa;
  }



 })(prototypeJungle);
