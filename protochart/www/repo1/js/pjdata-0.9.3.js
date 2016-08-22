(function (pj) {
"use strict"

var geom=pj.geom;
/* For data with categories a separate prototype is produced for each category.


 * For a Spread object s, s.marks and s.modified hold the individual marks.
 * s.modified is a group with elements m[i] defined in the cases
 * where marks[i] === '__modified'.!

 */

 debugger;

pj.defineSpread = function (groupConstructor) {
  pj.set('Spread',groupConstructor()).__namedType(); 

debugger;


/* a utility. Given an array of categories, and a master prototype
 * it fills in missing categories with instances of the master prototype, and also initializes colors
 */

pj.Spread.fixupCategories = function (icategories) {
  var categories = icategories?icategories:[];
  var mc = this.categorizedPrototypes;
  if (!mc) {
    mc = this.set('categorizedPrototypes',pj.Object.mk());
    //pj.declareComputed(mc);
  }
  var mp = this.masterPrototype;
  var thisHere = this;
  var fe = function (c,idx) {
    if (!mc[c]) {
      var cp = mp.instantiate();
      cp.__markProto = 1;
      mc.set(c,cp);
      if (!cp.setColor) {
        debugger;
      }
      cp.setColor(pj.svg.stdColor(idx));
    }
  }
  categories.forEach(fe);
  fe('defaultPrototype',0);
}
  

var categoryCounts = function(dt,startIndex) {
  var dln = dt.length;
  var rs = {};
  var perEl = function (el) {
    var dcat = el.category;
    var cat = (dcat===undefined)?'__default':dcat;
    var sf = rs[cat];
    rs[cat] = (sf===undefined)?1:sf+1;
  }
  if (pj.Array.isPrototypeOf(dt)) {
    dt.forEach(perEl);
  } else {
    pj.forEachTreeProperty(dt,perEl);
  }
  return rs;
}
  
 /* 
   * It is more efficient to instantiate a single object multiple times
   * So, we prebuild the supply of marks we will need, building them in batches by category
  */
 
var buildInstanceSupply = function(marks,ip,dt,byCategory) { // for dataless spreads, dt will be the count
  var i,n,irs,rs,irs,instances,proto,cat,ccnts,dataln,modln,mods,modcnt,mdi,sz;
  pj.tlog('Start Instance supply; byCategory',byCategory);
  if (byCategory) {
    ccnts = categoryCounts(dt,0);
    rs = {};
    for (cat in ccnts) {
      if (cat === '__default') {
        p = ip.defaultPrototype;
      } else {
        var p = ip[cat];
        if (!p) {
          p = ip.defaultPrototype;
        }
      }
      n = ccnts[cat];
      if (n===1) {
        instances= [p.instantiate()];
      } else {
        instances= p.instantiate(n);
      }
      rs[cat] = instances;
      instances.forEach(function (i) {i.__mark = 1;});//;i.__category = cat;});
    }
  } else {
    sz = (typeof  dt === 'number')?dt:dt.__size();
    irs = ip.instantiate(sz);
    rs = (sz === 0)?[]:((sz === 1)?[irs]:irs);
    rs.forEach(function (i) {i.__mark = 1});
  }
  pj.tlog('finish instance supply'); 
   return rs;
}

/*
 *  This is for building the mark set for new data, or after restoring from an external file.
 *  It grabs the mark from modifications if available, and otherwise uses the instance supply. 
 */

 pj.Spread.generateMark = function (instanceSupply,n,element,byCategory) { 
  var dst = this.marks;
  var modifications = this.modifications;
  var categories = this.categories;
  var useArray = false;
  var modified = false;
  var dcat,cat,insts,nm,rs;
  if (typeof n === 'number') {
    useArray = true;
    nm = 'm'+n;
    if (modifications[nm]) {
      dst.push('__modified');
      modified = true;
    }
  } else {
    if (modifications[n]){
      dst[n] = '__modified';
      modified = true;
      return;
    }
  }
  if (byCategory) {
    dcat =  element.category;
    cat = (dcat===undefined)?'__default':dcat;
    this.categories.push(cat);
    if (modified) {
      return;
    }
    insts = instanceSupply[cat];
  } else {
    if (modified) {
      return;
    }
    insts = instanceSupply;   
  }
  if (!insts) {
      debugger;
  }
  rs = insts.pop();
  if (useArray) {
    dst.push(rs);
  } else {
    dst.set(n,rs);
  }
  if (typeof rs === 'object') rs.__show();//ie not '__modified'
  return rs; 
}
/*
 * This syncs the set of marks to the data.  If there are already marks in the set, 
 * it reuses them, and builds new ones as required. For now,  if the data is categorized
 * sync always starts from scratch

 * a reset is needed if the set of categories has changed
 */
/*
 * Checks that the categories of marks and data line up, and that each is of the same length.
 */
  
 pj.Spread.inSync = function () {
  var count = this.count;
  var data = this.data;
  var marks = this.marks;
  var elements,isArray,ln,nomarks,size;
  if (data) {
    elements = data.elements?data.elements:data;
    isArray =  pj.Array.isPrototypeOf(elements);
    size = elements.__size();
  } else {
    isArray = true;
    size = count;
  }
  //var ln = this.numElements;
  var nomarks = (!marks) || (marks.length === 0); // marks.length === 0 will hold when loading a saved spread
  if (nomarks) {
    return this.numElements === size?'nomarks':false;
  }
  ln = this.marks.length;
  if (ln !== size) {
    return false;
  }
  if (count || ((!data.categories)  && isArray)) {
    return true;
  }
  var categories = this.categories;
  if (isArray) {
    for (var i=0;i<ln;i++) {
      if (categories[i]  !== elements[i].category) {
        return false;
      }
    }
    return true;
  } else {
    pj.forEachTreeProperty(this,function (mark,nm) {
      var el = elements[nm];
      if (!el) return false;
      if (categories) {
        if (!Object.isProtototypeOf(this.categorizedPrototypes[categories[nm]],mark)) {
          return false;
        }
      }
    });
    return true;
  }
}

  
    
pj.Spread.sync = function () {
  var count = this.count; // for a dataless spread
  var data = this.data;
  var p,shps,sln,dt,dln,i,isup,categories,elements,isArray,byCategory,thisHere,ins;
  if (!(data || count)) return this;//not ready
  if (data) {
    elements = data.elements?data.elements:data;
    isArray = pj.Array.isPrototypeOf(elements);
  } else {
    isArray = true;
  }
  ins = this.inSync();
  if (ins) {
    if (ins === 'nomarks') {
      this.set('marks',mkTheMarks(isArray));
    } else {
      return this;
    } 
  } else {
    this.reset();
  }
  var shps = this.__get('marks');
  if (!shps) {
    shps = this.set('marks',mkTheMarks(isArray));
  }
  pj.declareComputed(shps);
  if (count) {
   isup = buildInstanceSupply(this,this.masterPrototype,count);
    for (var i=0;i<count;i++) {
      this.generateMark(isup,i);
    }
    this.numElements = count;
    return this;
  }
  categories = data.categories;
  if (categories) {
    p = this.categorizedPrototypes;
    if (!p) {
      this.fixupCategories(data.categories);
      p = this.categorizedPrototypes;
    }
  } else {
    p = this.masterPrototype; 
  }
 
  var eln = elements.__size();
  // set data for existing marks
  byCategory = !!categories;
  p = byCategory?this.categorizedPrototypes:this.masterPrototype;
  // make new marks
  isup = buildInstanceSupply(this,p,elements,byCategory);
  if (isArray) {
    for (var i=0;i<eln;i++) {
      this.generateMark(isup,i,elements[i],byCategory);
    }
  } else {
    thisHere = this;
    pj.forEachTreeProperty(elements,function (element,nm) {
      thisHere.generateMark(isup,nm,elements[nm],byCategory);
    },true);
  }
  this.numElements = eln;
  return this;
}
  
  
  /*
   * a spread may have a 'binder' function, which given a mark, its datum, index, and the lenght of the series
   *  adjusts the mark as appropriate. Binders are optional.
   */
  
pj.Spread.bind = function () {
  if (!this.binder) return;
  var d = this.data;
  var count = this.count;
  var isArray;
  if (count) {
    ln = count;
    isArray = true;
  } else {
    var els = d.elements?d.elements:d;
    var ln = els.length;
    if (ln === 0) {
      return;
    }
    isArray = pj.Array.isPrototypeOf(els);
  }
  var marks = this.marks;
  var ln,i,mark,thisHere;
  if (isArray) {
    //ln = els.length;
    for (i=0;i<ln;i++) {
      mark = this.selectMark(i); 
      this.binder(mark,count?0:els[i],i,ln);
      mark.__update();
    }
  } else {
    thisHere = this;
    pj.forEachTreeProperty(els,function (el,nm) {
      mark = thisHere.selectMark(nm);
      thisHere.binder(mark,el,nm);
      mark.__update();
    });
  }
}
  
pj.Spread.update = function () {
  if (this.data || this.count) {
    this.sync();
    this.bind();
  }
}
  
  // a reset is needed when the shape of data changes in length, or in assignment of categories
pj.Spread.reset = function () {
  var shps = this.__get('marks');
  if (shps) {
    shps.remove();
    this.categories.length = 0;
  }
  
  if (this.modifications){
    this.modifications.remove();
  }
  this.initialize();
}

  /*
   * if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
   * A MarkSet mignt be unary (with just one prototype), or multiPrototype, with a prototype per category.
   */

 pj.Spread.mk = function (mp) { // multiPrototype is the default
  var rs = Object.create(pj.Spread);
  rs.initialize();
  //rs.multiPrototype = 1;
  if (mp) {    
    pj.setIfExternal(rs,'masterPrototype',mp);
  }
  return rs;
}


  
pj.Spread.forEachMark = function (fn) {
  var ln = this.marks.length;
  var i;
  for (i=0;i<ln;i++) {
    fn(this.selectMark(i),i);
  }
}

// sometimes used when there is no new data
pj.Spread.refresh = function () {
  this.forEachMark(function (mark) {
    mark.__update();
    });
}

pj.Spread.setFromData = function (p,fn) {
  this.forEachMark(function (m) {
    var d = m.data;
    var v = fn(d,i);
    m.set(p,v);
  });
}
 
  
pj.nodeMethod('__spreadAncestor',function () {
  var pr;
  if (pj.Spread.isPrototypeOf(this)) {
    return this;
  }
  pr = this.__parent;
  if (pr) {
    return pr.__spreadAncestor();
  }
});
  
  
pj.Spread.show = function () {
  this.mapOverShapes(function (s) {
    s.__show();
  });
  return this;
}
  
  
pj.Spread.colorOfCategory = function (category) {
  var rs;
  var protoForCategory = this.categorizedPrototypes[category];
  if (protoForCategory.getColor) {
    rs = protoForCategory.getColor();
  } else {
    rs = protoForCategory.fill;
  }
  console.log('color of category',category,rs);
  return rs;
}
  
pj.Spread.setColorOfCategory = function (category,color) {
  if (!this.categorizedPrototypes) {
    return;
  }
  var protoForCategory = this.categorizedPrototypes[category];
  if (protoForCategory.setColor) {
    protoForCategory.setColor(color);
  } else {
    protoForCategory.fill = color;
    protoForCategory.__update();
  }
}
  

var mkTheMarks = function (arrayData) {
  var rs;
  if (arrayData) {
    rs = pj.Array.mk();
  } else {
    rs = groupConstructor();
  }
  pj.declareComputed(rs);
  return rs;
}
 
 pj.Spread.initialize = function (arrayData) {
  pj.resetComputedArray(this,'categories');
  //this.set('categories',pj.Array.mk());
  this.set('modifications',groupConstructor());
  //pj.declareComputed(this.marks);
  this.modifications.__unselectable = true;
 }
  
// move mark number n to the modified node from the array.  
  
pj.Spread.assertModified = function (mark) {
  var md = this.modifications;
  var nm;
  if (mark.__parent === md) {
    return; // already modified 
  }
  var n = parseInt(mark.__name); 
  nm = 'm'+n;
  mark.__reparent(md,nm);
  this.marks[n] = '__modified';
  this.__draw();
}

/*
 * Revert the atomic properties, and then move the mark back to the marks array from the modified object
 * Assumes that the mark is modified
 */

 var propertiesNotToRevert = {'__name':1,'__mark':1,'visibility':1,'data':1,'transform':1,'__selected':1};

pj.Spread.unmodify = function (mark) {
  var nm = mark.__name;
  var n = Number(nm.substr(1));
  mark.__revertToPrototype(propertiesNotToRevert);
  this.modifications;
  delete this.modifications[nm];
  this.marks[n] = mark;
  mark.__parent = this.marks;
  mark.__name = n;
}

var modificationName = function (n) {
  return (typeof n === 'number')?'m'+n:n;
}

// mark might be in __modified 
pj.Spread.selectMark = function (n) {
  var rs = this.marks[n];
  return (rs === '__modified')?this.modifications[modificationName(n)]:rs;
}
pj.findReplaceableSpread = function (iroot) {
  var root = iroot?iroot:pj.root;
}
pj.Spread.replacePrototype = function (newProto) {
  var cp,categories,perCategory,oldProto;
  oldProto = this.masterPrototype;
  pj.transferState(newProto,oldProto);
  newProto.__adjustable = !!oldProto.__adjustable;
  newProto.__draggable = !!oldProto.__draggable;
  //newProto.__hide();
  categories = this.data.categories;
  if (categories) {
    cp = this.categorizedPrototypes;
    perCategory = function (category) {
      var newCP = newProto.instantiate();
      newCP.__markProto = true;
      pj.transferState(newCP,cp[category],'ownOnly');
      cp.set(category,newCP);
    }
    categories.forEach(perCategory);
    perCategory('defaultPrototype')
  }
 // newProto.fill = this.masterPrototype.fill;
  this.set('masterPrototype',newProto);
  this.marks.remove();
  var mods = this.modifications;
  if (mods) {
    pj.forEachTreeProperty(mods,function (mod,prop) {
      mods.set(prop,pj.transferState(newProto.instantiate(),mod,'ownOnly'));
    });
  }
  // only do an update if one has been done before
  if (this.__updateCount) {
    this.update();
    this.__draw();
  }
}

}

debugger;
pj.defineSpread(pj.svg.tag.g.mk);
  var dat = pj.set("dat",pj.Object.mk());
  dat.__builtIn = true;

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
      return true;
    }
    n++;
  });
  return rs;
}

