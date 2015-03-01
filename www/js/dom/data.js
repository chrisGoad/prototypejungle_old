
(function (pj) {
  var om = pj.om;
  var geom = pj.geom;

// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

  var dat = pj.set("dat",pj.om.DNode.mk());
  dat.__builtIn = 1;

  // utilities for data
  // 
  // Each item has a data field,  which can be set in three ways: it can be a normal part of the item,
  //  like any other field. It can arise by loading from an external source, in which case _xdata is set to the "raw" external data
  // and .data to its internalized verions. Or it can be computed. 
  
  
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
  
  
 
  //utility: the form of any data element should be {...data:[array]}
  // If instead the element is a raw array, wrap it. This before lifting
  // A scale describes a mapping from data space to image space. The coverage of a scale is an interval
  // in data space, and its extent an interval in image space

  // The callback expects an error as first arg, node style
  dat.loadData = function (url,cb) {
    dat.svDataCallback = window.dataCallback;
    window.callback = window.dataCallback = function (rs) {
      window.dataCallback = dat.svDataCallback;
      cb(null,rs);
    }
    var  loadCb = function (e) {
      if (e) {
        cb(e);
      }
    }
    om.loadScript(url,loadCb);
  }
  
    
  dat.set("LinearScale",om.DNode.mk()).namedType();
  dat.LinearScale.set("coverage",geom.Interval.mk(0,100));
  dat.LinearScale.set("extent",geom.Interval.mk(0,100));
 
  
  
  dat.LinearScale.setExtent = function (xt) {
    this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
  }

  dat.LinearScale.mk = function (cv,xt) {
    var rs = dat.LinearScale.instantiate();
    if (cv) rs.set("coverage",cv);
    if (xt) {
      this.setExtent(xt);
    }
    return rs;
  }
  
  dat.LinearScale.eval = function (v) {
    var cv = this.coverage;
    var xt = this.extent;
    var sc = (xt.ub - xt.lb)/(cv.ub - cv.lb);
    return (this.isY)?xt.ub - sc * (v - cv.lb):xt.lb + sc * (v - cv.lb); // Y up 
  }

  dat.LinearScale.dtToImScale = function () {
     var cv = this.coverage;
     var xt = this.extent;
     return (xt.ub-xt.lb)/(cv.ub - cv.lb);
  }
  
  dat.LinearScale.label = function (dv) {
    return dv;
  }
  
  dat.set("OrdinalScale",om.DNode.mk()).namedType();
  dat.OrdinalScale.set("coverage",10); // the number of __values
  dat.OrdinalScale.set("extent",geom.Interval.mk(0,100));// the range in which to place them
  
  dat.OrdinalScale.setExtent = function (xt) {
    this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
  }
  
  dat.OrdinalScale.mk = function (cv,xt) {
    var rs = dat.OrdinalScale.instantiate();
    if (cv) rs.set("coverage",cv);
    if (xt) {
      this.setExtent(xt);
    }
    return rs;
  }
  
  dat.OrdinalScale.eval = function (v) {
    var cv = this.coverage;
    var xt = this.extent;
    var sc = (xt.ub - xt.lb)/cv;
    return (this.isY)?xt.ub - sc * v - cv:xt.lb + sc * v; // Y up 
   
  }
  
  dat.OrdinalScale.dtToImScale = function () {
     var cv = this.coverage;
     var xt = this.extent;
     return (xt.ub-xt.lb)/cv;
  }
  
  dat.OrdinalScale.label = function (dv) {
    return dv;
  }
  
   // the descriptor of a datum is the object which contains its field information - typically the series that contains it,
  // sometimes it is the datum itself, for the standalone case, or where d itself is the series.
  
  
  // naming note: we want consitent naming for Data and LNode methods, so include the word "data" in all names,
  // even if it is a bit redundant for LNodes.
  
 
  // some special fields: domain,range and caption. The names of these fields can be
  // set at the Series level. But default names for the fields are "x","y" and "caption"
  // defaults to "x" if there is an x field
  
  /*om.LNode.dataRangeValue = function () {
    var di = this.dataRangeIndex();
    if (di >= 0) {
      return this[di];
    }
  }*/
  
  
  // turns [1,2,3] into {a:1,b:2,c:3} if fields = [a,b,c]
 
   var elementToObject = function (fields,el) {
    var mln = Math.min(fields.length,el.length);
    var rs = om.DNode.mk();
    for (var i=0;i<mln;i++) {
      var fld = fields[i];
      var r = fld.role;
      var id = fld.id;
      var prp = r?r:id;
      rs[prp] = el[i];
    }
    return rs;
  }
  
  //dat.set("Series",dat.dat.mk()).namedType();
  dat.set("Series",om.DNode.mk()).namedType();
 
 
  //find the index of the field whose role or id is nm
  dat.Series.fieldIndex = function (nm) {
    var n=0;
    var rs=-1;
    this.fields.some(function (f) {
      if ((f.id === nm)||(f.role === nm)){
        rs=n;
        return 1;
      }
      n++;
    });
    return rs;
  }
  
  //
  // special case: if {containsPoints is true, assume an array of pairs, and each is to be a point
  
  dat.mkPointSeries = function (pnts) {
    var rs = Object.create(dat.Series);
    rs.containsPoints = 1;
    rs.set("elements",pnts);
    return rs;
  }
  
  dat.Series.mk = function (dt) {
    if (!dt) return undefined;
    if (om.isNode(dt)) {
      return dt;
    }
    var els = dt.elements;
    if (els === undefined) {
      els = [];
    }
    if (!Array.isArray(els)) {
      return "elements should be array";
    }
    var rs = Object.create(dat.Series);
    var nels = om.LNode.mk();
    if (dt.containsPoints) {
      rs.containsPoints = 1;
      var nels = om.LNode.mk();
      els.forEach(function (e) {
        var p = geom.Point.mk(e[0],e[1]);
        nels.push(p);
      });
      rs.set("elements",nels);
      return rs;
    }
      
      
    var fields = dt.fields;
    // rename domain and range to their standard names
    var ln = fields.length;
    els.forEach(function (el) {
      nels.push(elementToObject(fields,el));
    });
    rs.set("fields",om.lift(fields));
    om.setProperties(rs,dt,["categories","categoryCaptions"]);
    rs.set("elements",nels);
    om.setProperties(rs,dt,["title"]);
    return rs;
  }
  
  dat.Series.length = function () {
    return this.value.length;
  }
  // for use with polylines
  

  dat.Series.toPoints= function (category) {
    if (this.containsPoints) {
      return this.elements;
    }
    var rs = om.LNode.mk();
    var els = this.elements;
    els.forEach(function (el) {
      if ((!category) || (el.category ===category)) {
        var p = geom.Point.mk(el.domain,el.range);
        rs.push(p);
      }
    });
    return rs;
  }
    
 
  
  // gather the categories from the data
  dat.Series.computeCategories = function () {
    var ccts = this.categories;
    if (ccts) {
      return ccts;
    }
    var flds = this.fields;
    var cti = this.fieldIndex("category");
    if (cti<0) {
      return undefined;
    }
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
  
  // in the data, elements might be 2d, as in bar or scatter charts,  or lines as in line charts.
  // Each chart type has a markType, which at the moment might be "NNC",
  //  NNC used for charts like bar graphs, in which one mark is made for each dimension of the range.
  // this turns {fields:[{id:year},{id:Imports},{id:Exports},],elements:[[1998,1000,2000]]]
  // into {fields:[{id:year},{id:value},{id:Category}],elements:[[1998,1000,'Imports'],[1998,2000,'Exports']
  //LC means line, category. Line graphs
  
  dat.Series.toNNC = function () {
    var rs =  Object.create(dat.Series);
    var flds = this.fields;
    //  for now, the categories are the ids of the fields after the 0th (which is the domain)
    var ln = flds.length;
    if (ln < 3) {
      return this;
    }
    var els = this.elements;
    var cts = om.LNode.mk();
    var i;
    var domain = flds[0].id;
    
    for (i=1;i<ln;i++) {
      var ct = flds[i].id;
      cts.push(ct);
    }
    var nels = om.LNode.mk();
    els.forEach(function (el) {
      var domainV = el[domain];
      for (i=1;i<ln;i++) {
        var fld = flds[i];
        var fid = fld.id; 
        var nel = om.DNode.mk();
        nel.domain = domainV;
        nel.range = el[fid]; 
        nel.category = cts[i-1];
        nels.push(nel);
      } 
    });
    var fld0 = om.DNode.mk({id:domain,role:'domain',type:flds[0].type});
    var fld1 = om.DNode.mk({id:'value',role:'range',type:flds[1].type});
    var fld2 = om.DNode.mk({id:'category',type:'string'});
    var nflds = om.LNode.mk([fld0,fld1,fld2]);
    rs.set('fields',nflds);
    rs.set("elements",nels);
    rs.set("categories",cts);
    return rs;
  }
    
      
    dat.Series.computeCategoryCaptions = function () {
      var ccc = this.categoryCaptions;
      if (ccc) return ccc;
      var cats = this.categories;
      if (!cats) return;
      var rs = om.DNode.mk();
      cats.forEach(function (c) {rs[c]=c;});
      this.categoryCaptions = rs;
      return rs;
    }

  // formats: "ymd" (eg "1982-2-3"), or "year". In future, will support "monthName"(eg"Jan") "md" (eg "10-27") "m"year". Defaults to ymd
  //
  
  dat.dayOrdinalToYear = function (o) {
    var rdt = new Date(o * dayMilliseconds);
    var yr = rdt.getUTCFullYear();
    var yo = dat.toDayOrdinal(yr);
    var lyear = 0;
    var dys = o - yo;
    return yr + dys/365;
  }
    

  
  dat.dayOrdinalToString = function (o,format) {
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
  dat.toDayOrdinal = function(dts) {
    if (typeof(dts) === 'number') {
      dtn = new Date(dts,0,1);
    } else {
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
    }
    var rs = Math.floor(dtn/dayMilliseconds);
    //var fdo = dat.dayOrdinalToString(rs);
    return rs;
   
  }
   
  
  // converts date fields to JavaScript numerical times. No milliseconds included
  
  dat.Series.convertDateField = function (f) {
    var els = this.elements;
    els.forEach(function (el) {
      var dv = el[f];
      if (typeof dv ==="string") {
        var dord = dat.toDayOrdinal(dv);
        el[f] = dord;
      }
    });
  }
  
  dat.Series.convertField = function (f,typ) {
    var els = this.elements;
    els.forEach(function (el) {
      var dv = el[f];
      if (typeof dv==="string") {
        var nv = (typ==="date")?dat.toDayOrdinal(dv):
                 (typ==="number")?parseFloat(dv):
                 parseInt(dv);
        el[f] = nv;
      }
    });
  }
  
  
  dat.Series.convertNumberField = function (f) {
    var els = this.elements;
    els.forEach(function (el) {
      var dv = el[f];
      if (typeof dv ==="string") {
        var nv = parseFloat(dv); //@todo check?
        el[f] = dv;
      }
    });
  }
  
  dat.internalName = function (f) {
    var r = f.role;
    return r?r:f.id;
  }
  
  var convertableTypes = {"date":1,"number":1,"integer":1};
  
  dat.Series.convertFields = function () {
    var flds = this.fields;
    var ln = flds.length;
    for (var i=0;i<ln;i++) {
      var fldi = flds[i];
      var ftp = fldi.type;
      if (convertableTypes[ftp]) {
        this.convertField(dat.internalName(fldi),ftp);
      }
    }
  }
  
      
      
      
  dat.Series.extreme = function (fld,findMax) {
    var rs = findMax?-Infinity:Infinity;
    var els = this.elements;
    els.forEach(function (el) {
      var v = el[fld];
      rs = findMax?Math.max(rs,v):Math.min(rs,v);
    });
    return rs;
  }
  
  dat.Series.max = function (fld) {
    return this.extreme(fld,1);
  }
  
  dat.Series.min = function (fld) {
    return this.extreme(fld,0);
  }
  
  dat.Series.range = function (fld) {
    var mn = this.min(fld);
    var mx = this.max(fld);
    return geom.Interval.mk(mn,mx);
  }
  
      
    
  
  dat.Series.map = function (fn) {
    var opnts = this.value.map(fn);
    var rs = dat.Series.mk({value:opnts});
    om.setProperties(rs,this,["caption"]);
    return rs;
  }
  
  dat.Series.scale = function (xScale,yScale) {
    function scaleDatum(p) {
      var ln = p.length;
      var npx = xScale.eval(datumGet(p,"x"));
      var npy = yScale.eval(datumGet(p,"y"));
      var np = om.LNode.mk((ln===2)?[npx,npy]:[p[0],npx,npy]);
      return np;
    }
    return dat.Series.map(scaleDatum);
  }
  

  
  
  
  
  // data should not be saved with items, at least most of the time (we assume it is never saved for now)
  // in the save process, a way is needed to remove data, and then restore it when the save is done
  
  // for now, all data comes from an external source
  // data only appears at the root of non-assemblies, or in parts of assemblies
  dat.stashedData = {};
  var stashData1 = function (nd,sd,isRoot) {
    if (1 || isRoot || nd.__isPart) {
      var d = nd.data;
      var xd = nd.__xdata;
      if (d) {
        sd.__data__ = d;
        delete nd.data;
      }
      if (xd) {
        sd.__xdata__ = xd;
        delete nd.__xdata;
      }
    }
    if (isRoot && !nd.__isAssembly) {
      return;
    }
    //if (!nd.__isPart) {
      om.forEachTreeProperty(nd,function (ch,k) {
        if (k==="data" || k==="__requires") return;
        var nsd = {};
        sd[k] = nsd;
        stashData1(ch,nsd);
      });
    //}
  }
    
  
  dat.stashData = function (nd) {
    dat.stashedData = {};
    stashData1(nd,dat.stashedData,1);
  }
  
  
  var restoreData1 = function (nd,sd) {
    if (!sd) return;
    var d = sd.__data__;
    var xd = sd.__xdata__;
    if (d) {
      nd.data = d;
    }
    if (xd) {
      nd.__xdata = xd;
    }
    om.forEachTreeProperty(nd,function (ch) {
      var nm = ch.__name;
      if (nm!=="data") {
         restoreData1(ch,sd[nm]);
      }
    });
  }
  
  dat.restoreData = function (nd) {
    restoreData1(nd,dat.stashedData);
  }

  // a Series might have an associated transform in its __transform field. If so, the data is transformed before binding
  // to marks.

  om.nodeMethod("__dataTransform",function () {
    var anc = om.ancestorWithProperty(this,"__transform");
    if (anc && dat.Series.isPrototypeOf(anc)) {
      return anc["__transform"]
    }
  });
      
    
// where only the domain is transformed, eg 1d bubble charts
  om.nodeMethod("__dataTransform1d",function () {
    var anc = om.ancestorWithProperty(this,"__transform1d");
    if (anc && dat.Series.isPrototypeOf(anc)) {
      return anc["__transform1d"]
    }
  });
  
  
  
  dat.internalizeData = function (dt,elementType) {
    if (dt===undefined) {
      return; 
    }
    if (dt.containsPoints) {
      var pdt = dat.Series.mk(dt);
    } else if (dt.fields) {
      pdt = dat.Series.mk(dt);
      var flds = pdt.fields;
      if (elementType === 'NNC') {
        pdt = pdt.toNNC();
        var categories = pdt.categories;
      } else {
        categories = pdt.computeCategories();
      }
      if (categories){
        pdt.computeCategoryCaptions();
      }
      pdt.convertFields();
    } else {
      pdt = om.lift(dt);
    }
    return pdt;
  }
  
  om.dataInternalizer = dat.internalizeData;
  
  // outside data is data that comes down from ancestors
  // insideData belongs to this node, and is held with it when the node is persisted
   om.DNode.__isetData = function (d,insideData) {
    if (d===undefined) return;
    this.__outsideData = !insideData;
    var tp = typeof(d);
    if (!d || tp!=="object") {//primitive value
      this.data = d;
      return d;
    }
    if (om.isNode(d)) {
      var  id = d;
    } else {
      var id =  dat.internalizeData(d);
    }
    om.setIfExternal(this,"data",id);
    
    return id;
  }
  om.DNode.setData = function (d,insideData) {
    var pj = prototypeJungle
    if (d) {
      var id = this.__isetData(d,insideData);
    }
    if (this.update) {
      this.outerUpdate();
      //code
    }
  }
  om.DNode.__setInsideData = function (d) {
    this.setData(d,1);
  }
  
  
  
//end extract   
  
  
})(prototypeJungle);