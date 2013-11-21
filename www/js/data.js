
(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  
  var dataOps = __pj__.set("dataOps",__pj__.om.DNode.mk());
  dataOps.__externalReferences__ = [];

  // utilities for data
  // format
  // a datum is either an array of strings and number
  // or an object {fields:array,value:array}
  // a series has the form {fields:array,value:array}
  // eg {fields:["value","x","y"],value:[[1,2,3],....]]}
  
  //[{type:}] means an array or lnode with members of the given tp
  //N means a number, S  a string,SN
  // A seriesDatum  is either a pair [N,N] or a triple [S,N,N]
  //A series has the form {value:[seriesData]} where the series might have other properites
  //LineGraphData has the form {value:[series]}
  
  
  function datumGet(d,f) {
    if (om.LNode.isPrototypeOf(d)) {
      var pr = d.__parent__;
      if (pr) {
        if (om.LNode.isPrototypeOf(pr)) {
          var fh = pr.__parent__;
        } else {
          fh = pr;
        }
      }
      if (fh) {
        var flds = fh.fields;
      }
    } else {  
      // the standalone case
      flds = d.fields;
      d = d.value;
    }
    if (!flds) {
      return;
    }
    var indx = flds.indexOf(f);
    var ln = d.length;
    if ((0<=indx)&&(indx<ln)) {
      return d[indx];
    }
  }
  
  
  dataOps.datumGet = datumGet;
  /*
  dataOps.unpackDatum = function (d) {
    var ln = d.length;
    if (ln == 2) return {x:d[0],y:d[1]};
    if (ln == 3) return {caption:d[0],x:d[1],y:d[2]};
    om.error("NOT YET");
  }
  */
  //utility: the form of any data element should be {...data:[array]}
  // If instead the element is a raw array, wrap it. This before lifting
  /*
  dataOps.wrapArrayElements = function (x) {
    if (typeof x=="object") {
      if (Array.isArray(x)) {
        var rsa = x.map(dataOps.wrapArrayElements);
        return {data:rsa};
      } else {
        var dt = x.data;
        if (!dt) {
          om.error("Missing data field");
        }
        var rsa = dt.map(dataOps.wrapArrayElements);
        return {data:rsa};
      }
    } else {
      return x;
    }
  }
  */
           
        
 
  // A scale describes a mapping from data space to image space. The coverage of a scale is an interval
  // in data space, and its extent an interval in image space
  
  
  dataOps.set("LinearScale",om.DNode.mk()).namedType();
  dataOps.LinearScale.set("coverage",geom.Interval.mk(0,100));
  dataOps.LinearScale.set("extent",geom.Interval.mk(0,100));

  
  
  dataOps.LinearScale.setExtent = function (xt) {
    this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
  }

  dataOps.LinearScale.mk = function (cv,xt) {
    var rs = dataOps.LinearScale.instantiate();
    if (cv) rs.set("coverage",cv);
    if (xt) {
      this.setExtent(xt);
    }
    return rs;
  }
  
  dataOps.LinearScale.eval = function (v) {
    var cv = this.coverage;
    var xt = this.extent;
    var sc = (xt.ub - xt.lb)/(cv.ub - cv.lb);
    return (this.isY)?xt.ub - sc * (v - cv.lb):xt.lb + sc * (v - cv.lb); // Y up 
   
  }
  
  
  
  
  
  dataOps.LinearScale.dtToImScale = function () {
     var cv = this.coverage;
     var xt = this.extent;
     return (xt.ub-xt.lb)/(cv.ub - cv.lb);
  }
  
  dataOps.LinearScale.label = function (dv) {
    return dv;
  }
  
  
  
  dataOps.set("OrdinalScale",om.DNode.mk()).namedType();
  dataOps.OrdinalScale.set("coverage",10); // the number of values
  dataOps.OrdinalScale.set("extent",geom.Interval.mk(0,100));// the range in which to place them

  
  
  dataOps.OrdinalScale.setExtent = function (xt) {
    this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
  }
  
  
  
  dataOps.OrdinalScale.mk = function (cv,xt) {
    var rs = dataOps.OrdinalScale.instantiate();
    if (cv) rs.set("coverage",cv);
    if (xt) {
      this.setExtent(xt);
    }
    return rs;
  }
  
  
  
  dataOps.OrdinalScale.eval = function (v) {
    var cv = this.coverage;
    var xt = this.extent;
    var sc = (xt.ub - xt.lb)/cv;
    return (this.isY)?xt.ub - sc * v - cv:xt.lb + sc * v; // Y up 
   
  }
  
  
  
  
  dataOps.OrdinalScale.dtToImScale = function () {
     var cv = this.coverage;
     var xt = this.extent;
     return (xt.ub-xt.lb)/cv;
  }
  
  dataOps.OrdinalScale.label = function (dv) {
    return dv;
  }
  
  
  
  dataOps.set("Data",om.DNode.mk()).namedType();
  
 
  
  om.LNode.getField = function (f) {
    return dataOps.datumGet(this,f);
  }
  
  dataOps.Data.getField = function (f) {
    return dataOps.datumGet(this,f);
  }
  
  dataOps.Data.mk = function (o) {
    var rs = Object.create(dataOps.Data);
    rs.setProperties(o);
    return rs;
  }

  
  dataOps.set("Series",dataOps.Data.mk()).namedType();
  
  // only does something about "raw" (non dnode data)
  // 
  dataOps.Series.mk = function (dt) {
    if (!dt) return undefined;
    if (om.isNode(dt)) {
      return dt;
      om.error("Expected raw data (not a node)");
    } 
    var rs = dataOps.Series.instantiate();
    rs.setProperties(dt);
    rs.set("value",om.lift(dt.value));
    return rs;
  }
  
  dataOps.Series.length = function () {
    return this.value.length;
  }
  
  dataOps.Series.extreme = function (which,fld,isofar) {
    var sofar = (isofar===undefined)?(which==="max"?-Infinity:Infinity):isofar;
    this.value.forEach(function (p) {
      var v = p.getField(fld);
      if ((v!==undefined) && (which==="max"?v>sofar:v<sofar)) {
        sofar = v;
      }
    });
    return sofar;
  }
  
  //domain with default
  dataOps.Series.domainD = function () {
    var rs = this.domain;
    return rs?rs:"x";
  }
  
   dataOps.Series.rangeD = function () {
    var rs = this.range;
    return rs?rs:"y";
  }
  
    
  dataOps.Series.min =function (fld,isofar) {
    return this.extreme("min",fld,isofar);
  }
  dataOps.Series.max =function (fld,isofar) {
    return this.extreme("max",fld,isofar);
  }
  
  // gather the categories from the data
  dataOps.Series.computeCategories = function () {
    var ccts = this.categories;
    if (ccts) {
      return ccts;
    }
    var cti = flds.indexOf('category');
    if (cti<0) return;
    var dt = this.value;
    var cts = om.LNode.mk();
    var cto = {};
    dt.forEach(function (a) {
      if (cti < a.length) {
        var ct = a[cti];
        if (!cto[ct]) {
          cto[ct] = 1;
          cts.push(cts);
        }
      }
      this.categories = cts;
      return cts;
    });
  }
    
      
    dataOps.Series.computeCategoryCaptions = function () {
      var ccc = this.categoryCaptions;
      if (ccc) return ccc;
      var cats = this.categories;
      if (!cats) return;
      var rs = om.LNode.mk();
      cats.forEach(function (c) {rs.push(c)});
      this.categoryCaptions = rs;
      return rs;
    }
  
  // when there are categories, it is conventient for bar charts to  have all data points
  // with the same domain value and different categories grouped by category, in the standard
  // if the domain is numerical, sort by domain value too
  
  dataOps.Series.groupByDomain  = function () {
    // first build a dictionary of dictionaries, where the outer index is domain, and the inner category
    // also record the order in which domain values appear
  
    var domain = this.domainD();
    var categories = this.computeCategories();
    this.computeCategoryCaptions();
    var byDomain = {};
    var domainOrder = [];
    var dt = this.value;
    var flds = this.fields;
    var cti = flds.indexOf("category");
    var dmi = flds.indexOf(domain);
    dt.forEach(function (a) {
      var dmv = a[dmi];
      var ct = a[cti];
      var byCat= byDomain[dmv];
      if (!byCat) {
        domainOrder.push(dmv);
        byCat = byDomain[dmv] = {};
      }
      byCat[ct] = a;
    });
    // ok, now rearrange the value
    dt.length = 0;
    domainOrder.forEach(function (dmv) {
      var byCat = byDomain[dmv];
      categories.forEach(function (ct) {
        dt.pushChild(byCat[ct]);
      });
    });
  }
    
   
      
      
      
      
      
    
  
  dataOps.Series.map = function (fn) {
    var opnts = this.value.map(fn);
    var rs = dataOps.Series.mk({value:opnts});
    rs.setProperties(this,["caption"]);
    return rs;
  }
  
  dataOps.Series.scale = function (xScale,yScale) {
    function scaleDatum(p) {
      var ln = p.length;
      var npx = xScale.eval(datumGet(p,"x"));
      var npy = yScale.eval(datumGet(p,"y"));
      var np = om.LNode.mk((ln===2)?[npx,npy]:[p[0],npx,npy]);
      return np;
    }
    return dataOps.Series.map(scaleDatum);
  }
  
  dataOps.set("Collection",dataOps.Data.mk()).namedType;
  dataOps.set("SeriesCollection",Object.create(dataOps.Collection)).namedType;

  dataOps.SeriesCollection.mk = function (o) {
    var rs = dataOps.SeriesCollection.instantiate();
    var mems = o.value;
    var smems = om.LNode.mk();
    mems.forEach(function (m) {
      smems.pushChild(dataOps.Series.mk(m));
    });
    rs.set("value",smems);
    return rs;
  }
  
  dataOps.Collection.map = function (fn) {
    var nmems = this.value.map(fn);
    var rs = dataOps.Collection.mk({value:nmems});
    rs.setProperties(this,["caption"]);
    return rs;
  }

  
  
  dataOps.Collection.extreme = function (which,fld,isofar) {
    var sofar = (isofar===undefined)?(which==="max"?-Infinity:Infinity):isofar;
    this.value.forEach(function (dt) {
      var c = dt.extreme(which,fld,sofar);
      if ((which==="max")?c>sofar:c<sofar) {
        sofar = c;
      }
    });
    return sofar;
  }
  
  
  dataOps.Collection.max =function (fld,isofar) {
    return this.extreme("max",fld,isofar);
  }
  
  dataOps.Collection.min =function (fld,isofar) {
    return this.extreme("min",fld,isofar);
  }
  
  dataOps.Collection.scale = function (xScale,yScale) {
    return dataOps.Collection.map(function (m) {
      return m.scale(xScale,yScale);
    });
  }
  
  dataOps.lift = function (dt) { // raw json; for now assumed to be a series collection; @todo generalize later dig into it so see what it looks like
    if (dataOps.SeriesCollection.isPrototypeOf(dt)) {
      return dt;
    } else {
      return dataOps.SeriesCollection.mk(dt);
    }
  }
  
  
  // data should not be saved with items, at least most of the time (we assume it is never saved for now)
  // in the save process, a way is needed to remove data, and then restore it when the save is done
  om.stashedData = [];
  // nees improvement to recurse the tree
  om.stashData = function () {
    om.stashedData = om.root.__data__;
  }
  
  om.restoreData = function () {
    om.root.__data__ = om.stashedData;
   
  }
  

 /* 
  om.DNode.genericSetData = function (d) {
    if (this.__withComputedFields__) {
      this.evaluateComputedFields(d);
    }
    this.setIfExternal("__data__",d);
    return this;
  }
  

  om.DNode.setData = om.DNode.genericSetData;
   
  
   */
 
  om.DNode.setData = function (d) {
    if (d) {
      this.setIfExternal("__data__",d);
      var rs = d;
    } else {
      rs = this.__data__;
    }
    return rs;
  }

  om.nodeMethod("dataTransform",function () {
    var anc = this.ancestorWithProperty("__transform__");
    if (dataOps.Data.isPrototypeOf(anc)) {
      return anc["__transform__"]
    }
  });
      

  
  
})(prototypeJungle);