

(function (pj) {
  
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

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

//end extract

})(prototypeJungle);

