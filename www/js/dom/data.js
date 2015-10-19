
(function (pj) {
  var geom = pj.geom;

// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

  var dat = pj.set("dat",pj.Object.mk());
  dat.__builtIn = 1;

  // utilities for data
  // 
  // Each item has a data field,  which can be set in three ways: it can be a normal part of the item,
  //  like any other field. It can arise by loading from an external source, in which case _xdata is set to the "raw" external data
  // and .data to its internalized verions. Or it can be computed. 
  
  
  // When an update is done, first this.data is passed to each of the computedValue functions.
  
  // format described in the code doc
 
  
 
  //utility: the form of any data element should be {...data:[array]}
  // If instead the element is a raw array, wrap it. This before lifting
  // A scale describes a mapping from data space to image space. The coverage of a scale is an interval
  // in data space, and its extent an interval in image space

  
    
  dat.set("LinearScale",pj.Object.mk()).namedType();
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
  
  dat.set("OrdinalScale",pj.Object.mk()).namedType();
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
  
  
  // turns [1,2,3] into {a:1,b:2,c:3} if fields = [a,b,c]
 
   var elementToObject = function (fields,el) {
    var mln = Math.min(fields.length,el.length);
    var rs = pj.Object.mk();
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
  dat.set("Series",pj.Object.mk()).namedType();
 
 
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
  //  if containsPoints is true, assume an array of pairs, and each is to be a point
  
  dat.mkPointSeries = function (pnts) {
    var rs = Object.create(dat.Series);
    rs.containsPoints = 1;
    rs.set("elements",pnts);
    return rs;
  }
  

  dat.Series.mk = function (dt) {
    if (!dt) return undefined;
    if (dat.Series.isPrototypeOf(dt)) {
      return dt;
    }
    //if (pj.isNode(dt)) {
    //  return dt;
    //}
    //var els = dt.elements; 
    var els = dt.rows;
    if (els === undefined) {
      els = dt.elements?dt.elements:[];
    }
    if (!pj.Array.isPrototypeOf(els)) {
      return "elements should be array";
    }
    var rs = Object.create(dat.Series);
    var nels = pj.Array.mk();
    if (dt.containsPoints) {
      rs.containsPoints = 1;
      var nels = pj.Array.mk();
      els.forEach(function (e) {
        var p = geom.Point.mk(e[0],e[1]);
        nels.push(p);
      });
      rs.set("elements",nels);
      return rs;
    }
    
    var fields = dt.cols?dt.cols:dt.fields;
    // rename domain and range to their standard names
    var ln = fields.length;
    var primitiveSeries = ln === 1; 
    els.forEach(function (el) {
      nels.push(primitiveSeries?el:elementToObject(fields,el));
    });
    rs.set("fields",pj.lift(fields));
    pj.setProperties(rs,dt,["categories","categoryCaptions"]);
    rs.set("elements",nels);
    pj.setProperties(rs,dt,["title"]);
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
    var rs = pj.Array.mk();
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
    var cts = pj.Array.mk();
    var cto = {};
    var perEl = function (el) {
        var ct = el.category;
        if (!cto[ct]) {
          cto[ct] = 1;
          cts.push(ct);
        }
      };
    if (pj.Array.isPrototypeOf(els)) {
      els.forEach(perEl);
    } else {
      pj.forEachTreeProperty(els,perEl);
    }
    this.set("categories",cts);
    return cts;
  }
  
  // in the data, elements might be 2d, as in bar or scatter charts,  or lines as in line charts.
  // Each chart type has a dataElementType, which at the moment might be "NNC","SNC" or "[P]C" 
  // "NNC" means that each element has fields domain:number range:number category:string
  // SNC means that the elements have fiedls domain:string range:number category:string
  // "[P]C" means that elements have fields points:array(Point) C:category
  // The category might be missing in each case.
  // toNNC and toLC convert incoming data where the first field is assumed to be the domain,
  // and subsequent fields to be associated range values, into NNC, SNC or [P]C for, where there is one element
  // for each mark.
  //  NNC, SNC are used for charts like bar graphs, in which one mark is made for each dimension of the range.
  // The toNNC converter takes input like  {fields:[{id:year},{id:Imports},{id:Exports},],
  // elements:[{year:1998,imports:1000,exports:2000]]]
  // and returns {fields:[{id:year,role:domain},{id:value,role:range},{id:Category}],
  // elements:[{domain:1998,range:1000,category'Imports'],[domain:1998,range:2000,'category':'Exports']
  
  // this works for SNC too
  
  dat.Series.toNNC = function () {
    var rs =  Object.create(dat.Series);
    if (this.title) {
      rs.title = this.title;
    }
    var flds = this.fields;
    // if there is only one field, then there is nothing to do; this is a primitive series.
    
    //  for now, the categories are the ids of the fields after the 0th (which is the domain) 
    var ln = flds.length;
    if (ln < 2) return this;
    
    var categorize = ln >= 3;
    var els = this.elements;
    var i;
    var domainId = flds[0].id;
    var domainType = flds[0].type;
    if (categorize) {
      var cts = pj.Array.mk();
      for (i=1;i<ln;i++) {
        var ct = flds[i].id;
        cts.push(ct);
      }
    }
    var nels = pj.Array.mk(); 
    els.forEach(function (el) {
      var domainV = el[domainId];
      for (i=1;i<ln;i++) {
        var fld = flds[i];
        var fid = fld.id; 
        var nel = pj.Object.mk();
        nel.domain = domainV;
        nel.range = el[fid]; 
        if (categorize) nel.category = fid;//cts[i-1];  
        nels.push(nel);
      } 
    });
  
    var fld0 = pj.Object.mk({id:domainId,role:'domain',type:flds[0].type});
    var fld1 = pj.Object.mk({id:'value',role:'range',type:flds[1].type});
    if (categorize) {
      var fld2 = pj.Object.mk({id:'category',type:'string'});
      var nflds = pj.Array.mk([fld0,fld1,fld2]);
    } else {
      nflds = pj.Array.mk([fld0,fld1]);      
    }
    rs.set('fields',nflds);
    rs.set("elements",nels);
    if (categorize) rs.set("categories",cts);
    var eltype = (domainType === "string")?"S,N":"N,N";
    rs.elementType = eltype;
    return rs;
  }
  // this converts incoming data to a form where each mark has the form {points:,[category:]}
  dat.Series.to_pointArrays = function () { 
    var rs =  Object.create(dat.Series);
    var flds = this.fields;
    // if there is only one field, then there is nothing to do; this is a primitive series.
    //  for now, the categories are the ids of the fields after the 0th (which is the domain) 
    var ln = flds.length;
    if (ln < 2) return this; 
    var categorize = ln >= 3;
    var els = this.elements;
    var i;
    var domain = flds[0].id;
    var nels = pj.Array.mk(); // each will have the form {category:,points:},
    if (categorize) {
      var cts = pj.Array.mk();
      for (i=1;i<ln;i++) {
        var ct = flds[i].id;
        cts.push(ct);
        var nel = pj.Object.mk({category:ct,points:pj.Array.mk()});
        nels.push(nel);
        //byCategory[ct] = nel; 
      }
    } else {
      nels.push(pj.Object.mk({category:undefined,points:pj.Array.mk()}))
    }
    els.forEach(function (el) {
      var domainV = el[domain];
      for (i=1;i<ln;i++) {
        var fld = flds[i];
        var fid = fld.id;
        var pnt = geom.Point.mk(domainV,el[fid]);
        var nel = nels[i-1];
        nel.points.push(pnt);
      } 
    }); 
    var fld0 = pj.Object.mk({id:domain,role:'domain',type:flds[0].type});
    var fld1 = pj.Object.mk({id:'value',role:'range',type:flds[1].type});
    if (categorize) {
      var fld2 = pj.Object.mk({id:'category',type:'string'});
      var nflds = pj.Array.mk([fld0,fld1,fld2]);
    } else {
      nflds = pj.Array.mk([fld0,fld1]);      
    }
    rs.set('fields',nflds);
    rs.set("elements",nels);
    if (categorize) rs.set("categories",cts); 
    rs.elementType = "pointArray";
    return rs;
  }
    
    
      
    dat.Series.computeCategoryCaptions = function () {
      var ccc = this.categoryCaptions;
      if (ccc) return ccc;
      var cats = this.categories;
      if (!cats) return;
      var rs = pj.Object.mk();
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
  
      
  dat.arrayExtreme = function (arr,fld,findMax) {
    var rs = findMax?-Infinity:Infinity;
    arr.forEach(function (el) {
      var v = el[fld];
      rs = findMax?Math.max(rs,v):Math.min(rs,v);
    });
    return rs;
  }
    
  dat.Series.extreme = function (fld,findMax) {
    var elType = this.elementType;
    if (elType === "pointArray") {
      var pfld = (fld==="domain")?"x":"y";
    }
    var rs = findMax?-Infinity:Infinity;
    var els = this.elements;
    els.forEach(function (el) {
      if (elType === "pointArray") { // elements are have the form points:,category:
        var points = el.points;
        var v = dat.arrayExtreme(points,pfld,findMax);
      } else {
        var v = el[fld];
      }
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
    pj.setProperties(rs,this,["caption"]);
    return rs;
  }
  
  dat.Series.scale = function (xScale,yScale) {
    function scaleDatum(p) {
      var ln = p.length;
      var npx = xScale.eval(datumGet(p,"x"));
      var npy = yScale.eval(datumGet(p,"y"));
      var np = pj.Array.mk((ln===2)?[npx,npy]:[p[0],npx,npy]);
      return np;
    }
    return dat.Series.map(scaleDatum);
  }
  
  dat.Series.domainType = function () {return "string"}; // for now
 // often, for labels we don't need the whole series, only domain values.  This
 // returns the domain values as a series
  dat.Series.extractDomainValues = function () {
    var rs = Object.create(dat.Series);
    var els = this.elements;
    var nels = pj.Array.mk();
    var cats = this.categories;
    var catCount = cats?cats.length:1;
    var numEls = els.length;
    var i;
    for (i = 0;i < numEls;i += catCount) {
      var el = els[i];
      nels.push(el.domain);
    }
    var nflds = pj.Array.mk();
    
    nflds.push(pj.lift({type:this.domainType()}));
    rs.set("fields",nflds);
    rs.set("elements",nels);
    return rs;

  }
  
  dat.Series.numericalDomain = function () { 
    return this.fields[0].type === "number";
  }
  
  // data should not be saved with items
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
      pj.forEachTreeProperty(nd,function (ch,k) {
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
    pj.forEachTreeProperty(nd,function (ch) {
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

  pj.nodeMethod("__dataTransform",function () {
    var anc = pj.ancestorWithProperty(this,"__transform");
    if (anc && dat.Series.isPrototypeOf(anc)) {
      return anc["__transform"]
    }
  });
      
    
// where only the domain is transformed, eg 1d bubble charts
  pj.nodeMethod("__dataTransform1d",function () {
    var anc = pj.ancestorWithProperty(this,"__transform1d");
    if (anc && dat.Series.isPrototypeOf(anc)) {
      return anc["__transform1d"]
    }
  });
  
  
  
  dat.internalizeData = function (dt,markType) {
    if (dt===undefined) {
      return; 
    }
    if (dt.__internalized) {
      return dt;
    }
    if (dt.containsPoints) {
      var pdt = dat.Series.mk(dt);
    } else if (dt.fields || dt.rows) {
      pdt = dat.Series.mk(dt);
      if (dt.title) {
        pdt.title = dt.title;
      }
      var flds = pdt.fields;
      if ((markType === 'NNC')||(markType === "[N|S],N")){
        pdt = pdt.toNNC();
        var categories = pdt.categories;
      } else if (markType === "pointArray") {
        pdt = pdt.to_pointArrays();
        categories = pdt.computeCategories();
      }
      if (categories){
        pdt.computeCategoryCaptions();
      }
      pdt.convertFields();
    } else {
      pdt = pj.lift(dt);
    }
    pdt.__internalized = 1;
    return pdt;
  }
  
  pj.dataInternalizer = dat.internalizeData;
  
  // outside data is data that comes down from ancestors
  // insideData belongs to this node, and is held with it when the node is persisted
   pj.Object.__isetData = function (d,insideData) {
    if (d===undefined) return;
    this.__outsideData = !insideData;
    var tp = typeof(d);
    if (!d || tp!=="object") {//primitive value
      this.data = d;
      return d;
    }
    if (pj.isNode(d)) {
      var  id = d;
    } else {
      var id =  dat.internalizeData(d,this.markType);
    }
    pj.setIfExternal(this,"data",id);
    
    return id;
  }
  pj.Object.setData = function (xdt,doUpdate) {
    //var isArray = Array.isArray(xdt);
    var isNode = pj.isNode(xdt);
    if (!isNode) {
      this.set('data',pj.lift(xdt));
    } else {
      var fromExternal = xdt.__get('__sourcePath');
      // need an Object.create here so that we get a reference on externalization
      var dt = fromExternal?Object.create(xdt):xdt;
      if (!dt.parent()) {
        this.set("data",dt);
      } else {
        this.data = dt;
      }
    }
    this.dataInInternalForm();
    if (doUpdate && this.update) {
      this.update();
    }
  }
  
  pj.Object.dataInInternalForm  = function () {
    if (!this.data) {
      return undefined;
    }
    if (this.data.__internalized) {
      return this.data;
    }
    if (this.__idata) {
      return this.__idata;
    }
    
    if (this.markType) { // if markType is asserted, then an internalized form of the data is wante
      var internaldt =  dat.internalizeData(this.data, this.markType);
      internaldt.__computed = 1; // so it won't get saved
      internaldt.__internalized = 1;
      this.set("__idata",internaldt);
      return internaldt;
    }
    return this.data;
  }
  /*
   * How this works: external data is handled by the component system. The pattern for associating data
   * with an object X is X.setData(data.instantiate()) where data is an external value. This in turn
   * sets X.data to the internalized version of data, and xdata to the original (meaning that it will
   * be saved by external reference.) .data is always stripped away on saving. Outerupdate re-computes
   * data from xdata.
   */
 /* pj.Object.outerUpdate = function () {
    
  }
  */
  pj.Object.__setInsideData = function (d) {
    this.setData(d,1);
  }
  
  
  
//end extract   
  
  
})(prototypeJungle);