//
//  if containsPoints is true, assume an array of pairs, and each is to be a point

dat.mkPointSeries = function (pnts) {
  var rs = Object.create(dat.Series);
  rs.containsPoints = true;
  rs.set("elements",pnts);
  return rs;
}

var fieldProps = ['id','type','label'];

dat.copyFields = function (fields) {
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
  rs.set("fields",dat.copyFields(fields));
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
  //cts = pj.resetComputedArray(this,'categories');
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
    //cts = pj.resetComputedArray(rs,"categories");
    var cts = pj.Array.mk();
    var categoryCaptions = pj.Object.mk();
    for (i=1;i<ln;i++) {
      ct = flds[i].id;
      cts.push(ct);
      categoryCaptions[ct] = flds[i].label;
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
  if (categorize) {
    rs.set("categories",cts);
    rs.set("categoryCaptions",categoryCaptions);
  }
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
  
var fieldsById = function (fields) {
  var rs = {};
  fields.forEach(function (field) {
    var id = field.id;
    rs[id] = field;
  });
}
/*
dat.Series.computeCategoryCaptions = function () {
  debugger;
  var ccc = this.categoryCaptions;
  if (ccc) return ccc;
  var cats = this.categories;
  if (!cats) return;
  var byId = fieldsById(this.fields);
  
  var rs = pj.Object.mk();
  cats.forEach(function (c) {rs[c]=byId[c].label;});
  this.categoryCaptions = rs;
  return rs;
}*/

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
  return this.extreme(fld,true);
}
  
dat.Series.min = function (fld) {
  return this.extreme(fld,false);
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
  
// returns the kind
dat.checkIncomingData = function (dt) {
  if (dt.fields && dt.elements) {
    return 'table';
  }
  if (dt.rows && dt.columns) {
    return 'table';
  }
  if (dt.vertices && dt.edges) {
    return 'graph';
  }
  return false;
}

dat.badDataErrorKind = {};

dat.internalizeData = function (dt,markType) {
  debugger;
  var ok = dat.checkIncomingData(dt);
  if (!ok) {
    throw {kind:dat.badDataErrorKind,message:'bad data'}
  }
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
    debugger;
    pdt = dat.Series.mk(dt);
    flds = pdt.fields;
    if ((markType === 'NNC')||(markType === "[N|S],N")){
      pdt = pdt.toNNC();
      categories = pdt.categories;
    } else if (markType === "pointArray") {
      pdt = pdt.to_pointArrays();
      categories = pdt.computeCategories();
    }
    if (dt.title) {
      pdt.title = dt.title;
    }
    //if (categories){
    //  pdt.computeCategoryCaptions();
    //}
    pdt.convertFields();
  } else {
    pdt = pj.lift(dt);
  }
  pdt.__internalized = true;
  return pdt;
}
  
pj.dataInternalizer = dat.internalizeData;
  
// data for x will be present either in x.data, or x.__idata, if there is an internalization step; choose __idata if present


pj.Object.setData = function (xdt,doUpdate) {
  //var isArray = Array.isArray(xdt);
  var isNode = pj.isNode(xdt);
  var fromExternal,dt,lifted;
  fromExternal = pj.getval(xdt,'__sourcePath');
  if (!isNode) {
    lifted = pj.lift(xdt);
    // need an Object.create here so that we get a reference on externalization
    this.set('data',fromExternal?Object.create(lifted):lifted);
    this.__newData = true;
  } else {
    dt = fromExternal?Object.create(xdt):xdt;
    if (!dt.parent()) {
      this.set("data",dt);
      this.__newData = true;
    } else {
      if (this.data !== dt) {
        this.data = dt;
        this.__newData = true;
      }
    }
  }
  this.getData();// gets data into internal form
  if (doUpdate)  {
    this.__update();
  }
}
// sometimes, data needs processing. In this case, the internalized data is put in __idata
//pj.Object.__dataInInternalForm  = function () {
pj.Object.getData  = function () {
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
    this.__newData = true;
    return internaldt;
  }
  return this.data;
}


//pj.Object.getData = function () {
//  return this.__dataInInternalForm();
  //var idt = this.__idata;
  //return idt?idt:this.data;
//}

pj.Object.__dataSource = function () {
  var dat = this.__get('data');
  if (dat) {
    while (dat && dat.__get) {
      if (dat.__get('__sourcePath')) {
        return pj.fullUrl(dat.__get('__sourceRelto'),dat.__get('__sourcePath'));
        //return dat.__get('__sourceRepo') + "|" + dat.__sourcePath;
      }
      dat = Object.getPrototypeOf(dat);
      //code
    }
  }
}

pj.Array.__dataSource = function () {}


dat.findDataSource = function (iroot) {
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
  
  
 
return pj;
})(prototypeJungle);
