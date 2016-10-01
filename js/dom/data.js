

  var data = pj.set("data",pj.Object.mk());
  data.__builtIn = true;

/* utilities for data


* A scale describes a mapping from data space to image space. The coverage of a scale is an interval
* in data space, and its extent an interval in image space
*/


    
data.set("LinearScale",pj.Object.mk()).__namedType();
data.LinearScale.set("coverage",geom.Interval.mk(0,100));
data.LinearScale.set("extent",geom.Interval.mk(0,100));



data.LinearScale.setExtent = function (xt) {
  this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
}

data.LinearScale.mk = function (cv,xt) {
  var rs = data.LinearScale.instantiate();
  if (cv) rs.set("coverage",cv);
  if (xt) {
    rs.setExtent(xt);
  }
  return rs;
}
  
data.LinearScale.eval = function (v) {
  var cv = this.coverage;
  var xt = this.extent;
  var sc = (xt.ub - xt.lb)/(cv.ub - cv.lb);
  return (this.isY)?xt.ub - sc * (v - cv.lb):xt.lb + sc * (v - cv.lb); // Y up 
}

data.LinearScale.dtToImScale = function () {
   var cv = this.coverage;
   var xt = this.extent;
   return (xt.ub-xt.lb)/(cv.ub - cv.lb);
}

  
// c = max after decimal place; @todo adjust for .0000 case
pj.nDigits = function (n,d) {
  var ns,dp,ln,bd,ad;
  if (typeof n !=="number") return n;
  var pow = Math.pow(10,d);
  var unit = 1/pow;
  var rounded = Math.round(n/unit)/pow;
  ns = String(rounded);
  dp = ns.indexOf(".");
  if (dp < 0) return ns;
  ln = ns.length;
  if ((ln - dp -1)<=d) return ns;
  bd = ns.substring(0,dp);
  ad = ns.substring(dp+1,dp+d+1)
  return bd + "." + ad;
}


  
data.LinearScale.label = function (dv) {
  return pj.nDigits(dv,3);
}

data.set("OrdinalScale",pj.Object.mk()).__namedType();
data.OrdinalScale.set("coverage",10); // the number of __values
data.OrdinalScale.set("extent",geom.Interval.mk(0,100));// the range in which to place them

data.OrdinalScale.setExtent = function (xt) {
  this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
}

data.OrdinalScale.mk = function (cv,xt) {
  var rs = data.OrdinalScale.instantiate();
  if (cv) rs.set("coverage",cv);
  if (xt) {
    this.setExtent(xt);
  }
  return rs;
}

data.OrdinalScale.eval = function (v) {
  var cv = this.coverage;
  var xt = this.extent;
  var sc = (xt.ub - xt.lb)/cv;
  return (this.isY)?xt.ub - sc * v - cv:xt.lb + sc * v; // Y up 
 
}

data.OrdinalScale.dtToImScale = function () {
   var cv = this.coverage;
   var xt = this.extent;
   return (xt.ub-xt.lb)/cv;
}

