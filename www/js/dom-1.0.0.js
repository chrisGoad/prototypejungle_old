

(function (pj) {
"use strict";
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly

/* For data with categories a separate prototype is produced for each category.


 * For a Spread object s, s.marks and s.modified hold the individual marks.
 * s.modified is a group with elements m[i] defined in the cases
 * where marks[i] === '__modified'.!

 */

pj.defineSpread = function (groupConstructor) {
  pj.set('Spread',groupConstructor()).__namedType(); 


/* a utility. Given an array of categories, and a master prototype
 * it fills in missing categories with instances of the master prototype, and also initializes colors
 */

pj.Spread.fixupCategories = function (icategories) {
  var categories = icategories?icategories:[];
  var mc = this.categorizedPrototypes;
  if (!mc) {
    mc = this.set('categorizedPrototypes',pj.Object.mk());
  }
  var mp = this.masterPrototype;
  var thisHere = this;
  var fe = function (c,idx) {
    if (!mc[c]) {
      var cp = mp.instantiate();
      cp.__markProto = 1;
      mc.set(c,cp);
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
    if (modifications && modifications[nm]) {
      dst.push('__modified');
      modified = true;
    }
  } else {
    if (modifications && modifications[n]){
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
  var data = this.__data;
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
  var data = this.__data;
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
   * a spread may have a 'binder' function, which given a mark, its datum, index, and the lenght of the sequence
   *  adjusts the mark as appropriate. Binders are optional.
   */
  
pj.Spread.bind = function () {
  if (!this.binder) return;
  var d = this.__data;
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
  if (this.__data || this.count) {
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
    var d = m.__data;
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
  categories = this.__data.categories;
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


 
var geom = pj.set("geom",pj.Object.mk());
geom.__builtIn = true;
geom.set("Point",pj.Object.mk()).__namedType;

geom.Point.mk = function (x,y) {
  var rs = Object.create(geom.Point);
  if (typeof x==="number") {
    rs.x = x;
    rs.y = y;
  } else {
    rs.x = 0;
    rs.y =0;
  }
  return rs;
}
  
geom.Point.nonNegative = function () {
  this.x = Math.max(0,this.x);
  this.y = Math.max(0,this.y);
  return this;
}

geom.Point.hasNaN = function () {
  return isNaN(this.x) || isNaN(this.y);
}

  
  
  // set the property p of this to v construed as a point 
  
pj.Object.__setPoint = function (p,v) {
  var pnt;
  if (v) {
    pnt = geom.toPoint(v);
  } else {
    pnt = geom.Point.mk();
  }
  this.set(p,pnt);
  return pnt;
}



geom.Point.x = 0;
geom.Point.y = 0;



geom.Point.plus = function (q) {
  var p = this;
  return geom.Point.mk(p.x + q.x,p.y + q.y);
};

geom.Point.plusX = function (x) {
  return geom.Point.mk(this.x + x,this.y);
}
  
  
geom.Point.plusY = function (y) {
  return geom.Point.mk(this.x,this.y+y);
}

geom.Point.length = function () {
  var x = this.x;
  var y = this.y;
  return Math.sqrt(x*x + y*y);
}

// x might be an array, or a point, or x and y might be numbers
geom.pointify = function (mkNew,x,y) {
  var p;
  if (x === undefined) {
    p = geom.Point.mk(0,0);
  } else if (typeof(y)==="number") {
    p = geom.Point.mk(x,y);
  } else if (pj.Array.isPrototypeOf(x) || Array.isArray(x)) {
    p = geom.Point.mk(x[0],x[1])
  } else {
    p = mkNew?geom.Point.mk(x.x,x.y):x;
  }
  return p;
}



geom.toPoint = function (x,y) {
  return geom.pointify(0,x,y);
}

geom.Point.copy = function () {
  return geom.Point.mk(this.x,this.y);
}
  
  
geom.Point.copyto = function (src) {
  this.x = src.x;
  this.y = src.y;
  return this; 
}


geom.newPoint = function (x,y) {
  return geom.pointify(1,x,y);
}


geom.Point.direction = function () {
  return geom.normalizeAngle(Math.atan2(this.y,this.x));
}

geom.Point.difference = function (q) {
  var p = this;
  return geom.Point.mk(p.x - q.x,p.y - q.y);
}

geom.set("Interval",pj.Object.mk()).__namedType();


geom.Interval.mk = function (lb,ub) {
  var rs = Object.create(geom.Interval);
  rs.lb = lb;
  rs.ub = ub;
  return rs;
}

geom.mkInterval = function (lb,ub) {
  return geom.Interval.mk(lb,ub);
}

geom.Point.setCoords = function (x,y) {
  this.set("x",x);
  this.set("y",y);
}

// if p is null, compute distance from origin
geom.Point.distance = function (p) {
  var vx,vy;
  if (p) {
    vx = this.x - p.x;
    vy = this.y - p.y;
  } else {
    vx = this.x;
    vy = this.y;
  }
  return Math.sqrt(vx*vx + vy * vy);
  
}


geom.Point.times = function (f) {
  var p = this;
  return geom.Point.mk(f*p.x,f*p.y);
}


geom.Point.normalize = function () {
  var ln = this.length();
  return geom.Point.mk(this.x/ln,this.y/ln);
}


geom.Point.normal = function () {
  return geom.Point.mk(-this.y,this.x);
}

geom.Point.minus = function () {
  return geom.Point.mk(-this.x,-this.y);
}

geom.Point.dotp = function (p) {
  return this.x * p.x + this.y * p.y;
}

geom.mkRadialPoint = function (r,a) {
  return geom.Point.mk(r*Math.cos(a),r*Math.sin(a));
}


geom.Point.interpolate = function (dst,fc) {
   var d = dst.difference(this);
   var vc  = d.times(fc);
   var rs = this.plus(vc);
   return  rs;
}

geom.Point.toRectangle = function () {
  var x = this.x;
  var y = this.y;
  var xt = geom.Point.mk(Math.abs(x),Math.abs(y));
  var cx = (x<0)?x:0;
  var cy = (y<0)?y:0;
  var crn = geom.Point.mk(cx,cy);
  return geom.Rectangle.mk({corner:crn,extent:xt});
}

geom.Point.toString = function () {
  var x = this.x;
  var y = this.y;
  return "["+x+","+y+"]";
}

geom.set("Transform",pj.Object.mk()).__namedType();

// every transform will have all three of scale, rotation,translation defined.
// scale might be scale or a point. In the latter case, the scaling in  x and y are the scale's coordinates.
geom.Transform.mk = function (o,scale,rotation) {
  var rs = Object.create(geom.Transform);
  var otranslation,oscale,orotation;
  rs.scale = 1;
  rs.rotation = 0;
  if (!o) {
    rs.set("translation",geom.Point.mk());
    return rs;
  }
  if (geom.Point.isPrototypeOf(o)) {
    rs.translation = o;
    if (typeof scale === 'number') {
      rs.scale = scale;
    }
    if (typeof rotation === 'number') {
      rs.rotation = rotation;
    }
    return rs;
  }
  otranslation = o.translation;
  if (otranslation) {
    rs.__setPoint('translation',otranslation);
  }
  oscale = o.scale;
  if (typeof oscale === "number") {
    rs.scale = oscale;
  }
  orotation = o.rotation;
  if (typeof orotation === "number") {
    rs.rotation = ort;
  } 
  return rs;
}

geom.Transform.hasNaN = function() {
  if (isNaN(this.scale)) return true;
  if (isNaN(this.rotation)) return true;
  var tr = this.translation;
  if (tr) {
    return tr.hasNaN();
  }
}


geom.normalizeAngle = function (a) { // normalize to between 0 and 2*Pi
  var m = a%(Math.PI*2);
  if (m < 0) m = m + Math.PI*2;
  return m;
}
  
// see __draw: __properties translation (a point), subject and optionally scale,rotation (later matrix xform)
// if the subject is another translation

  
  
geom.mkRotation = function (r) {
  var trns =  geom.Transform.mk();
  trns.rotation = r;
  return trns;

}

// x might be a point; this is in the object's own coord system
geom.mkTranslation = function (x,y) {
  var p = geom.newPoint(x,y);
  var trns = geom.Transform.mk({translation:p});
  return trns;
}

geom.mkScaling = function (s) {
  var trns = geom.Transform.mk();
  trns.scale = s;
  return trns;
}
  
// move to a given location where x,y are in global coords
geom.movetoInGlobalCoords = function (nd,x,y) { // only for points for now; inputs are in global coordinates
  var p = geom.toPoint(x,y);
  var pr = nd.__parent;
  var lp = geom.toLocalCoords(nd,p);//desired position of this relative to its parent
  // we want to preserve the existing scaling
  var xf = nd.transform;
  var o = {};
  if (xf) {
    xf.translation.setTo(lp);
  } else {
    o.translation = lp;
    var trns = geom.Transform.mk(o);
    nd.set("transform", trns);
  }
  nd.__transformToSvg();

}

  
geom.Transform.inverse =  function () {
  var s = this.scale;
  var ns,nsx,nsy,tr;
  if (!s) s = 1;
  if (typeof s === "number"){
    ns = 1/s;
    nsx = ns;
    nsy = nsy;
  } else {
    nsx = 1/(s.x);
    nsy = 1/(s.y);
    ns = geom.Point.mk(nsx,nsy);
  }
  tr = this.translation;
  if (tr) {
    nx = -(tr.x) * nsx;
    ny = -(tr.y) * nsy;
    return geom.Transform.mk({scale:ns,translation:geom.Point.mk(nx,ny)});
  } else {
    return geom.Transform.mk({scale:ns});
  }
  }

   
geom.Point.applyTransform = function (tr) {
 // order: rotation,scaling  translation
 var trns = tr.translation;
 var tx = trns.x,ty = trns.y;
 var sc = tr.scale;
 var scx,scy,rt,x,y,s,c,rx,ry,fx,fy;
 if (sc === undefined) {
    scx = scy = 1;
 } else if (typeof sc === "number") {
   scx = scy = sc;
 } else {
   scx = sc.x;
   scy = sc.y;
 }
 rt = tr.rotation;
 x = this.x;
 y = this.y;
 if (rt === 0) {
   var rx = x,ry = y;
 } else {
   s = Math.sin(rt);
   c = Math.cos(rt);
   rx = c*x - s*y;
   ry = s*x + c*y;
 }
 fx = scx*rx + tx;
 fy = scy*ry + ty;
 return geom.Point.mk(fx,fy);
}

geom.Transform.apply = function (p) {
  return p.applyTransform(this);
}

geom.Transform.applyInverse = function (p) {
  // reverse order: translation, scaling, rotation
  var trns = this.translation;
  var sc = this.scale;
  var rt = this.rotation;
  var px = p.x - trns.x;
  var py = p.y - trns.y;
  var isc = 1/sc;
  var s,c,fx,fy;
  px = px * isc;
  py = py * isc;
  if (rt === 0) {
    fx = px,fy = py;
  } else {
    s = Math.sin(-rt);
    c = Math.cos(-rt);
    fx = c*px - s*py;
    fy = s*px + c*py;
  }
 
  return geom.Point.mk(fx,fy);
}

geom.Point.applyInverse = function (tr) {
  return tr.applyInverse(this);
}

geom.Transform.applyToPoints = function (pnts) {
  var rs = pj.Array.mk();
  var thisHere = this;
  pnts.forEach(function (p) {
    rs.push(p.applyTransform(thisHere));
  });
  return rs;
}
    

// ip is in this's coords. Return ip's coords at the top level: ie, at the svg level. // relative to the root of the tree.
// the transform of the root itself is not included (this last takes care of the zoom and pan)
// globalObject, if ommitted,is effectively pj.  If includeRoot is given, then  this means go all the way up
// to svg coords. Otherwise, stop at ui.root

geom.toGlobalCoords = function (nd,ip,includeRoot) {
  var p = ip?ip:geom.Point.mk(0,0);
  var pr = nd.__get('__parent');
  var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || pj.Array.isPrototypeOf(pr));
  var xf;
  if (atRoot && !includeRoot) return p;
  xf =nd.__get("transform");
  if (xf) {
    p = p.applyTransform(xf);
  }
  if (atRoot) return p;
  return geom.toGlobalCoords(pr,p);
}
  
  
geom.scalingDownHere = function (nd,includeRoot,sofar) {
  var s = (sofar===undefined)?1:sofar;
  var pr = nd.__get('__parent');
  var atRoot = !(pj.svg.Element.isPrototypeOf(pr) || pj.Array.isPrototypeOf(pr));
  var xf;
  if (atRoot && !includeRoot) return s;
  xf =nd.__get("transform");
  if (xf) {
    s = xf.scale * s;
  }
  if (atRoot) return s;
 return geom.scalingDownHere(pr,includeRoot,s);
}
// p is in the coords of nd's parent; returns that point in nd's own coords

geom.toCoords = function (nd,p) {
  var xf = nd.__get("transform");
  if (xf) {
    return xf.applyInverse(p);
  } else {
    return p;
  }
}
// ip is in global coords. Return ip's coords in the coords associated with nd's parent
// (If we wish to move nd to p, we want p expressed in nd's parent's coords)
geom.toLocalCoords = function (nd,ip,toOwn) {
 var p = ip?ip:geom.Point.mk(0,0);
 var pr = nd.__get('__parent');
 var prIsRoot = (!pr);
 if (prIsRoot) return toOwn?geom.toCoords(nd,p):p;
 var gpr = pr.__get('__parent');
 var prIsRoot = !(pj.svg.Element.isPrototypeOf(gpr) || pj.Array.isPrototypeOf(gpr));
 if (prIsRoot) return toOwn?geom.toCoords(nd,p):p;
 p = geom.toLocalCoords(pr,p); // p in the coords of the grandparent
 p = geom.toCoords(pr,p);
 return toOwn?geom.toCoords(nd,p):p;
}

geom.toOwnCoords = function (nd,p) {
 return geom.toLocalCoords(nd,p,true);
}

geom.toParentCoords = function (nd,p) {
 return geom.toLocalCoords(nd,p);
}
  
// ip in nd's own coordinates
geom.toOwnCoords = function (nd,ip) {
  var p = geom.toLocalCoords(nd,ip);
  var xf = nd.__get("transform");
  if (xf) {
    p = xf.applyInverse(p);
  }
  return p;
}


 geom.translateX = function (nd,x) {
  var xf = nd.transform;
  if (xf) {
    xf.translation.x =x;
    return;
  }
  var xf = geom.mkTranslation(x,0);
  nd.set("transform",xf);
}


 geom.translateY = function (nd,y) {
  var xf = nd.transform;
  if (xf) {
    xf.translation.y =y;
    return;
  }
  xf = geom.mkTranslation(0,y);
  nd.set("transform",xf);
}
  
geom.setScale = function (nd,s) {
  var xf = nd.transform;
  if (xf) {
    xf.scale = s;
    return;
  }
  xf = geom.mkScaling(s);
  nd.set("transform",xf);
}



geom.rotate = function (nd,r) {
  var xf = nd.transform;
  if (xf) {
    xf.rotation = r;
    return xf;
  }
  xf = geom.mkRotation(r);
  nd.set("transform",xf);
}

    
    
geom.Point.setTo = function (src) {
  this.x = src.x;
  this.y = src.y;
}

geom.Point.setXY = function (x,y) {
  if (y === undefined) { // assume the one arg is a point
    this.x = x.x;
    this.y = x.y;
  } else { 
    this.x = x;
    this.y = y;
  }
}



geom.set("Rectangle",pj.Object.mk()).__namedType();

// takes corner,extent or {corner:c,extent:e,style:s} style being optional, or no args
// Rectangles without styles are often used for purely computational purpose - never drawn.
geom.Rectangle.mk = function (a0,a1) {
  var rs = Object.create(geom.Rectangle);
  var c,e,style;
  if (!a0) return rs;
  if (a1) {
    c = a0;
    e = a1;
  } else {
    if (a0.style) {
      style = pj.__draw.Style.mk();
      rs.set("style",style);
      pj.extend(style,a0.style);
    }
    var c = a0.corner;
    var e = a0.extent;
  }
  rs.__setPoint("corner",c);
  rs.__setPoint("extent",e);
  return rs;
}
  
geom.Rectangle.toString = function () {
  var corner = this.corner;
  var extent = this.extent;
  return '[['+corner.x+','+corner.y+'],['+extent.x+','+extent.y+']]';
}

geom.Rectangle.hasNaN = function () {
  var crn = this.corner;
  var xt = this.extent;
  if (crn) {
    if (isNaN(crn.x) || isNaN(xt.y)) {
      return true;
    }
  }
  if (xt) {
    if (isNaN(xt.x) || isNaN(xt.y)) {
      return true;
    }
  }
}


geom.Rectangle.set("corner",geom.Point.mk());
geom.Rectangle.set("extent",geom.Point.mk(1,1));

geom.Rectangle.corners = function () {
  var rs = [];
  var c = this.corner;
  var cx = c.x,cy = c.y;
  var xt = this.extent;
  var xtx = xt.x;
  var xty = xt.y;
  rs.push(c);
  rs.push(geom.Point.mk(cx,cy+xty));
  rs.push(geom.Point.mk(cx+xtx,cy+xty));
  rs.push(geom.Point.mk(cx+xtx,cy));
  return rs;
}

geom.Rectangle.expandBy = function (x,y) {
  var xt = this.extent;
  var c = this.corner;
  var nex = xt.x + x;
  var ncx = c.x - 0.5*x;
  var ney =  xt.y + y;
  var ncy =  c.y -0.5*y;
  return geom.Rectangle.mk(geom.Point.mk(ncx,ncy),geom.Point.mk(nex,ney));
}

  
// expand the extent of this to at least x in x and y in y

geom.Rectangle.expandTo = function (x,y) {
  var xt = this.extent;
  var xx = (xt.x < x)?(x-xt.x):0;
  var yx = (xt.y < y)?(y-xt.y):0;
  if ((xx === 0) && (yx === 0)) return  this;
  return this.expandBy(xx,yx);
}
  

// the bounding rectangle of an array of points

geom.boundingRectangle = function (pnts) {
  var ln = pnts.length;
  if (ln===0) return undefined;
  var p0 = pnts[0];
  var minx = p0.x;
  var maxx = minx;
  var miny = p0.y;
  var maxy = miny;
  for (var i=1;i<ln;i++) {
    var p = pnts[i];
    var px = p.x,py = p.y;
    maxx = Math.max(maxx,px);
    minx = Math.min(minx,px);
    maxy = Math.max(maxy,py);
    miny = Math.min(miny,py);
  }
  return geom.Rectangle.mk({corner:geom.Point.mk(minx,miny),extent:geom.Point.mk(maxx-minx,maxy-miny)});
}

// this ignores any transforms the rectangles might have 
geom.Rectangle.extendBy = function (xby) {
  var corners = this.corners().concat(xby.corners());
  return geom.boundingRectangle(corners);
}

geom.boundsForRectangles = function (rectangles) {
  var ln = rectangles.length;
  if (ln === 0) {
    return undefined;
  }
  var allCorners = [];
  rectangles.forEach(function (rectangle) {
    var corners = rectangle.corners();
    corners.forEach(function (corner) {
      allCorners.push(corner);
    });
  });
  return geom.boundingRectangle(allCorners);
}
    
  
geom.Rectangle.center = function () {
  var xt = this.extent;
  var c = this.corner;
  return geom.Point.mk(c.x + 0.5*xt.x,c.y + 0.5*xt.y);
}


geom.Rectangle.width = function () {
  return this.extent.x
}


geom.Rectangle.height = function () {
  return this.extent.y
}

geom.Rectangle.scaleCentered = function (sc) { // while maintaining the same center
  var wd = this.width();
  var ht = this.height();
  var cnt = this.center();
  var swd =  sc * wd;
  var sht =  sc * ht;
  var crn = cnt.plus(geom.Point.mk(-0.5 * swd,-0.5 * sht));
  var xt = geom.Point.mk(swd,sht);
  return geom.Rectangle.mk({corner:crn,extent:xt});
}

geom.Rectangle.plus = function (p) { // __translate
  var rs = geom.Rectangle.mk({corner:this.corner.plus(p),extent:this.extent});
  return rs;
}

geom.Rectangle.contains = function (p) {
  var c = this.corner;
  var px = p.x;
  var py,ex;
  if (px < c.x) return false;
  py = p.y;
  if (py < c.y) return false;
  ex = this.extent;
  if (px > c.x + ex.x) return false;
  if (py > c.y + ex.y) return false;
  return true;
}

  
geom.Rectangle.distance2 = function (p,msf) {
  if (!this.contains1(p)) return undefined;
  var c = this.corner;
  var xt = this.extent;
  var ux = c.x + xt.x;
  var uy = c.y + xt.y;
  var d = Math.min(p.x - c.x,ux - p.x,p.y - c.y,uy - p.y);
  if (d < msf) return d;
  return undefined;
}

// for rotation, all four corners need consideration
geom.Rectangle.applyTransform = function (tr) {
  var rt = tr.rotation;
  var crn,xt,sc,rcrn,rxt,corners,xcorners;
   if (rt === 0) {
    crn = this.corner;
    xt = this.extent;
    sc = tr.scale;
    rcrn = crn.applyTransform(tr);
    rxt = xt.times(sc);
    return geom.Rectangle.mk({corner:rcrn,extent:rxt});
  } else {
    corners = this.corners();
    xcorners = corners.map(function (c) {return c.applyTransform(tr)});
    return geom.boundingRectangle(xcorners);
  }
  // the transform which fitst the rectangle this evenly into the rectangle dst
}
  
geom.Rectangle.upperLeft = function () {
  return this.corner;
}

geom.Rectangle.lowerLeft = function () {
  var corner = this.corner;
  var  x =  corner.x;
  var y = corner.y + this.extent.y;
  return geom.Point.mk(x,y);
}



geom.Rectangle.upperRight = function () {
  var corner = this.corner;
  var  x =  corner.x + this.extent.x;
  var y = corner.y;
  return geom.Point.mk(x,y);
}


geom.Rectangle.lowerRight = function () {
  var corner = this.corner;
  var  x =  corner.x + this.extent.x;
  var y = corner.y + this.extent.y;
  return geom.Point.mk(x,y);
}
    
//  does not work with rotations
geom.Transform.times = function (tr) {
  var sc0 = this.scale;
  var sc0N,sc0x,sc0y,sc1N,sc1x,sc1y,tr0,tr1,sc,scx,scy,sc,trX,trY,rtr,rs;
  if (typeof sc0 === "number") {
    sc0N = 1;
    sc0x = sc0;
    sc0y = sc0;
  } else {
    sc0x = sc0.x;
    sc0y = sc0.y;
  }
  sc1 = tr.scale;
  if (typeof sc1 === "number") {
    sc1N = 1;
    sc1x = sc1;
    sc1y = sc1;
  } else {
    sc1x = sc0.x;
    sc1y = sc0.y;
  }
  tr0 = this.translation;
  tr1 = tr.translation;
  if (sc0N && sc1N) {
    sc = sc0 * sc1;
  } else {
    scx = sc0x*sc1x;
    scy = sc0y*sc1y;
    sc = geom.Point.mk(scx,scy);
  } 
  trX = sc1x * tr0.x + tr1.x;
  trY = sc1y * tr0.y + tr1.y;
  rtr = geom.Point.mk(trX,trY);
  rs = geom.Transform.mk({scale:sc,translation:rtr});
  return rs;
}
    
    
    
geom.Rectangle.transformTo = function (dst) {
  var crn = this.corner;
  var dcrn = dst.corner;
  var cnt = this.center();
  var dcnt = dst.center();
  var wd = this.width();
  var ht = this.height();
  var dwd = dst.width();
  var dht = dst.height();
  var wdr,htr,r,x,y,rs;
  if ((wd == 0)&&(ht==0)) {
    return geom.Transform.mk({translation:geom.Point.mk(0,0),scale:1});
  }
  wdr = (wd === 0)?Infinity:dwd/wd;
  htr = (ht === 0)?Infinity:dht/ht;
  r = Math.min(wdr,htr);
  x = dcnt.x - (cnt.x)*r;
  y = dcnt.y - (cnt.y)*r;
  rs = geom.Transform.mk({translation:geom.Point.mk(x,y),scale:r});
  return rs;
}
  
// rectangle is  given relative  to node's coords
geom.Rectangle.toGlobalCoords = function (node) {
  var corner = this.corner;
  var extent = this.extent;
  var outerCorner = corner.plus(this.extent);
  var globalCorner = geom.toGlobalCoords(node,corner);
  var globalOuter = geom.toGlobalCoords(node,outerCorner);
  return geom.Rectangle.mk(globalCorner,globalOuter.difference(globalCorner));
}

// rectangle is given relative to global coords - returns relative to ownCoords
geom.Rectangle.toOwnCoords = function (node) {
  var corner = this.corner;
  var extent = this.extent;
  var outerCorner = corner.plus(this.extent);
  var ownCorner = geom.toOwnCoords(node,corner);
  var ownOuter = geom.toOwnCoords(node,outerCorner);
  return geom.Rectangle.mk(ownCorner,ownOuter.difference(ownCorner));
}

  
geom.mkSquare = function (center,sz) {
  var x = center.x;
  var y = center.y;
  var hsz = sz/2;
  var lx = x-hsz;
  var ly = y-hsz;
  return geom.Rectangle.mk([lx,ly],[sz,sz]);
}

pj.Object.__countShapes = function () {
  var cnt = 1;
  this.shapeTreeIterate(function (c) {
    cnt = cnt + c.__countShapes();
  });
  return cnt;
}


pj.Array.__countShapes = pj.Object.__countShapes;

pj.Object.__displaceBy = function (p) {
  var xf = s.xform;
  if (xf) {
    tr.setXY(xf.translation.plus(p));
  } else {
    geom.translate(s,p);
  }
}

geom.flipY = function (pnts,bias) {
  var rs = pj.Array.mk();
  pnts.forEach(function (p) {
    var fp = geom.Point.mk(p.x,bias -p.y);
    rs.push(fp);
  });
  return rs;
}

// coverage is data space, extent is image space.
// this maps the former to the later, with a y flip
// used for graphing
geom.transformForGraph = function (coverage,extent) {
  var cvxt = coverage.extent;
  var xtxt = extent.extent;
  var cvc = coverage.corner;
  var xtc = extent.corner;
  var scx = (xtxt.x)/(cvxt.x);
  var scy = -(xtxt.y)/(cvxt.y);
  var tx = xtc.x - scx * cvc.x;
  var ty = (xtc.y + xtxt.y) - scy * cvc.y;
  var tr = geom.Point.mk(tx,ty);
  var sc = geom.Point.mk(scx,scy);
  var rs = geom.Transform.mk({scale:sc,translation:tr});
  return rs;
}

geom.degreesToRadians =  function (n) { return Math.PI * (n/180);}

geom.radiansToDegrees =  function (n) { return 180 * (n/Math.PI);}

geom.Rectangle.randomPoint = function () {
  var c = this.corner;
  var ex = this.extent;
  var x = c.x + (ex.x)*Math.random();
  var y = c.y +(ex.y)*Math.random();
  return geom.Point.mk(x,y);
}
  
// This is one of the code files assembled into pjdom.js. 


var dom = pj.set("dom",pj.Object.mk());
var svg =  pj.set("svg",pj.Object.mk());
dom.__builtIn = true;
svg.__builtIn = true; 

/* the two varieties of dom elements are svg.shape and html.Element
 * each particular element, such as an svg rect or an html div, is represented by its own prototype.
 */

dom.set("Element",pj.Object.mk()).__namedType();

/* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
 The tag  names the prototype of this item. In svg mode the attributes are primitive __properties of the item.
 The id attribute determines the __name. Shorthand; instead of id="abc"  #abc will also work.
 
 example
 <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
 item.bubble.caption
 item.set("rectP","<rectangle style='color:red'>
dom.set("Style",pj.Object.mk()).namedType();
*/
  
  
dom.set("Style",pj.Object.mk()).__namedType();



//pj.set("DomMap",pj.Object.mk()).__namedType();


dom.Style.mk = function (o) { 
  var rs = Object.create(dom.Style);
  pj.extend(rs,o);
  return rs;   
}
  

function parseStyle(st,dst) {
   var rs = dst?dst:dom.Style.mk();
   var sp0 = st.split(';');
   sp0.forEach(function (c) {
     var sp1 = c.split(":");
     if (sp1.length==2) {
       rs[sp1[0]] = sp1[1];
     }
   });
   return rs;
 }
  
dom.parseStyle = parseStyle;


dom.set("Elm",pj.Object.mk()); // the methods of Elements

var ccnt = 0;
  
pj.Object.__tag = function () {
  // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
  // until p1 === svg.shape
  var p0 = this;
  var p1 = Object.getPrototypeOf(p0);
  while (true) {
    if ((p1 === svg.Element) || (pj.html && (p1 === pj.html.Element))) {
      return p0.__name;
    }
    if (p1 === pj.Object) {
      return undefined;
    }
    p0 = p1;
    p1 = Object.getPrototypeOf(p1);
  }
}
// an Array functions as a <g>
pj.Array.__tag = function () {
  return "g";
}

dom.isSvgTag = function (itag) {
  var svg = pj.svg;
  if (svg) {
    var tag = svg.tag;
    if (tag) {
      return tag[itag];
    }
  }
}
 
dom.toCamelCase = function (str) {
  var dashPos = str.indexOf("-"),
    beforeDash,oneAfterDash,rs;
  if (dashPos < 0) {
    return str;
  }
  beforeDash = str.substr(0,dashPos);
  oneAfterDash = str.substr(dashPos+2);
  rs = beforeDash + str[dashPos+1].toUpperCase() + oneAfterDash;
  return rs;
}
  
  
dom.Element.__setStyle = function () {
  var st = this.style;
  var el = this.__element;
  if (st && el) {
    pj.mapNonCoreLeaves(st,function (sv,iprop) {
      var prop = dom.toCamelCase(iprop); 
      el.style[prop] = sv;
    });
  }
}

dom.Element.__applyDomMap = function () {
  var transfers = this.__domTransfers;
  var el = this.__element;
  var thisHere = this;
  if (transfers) {
    transfers.forEach(function (att) {
      var val = thisHere[att];
      if (val !== undefined) {
        el.setAttribute(att,val);
      }
    });
  }
  if (this.__setDomAttributes) {
    this.__setDomAttributes(el);
  }
}

dom.Element.__setAttributes = function (tag) {
  var forSvg = dom.isSvgTag(tag);
  var tagv = forSvg?svg.tag[tag]:pj.html.tag[tag];
  if (!tagv) {
     pj.error('dom','uknown tag '+tag);
  }
  var el = this.__get("__element");
  var atts,op,thisHere,id,setatt,catts,xf,pxf,s,tc,ptxt,cl,prevA;
  if (!el) return;
  thisHere = this;
  id = this.__svgId?this.__svgId:(this.id?this.id:this.__name);
  this.__applyDomMap();
  this.__setStyle();
  el.setAttribute('id',id);
  xf = this.transform;
  if (xf) {
    el.setAttribute("transform",xf.toSvg());
  }
  var tc = this.text;
  if (tc  && (tag==="text")) {
    this.updateSvgText();
  }
  cl = this.class;
  if (cl) {
    el.className = cl;
  }
}


dom.Element.__setAttribute = function (att,av) {
  var el;
  this[att] = av;
  el = this.__get("__element");
  if (el) {
    el.setAttribute(att,av);
  }
}
/*

  prevA = this.__get("__domAttributes");
  if (!prevA) {
    prevA = this.__domAttributes = {};
  }
  pv = prevA[att];
  if (pv !== av) {
    el.setAttribute(att,av);
    prevA[att] = av;
  }
}
  
  */
// the only attribute that an Array has is an id. This is only for use as the g element in svg
pj.Array.__setAttributes = function () {
  var el = this.__get("__element");
  var id,vis;
  if (!el) return;
  id = this.id?this.id:this.__name;
  el.setAttribute("id",id);
  vis = this.visibility;
  if (vis) {
    el.setAttribute("visibility",vis);
  }
};
  
dom.Element.__removeAttribute = function (att) {
  var el = this.__element;
  if (el) {
    el.removeAttribute(att);
  }
}
  
  
dom.stashDom = function (nd,stash) {
  var el = nd.__element;
  var cn = nd.__container;
  if (!(el||cn))return; 
  if (el) stash.__element = el;
  if (cn) stash.__container = cn;
  delete nd.__element;
  delete nd.__container;
  //delete nd.__domAttributes;
  pj.forEachTreeProperty(nd,function (v,k) {
      var chst;
      if (stash) {
        chst = stash[k] = {};
      } else {
        chst = undefined;
      }
      dom.stashDom(v,chst);
    });  
}

pj.restoreDom = function (nd,stash) {
  if (!stash) {
    return;
  }
  if (stash.__element) {
    nd.__element = stash.__element;
  }
  if (stash.__container) {
    nd.__container = stash.__container;
  }
  pj.forEachTreeProperty(nd,function (ch,k) {
    var stch = stash[k];
    pj.restoreDom(ch,stch);
  });
}
  
  
  dom.restoreDom = function (nd) {};
  
 
// for adding event listeners to the DOM for newly added dom.Elements
var addEventListeners = function (el) {
  var cv = el;
  var eel = el.__element;
  var done = false;
  var evl;
  while (!done) {
    evl = cv.__get("__eventListeners");
    if (evl) {
      pj.mapOwnProperties(evl,function (fns,nm) {
        fns.forEach(function (f) {eel.addEventListener(nm,f);});
      });
    }
    cv = Object.getPrototypeOf(cv);
    done = cv === dom.Element;
  }
}
  
/* add this one element to the DOM. Does not recurse.
 * todo need to take __setIndex of this into account
 * appends to to the element of the parent, if present, ow uses rootEl
 */
var hitPolyline = false;
dom.Element.__addToDom1 = function (itag,rootEl) {
  var cel = this.__get("__element");
  var pr,pel,isLNode,forSvg,tag,cel,zz;
  if (cel) return cel;
  var pr = this.__parent;
  if (pr) {
    pel = pr.__get("__element");
  }
  if (rootEl && !pel) {
    pel = rootEl;
    this.__container  = pel;//=rootEl;
  } else {
    if (!pel) return;
  }
  isLNode = pj.Array.isPrototypeOf(this);
  forSvg =  dom.isSvgTag(itag);
  tag = itag?itag:this.tagOf();
  cel = forSvg?document.createElementNS("http://www.w3.org/2000/svg", tag):document.createElement(tag);
  this.__element = cel;
  cel.__prototypeJungleElement = this;
  this.__setAttributes(tag,forSvg);
  if (!pel || !pel.appendChild) {
     pj.error('dom','unexpected condition'); 
  }
  var zz = pel.appendChild(cel);
  if (this.__color__) {
    $(cel).spectrum({change:this.__newColor__,
      color:this.__color__,showInput:true,showInitial:true,preferredFormat:"rgb"});
  }
  if (!forSvg && this.text) {
    cel.innerHTML = this.text;
  }
   if (!isLNode && !forSvg)  {
    addListenFors(this);
    addEventListeners(this);
  }
  return cel;
}

  
  pj.Array.__addToDom1 = dom.Element.__addToDom1

dom.Element.__addToDom =  function (rootEl) {
  var el = this.__get("__element");
  var tg = this.__tag();
  var wr;
  if (el) {
    this.__setAttributes(tg); // update 
  } else {
    if (this.visibility === 'hidden') {
      return;
    }
    wr = this.__wraps;// if this wraps an element already on the page, no need for a root.
    if (wr) {
      el = document.getElementById(wr);
      if (!el) {
        pj.error('Missing element for wrap of ',wr);
        return;
      }
      if (el.tagName.toLowerCase() !== tg) {
        pj.error('Tag mismatch for wrap of ',wr);
        return;
      }
      this.__element = el;
      this.__setAttributes(tg); // update 
    } else {
      el = this.__addToDom1(tg,rootEl);
    }
  }
  if (el) {
    this.__iterDomTree(function (ch) {
      ch.__addToDom();
    },true); // iterate over objects only
  }
}
  
pj.Array.__addToDom = function () {
  var rs = dom.Element.__addToDom.call(this);
}

dom.Element.__draw = dom.Element.__addToDom;
pj.Array.__draw = dom.Element.__addToDom;
  
  dom.Element.__installChild = function (nd) {
   var el = this.__element;
   var nel;
   if (!el) return;
   nel = pj.getval(nd,"__element");
   if (nel) return;
   nd.__addToDom(el);
 }
 
 pj.Array.__installChild = dom.Element.__installChild;
 
  
dom.Element.__mkFromTag = function (itag) {
  var tag = itag;
  var tv,rs,html,dv;
  if (tag) {
    tv = (svg&&(svg.tag))?svg.tag[tag]:undefined;
  }
  if (tv) {
    rs  = Object.create(tv);
  } else {
    html = pj.html;
    if (!html) {
      pj.error("No definition for tag",tag);
    }
    dv = html.tag[tag];
    if (dv) {
      rs = dv.instantiate();
    } else{
      pj.error("No definition for tag",tag);
    }
  }
  return rs;
}

        
dom.Element.push = function (ind) {
  var nd,scnt;
  if (typeof ind === "string") {
    pj.error("OBSOLETE option");
  } else {
    nd = ind;
    if (!pj.__isDomEL(nd)) {
      pj.error("Expected dom Element");
    }
  }
  scnt = pj.getval(this,'__setCount');
  scnt = scnt?scnt+1:1;
  nd.__name  = scnt;
  this.__setCount = scnt;
  this[scnt] = nd;
  nd.__parent = this;
  this.__installChild(nd);
}
  
  pj.__isDomEL = function (x) {
    if (pj.Array.isPrototypeOf(x)) {
      return !x.__notInDom
    } else {
      return dom.Element.isPrototypeOf(x);
    }
  }
  
dom.removeElement = function (x) {
  var el = x.__element;
  var pel;
  if (el) {
    var pel = el.parentNode;
    if (pel) {
      pel.removeChild(el);
    }
  } 
  delete x.__element;
 // delete x.__domAttributes; 
}
  
  pj.removeHooks.push(dom.removeElement);

  // called just  before the main reparenting 
dom.reparentElement = function (x,newParent,newName) {
  var el = x.__element;
  var npEl = newParent.__element;
  var pel;
  if (el) {
    if (!npEl) {
      pj.error(newParent.__name," is not in the svg tree in reparent");
    }
    pel = el.parentNode;
    if (pel) {
      pel.removeChild(el);
    }
    npEl.appendChild(el);
    if (!el.id) {
     el.setAttribute("id",newName);
    }
  } 
}

pj.reparentHooks.push(dom.reparentElement);

  
  
var tryParse = false;
dom.alwaysXMLparse = true; // didn't have luck with the html variant, for some reason. Later, use resig's javascript html parser
dom.parseWithDOM = function (s,forXML) {
  var prs = dom.domParser,rs,dm;
  if (!prs) {
    dom.domParser = prs = new DOMParser();// built into js
  }
  dm = prs.parseFromString(s,forXML||dom.alwaysXMLparse?'application/xml':'text/html');
  if ((!dm) || (!dm.firstChild) || (dm.firstChild.tagName === "html")) { // an error message
    pj.error("Error in parsing XML",s);
  }
  if (tryParse) {
    try {
      rs = dom.domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
    } catch (e) {
      pj.error("Error in parsing XML",s);
    }
  } else {
    rs = dom.domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
  }
  return rs;
}

 
  
pj.Object.__iterDomTree = function (fn) {
  var ownprops = Object.getOwnPropertyNames(this);
  var thisHere = this;
  var sch = [];
  var cmf;
  ownprops.forEach(function (k) {
    var ch;
    if (pj.treeProperty(thisHere,k,true,true))  { //true: already known to be an owned property
      ch = thisHere[k];
      //if (pj.__isDomEL(ch) || pj.Array.isPrototypeOf(ch)) {
      if (pj.__isDomEL(ch)) {
        sch.push(ch);
      }
    }
  });// now sort by __setIndex
  cmf = function (a,b) {
    var ai = a.__setIndex;
    var bi;
    if (ai === undefined) {
      ai = parseInt(a.__name);
    }
    ai = isNaN(ai)?0:ai;
    bi = b.__setIndex;
    if (bi === undefined) {
      bi = parseInt(b.__name);
    }
    bi = isNaN(bi)?0:bi;
    return (ai < bi)?-1:1;
  }
  sch.sort(cmf);
  /* for debugging 
  var names = '';
  sch.forEach(function (ch) {
    names += ch.__name +' ';
  });
  console.log('ORDER ADDED ',names);
  */
  sch.forEach(function (ch) {
    fn(ch,ch.__name);
  });
  return this;
}
  
pj.Array.__iterDomTree = function (fn) {
  this.forEach(function (ch) {
//    if (pj.__isDomEL(ch) || pj.Array.isPrototypeOf(ch)) {
    if (pj.__isDomEL(ch)) {
      fn(ch);
    }
  });
  return this;
}
  
// this causes sets of ELements to be added to the DOM
 pj.preSetChildHooks.push(function(node,nm) {
  // this needs to work before pj.ComputedField is defined
  var prv = node[nm];
  if (prv && pj.__isDomEL(prv)) {
    prv.remove();
  }
});
  
  
  
/* since order is important for drawing, order of set operations is preserved here.
 * specifically, each Object has a __setCount just counting how many sets have been done over time
 * each of its Node __children has a __setIndex, which was the value of __setCount when it was set
 * then drawing draws __children in setIndex order
 */

pj.disableAdditionToDomOnSet = false;

pj.setChildHooks.push(function(node,nm,c) {
 // this needs to work before pj.ComputedField is defined
 var scnt;
 if (pj.disableAdditionToDomOnSet) {
   return;
 }
 if (pj.__isDomEL(node)) {
   // keep track of shape and Arrays __children order
   if ((nm === "transform") && geom.Transform.isPrototypeOf(c)) { //special treatment for transforms
     node.__transformToSvg();
     return;
   }
   //if (pj.__isDomEL(c) || pj.Array.isPrototypeOf(c)) {
   if (pj.__isDomEL(c)) {
     scnt = pj.getval(node,'__setCount');
     scnt = scnt?scnt+1:1;
     node.__setCount = scnt;
     c.__setIndex = scnt;
     node.__installChild(c);
   }
 }
});

  
pj.pushHooks.push(function (node,c) {
  var ndom = pj.__isDomEL(node),
    cdom = pj.__isDomEL(c);
    
  if ((ndom || pj.Array.isPrototypeOf(node)) && (cdom || pj.Array.isPrototypeOf(c)) && (ndom || cdom)) {
    node.__installChild(c);
  }
});
   
   // an Element may have a property __eventListeners, which is a dictionary, each of whose
   // values is an array of functions, the listeners for the id of that value
  dom.Element.addEventListener = function (id,fn) {
   var listeners = this.__get("__eventListeners");
   var element,listenerArray;
   if (!listeners) {
     listeners = pj.Object.mk();
     this.set("__eventListeners",listeners);
   }
   var element = this.__element;
   var listenerArray = listeners[id]; 
   if (listenerArray===undefined) {
     listenerArray = listeners.set(id,pj.Array.mk());
   }
   listenerArray.push(fn);
   //ev[nm] = fn;
   if (element) {
     element.addEventListener(id,fn);
   }    
 }
  
  // remove listener needs to be applied at each object in the prototype chain, since __eventListeners can appear at various levels
dom.Element.__removeEventListener1 = function (nm,f) {
  var ev = this.__get("__eventListeners");
  var evl,eel;
  if (!ev) return;
  evl = ev[nm];
  eel = this.__element;
  if (evl) {
    if (f === undefined) { // remove all listeners of this type
      delete ev[nm];
      if (eel) {
        evl.forEach(function (ff) {
          eel.removeEventListener(nm,ff);
        });
      }
    } else {
      var idx = evl.indexOf(f);
      if (idx >= 0) {
        evl.splice(idx,1);
      }
    }
  }
}
  
dom.Element.removeEventListener = function (nm,f) {
 var eel = this.__element;
 var cv,done;
 if (eel && (f !== undefined)) { // remove all listeners of this type
   eel.removeEventListener(nm,f);
 }

 cv = this;
 done = false;
 while (!done) {
   cv.__removeEventListener1(nm,f);
   done = cv === dom.Element;
   cv = Object.getPrototypeOf(cv);
 }
}
  
  
dom.getStyle = function (e) {
  var cst = e.style;
  if (!cst) {
    cst = dom.Style.mk();
    e.set("style",cst);
  }
  return cst;
}
  
dom.Element.__rootElement = function () { // find the most distant ancestor which is an Element
  var cv  = this;
  var nv;
  while (true) {
    nv = cv.__parent;
    if (!dom.Element.isPrototypeOf(nv)) {
      return cv;
    }
    cv = nv;
  }
}
  
  // dom events are transduced into prototypejungle events if they are listened for
  
dom.findAncestorListeningFor = function (nd,evn) {
  var cv = nd;
  var lf;
  while (true) {
    lf = cv.__listenFor;
    if (lf && (lf.indexOf(evn)>=0)) {
      return cv;
    }
    cv = cv.__parent;
  }
}
dom.eventTransducer = function (e) {
  var trg = e.target.__prototypeJungleElement;
  var evn = e.type;
  var ev = pj.Event.mk(trg,"dom_"+evn);
  ev.domEvent = e;
  ev.emit();
}
  
dom.addTransducers = function (nd,events) {
  var el = this.__element;
  if (el) {
    events.forEach(function (evn) {el.addEventListener(evn,svg.eventTransducer)});
  }
}
  
dom.Element.__listenFor = function (events) {
    var el = this.__element;
    var prv = this.__listenFor;
    if (prv) {
      events.forEach(function (evn) {
        if (prv.indexOf(evn)<0) {
          prv.push(evn);
          if (el) {
            el.addEventListener(evn,svg.eventTransducer);
          }
        }
      });
    } else {
      this.set("__listenFor",pj.lift(events));
      dom.addTransducers(this,events);
    }
  }
 
  // used when nd is first added to the DOM
var addListenFors = function (nd) {
  var lf = nd.__listenFor;
  if (lf) {
    dom.addTransducers(nd,lf);
  }
}
   
dom.elementWidth = function (node) {
  var el = node.__element;
  if (el) {
    return el.offsetWidth;
  }
}
  
  
dom.parentElementWidth = function (node) {
  var el = node.__element;
  var cel;
  if (el) {
    cel = el.parentNode;
    return cel.offsetWidth;
  }
}

  

dom.elementHeight = function (node) {
  var el = node.__element;
  if (el) {
    return el.offsetHeight;
  }
}
  
  
dom.parentElementHeight = function (node) {
  var el = node.__element;
  if (el) {
    var cel = el.parentNode;
    return cel.offsetHeight;
  }
}



pj.Object.__setData = function (xdt,dontUpdate) {
 this.__data = xdt;
 if (!dontUpdate)  {
    this.__update();
  }
}
// sometimes, data needs processing. In this case, the internalized data is put in __idata
//pj.Object.__dataInInternalForm  = function () {
pj.Object.__getData  = function () {
  return this.__data;
}


  
// This is one of the code files assembled into pjdom.js. 

  // turning DOM object into JSON trees
// from https://developer.mozilla.org/en-US/docs/JXON
/*\
|*|
|*|  JXON Snippet #3 - Mozilla Developer Network
|*|
|*|  https://developer.mozilla.org/en-US/docs/JXON
|*|
\*/


// modified by cg to build prototypejungle dom.Elements rather than plain javascript object trees
function parseText (sValue) {
  if (/^\s*$/.test(sValue)) { return null; }
  if (/^(?:true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
  if (isFinite(sValue)) { return parseFloat(sValue); }
  return sValue;
}


function getJXONTree (oXMLParent,forXML) {
  var tv,nodeId, nLength = 0, sCollectedTxt = "",xf;
  var tag = oXMLParent.tagName;
  if (tag === "parsererror") {
    throw tag;
  }
  var vResult = dom.Element.__mkFromTag(tag);
  if (oXMLParent.attributes) { // cg added the check for existence of method
    // cg also modified this to stash in attributes rather than things named @att
    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
      var oAttrib = oXMLParent.attributes.item(nLength);
      var attName = oAttrib.name;//.toLowerCase();
      var attValue = parseText(oAttrib.value.trim());
      if (attName === "style") {
        var st = dom.parseStyle(attValue);
        vResult.set("style",st);
      } else if (attName === "id") {
        vResult.__name = attValue; 
      } else if (attName === "transform") {
        var gxf = svg.stringToTransform(attValue);
        if (gxf) {
          vResult.set("transform",gxf);
        }
      } else {
        vResult[attName] = attValue;
      }
    }
  }
  if (oXMLParent.hasChildNodes()) {
    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
      oNode = oXMLParent.childNodes.item(nItem);
      if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
      else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
      else if (oNode.nodeType === 1 && !oNode.prefix) { /* nodeType is "Element" (1) */
        if (nLength === 0) { }
        vContent = getJXONTree(oNode,oNode.tagName);
        var nm = vContent.__get("__name");
        if (nm) {
          vResult.set(nm,vContent);
        } else {
          vResult.push(vContent);
        }
        nLength++;
      }
    }
  }
  if (sCollectedTxt) {
    vResult.text= parseText(sCollectedTxt);
  }
  return vResult;
}

dom.domToElement = function (dm,forXML) {
  var tr = getJXONTree(dm);
  var rs = forXML||dom.alwaysXMLparse?tr: tr[2][1];// wrapped in html/body if parsing html
  return  rs;
}
   
// This is one of the code files assembled into pjdom.js.
 
svg.surroundersEnabled = true;

svg.mkWithStyle = function (pr,style) {
  var rs = Object.create(pr);
  if (style) {
    rs.set("style",dom.Style.mk(style));
  } else {
    rs.set("style",dom.Style.mk());
  }
  return rs;
}
  
  
  
svg.mkWithVis = function (pr) {
  var rs = Object.create(pr);
  rs.visibility = "inherit";
  return rs;
}
  
svg.__external = true;
svg.NS = "http://www.w3.org/2000/svg";

// a Root is separate svg element. At the moment only one is in use: svg.main
svg.set("Root",Object.create(dom.Element)).__namedType();

  
svg.Root.mk = function (container) {
  var rs = Object.create(svg.Root);
  var cel,wd,ht;
  rs.fitFactor = 0.8; // a default;
  cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  cel.setAttribute("version","1.1");
  cel.style['background'] = 'white';
  cel.addEventListener("dragstart",function (event) {
    event.preventDefault();
  });
  rs.__element = cel;
  rs.__aPoint = cel.createSVGPoint();
  if (container) {
    rs.__container = container;
    container.appendChild(cel);
    wd = container.offsetWidth-2;// -2 motivated by jsfiddle (ow boundary of containing div not visible)
    ht = container.offsetHeight-2; 
    cel.setAttribute('height',ht);
    cel.setAttribute('width',wd);
  }
  return rs;
}

svg.Root.cursorPoint = function (evt){
  var pj = this.__aPoint;
  var rs;
  pj.x = evt.clientX;
  pj.y = evt.clientY;
  rs = pj.matrixTransform(this.__element.getScreenCTM().inverse());
  return geom.Point.mk(rs.x,rs.y);
}

  
  
  
svg.wrapAsRoot = function (node) {
  var rs = Object.create(svg.Root);
  var cel;
  rs.contents = node;
  cel = node.__element;
  if (cel) {
    cel.addEventListener("dragstart",function (event) {
      event.preventDefault();
    });
    rs.__element = cel;
  }
  return rs;
}
  
svg.setMain = function (node) {
  svg.main = svg.wrapAsRoot(node);
}
  
svg.Root.resize = function (wd,ht) {
  var cel = this.__element;
  if (cel) {
    cel.setAttribute("width",wd)
    cel.setAttribute("height",ht);
  }
  if (this.backgroundRect) {
    this.addBackground();
  }
}
 
svg.set("Element",Object.create(dom.Element)).__namedType();
svg.Element.mk = function () {return Object.create(svg.Element)};


svg.Element.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}



svg.Element.__addChildren = function (ch) {
  var thisHere = this;
  ch.forEach(function (c) {
    thisHere.push(c);
  });
  return this;
}
  
/* outerHTML is not defined in IE edge or safari 
 * From http://www.yghboss.com/outerhtml-of-an-svg-element/
 * with jquery: $('<div>').append($(svgElement).clone()).html(); */

svg.Element.__outerHTML = function() {
  var el = this.__element;
  var oh,node,temp;
  if (!el) {
    return undefined;
  }
  oh = el.outerHTML;
  if (oh) {
    return oh;
  }
  temp = document.createElement('div');
  node = el.cloneNode(true);
  temp.appendChild(node);
  return temp.innerHTML;
}

svg.Element.__visible = function () {
  var v = this.visibility;
  return (v===undefined) || (v==="visible")||(v==="inherit");
}
  
  
  // if bringToFront is true, then the element should be not removed, but just moved out as the last child of its parent
  // overrides dom.Element.remove
svg.Element.__bringToFront = function () {
  var el = this.__element;
  var pel;
  if (el) {
    pel = el.parentNode;
    pel.removeChild(el);
    //svg.frontShape = this;
    pel.appendChild(el);
  }
}
 
svg.Element.__hidden = function () {
  return this.visibility === "hidden";
}

pj.Array.__hidden = svg.Element.__hidden;

svg.Element.__hide = function () {
  this.visibility = "hidden";
  if (this.__element) {
    this.__draw();
  }
  return this;
}

svg.Element.__show = function () {
  this.visibility = "inherit";
 // if (this.__element) {
    this.__draw();
 // }
  return this;
}

svg.Element.__unhide = function () {
  this.visibility = "inherit";
  return this;
}

svg.Root.draw = function () {  
  var st = Date.now();
  var cn = this.contents;
  var tm;
  if (cn  && cn.__addToDom) cn.__addToDom(this.__element);
  tm = Date.now() - st;
  pj.log("svg","Draw time",tm);
}

svg.draw= function () {
  if (svg.main) svg.main.draw();
}

svg.Root.width = function () {
  var rs;
  var element = this.__element;
  if (element) {
    rs = element.clientWidth;
    if (rs === undefined) {
      return parseFloat(element.attributes.width.nodeValue);
    }
    return rs;
  }
}
  
svg.Root.height = function () {
  var rs;
  var element = this.__element;
  if (element) {
    //rs = element.offsetHeight;
    rs = element.clientHeight;
    if (rs === undefined) {
      return parseFloat(element.attributes.height.nodeValue);
    }
    return rs;
  }
}


//svg.commonAttributes = {"visibility":"S","pointer-events":"S","clip-path":"S","stroke":"S",fill:"S","stroke-opacity":"N","fill-opacity":"N",
//                        "stroke-width":"N","stroke-linecap":"S","text-anchor":"S"};
                        
svg.commonTransfers = ['visibility','stroke','stroke-opacity','stroke-width','stroke-linecap','fill','fill-opacity'];


var tag = svg.set("tag",pj.Object.mk());
tag.set("svg",svg.Element.mk()).__namedType();
  //tag.svg.set("attributes",pj.lift({width:"N",height:"N",viewBox:"S"})); 

tag.svg.__domTransfers = ['width','height','viewBox'];

tag.svg.mk = function () {
  return Object.create(tag.svg);
}

tag.set("g",svg.Element.mk()).__namedType();

tag.g.__domTransfers =svg.commonTransfers;


tag.g.mk = function () {
  return svg.mkWithVis(tag.g);
}

//tag.g.set("attributes",pj.Array.mk());// no attributes, but might have style

tag.set("line",svg.Element.mk()).__namedType();

tag.line.__domTransfers = svg.commonTransfers.concat(['x1','y1','x2','y2']);

//tag.line.set("attributes",pj.lift({x1:"N",y1:"N",x2:"N",y2:"N","stroke-linecap":"S"}));

function primSvgStringR(dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
 }
  
tag.line.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
tag.line.end1 = function () {
  return geom.Point.mk(this.x1,this.y1);
}

tag.line.end2 = function () {
  return geom.Point.mk(this.x2,this.y2);
}


tag.line.setEnd1 = function (p) {
  this.x1 = p.x;
  this.y1 = p.y;
}

tag.line.setEnd2 = function (p) {
  this.x2 = p.x;
  this.y2 = p.y;
}


tag.line.setEnds = function (e1,e2) {
  this.setEnd1(e1);
  this.setEnd2(e2);
}
  
  
tag.set("rect",svg.Element.mk()).__namedType();
tag.rect.__domTransfers = svg.commonTransfers.concat(['x','y','width','height']);

//tag.rect.set("attributes",pj.lift({x:"N",y:"N",width:"N",height:"N"}));
tag.rect.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));
tag.rect.mk = function (x,y,width,height,st) {
  var rs = svg.mkWithVis(tag.rect);
  if (x === undefined) {
    return rs;
  }
  rs.x = x;
  rs.y = y;
  rs.width = width;
  rs.height = height;
  return rs;
}
  

tag.rect.toRectangle = function (dst) {
  var crn,xt,rs;
  if (dst) {
    crn = dst.corner;
    xt = dst.extent;
    crn.x = this.x;
    crn.y = this.y;
    xt.x = this.width;
    xt.y = this.height;
    return dst;
  } else {
    crn = geom.Point.mk(this.x,this.y);
    xt = geom.Point.mk(this.width,this.height);
    var rs = geom.Rectangle.mk(crn,xt);
    return rs;
  }
}
  
  
tag.rect.__setExtent = function (extent) {
  this.width = extent.x;
  this.height = extent.y;
  this.x = -0.5 * extent.x;
  this.y = -0.5 * extent.y;
}

tag.rect.__adjustable = true;

tag.rect.setColor = function (color) {
  this.fill = color;
}
geom.Rectangle.toRect = function () {
  var rs = tag.rect.mk();
  rs.__enactBounds(this);
}
  
tag.rect.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
  
geom.Transform.svgString = function (dst) {
  var rs = 'transform="'
  var tr = this.translation;
  var sc;
  if (tr) {
    rs += 'translate('+tr.x+' '+tr.y+')'
  }
  sc = this.scale;
  if (sc && sc!==1) {
    rs += 'scale('+sc+')'
  }
  rs += '"';
  return rs;
}


tag.set("path",svg.Element.mk()).__namedType();

tag.path.__domTransfers = svg.commonTransfers.concat(['d']);

//tag.path.set("attributes",pj.lift({d:"S"}));
tag.path.set('__signature',pj.Signature.mk({fill:'S',stroke:'S','stroke-width':'N'}));

tag.path.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
tag.set("polyline",svg.Element.mk()).__namedType();

tag.polyline.__domTransfers =svg.commonTransfers.concat(['points']);

//tag.polyline.set("attributes",pj.lift({points:"S"}));

tag.polyline.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
  
  
  tag.set("polygon",svg.Element.mk()).__namedType();
  
tag.polygon.__domTransfers = svg.commonTransfers.concat(['points']);
//  tag.polygon.set("attributes",pj.lift({points:"S"}));

tag.polygon.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}


tag.set("linearGradient",svg.Element.mk()).__namedType();

tag.linearGradient.__domTransfers = svg.commonTransfers.concat(['x1','y1','x2','y2']);

//tag.linearGradient.set("attributes",pj.lift({x1:'N',x2:'N',y1:'N',y2:'N'}));


tag.set("radialGradient",svg.Element.mk()).__namedType();



tag.radialGradient.__domTransfers = svg.commonTransfers;

//tag..set("attributes",pj.lift({cx:'N',cy:'N',r:'N'}));





tag.set("stop",svg.Element.mk()).__namedType();


tag.stop.__domTransfers = svg.commonTransfers.concat(['offset','stop-color','stop-opacity']);
//tag.stop.set("attributes",pj.lift({offset:'N','stop-color':'S','stop-opacity':'S'}));

  /* For setting the points field of a polyline or polygon from an array of geom.point, and from a mapping on the plane */
  
svg.toSvgPoints = function (points,f) {
  var rs = "";
  var i,p,mp;
  var n = points.length;
  for (var i=0;i<n;i++) {
    p = points[i];
    mp = f?f(p):p;
    rs += mp.x +",";
    rs += mp.y;
    if (i<n-1) {
      rs += ",";
    }
  }
  return rs;
}
  
/* returns bound of this in the coordinates of rt, if rt is supplied; ow in this's own coords */
svg.Element.__bounds = function (rt) {
  var el = this.__element;
  var bb,gc,sc,grs;
  if (el) {
    if (!el.getBBox) {
      pj.log("svg","Missing getBBox method");
      return;
    }
    bb = el.getBBox();
    pj.log("svg","BBOX ",bb);
    var rs = tag.rect.toRectangle.call(bb);
    if (rt) {
      gc = geom.toGlobalCoords(this,rs.corner);
      sc = geom.scalingDownHere(this);// 1 = includeRoot
      pj.log("svg","scaling down here",sc);
      grs = geom.Rectangle.mk(gc,rs.extent.times(sc));
      pj.log("svg","scaling ",sc,'extent',grs.extent.x,grs.extent.y);
      return grs;
    } else {
      return rs;
    }
  }
}

// mostly used for debugging
svg.showRectangle = function (bnds) {
  var ext = bnds.extent;
  var crn = bnds.corner;
  var nm =   pj.autoname(pj.root,'rectangle');
  pj.root.set(nm,svg.Element.mk(
   '<rect x="'+crn.x+'" y="'+crn.y+'" width="'+ext.x+'" height="'+ext.y+
   '" stroke="red" stroke-width="2" fill="transparent"/>'
   ));
}

svg.visibleChildren = function (node) {
  var allVisible = true,noneVisible = true,
    rs = [];
  pj.forEachTreeProperty(node,function (child) {
    if (svg.Element.isPrototypeOf(child)) {
      if  (child.visibility === "hidden") {
        allVisible = false;
      } else {
        noneVisible = false;
        rs.push(child);
      }
    }
  });
  return noneVisible?rs:(allVisible?"all":rs);
}
   
// only goes one layer deep; used to exclude surrounders from root, currently
svg.boundsOnVisible = function  (node,root) {
  var visChildren = svg.visibleChildren(node);
  var rs;
  if (visChildren === "all") {
    return node.__bounds(root);
  } else {
    if (visChildren.length === 0) {
      return undefined;
    }
    visChildren.forEach(function (child) {
      var bnds = child.__bounds(root);
      if (rs) {
        rs = rs.extendBy(bnds);
      } else {
        rs = bnds;
      }
    });
    return rs;
  }
}
  

  var highlights = [];
  var numHighlightsInUse = 0;
  
var highlightNode = function (node) {
  var bounds,root,ebounds,ln,highlight,extent,corner;
  if (!node.__bounds) {
    return;
  }
  bounds = node.__bounds(svg.main);
  root = svg.main;
  if (root && bounds) {
    ebounds = bounds.expandBy(20,20);
    ln = highlights.length;
    if (numHighlightsInUse === ln) { // allocate another
      highlight = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      svg.main.contents.__element.appendChild(highlight);
      highlight.setAttribute("fill","rgba(50,100,255,0.4)");
      highlight.setAttribute("stroke","rgba(255,0,0,0.4)");
      highlight.setAttribute("stroke-width","5");
      highlight.style["pointer-events"] = "none";
      highlights.push(highlight);
    } else {
      highlight = highlights[numHighlightsInUse++];
    }
    highlight.style.display = "block";
    var extent = ebounds.extent;
    var corner = ebounds.corner;
    highlight.setAttribute("width",extent.x)
    highlight.setAttribute("height",extent.y);
    highlight.setAttribute("x",corner.x);
    highlight.setAttribute("y",corner.y);
  }
}
  
  
svg.highlightNodes = function (nodes) {
  nodes.forEach(highlightNode);
}

svg.unhighlight = function () {
  highlights.forEach(function (highlight) {
    highlight.style.display = "none";
  });
  numHighlightsInUse = 0;
}
  

svg.Element.__getBBox = function () {
  var el = this.__element;
  if (el) {
    return el.getBBox();
  }
}

svg.Element.__getCTM = function () {
  var el = this.__element;
  if (el) {
    return el.getCTM();
  }
}
svg.Element.__getHeight = function () {
  var el = this.__element;
  if (el) {
    return el.getBBox().height;
  } else {
    return 0;
  }
}


tag.set("circle",svg.Element.mk()).__namedType();
tag.circle.__domTransfers = svg.commonTransfers.concat(['cx','cy','r']);

//tag.circle.set("attributes",pj.lift({r:"N",cx:"N",cy:"S"}));

tag.circle.setColor = function (color) {
  this.fill = color;
}
tag.circle.__getExtent = function () {
  var diam = 2 * this.r;
  return geom.Point.mk(diam,diam);
}
tag.circle.__setExtent = function (extent) {
  var r = 0.5 * Math.min(extent.x,extent.y)
  this.r = r; 
}

tag.circle.__adjustable = true;

tag.circle.__svgStringR = primSvgStringR;

tag.set("text",svg.Element.mk()).__namedType();
tag.text.set({"font-family":"Arial","font-size":"10",fill:"black","stroke-width":0.5});
tag.text.mk = function (txt) {
  var rs = svg.mkWithVis(tag.text);
  if (txt!==undefined) {
    rs.setText(txt);
  }
  return rs;
}

tag.text.__domTransfers =  svg.commonTransfers.concat(['x','y','stroke-width','font-style','font-weight','font-family','font-size','text-anchor']);


//tag.text.set("attributes",pj.lift({x:"N",y:"N","font-style":"S","font-weight":"S","font-family":"S","font-size":"N","stroke-width":"N"}));
tag.text.update = function () {
  var d = this.__data;
  var tp = typeof(d);
  if (tp === "number") {
    this.setText(d+"");
  } else if (tp === "string") {
    this.setText(d);
  }
}

tag.set("tspan",svg.Element.mk()).__namedType();
tag.tspan.mk = function () {return Object.create(tag.tspan)};

tag.tspan.__domTransfers  = svg.commonTransfers.concat(['x','y','dx','dy','font-family','font-size']);

//tag.tspan.set("attributes",pj.lift({x:"N",y:"N",dx:"N",dy:"N","font-family":"S","font-size":"N"}));

  
tag.text.__svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
svg.elementPath = function (el) {
  var rs = [];
  var cel = el;
  while (cel.tagName !== "svg") {
    rs.push(cel.id);
    //cel = cel.parentElement;
    cel = cel.parentNode;
  }
  rs.pop(); // don't need that last step
  rs.reverse();
  return rs;
}


  
geom.degreesToRadians =  function (n) { return Math.PI * (n/180);}

geom.radiansToDegrees =  function (n) { return 180 * (n/Math.PI);}

  
pj.Object.__isShape = function () {
  return svg.Element.isPrototypeOf(this);
}

pj.Array.__isShape = function () {
  return true; 
}
svg.tag.text.setText = function (itxt)  {
  var txt = String(itxt);
  this.text = txt;
   if (itxt === '\n') {
    return;
  }
  this.updateSvgText();
  return;
} 
  
   
svg.tag.text.center = function () {
  var size = this['font-size']; 
  this.y = size/3;  
  return;
}

svg.tag.text.__setExtent = function (extent) {
  var iht = Math.trunc(extent.y);
  this["font-size"] = iht;
  this.y = iht/3
}
  
  svg.tag.text.updateSvgText  = function ()  {
   var el = this.__get("__element");
   var fc,txt,tn;
   if (!el) return;
   fc = el.firstChild;
   txt = this.text;
   var txt2 = '\u0398'
   var txt3 = "\u0398";
   //txt = 'ab \u0398';
   if (txt === '\n') {
     return;
   }
   if (fc && (fc.nodeType === 3)) {
     fc.textContent = txt;
   } else { // needs to be added
     tn = document.createTextNode(txt);
     el.appendChild(tn);
   }
 }
  
tag.set("clipPath",svg.Element.mk()).__namedType(); //tags are lower case
tag.set("defs",svg.Element.mk()).__namedType();


tag.defs.__domTransfers = ['gradient'];
  
svg.stringToTransform = function (s) {
    var mt = s.match(/translate\(([^ ]*)( +)([^ ]*)\)/)
    if (mt) {
      return geom.mkTranslation(parseFloat(mt[1]),parseFloat(mt[3]));
    }
  }
    
geom.Transform.toSvg = function () {
  var tr = this.translation;
  var sc = this.scale;
  var x = tr.x;
  var y = tr.y;
  if (isNaN(x)||isNaN(y)||isNaN(sc)) {
    pj.error('svg','NaN in transform');
  }
  var rs = 'translate('+tr.x+' '+tr.y+')';
  if (sc) {
    rs += 'scale('+sc+')';
  }
  return rs;
}
  // bounds computations:
  
  
 
  
svg.set("Rgb",pj.Object.mk()).__namedType();




pj.Object.__transformToSvg = function () {
  var xf = this.transform;
  var el = this.__element;
  var svgXf;
  if (el && xf) {
    svgXf = xf.toSvg();
    el.setAttribute("transform",svgXf);
  }
}
      
   
  
  // returns the transform that will fit bnds into the svg element, with fit factor ff (0.9 means the outer 0.05 will be padding)
 svg.Root.fitBoundsInto = function (bnds,fitFactor) {
  var ff = fitFactor?fitFactor:this.fitFactor;
  var wd = this.__container.offsetWidth;
  var ht = this.__container.offsetHeight;
   var dst = geom.Point.mk(wd,ht).toRectangle().scaleCentered(ff);
   var rs = bnds.transformTo(dst);
   pj.log("svg","fitting ",bnds," into ",wd,ht," factor ",ff);
   return rs;
  
 }
  
svg.Root.fitContentsTransform = function (fitFactor) {
  var cn = this.contents;
  var bnds;
  if (!cn) return undefined;
  if (!cn.__bounds) return undefined;
  bnds = cn.__bounds();
  // don't take the Element's own transform into account; that is what we are trying to compute!
  if (!bnds) return;
  return this.fitBoundsInto(bnds,fitFactor);
}
 
svg.Root.fitItem = function (item,fitFactor) {
  var bnds = item.__bounds();
  var xf = this.fitBoundsInto(bnds,fitFactor);
  var cn = this.contents;
  cn.set("transform",xf);
  cn.__draw();

}
svg.Root.fitContents = function (fitFactor,dontDraw) {
  var cn = this.contents;
  var sr = cn.surrounders;
  var ff,fitAdjust,cxf,xf;
  if (sr) {
    sr.remove();
  }
  if (!dontDraw) {
    cn.__draw();
  }
  ff = fitFactor?fitFactor:this.contents.fitFactor;
  if (!ff) {
    ff = this.fitFactor;//svg.fitFactor;
  }
  fitAdjust = this.contents.fitAdjust;
  cxf = cn.transform;
  if (cxf) {
    cn.__removeAttribute("transform");
  }
  var xf = this.fitContentsTransform(ff);
  if (fitAdjust) {
    xf.set("translation",xf.translation.plus(fitAdjust));
  }
  cn.set("transform",xf);
  if (sr && pj.selectedNode) {
    pj.selectedNode.__setSurrounders();
  }
  cn.__draw();
}
 
   
svg.Root.fitBounds = function (fitFactor,bounds) {
  var cn = this.contents;
  var xf = this.fitBoundsInto(bounds,fitFactor);
  //return xf;
  var cxf = cn.transform;
  if (cxf) {
    cn.__removeAttribute("transform");
  }
  this.contents.set("transform",xf);
  this.draw();
}

  
svg.drawAll = function (){ // svg and trees
  svg.draw();//  __get all the latest into svg
  svg.main.fitContents();
  svg.draw();
}
  
pj.Array.__svgClear = function () { 
  var el = this.__element;
  if (el) {
    this.forEach(function (x) {
      if (typeof x === 'object') {
        x.remove();
      }
    });
  }
  this.length = 0;
}


pj.Object.__svgClear = function () {
  var el = this.__element;
  var thisHere = this;
  if (el) {
    this.__iterDomTree(function (x,nm) {
      x.remove();
    });
  }
}

svg.Element.mk = function (s) {
  var hasVis = false;
  var rs,ops,pv;
  if (s) {
    rs = dom.parseWithDOM(s,true);
    // introduce computed __values
    ops = Object.getOwnPropertyNames(rs);
    ops.forEach(function (p) {
      if (p === "visibility") {
        hasVis = true;
      }
      pv = rs[p];
      if (typeof pv==="string") {
        if (pv.indexOf("function ")===0) {
          rs.setcf(p,pv);
        }
      }
    });
  } else {
    rs = Object.create(svg.Element);
  }
  if (!hasVis) rs.visibility = "inherit";
  return rs;
}
  
svg.Root.eventToNode = function (e) {
  return e.target.__prototypeJungleElement;
}


svg.Root.addBackground = function () {
   var cl = this.contents?this.contents.backgroundColor:"white";
   var el =  this.__element;
   if (el) {
     el.style["background-color"] = cl;
   }
}
  
svg.__rootElement = function (nd) {
  var cv =nd;
  var pr;
  while (true) {
    pr = cv.__get('__parent');
    if (!(pj.svg.Element.isPrototypeOf(pr)||pj.Array.isPrototypeOf(pr))) return cv;
    cv = pr;
  }
}



svg.Root.updateAndDraw = function (doFit,iitm) {
  var itm = itm?itm:this.contents;
  if (itm.update) {
    itm.__update();
  } else {
    pj.updateParts(itm,function (part) {
      return svg.Element.isPrototypeOf(part) && part.__visible();
    });
  }
  if (itm.__draw) {
    itm.__draw();
    this.addBackground(); 

    if (doFit) this.fitContents();
  }
}
    
 
svg.stdColors = ["rgb(100,100,200)","rgb(100,200,100)","red","yellow","red","rgb(244,105,33)","rgb(99,203,154)","rgb(207,121,0)","rgb(209,224,58)","rgb(51, 97, 204)","rgb(216,40,165)",
                   "rgb(109,244,128)","rgb(77,134,9)","rgb(1,219,43)","rgb(182,52,141)","rgb(48,202,20)","rgb(191,236,152)",
                   "rgb(112,186,127)","rgb(45,157,87)","rgb(80,205,24)","rgb(250,172,121)","rgb(200,109,204)","rgb(125,10,91)",
                   "rgb(8,188,123)","rgb(82,108,214)"];
svg.stdColor = function (n) {
  if (n < svg.stdColors.length) {
    return svg.stdColors[n];
  } else {
    return svg.randomRgb();
  }
}
  
  // fills in an  array mapping categories to colors with default values
svg.stdColorsForCategories = function (colors,categories) {
  var cnt = 0;
  var ln = svg.stdColors.length;
  categories.forEach(function (category) {
    if (!colors[category]) {
      colors[category] = svg.stdColors[cnt%ln];
    }
    cnt++;
  });
}
  
  // move to a given location in nd's own coordinates
    // supports multiple input formats eg x = Point or array


svg.Element.__moveto = function (ix,iy) {
  var x,y,xf;
  if (typeof iy=="number") {
    x = ix;
    y = iy;
  } else {
    x = ix.x;
    y = ix.y;
  }
  xf = this.transform;
  if (xf) {
    xf.translation.setXY(x,y);
    
  }  else {
    xf = geom.mkTranslation(x,y);
    this.set("transform",xf);
  }
  this.__transformToSvg(); 
}
  

svg.Element.__setX = function (x) {
  var xf = this.transform;
  var tr;
  if (xf) {
    tr = xf.translation;
    tr.x = x;
    return;
  }
  xf = geom.mkTranslation(x,0);
  this.set("transform",xf);
}

svg.Element.__setY = function (y) {
  var xf = this.transform;
  var tr;
  if (xf) {
    tr = xf.translation;
    tr.y = y;
    return;
  }
  xf = geom.mkTranslation(0,y);
  this.set("transform",xf);
}


  
svg.Element.__setScale = function (s) {
  var xf = this.transform;
  if (xf) {
    xf.scale = s;
    return;
  }
  xf = geom.mkScaling(s);
  this.set("transform",xf);
}

pj.defineSpread(svg.tag.g.mk); 

svg.svgAncestor = function (node) {
  var current = node;
  while (true) {
    if (svg.tag.svg.isPrototypeOf(current)) {
      return current;
    } else {
      if (current.__container) {
        return svg.main;
      }
      current = current.__parent;
      if (!current) {
        return undefined;
      }
    }
  }
}

tag.text.__getExtent = function () {
  var bb = this.__getBBox();
  return geom.Point.mk(bb.width,bb.height);
}

tag.text.__holdsExtent = function () {
  return this.hasOwnProperty('font-size');
}



//tag.text.__scalable = true;
//tag.text.__adjustable = true;

svg.Element.__getExtent = function () {
  return pj.geom.Point.mk(this.width,this.height);
}


svg.Element.__setExtent = function (extent) {
  this.width = extent.x;
  this.height = extent.y;
}

svg.Element.__removeIfHidden = function () {
  if (this.__hidden()) {
    this.remove();
    //dom.removeElement(this);
  } else {
    this.__iterDomTree(function (ch) {
        ch.__removeIfHidden();
      },true); 
  }
}


svg.Element.__getTranslation = function () {
  var xf = this.transform;
  if (xf) {
    return xf.translation;
  }
  return geom.Point.mk(0,0);
}


  
  
  
  
svg.Element.__getTransform = function () {
  var rs = this.transform;
  if (!rs) {
    rs = geom.Transform.mk();
    this.set('transform',rs);
  }
  return rs;
}


svg.Element.__setTransform = function (transform) {
  this.set('transform',transform);
  return this;
}
svg.Element.__getScale = function () {
  var xf = this.transform;
  if (xf) {
    return xf.scale;
  }
  return 1;
}

pj.Array.__removeIfHidden = svg.Element.__removeIfHidden;


pj.newItem = function () {
  return tag.g.mk();
  return svg.Element.mk('<g/>');
}

// color utilities

svg.colorTable = {blue:'#0000FF',
                  red:'#FF0000',
                  green:'#00FF00'};
                  
svg.parseColor  =  function (color) {
  if (color[0] === '#') {
    return {r:parseInt(color.substr(1,2),16),
            g:parseInt(color.substr(3,2),16),
            b:parseInt(color.substr(5,2),16)};
  }
  var m = color.match(/^rgb\(\ *(\d*)\ *\,\ *(\d*)\ *\,\ *(\d*)\ *\)$/);
  if (m) {
    return {r:Number(m[1]),g:Number(m[2]),b:Number(m[3])}
  } else {
    var lkup = svg.colorTable[color];
    if (lkup) {
      return svg.parseColor(lkup);
    } else {
      return null;
    }
  }
}
/*
svg.updateVisibleInheritors = function (node) {
  pj.updateInheritors(node,
  function (inh) {
      return svg.Element.isPrototypeOf(inh) && inh.__visible()
    //code
  });
}
*/
var isVisible =  function (inh) {
      return svg.Element.isPrototypeOf(inh) && inh.__visible()
    //code
};

pj.Object.__updateVisibleInheritors = function () {
  pj.updateInheritors(this,function (x) {x.__update()},isVisible);
 
}


pj.Object.__forVisibleInheritors = function (fn) {
  pj.forInheritors(this,fn,isVisible);
}


svg.updateVisibleParts = function (node) {
  pj.updateParts(node,
  function (part) {
      return svg.Element.isPrototypeOf(part) && part.__visible()
    //code
  });
}

// This is one of the code files assembled into pjdom.js.

var html =  pj.set("html",pj.Object.mk());

html.set("Element",Object.create(dom.Element)).__namedType(); // dom elements other than svg

var htag = html.set("tag",pj.Object.mk());
htag.set("html",html.Element.instantiate()).__namedType();// the top level doc
htag.set("head",html.Element.instantiate()).__namedType();
htag.set("body",html.Element.instantiate()).__namedType();
htag.set("div",html.Element.instantiate()).__namedType();
htag.set("span",html.Element.instantiate()).__namedType();
htag.set("select",html.Element.instantiate()).__namedType();
htag.set("option",html.Element.instantiate()).__namedType();
htag.set("pre",html.Element.instantiate()).__namedType();
htag.set("img",html.Element.instantiate()).__namedType();
htag.set("p",html.Element.instantiate()).__namedType();
htag.set("a",html.Element.instantiate()).__namedType();
htag.set("input",html.Element.instantiate()).__namedType();
htag.set("iframe",html.Element.instantiate()).__namedType();
htag.set("textarea",html.Element.instantiate()).__namedType();

html.commonTransfers = ['href','type','src','width','height','scrolling'];


html.Element.__domTransfers = html.commonTransfers;

htag.select.__domTransfers = html.commonTransfers.concat(['selectedIndex']);

htag.option.__domTransfers = html.commonTransfers.concat(['selected']);

htag.textarea.__domTransfers = html.commonTransfers.concat(['rows','cols']);

html.Element.__mkFromTag = function (tag) {
  var tv,rs;
  if (tag) {
    tv = html.tag[tag];
  }
  if (tv) {
    rs  = Object.create(tv);
    rs.set("_eventListeners",pj.Object.mk());
  } else {
    pj.error("This html tag is not implemented",tag);
  }
  return rs;
}
  
  
html.wrap = function (nm,tg,prps) {
  var el,rs;
  if (nm) {
    el = document.getElementById(nm);
  }
  if (el) {
    if (tg !== el.tagName.toLowerCase()) {
      pj.error('Tag mismatch for wrap of ',nm);
      return;
    }
  }    
  rs = dom.Element.__mkFromTag(tg);
  pj.setProperties(rs,prps);
  if (el) rs.__element = el;
  rs.__wraps = nm;
  return rs;
}

/* this will be used for compatability with old scheme for a while */
  
html.Element.addChild = function (a1,a2) {
  var ch;
  if (a2 === undefined) {
    ch = a1;
    if (!ch) {
       pj.error('html','unexpected condition'); 
    }
    if (ch.__get("__name")) {
      this.set(ch.__name,ch);
    } else {
      this.push(ch);
    }
  } else {
    this.set(a1,a2);
  }
  return this;
}

html.Element.__addChildren = function (ch) {
  var thisHere = this;
  ch.forEach(function (c) {
    thisHere.addChild(c);
  });
  return this;
}
  
  
html.Element.mk = function (s,inheritFrom) {
  var rs;
  if (s) {
    rs = dom.parseWithDOM(s,false);
  }
  if (!rs) {
     pj.error('html','unexpected condition'); 
  }
  return rs;
}
  
html.Element.$html = function (h) {
  var eel = this.__element;
  var txt;
  if (typeof h === 'string') {
    this.text = h;
    if (eel) { 
      eel.innerHTML = h;
    }
  } else { 
    if (eel) {
      txt = eel.innerHTML;
      this.text = txt;
      return txt;
    }
  }
}
  
html.Element.$focus = function () {
  var eel = this.__element;
  if (eel) {
    eel.focus();
  }
}
  
    
html.Element.$select = function () {
  var eel = this.__element;
  if (eel) {
    eel.select();
  }
}
  
  
  
html.styleToString = function (st) {
  var prps=Object.getOwnPropertyNames(st);
  var rs = "";
  var cl = prps.map(function (p) {return '"'+prp+'":"'+st[prp]+'"'});
  return cl.join(";");
}
  

html.Element.$css = function (ist,v) {
  var cst = dom.getStyle(this);
  var eel,st,prps;
  if (typeof ist === "string") {
    if (v) {
      cst[ist] = v;
      eel =  this.__element;
      if (eel) {
        eel.style[ist] = v;
      }
      return;
    }
    st = dom.parseStyle(ist);
  } else {
    st = ist;
  }
  prps=Object.getOwnPropertyNames(st);
  prps.forEach(function (p) {cst[p] = st[p]});
  this.__setStyle();
}

html.Element.$attr = function (att,v) {
  var prps;
  if (typeof att==="string") {
    this.__setAttribute(att,v);
  } else {
    prps=Object.getOwnPropertyNames(att);
    prps.forEach(function (p) {el[p] = att[p]});
    this.__setAttributes();
  }
}

  
html.Element.$prop= function (p,v) {
  var eel;
  this[p] = v;
  eel = this.__element;
  if (eel) {
    eel[p] = v;
  }
}


html.Element.$setStyle = function (att,value) {
  var cst = dom.getStyle(this);
  var eel;
  cst[att] = value;
  eel = this.__element;
  if (eel) {
    eel.style[att] = value;
  }
}

html.Element.$hide = function () {
  this.$setStyle('display','none');
}

html.Element.$show = function () {
  this.$setStyle('display','');
}

html.Element.setVisibility = function (v) {
  if (v) {
    this.$show();
  } else {
    this.$hide();
  }
}


html.Element.$click = function (fn) {
  this.addEventListener("click",fn);
}


html.Element.$mouseup = function (fn) {
  this.addEventListener("mouseup",fn);
}
  
  
html.Element.$change = function (fn) {
  this.addEventListener("change",fn);
}


html.Element.$enter = function (fn) {
  this.addEventListener("enter",fn);
}
  
  
  
html.Element.$dblclick = function (fn) {
   this.addEventListener("dblclick",fn);
}
  
  
html.Element.$offset = function () {
  var eel = this.__element;
  var rect,x,y;
  if (eel) {
    rect = eel.getBoundingClientRect();
    y = rect.top + document.body.scrollTop;
    x = rect.left + document.body.scrollLeft;
    return geom.Point.mk(x,y);
  }
}
  
dom.Element.$height = function () {
  var eel = this.__element;
  if (eel) {
    return eel.offsetHeight;
  }
}


dom.Element.$width = function () {
  var eel = this.__element;
  if (eel) {
    return eel.offsetWidth;
  }
}
  
html.Element.$prop = function (nm,v) {
  var eel = this.__element;
  if (eel !== undefined) {
    if (v !== undefined) {
      eel[nm] = v;
    } else {
      return eel[nm];
    }
  }
}
  
html.Element.$empty = function () {                            
  this.$html('');
  this.__iterDomTree(function (ch) {
    ch.remove();
  },true); // iterate over objects only
}
// so that some ui functions can be included in items that are used in a non-ui context

// This is one of the code files assembled into pjdom.js. 
// Allows code to include UI operations, but to run in variants of the system lacking the UI (like prototypejungle.org/view)
var ui = pj.set("ui",Object.create(pj.Object));
ui.setNote = function () {}
ui.watch = function () {}
ui.freeze = function (){}
ui.freezeExcept = function (){}
ui.hide = function () {}
ui.show = function () {}
ui.hideExcept = function () {}
ui.hideInstance = function () {}
ui.hideInInstance = function () {}
pj.Object.__setFieldType = function () {}
pj.Object.__setUIStatus = function () {}

  
// This is one of the code files assembled into pjui.js. 

  
// some state of an item is not suitable for saving (eg all of the dom links). This sta

var propsToStash = ["__objectsModified","surrounders","__container","__controlBoxes","__customBoxes"];
var computeStash;
var domStash;
var stateStash;
  
var stashPreSave = function (itm,needRestore) {
  stateStash = needRestore?{}:undefined;
  if (needRestore) {
    pj.setProperties(stateStash,itm,propsToStash,true);
  }
  propsToStash.forEach(function (p) {
    delete itm[p];
  });
  domStash = needRestore?{}:undefined;
  dom.stashDom(itm,domStash);
  computeStash = needRestore?{}:undefined;
  pj.removeComputed(itm,computeStash);
} 
  
  
pj.beforeStringify.push( function (itm) {stashPreSave(itm,1)});

var restoreAfterSave = function (itm) {
  pj.setProperties(itm,stateStash,propsToStash,true);
  pj.restoreComputed(itm,computeStash);
  pj.restoreDom(itm,domStash);
}
    
pj.afterStringify.push(restoreAfterSave);

// This is one of the code files assembled into pjdom.js. 


pj.viewItem = function (item,inDiv,cb) {
  var viewIt = function () {
    var root = pj.svg.Root.mk(document.getElementById(inDiv));
    root.set("contents", item);
    pj.updateParts(root);
    root.fitContents();
    if (cb) {
      cb();
    }
  }
  if (document.readyState == "complete" || document.readyState == "loaded"  || document.readyState == "interactive") {
     viewIt();
  } else {
    document.addEventListener('DOMContentLoaded',viewIt);
  }
}
 


})(prototypeJungle);

