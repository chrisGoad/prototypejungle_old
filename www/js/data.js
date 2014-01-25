
(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var svg = __pj__.svg;
  var dataOps = __pj__.set("dataOps",__pj__.om.DNode.mk());
  dataOps.__externalReferences__ = [];

  // utilities for data
  // 
  // Each item has a data field,  which can be set in three ways: it can be a normal part of the item,
  //  like any other field. It can arise by loading from an external source, in which __fromXdata__ is set
  // and  __currentXdata__ holds that value, or it might be set by update, in  which __computedData__ is set.
  // If data is loaded from the outside, the "own" data - the data internal to item itself is saved in __ownData___
  // and saved as data if the item is rebuilt.
  
  // It may also have
  // an __xData__ field, for data that it carries around with it (often used for components).
  //
  // Each item may also carry its own data internally, stored the jsonData field (a string, of course).
  // On loading, data is taken from dataSource if present, and otherwise from jsonData.
 // When an item is loaded with a url of the form ?item=...&data=... the data get arg sets (or overrides) dataSource.
 
  // When an update is done, first this.data is passed to each of the computedValue functions.
  
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
  
  
  dataOps.Data.mk = function (o) {
    var rs = Object.create(dataOps.Data);
    rs.setProperties(o);
    return rs;
  }
  
   // the descriptor of a datum is the object which contains its field information - typically the series that contains it,
  // sometimes it is the datum itself, for the standalone case, or where d itself is the series.
  
  
  // naming note: we want consitent naming for Data and LNode methods, so include the word "data" in all names,
  // even if it is a bit redundant for LNodes.
  
  om.LNode.dataDescriptor = function () {
    return this.ancestorWithProperty("fields");
  }
  
  dataOps.Data.fieldIndex = function (f) {
    if (!f) return -1;
    return this.fields.indexOf(f);
  }
  
  om.LNode.dataFieldValue = function (f) {
    var ds = this.dataDescriptor();
    if (ds) {
      var flds = ds.fields;
      var idx = flds.indexOf(f);
      if ((idx >= 0) && (idx < this.length)) {
        return this[idx];
      }
    }
  }
  
  
  
  
  
  // some special fields: domain,range and caption. The names of these fields can be
  // set at the Series level. But default names for the fields are "x","y" and "caption"
  // defaults to "x" if there is an x field
  
  dataOps.Data.domainName  = function () {
    var rs = this.domain;
    if (rs) {
      return rs;
    }
    if (this.fields.indexOf('x')>=0) {
      return 'x';
    }
  }
  dataOps.Data.domainIndex = function () {
    return this.fieldIndex(this.domainName());
  }
  
  
  
  om.LNode.dataDomainIndex = function () {
    var ds = this.dataDescriptor();
    var nm = ds.domainName();
    return ds.fields.indexOf(nm);
  }
  
  om.LNode.dataDomainValue = function () {
    var di = this.dataDomainIndex();
    if (di >= 0) {
      return this[di];
    }
  }
  
  
  
  dataOps.Data.rangeName  = function () {
    var rs = this.range;
    if (rs) {
      return rs;
    }
    if (this.fields.indexOf('y')>=0) {
      return 'y';
    }
  }
  
  
  
  om.LNode.dataRangeIndex = function () {
    var ds = this.dataDescriptor();
    var nm = ds.rangeName();
    return ds.fields.indexOf(nm);
  }
  
  om.LNode.dataRangeValue = function () {
    var di = this.dataRangeIndex();
    if (di >= 0) {
      return this[di];
    }
  }
  
  
  
  dataOps.Data.captionName  = function () {
    var rs = this.captionField;
    if (rs) {
      return rs;
    }
    if (this.fields.indexOf('caption')>=0) {
      return 'caption';
    }
  }
  
  
  
  om.LNode.dataCaptionIndex = function () {
    var ds = this.dataDescriptor();
    var nm = ds.captionName();
    return ds.fields.indexOf(nm);
  }
  
  om.LNode.dataCaptionValue = function () {
    var di = this.dataCaptionIndex();
    if (di >= 0) {
      return this[di];
    }
  }
  
  // turns [1,2,3] into {a:1,b:2,c:3} if fields = [a,b,c]
  var elementToObject = function (domain,range,fields,el) {
    var mln = Math.min(fields.length,el.length);
    var rs = om.DNode.mk();
    for (var i=0;i<mln;i++) {
      var fld = fields[i];
      var prp = (fld === domain)?"domainValue":((fld === range)?"rangeValue":fld);
      rs[prp] = el[i];
    }
    return rs;
  }
  
  //dataOps.set("Series",dataOps.Data.mk()).namedType();
  dataOps.set("Series",om.DNode.mk()).namedType();
 
 
 
  dataOps.Series.fieldIndex = function (f) {
    if (!f) return -1;
    return this.fields.indexOf(f);
  }
  // only does something about "raw" (non dnode data)
  // 
  dataOps.Series.mk = function (dt) {
    if (!dt) return undefined;
    if (om.isNode(dt)) {
      return dt;
      //m.error("Expected raw data (not a node)");
    } 
    var rs = Object.create(dataOps.Series);
    var fields = dt.fields;
    var els = dt.elements;
    if (els === undefined) {
      els = [];
    }
    if (!Array.isArray(els)) {
      return "elements should be array";
    }
    var nels = om.LNode.mk();
    var dm = this.domain;
    var rng = this.range;
    //els.length = 10;// for debugging
    els.forEach(function (el) {
      nels.push(elementToObject(dm,rng,fields,el));
    });
    rs.set("fields",om.lift(fields));
    if (dt.fieldTypes) {
      rs.set("fieldTypes",om.lift(dt.fieldTypes));
    }
    rs.set("elements",nels);
    rs.setProperties(dt,["domain","range"]);
    return rs;
  }
  
  dataOps.Series.length = function () {
    return this.value.length;
  }
  
  // for making small series for initialData
  // sdt should have the form {domain:foo,value:{a:v0,b:v1}, and then a series of the
  // form {fields:[a,b],[[v0,v1]] will be built
  
  
  dataOps.Series.mkSingleton = function(sdt) {
    var flds = [];
    var sval = [];
    var ivl = sdt.value;
    var values = [sval];
    for (k in ivl ) {
      flds.push(k);
      sval.push(ivl[k]);
    }
    sdt.value = sval;
    sdt.fields  = flds;
    return dataOps.Series.mk(sdt);
  }
  // gather the categories from the data
  dataOps.Series.computeCategories = function () {
    var ccts = this.categories;
    if (ccts) {
      return ccts;
    }
    var flds = this.fields;
    var els = this.elements;
    var cts = om.LNode.mk();
    var cto = {};
    els.forEach(function (el) {
      var ct = el.category;
      if (!cto[ct]) {
        cto[ct] = 1;
        cts.push(ct);
      }
    });
    this.set("categories",cts);
    return cts;
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

  // formats: "ymd" (eg "1982-2-3"), or "year". In future, will support "monthName"(eg"Jan") "md" (eg "10-27") "m"year". Defaults to ymd
  //
  
  dataOps.dayOrdinalToYear = function (o) {
    var rdt = new Date(o * dayMilliseconds);
    var yr = rdt.getUTCFullYear();
    var yo = dataOps.toDayOrdinal(yr);
    var lyear = 0;
    var dys = o - yo;
    return yr + dys/365;
  }
    

  
  dataOps.dayOrdinalToString = function (o,format) {
    var rdt = new Date(o * dayMilliseconds);
    var yr = rdt.getUTCFullYear();
    if (format === "year") {
      return parseInt(yr);
    }
    var mn = rdt.getUTCMonth();
    var dt = rdt.getUTCDate();
    return yr + "-" + (mn+1) + "-" + dt ;
  }
    
  // the number of days since 1970-1-1
  var dayMilliseconds = 60*60*24 * 1000;
  dataOps.toDayOrdinal = function(dts) {
    var dtn = Date.parse(dts);
    if (isNaN(dtn)) { // firefox at least can't deal with yy-dd-ss
      var sp =dts.split('-');
      if (sp.length === 3) {
        var y = parseInt(sp[0]);
        var m = parseInt(sp[1])-1;
        var d = parseInt(sp[2]);
        dtn = new Date(y,m,d);
      } else {
        return undefined;
      }
    }
    var rs = Math.floor(dtn/dayMilliseconds);
    var fdo = dataOps.dayOrdinalToString(rs);
    return rs;
   
  }
  
  
  // converts date fields to JavaScript numerical times. No milliseconds included
  
  dataOps.Series.convertDateField = function (f) {
    var els = this.elements;
    els.forEach(function (el) {
      var dv = el[f];
      if (typeof dv ==="string") {
        var dord = dataOps.toDayOrdinal(dv);
        el[f] = dord;
      }
    });
  }
  
  
  dataOps.Series.convertField = function (f,typ) {
    var els = this.elements;
    els.forEach(function (el) {
      var dv = el[f];
      if (typeof dv==="string") {
        var nv = (typ==="date")?dataOps.toDayOrdinal(dv):
                 (typ==="number")?parseFloat(dv):
                 parseInt(dv);
        el[f] = nv;
      }
    });
  }
  
  
  dataOps.Series.convertNumberField = function (f) {
    var els = this.elements;
    els.forEach(function (el) {
      var dv = el[f];
      if (typeof dv ==="string") {
        var nv = parseFloat(dv); //@todo check?
        el[f] = dv;
      }
    });
  }
  
  dataOps.Series.convertDateFields = function () {
    var ftps = this.fieldTypes;
    if (!ftps) return;
    var ln = ftps.length;
    var flds = this.fields;
    for (var i=0;i<ln;i++) {
      if (ftps[i]==="date") {
        this.convertDateField(flds[i]);
      }
    }
  }
  
  var convertableTypes = {"date":1,"number":1,"integer":1};
  
  dataOps.Series.convertFields = function () {
    var ftps = this.fieldTypes;
    if (!ftps) return;
    var ln = ftps.length;
    var flds = this.fields;
    for (var i=0;i<ln;i++) {
      var ftp = ftps[i];
      if (convertableTypes[ftp]) {
        this.convertField(flds[i],ftp);
      }
    }
  }
  // when there are categories, it is conventient for bar charts to  have all data points
  // with the same domain value and different categories grouped by category, in the standard
  // if the domain is numerical, sort by domain value too
  
  
  dataOps.Series.groupByDomain  = function () {
    // first build a dictionary of dictionaries, where the outer index is domain, and the inner category
    // also record the order in which domain values appear

    var flds = this.fields;
    if (!flds) return;
    var categories = this.computeCategories();
    this.computeCategoryCaptions();
    this.convertFields();
    return; //@todo

   
   
 
    var domain = this.domainName();
    if (!domain) return;
    var cti = flds.indexOf('category');
    if (cti < 0) return;
     var byDomain = {};
    var domainOrder = [];
    var dt = this.value;
   
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
        var vl = byCat[ct];
        if (vl) {
          dt.push(byCat[ct]);
        }
      });
    });
  }
    
   
      
      
      
  dataOps.Series.extreme = function (fld,findMax) {
    var rs = findMax?-Infinity:Infinity;
    var els = this.elements;
    els.forEach(function (el) {
      var v = el[fld];
      rs = findMax?Math.max(rs,v):Math.min(rs,v);
    });
    return rs;
  }
  
  dataOps.Series.max = function (fld) {
    return this.extreme(fld,1);
  }
  
  dataOps.Series.min = function (fld) {
    return this.extreme(fld,0);
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
      smems.push(dataOps.Series.mk(m));
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
  om.stashedData = {};
  om.nodeMethod("stashData1",function (sd) {
    if (this.__outsideData__) {
      sd.__data__ = this.data;
      delete this.data;
    }
    this.iterTreeItems(function (nd,k) {
      if (k==="data") return;
      var nsd = {};
      sd[k] = nsd;
      nd.stashData1(nsd);
    },true);
  });
    
  om.DNode.stashData = function () {
    om.stashedData = {};
    this.stashData1(om.stashedData);
  }
  
  om.nodeMethod("restoreData1",function (sd) {
    var d = sd.__data__;
    if (d) {
      this.data = d;
    }
    this.iterTreeItems(function (nd) {
      var nm = nd.__name__;
      if (nm!=="data") {
         nd.restoreData1(sd[nm]);
      }
    },true);
  });
  
  om.DNode.restoreData = function () {
    this.restoreData1(om.stashedData);
  }

 /* 
  om.DNode.genericSetData = function (d) {
    if (this.__withComputedFields__) {
      this.evaluateComputedFields(d);
    }
    this.setIfExternal("data",d);
    return this;
  }
  

  om.DNode.setData = om.DNode.genericSetData;
   
  
   */
 
 

  om.nodeMethod("dataTransform",function () {
    var anc = this.ancestorWithProperty("__transform__");
    if (dataOps.Data.isPrototypeOf(anc)) {
      return anc["__transform__"]
    }
  });
      
    
// where only the domain is transformed, eg 1d bubble charts
  om.nodeMethod("dataTransform1d",function () {
    var anc = this.ancestorWithProperty("__transform1d__");
    if (dataOps.Data.isPrototypeOf(anc)) {
      return anc["__transform1d__"]
    }
  });
  
  
  om.DNode.internalizeData  = function (dt) {
    if (dt===undefined) {
      return;
    }
    if (dt.fields) {
      var pdt = dataOps.Series.mk(dt);
      pdt.groupByDomain();
    } else {
      pdt = om.lift(dt);
    }
    this.set("data",pdt);
    return pdt;
  }
  // outside data is data that comes down from ancestors
  // insideData belongs to this node, and is held with it when the node is persisted
   om.DNode.isetData = function (d,insideData) {
    if (d===undefined) return;
    this.__outsideData__ = !insideData;
    var tp = typeof(d);
    if (!d || tp!=="object") {//primitive value
      this.data = d;
      return d;
    }
    if (om.isNode(d)) {
       id = d;
    } else {
      id =  this.internalizeData(d);
    }
    this.setIfExternal("data",id);
    
    return d;
  }
  om.DNode.setData = function (d,insideData) {
  
    if (d) {
      this.isetData(d,insideData);
    }
    this.evaluateComputedFields(d);
    if (this.update) {
      this.update();
      //code
    }
  }
  om.DNode.setInsideData = function (d) {
    this.setData(d,1);
  }
  
  
  
  om.tryit = function (fn,ep,noCatch,errEl) {
    if (noCatch) {
      fn();
    } else {
      try {
        fn();
        return true;
      } catch(e) {
        om.displayError(errEl,ep+e);
        return false;
      }
    } 
  }
  
  
  om.afterLoadData = function (xdt,cb,noCatch,errEl) {
    var rs = 1;
    om.tlog("LOADED DATA ");
    if (xdt) {
      om.root.__currentXdata__ = xdt;
    } else {
      xdt = om.root.__currentXdata__;
    }
    var idt = om.root.__iData__;
    om.root.internalizeData(xdt?xdt:idt);
    svg.main.setContents(om.root);
    svg.refresh(); // update might need things to be in svg
    var d = om.root.data;
    if (d !== undefined) {
      om.root.evaluateComputedFields(d);
    }
    if (om.root.soloInit) {
      om.root.soloInit();
    }
    if (om.root.update) {
      om.tlog("STARTING UPDATE");
    
      rs = om.tryit(function () {om.root.update()},"In update:",noCatch,errEl);
      om.tlog("FINISHED UPDATE");
      if (!rs) return rs;
    }
    om.root.installOverrides(om.overrides);
    if (cb) cb(rs);
    return rs;
   
  }
  /* no longer. 
  om.setDataSourceInHref = function () {
    var ds = om.root.dataSource;
    ds = ds?ds:"";
    if (om.beginsWith(ds,om.itemHost)) {
      ds = ds.substr(29);
    }
    location.href = om.beforeChar(location.href,"#") + "#data="+ds;
  }
*/

  om.getDataSourceFromHref = function (cuUrl) {
    var q = om.parseQuerystring();
    var d = q.data;
    if (!d) return;
    if (om.beginsWith(d,"http")) {
      return d;
    } else  if (om.beginsWith(d,"./")) {
      return om.itemHost+"/"+cuUrl.handle+"/"+cuUrl.repo+d.substr(1);
    } else {
      return om.itemHost + d;
    }
  }
  /*
    itemUrl = q.item;
    var ash = om.afterChar(location.href,"#");
    if (ash && om.beginsWith(ash,"data=")) {
      var ds = om.afterChar(ash,"=");
      if (om.beginsWith(ds,"/")) {
        return "http://s3.prototypejungle.org"+ds
      }
      return ds;
    }
  }
  http://prototypejungle.org:8000/inspectd?item=http://s3.prototypejungle.org/sys/repo0/examples/TwoRectangles&data=http://s3.prototypejungle.org/sys/repo0/data/bardata2.json
    */

  om.initializeDataSource  = function (cuUrl) {
    var ds = om.getDataSourceFromHref(cuUrl);
    if (ds) {
      om.root.dataSource = ds;
    }  else {
      ds = om.root.dataSource;
    }
    return ds;
  }
    
  
  
})(prototypeJungle);