data.OrdinalScale.label = function (dv) {
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

data.set("Sequence",pj.Object.mk()).__namedType();

 
//find the index of the field whose role or id is nm
data.Sequence.fieldIndex = function (nm) {
  var n=0;
  var rs=-1;
  this.fields.some(function (f) {
    if ((f.id === nm)||(f.role === nm)){
      rs=n;
      return true;
    }
    n++;
  });
  return rs;
}

//
//  if containsPoints is true, assume an array of pairs, and each is to be a point

data.mkPointSeries = function (pnts) {
  var rs = Object.create(data.Sequence);
  rs.containsPoints = true;
  rs.set("elements",pnts);
  return rs;
}

var fieldProps = ['id','type','label'];

data.copyFields = function (fields) {
  var rs = pj.Array.mk();
  fields.forEach(function (field) {
    var cf = pj.Object.mk();
    fieldProps.forEach(function (prop) {
      var v = field[prop];
      if (typeof v === 'string') {
        cf[prop] = v;
      }
    });
    rs.push(cf);
  });
  return rs;
}


// use labels as ids, if ids are missing, and conversely
var fillInLabelsIds = function (fields) {
  fields.forEach(function (field) {
    if (field.id === undefined) {
      field.id = field.label;
    } else if (field.label === undefined) {
      field.label = field.id
    }
  });
  return fields;
}

data.Sequence.mk = function (dt) {
  var els,rs,nels,fields,ln,primitiveSeries;
  if (!dt) return undefined;
  if (data.Sequence.isPrototypeOf(dt)) {
    return dt;
  }
  els = dt.rows;
  if (els === undefined) {
    els = dt.elements?dt.elements:[];
  }
  if (!pj.Array.isPrototypeOf(els)) {
    return "elements should be array";
  }
  rs = Object.create(data.Sequence);
  nels = pj.Array.mk();
  if (dt.containsPoints) {
    rs.containsPoints = true;
    var nels = pj.Array.mk();
    els.forEach(function (e) {
      var p = geom.Point.mk(e[0],e[1]);
      nels.push(p);
    });
    rs.set("elements",nels);
    return rs;
  }
  fields = dt.fields = fillInLabelsIds(dt.columns?dt.columns:dt.fields);
  // rename domain and range to their standard names
  ln = fields.length;
  primitiveSeries = ln === 1; 
  els.forEach(function (el) {
    nels.push(primitiveSeries?el:elementToObject(fields,el));
  });
  rs.set("fields",data.copyFields(fields));
  pj.setProperties(rs,dt,["categories","categoryCaptions"]);
  rs.set("elements",nels);
  pj.setProperties(rs,dt,["title"]);
  return rs;
}

data.Sequence.length = function () {
  return this.value.length;
}

// for use with polylines
  

data.Sequence.toPoints= function (category) {
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
data.Sequence.computeCategories = function () {
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

/*
 * Incoming data is "internalized" to make it more convenient to work with. How this works:

 * Each chart type might have markType. The only alternatives are "N" (meaning number), or "pointArray" (eg a polyline)
 * N means that the mark conveys a numerical value.  Numerical marks are always placed along a domain
 * (which might be horizontal or vertical), and that placement conveys another number : the domain value
 * Incoming data has the form {title:, fields: , elements: }.
 *  The first field is treated as the domain, and the remaining fields specify a sequence of range values for each domain value.
 *  Often, as with bar a scatter charts, for each domain value, there is one mark allocated for each range value.
 *
 *   Data internalization computesa new data sequence from the incoming data, where there a separate data element for each range value.
 *   Specifically, each incoming element {domain:v,range1:r1,...,rangen:rN} is turned into N elements:
 *  {domain:v,range:r1,category:range1},... {domain:v,range:rN,category:rangen}.
 *  Then, in building the chart, one mark is created for each element of the internalized sequence
 *  In the case of the bar graph, and scatter graphs, the marks are assigned a color to indicate their category.
 *  
 *  For point arrays, the idea is similar: rearrange the data so that there is one data  element per mark.
 *  
 * pointArrays give a mapping from a sequence of domain values to their corresponding range values.
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
  
var fieldId = function (field) {
  return (typeof field === 'object')?field.id:field;
}


var fieldLabel = function (field) {
  if (typeof field === 'object') {
    return field.label?field.label:field.id;
  } else {
    return field;
  }
}

data.Sequence.setupCategories = function (dt,flds) {
  var nflds;
  //var flds = dt.fields;
  var ln = flds.length;
  var categorize = ln >= 3;
  var domainId = fieldId(flds[0]);
  if (categorize) {
    var cts = pj.Array.mk();
    var categoryCaptions = pj.Object.mk();
    var rangeType = 'number';
    for (var i=1;i<ln;i++) {
      var fld = flds[i];
      var ct = fieldId(fld);
      cts.push(ct);
      categoryCaptions[ct] = fieldLabel(fld);
      if (fld.type !== 'number') {
        rangeType = 'string';
      }
    }
    this.set("categories",cts);
    this.set("categoryCaptions",categoryCaptions);
  }
  var fld0 = pj.Object.mk({id:domainId,role:'domain',type:flds[0].type});
  var fld1 = pj.Object.mk({id:'value',role:'range',type:rangeType});
  if (categorize) {
    var fld2 = pj.Object.mk({id:'category',type:'string'});
    nflds = pj.Array.mk([fld0,fld1,fld2]);
  } else {
    nflds = pj.Array.mk([fld0,fld1]);      
  }
  this.set('fields',nflds);
}

data.determineTypeOfField = function (dt,field) {
  var els = dt.elements;
  var ln = els.length;
  for (var i=0;i<ln;i++) {
    var v = els[i][field];
    if (typeof v !== 'number') {
      return 'string';
    }
  }
  return 'number';
}

data.addTypesToFields = function (dt) {
  var iflds = dt.fields;
  var rs = pj.Array.mk();
  iflds.forEach(function (field) {
    if ((typeof field === 'object') && field.type) {
      rs.push(field);
    } else {
      var tp = data.determineTypeOfField(dt,field);
      if (typeof field === 'object') {
        field.type = tp;
        rs.push(field);
      } else {
        var nfield = pj.Object.mk();
        nfield.id = field;
        nfield.type = tp;
        rs.push(nfield);
      }
      //code
    }
  });
  return rs;;
}
data.toCategorized = function (dt) {
  debugger;
  var rs =  Object.create(data.Sequence);
  var flds,ln,categorize,els,i,domainId,domainType,domainV,cts,ct,nels,fld0,fld1,fld2,nflds,eltype;
  flds = data.addTypesToFields(dt);
  els = dt.elements;
  var el0 = els[0];
  /* if there is only one field, then there is nothing to do; this is a primitive sequence.  
   *  for now, the categories are the ids of the fields after the 0th (which is the domain)
   */
  ln = flds.length;
  if (ln < 2) return this;
  categorize = ln >= 3;
  domainId = fieldId(flds[0]);
  rs.setupCategories(dt,flds);
  nels = pj.Array.mk();
  els.forEach(function (el) {
    var isArray = pj.Array.isPrototypeOf(el);
    var domainV = isArray?el[0]:el[domainId];
    for (i=1;i<ln;i++) {
      var fld = flds[i];
      var fid = fieldId(fld);
      var nel = pj.Object.mk();
      nel.domain = domainV;
      nel.range = isArray?el[i]:el[fid]; 
      if (categorize) nel.category = fid;//cts[i-1];  
      nels.push(nel);
    } 
  });
  rs.set("elements",nels);
  //eltype = (domainType === "string")?"S,N":"N,N";
  //rs.elementType = eltype;
  return rs;
}
  // this converts incoming data to a form where each mark has the form {points:,[category:]}
data.to_pointArrays = function (dt) {
  var rs =  Object.create(data.Sequence);
  var flds = data.addTypesToFields(dt);

 // var flds = dt.fields;
  // if there is only one field, then there is nothing to do; this is a primitive sequence.
  //  for now, the categories are the ids of the fields after the 0th (which is the domain) 
  var ln = flds.length;
  var categorize,els,i,domain,nel,nels,cts,ctd,nel,fld0,fld1,fld2,nflds;
  if (ln < 2) return this; 
  var categorize = ln >= 3;
  els = dt.elements;
  domainId = fieldId(flds[0]);
  nels = pj.Array.mk(); // each will have the form {category:,points:},
  rs.setupCategories(dt,flds);
  if (categorize) {
    for (i=1;i<ln;i++) {
      nel = pj.Object.mk({category:rs.categories[i-1],points:pj.Array.mk()});
      nels.push(nel);
    }
  } else {
    nels.push(pj.Object.mk({category:undefined,points:pj.Array.mk()}))
  }
  els.forEach(function (el) {
    var isArray = pj.Array.isPrototypeOf(el);
    var domainV = isArray?el[0]:el[domainId];
    var fld,fid,pnt,nel;
    for (i=1;i<ln;i++) {
      var fldi = flds[i];
      var fid =  fieldId(fldi);
      pnt = geom.Point.mk(domainV,isArray?el[i]:el[fid]);
      nel = nels[i-1];
      nel.points.push(pnt);
    } 
  });
  rs.set("elements",nels);
  rs.elementType = "pointArray";
  return rs;
}
  
var fieldsById = function (fields) {
  var rs = {};
  fields.forEach(function (field) {
    var id = field.id;
    rs[id] = field;
  });
}


  // formats: "ymd" (eg "1982-2-3"), or "year". In future, will support "monthName"(eg"Jan") "md" (eg "10-27") "m"year". Defaults to ymd

  
data.dayOrdinalToYear = function (o) {
  var rdt = new Date(o * dayMilliseconds);
  var yr = rdt.getUTCFullYear();
  var yo = data.toDayOrdinal(yr);
  var lyear = 0;
  var dys = o - yo;
  return yr + dys/365;
}
    

  
data.dayOrdinalToString = function (o,format) {
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
data.toDayOrdinal = function(dts) {
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
  return rs;
}
   
  
  // converts date fields to JavaScript numerical times. No milliseconds included
  
data.Sequence.convertDateField = function (f) {
  var els = this.elements;
  els.forEach(function (el) {
    var dv = el[f];
    if (typeof dv ==="string") {
      var dord = data.toDayOrdinal(dv);
      el[f] = dord;
    }
  });
}
  
data.Sequence.convertField = function (f,typ) {
  var els = this.elements;
  els.forEach(function (el) {
    var dv = el[f];
    var nv;
    if (typeof dv==="string") {
      nv = (typ==="date")?data.toDayOrdinal(dv):
               (typ==="number")?parseFloat(dv):
               parseInt(dv);
      el[f] = nv;
    }
  });
}
  

data.Sequence.convertNumberField = function (f) {
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
  
data.internalName = function (f) {
  var r = f.role;
  return r?r:f.id;
}

var convertableTypes = {"date":1,"number":1,"integer":1};
  
data.Sequence.convertFields = function () {
  var flds = this.fields;
  var ln = flds.length;
  var fldi,ftp;
  for (var i=0;i<ln;i++) {
    var fldi = flds[i];
    var ftp = fldi.type;
    if (convertableTypes[ftp]) {
      this.convertField(data.internalName(fldi),ftp);
    }
  }
}
  
      
data.arrayExtreme = function (arr,fld,findMax) {
  var rs = findMax?-Infinity:Infinity;
  arr.forEach(function (el) {
    var v = el[fld];
    rs = findMax?Math.max(rs,v):Math.min(rs,v);
  });
  return rs;
}
    
data.Sequence.extreme = function (fld,findMax) {
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
      var v = data.arrayExtreme(points,pfld,findMax);
    } else {
      var v = el[fld];
    }
    rs = findMax?Math.max(rs,v):Math.min(rs,v);
  });
  return rs;
}
  
data.Sequence.max = function (fld) {
  return this.extreme(fld,true);
}
  
data.Sequence.min = function (fld) {
  return this.extreme(fld,false);
}

data.Sequence.range = function (fld) {
  var mn = this.min(fld);
  var mx = this.max(fld);
  return geom.Interval.mk(mn,mx);
}
  
      
    
  
data.Sequence.map = function (fn) {
  var opnts = this.value.map(fn);
  var rs = data.Sequence.mk({value:opnts});
  pj.setProperties(rs,this,["caption"]);
  return rs;
}
  
data.Sequence.scale = function (xScale,yScale) {
  function scaleDatum(p) {
    var ln = p.length;
    var npx = xScale.eval(datumGet(p,"x"));
    var npy = yScale.eval(datumGet(p,"y"));
    var np = pj.Array.mk((ln===2)?[npx,npy]:[p[0],npx,npy]);
    return np;
  }
  return data.Sequence.map(scaleDatum);
}
  
data.Sequence.domainType = function () {return "string"}; // for now

 // often, for labels we don't need the whole sequence, only domain values.  This
 // returns the domain values as a sequence
data.Sequence.extractDomainValues = function () {
  var rs = Object.create(data.Sequence);
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
  
data.Sequence.numericalDomain = function () { 
  return this.fields[0].type === "number";
}
  
 
// a Sequence might have an associated transform in its __transform field. If so, the data is transformed before binding
// to marks.

pj.nodeMethod("__dataTransform",function () {
  var anc = pj.ancestorWithProperty(this,"__transform");
  if (anc && data.Sequence.isPrototypeOf(anc)) {
    return anc["__transform"]
  }
});
      
    
// where only the domain is transformed, eg 1d bubble charts
pj.nodeMethod("__dataTransform1d",function () {
  var anc = pj.ancestorWithProperty(this,"__transform1d");
  if (anc && data.Sequence.isPrototypeOf(anc)) {
    return anc["__transform1d"]
  }
});
  
// returns the kind
data.dataKind = function (dt) {
  if (dt.fields && dt.elements) {
    return 'sequence';
  }
  if (dt.vertices && dt.edges) {
    return 'graph';
  }
  return 'unknown';
}

data.badDataErrorKind = {};


data.throwDataError = function (msg) {
  debugger;
  if (pj.throwOnError) {
    throw {kind:data.badDataErrorKind,message:msg};
  } else {
    pj.error(msg);
  }
}

// for now, this is only for data sequences

data.internalizeData = function (dt,markType) {
  var k = data.dataKind(dt);
  if (k !== 'sequence') {
    data.throwDataError('Bad form for data: expected data sequence');
  }
  var pdt,flds,categories;
  if (dt===undefined) {
    return; 
  }
  if (dt.__internalized) {
    return dt;
  }
  if (dt.containsPoints) {
    pdt = data.Sequence.mk(dt);
  } else if (markType === 'N') {
    pdt = data.toCategorized(dt);
  } else if (markType === "pointArray") {
    pdt = data.to_pointArrays(dt);
  }
  if (dt.title) {
    pdt.title = dt.title;
  }
  pdt.__internalized = true;
  return pdt;
}

  
// data for x will be present either in x.data, or x.__idata, if there is an internalization step; choose __idata if present


pj.Object.__setData = function (xdt,dontUpdate) {
  debugger;
  this.__idata = undefined;
  var isNode = pj.isNode(xdt);
  var fromExternal,dt,lifted;
  fromExternal = pj.getval(xdt,'__sourceUrl');
  if (!isNode) {
    lifted = pj.lift(xdt);
    // need an Object.create here so that we get a reference on externalization
    this.set('__data',fromExternal?Object.create(lifted):lifted);
    this.__newData = true;
  } else {
    dt = fromExternal?Object.create(xdt):xdt;
    if (!dt.__get('__parent')) {
      this.set("__data",dt);
      this.__newData = true;
    } else {
      if (this.__data !== dt) {
        this.__data = dt;
        this.__newData = true;
      }
    }
  }
  if (!dontUpdate)  {
    this.__getData();// gets data into internal form
    this.__update();
  }
}
// sometimes, data needs processing. In this case, the internalized data is put in __idata
//pj.Object.__dataInInternalForm  = function () {
pj.Object.__getData  = function () {
  if (!this.__data) {
    return undefined;
  }
  if (this.__data.__internalized) {
    return this.__data;
  }
  if (this.__idata) {
    return this.__idata;
  }
  
  if (this.markType) { // if markType is asserted, then an internalized form of the data is wanted
    var internaldt =  data.internalizeData(this.__data, this.markType);
    internaldt.__computed = 1; // so it won't get saved
    internaldt.__internalized = 1;
    this.set("__idata",internaldt);
    this.__newData = true;
    return internaldt;
  }
  return this.__data;
}



pj.Object.__dataSource = function () {
  var data = this.__get('__data');
  if (data) {
    while (data && data.__get) {
      var url = data.__get('__sourceUrl');
      if (url) {
        return url;
      }
      data = Object.getPrototypeOf(data);
    }
  }
}

pj.Array.__dataSource = function () {}


data.findDataSource = function (iroot) {
  var root = root?root:pj.root;
  var rs;
  pj.forEachTreeProperty(root,function (node) {
    var ds = node.__dataSource();
    if (rs && ds) { // there is more than one possibility; not handled yet
      return undefined;
    } else if (ds) {
      rs = [node,ds];
    }
  });
  return rs;
}
  

pj.getDataJSONP = function (url,cb) {
  
ui.getDataJSONP = function (url,cb) {
  pj.returnData = function (data) {
    if (cb) {
      cb(data);
    }
  }
  pj.loadScript(url);
}
}

//pj.data = pj.returnData;

  