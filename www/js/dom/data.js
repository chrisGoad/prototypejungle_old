
(function (pj) {
  var geom = pj.geom;

// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

  var dat = pj.set("dat",pj.Object.mk());
  dat.__builtIn = 1;

/* utilities for data


* A scale describes a mapping from data space to image space. The coverage of a scale is an interval
* in data space, and its extent an interval in image space
*/


    
dat.set("LinearScale",pj.Object.mk()).__namedType();
dat.LinearScale.set("coverage",geom.Interval.mk(0,100));
dat.LinearScale.set("extent",geom.Interval.mk(0,100));



dat.LinearScale.setExtent = function (xt) {
  this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
}

dat.LinearScale.mk = function (cv,xt) {
  var rs = dat.LinearScale.instantiate();
  if (cv) rs.set("coverage",cv);
  if (xt) {
    rs.setExtent(xt);
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

dat.set("OrdinalScale",pj.Object.mk()).__namedType();
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

dat.set("Series",pj.Object.mk()).__namedType();

 
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
  var els,rs,nels,fields,ln,primitiveSeries;
  if (!dt) return undefined;
  if (dat.Series.isPrototypeOf(dt)) {
    return dt;
  }
  els = dt.rows;
  if (els === undefined) {
    els = dt.elements?dt.elements:[];
  }
  if (!pj.Array.isPrototypeOf(els)) {
    return "elements should be array";
  }
  rs = Object.create(dat.Series);
  nels = pj.Array.mk();
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
  fields = dt.cols?dt.cols:dt.fields;
  // rename domain and range to their standard names
  ln = fields.length;
  primitiveSeries = ln === 1; 
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
  var rs,els;
  if (this.containsPoints) {
    return this.elements;
  }
  rs = pj.Array.mk();
  els = this.elements;
  els.forEach(function (el) {
    var p;
    if ((!category) || (el.category ===category)) {
      p = geom.Point.mk(el.domain,el.range);
      rs.push(p);
    }
  });
  return rs;
}
    
 
  
// gather the categories from the data
dat.Series.computeCategories = function () {
  var ccts = this.categories;
  var flds,cti,els,cts,cto,perEl;
  if (ccts) {
    return ccts;
  }
  flds = this.fields;
  cti = this.fieldIndex("category");
  if (cti<0) {
    return undefined;
  }
  els = this.elements;
  cts = pj.Array.mk();
  cto = {};
  perEl = function (el) {
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

/* in the data, elements might be 2d, as in bar or scatter charts,  or lines as in line charts.
 * Each chart type has a dataElementType, which at the moment might be "NNC","SNC" or "[P]C" 
 * "NNC" means that each element has fields domain:number range:number category:string
 * SNC means that the elements have fiedls domain:string range:number category:string
 * "[P]C" means that elements have fields points:array(Point) C:category
 * The category might be missing in each case.
 * toNNC and toLC convert incoming data where the first field is assumed to be the domain,
 * and subsequent fields to be associated range values, into NNC, SNC or [P]C for, where there is one element
 * for each mark.
 *  NNC, SNC are used for charts like bar graphs, in which one mark is made for each dimension of the range.
 * The toNNC converter takes input like  {fields:[{id:year},{id:Imports},{id:Exports},],
 * elements:[{year:1998,imports:1000,exports:2000]]]
 * and returns {fields:[{id:year,role:domain},{id:value,role:range},{id:Category}],
 * elements:[{domain:1998,range:1000,category'Imports'],[domain:1998,range:2000,'category':'Exports']
  
 * this works for SNC too
 */
  
dat.Series.toNNC = function () {
  var rs =  Object.create(dat.Series);
  var flds,ln,categorize,els,i,domainId,domainType,domainV,cts,ct,nels,fld0,fld1,fld2,nflds,eltype;
  if (this.title) {
    rs.title = this.title;
  }
  flds = this.fields;
  /* if there is only one field, then there is nothing to do; this is a primitive series.  
   *  for now, the categories are the ids of the fields after the 0th (which is the domain)
   */
  ln = flds.length;
  if (ln < 2) return this;
  
  categorize = ln >= 3;
  els = this.elements;
  domainId = flds[0].id;
  domainType = flds[0].type;
  if (categorize) {
    var cts = pj.Array.mk();
    for (i=1;i<ln;i++) {
      ct = flds[i].id;
      cts.push(ct);
    }
  }
  nels = pj.Array.mk(); 
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

  fld0 = pj.Object.mk({id:domainId,role:'domain',type:flds[0].type});
  fld1 = pj.Object.mk({id:'value',role:'range',type:flds[1].type});
  if (categorize) {
    fld2 = pj.Object.mk({id:'category',type:'string'});
    nflds = pj.Array.mk([fld0,fld1,fld2]);
  } else {
    nflds = pj.Array.mk([fld0,fld1]);      
  }
  rs.set('fields',nflds);
  rs.set("elements",nels);
  if (categorize) rs.set("categories",cts);
  eltype = (domainType === "string")?"S,N":"N,N";
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
  var categorize,els,i,domain,nel,nels,cts,ctd,nel,fld0,fld1,fld2,nflds;
  if (ln < 2) return this; 
  var categorize = ln >= 3;
  els = this.elements;
  domain = flds[0].id;
  nels = pj.Array.mk(); // each will have the form {category:,points:},
  if (categorize) {
    cts = pj.Array.mk();
    for (i=1;i<ln;i++) {
      var ct = flds[i].id;
      cts.push(ct);
      nel = pj.Object.mk({category:ct,points:pj.Array.mk()});
      nels.push(nel);
    }
  } else {
    nels.push(pj.Object.mk({category:undefined,points:pj.Array.mk()}))
  }
  els.forEach(function (el) {
    var domainV = el[domain];
    var fld,fid,pnt,nel;
    for (i=1;i<ln;i++) {
      fld = flds[i];
      fid = fld.id;
      pnt = geom.Point.mk(domainV,el[fid]);
      nel = nels[i-1];
      nel.points.push(pnt);
    } 
  }); 
  fld0 = pj.Object.mk({id:domain,role:'domain',type:flds[0].type});
  fld1 = pj.Object.mk({id:'value',role:'range',type:flds[1].type});
  if (categorize) {
    fld2 = pj.Object.mk({id:'category',type:'string'});
    nflds = pj.Array.mk([fld0,fld1,fld2]);
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
  var dtn,sp,y,m,d,rs;
  if (typeof(dts) === 'number') {
    dtn = new Date(dts,0,1);
  } else {
    dtn = Date.parse(dts);
    if (isNaN(dtn)) { // firefox at least can't deal with yy-dd-ss
      sp =dts.split('-');
      if (sp.length === 3) {
        y = parseInt(sp[0]);
        m = parseInt(sp[1])-1;
        d = parseInt(sp[2]);
        dtn = new Date(y,m,d);
      } else {
        return undefined;
      }
    }
  }
  rs = Math.floor(dtn/dayMilliseconds);
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
    var nv;
    if (typeof dv==="string") {
      nv = (typ==="date")?dat.toDayOrdinal(dv):
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
    var nv;
    if (typeof dv ==="string") {
      nv = parseFloat(dv); //@todo check?
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
  var fldi,ftp;
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
  var pfld,rs,els;
  if (elType === "pointArray") {
    var pfld = (fld==="domain")?"x":"y";
  }
  var rs = findMax?-Infinity:Infinity;
  var els = this.elements;
  els.forEach(function (el) {
    var points,v;
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
  var i,el,nflds;
  for (i = 0;i < numEls;i += catCount) {
    el = els[i];
    nels.push(el.domain);
  }
  nflds = pj.Array.mk();
  
  nflds.push(pj.lift({type:this.domainType()}));
  rs.set("fields",nflds);
  rs.set("elements",nels);
  return rs;
}
  
dat.Series.numericalDomain = function () { 
  return this.fields[0].type === "number";
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
  var pdt,flds,categories;
  if (dt===undefined) {
    return; 
  }
  if (dt.__internalized) {
    return dt;
  }
  if (dt.containsPoints) {
    pdt = dat.Series.mk(dt);
  } else if (dt.fields || dt.rows) {
    pdt = dat.Series.mk(dt);
    if (dt.title) {
      pdt.title = dt.title;
    }
    flds = pdt.fields;
    if ((markType === 'NNC')||(markType === "[N|S],N")){
      pdt = pdt.toNNC();
      categories = pdt.categories;
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
  
// data for x will be present either in x.data, or x.__idata, if there is an internalization step; choose __idata if present

pj.Object.getData = function () {
  var idt = this.__idata;
  return idt?dt:this.data;
}

pj.Object.setData = function (xdt,doUpdate) {
  //var isArray = Array.isArray(xdt);
  var isNode = pj.isNode(xdt);
  var fromExternal,dt;
  if (!isNode) {
    this.set('data',pj.lift(xdt));
  } else {
    fromExternal = xdt.__get('__sourcePath');
    // need an Object.create here so that we get a reference on externalization
    dt = fromExternal?Object.create(xdt):xdt;
    if (!dt.parent()) {
      this.set("data",dt);
    } else {
      this.data = dt;
    }
  }
  this.__dataInInternalForm();
  if (doUpdate && this.update) {
    this.update();
  }
}
// sometimes, data needs processing. In this case, the internalized data is put in __idata
pj.Object.__dataInInternalForm  = function () {
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
 
  
  
//end extract   
  
  
})(prototypeJungle);