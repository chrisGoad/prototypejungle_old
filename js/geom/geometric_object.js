// Copyright 2019 Chris Goad
// License: MIT

// a geometric object is a core.Object with a transform property.  In applications, core.root is typically geometric, geometric
// descendants constitute the visible state. Some geometric objects have width and height, and possibly dimension properties.


const defineGeometric = function (geometric) {
  geometricObject = geometric;

const defineOnArray = function (name) {
  core.defineArrayNodeMethod(name,geometric[name]);
}
  

geometric.moveto = function (ix,iy) {
  let x,y,r,xf;
  let xnum = typeof ix === "number";
  let ynum = typeof iy === "number";
 
  if (xnum && ynum) {
    x = ix;
    y = iy;
  } else if (xnum) {
    x = ix;
    y = undefined;
  } else {
    ({x,y} = ix);
    r = iy;
  }
  xf = this.transform;
  if (xf) {
    if (y === undefined) {
      xf.translation.x = x;
    } else {
      xf.translation.setXY(x,y);
      if (r) {
        xf.rotation = r;
      }
    }
  }  else {
    xf = mkTranslation(x,y?y:0);
    this.set("transform",xf);
    if (r) {
      xf.rotation = r;
    }
  }
  if (this.realizeTransform) {
    this.realizeTransform();
  }
}

geometric.getTranslation = function () {
  let xf = this.transform;
  if (xf) {
    return xf.translation;
  }
  return Point.mk(0,0);
}


  
geometric.getTransform = function () {
  let rs = this.transform;
  if (!rs) {
    rs = Transform.mk();
    this.set('transform',rs);
  }
  return rs;
}


geometric.setTransform = function (transform) {
  this.set('transform',transform);
  return this;
}
geometric.getScale = function () {
  let xf = this.transform;
  if (xf) {
    return xf.scale;
  }
  return 1;
}

geometric.setScale = function (s) {
  let xf = this.transform;
  if (xf) {
    xf.scale = s;
    return;
  }
  xf = mkScaling(s);
  this.set("transform",xf);
}

geometric.getWidth = function () {
  let dim = this.dimension;
  return dim?dim:this.width;
}


geometric.getHeight = function () {
  let dim = this.dimension;
  return dim?dim:this.height;
}

geometric.getExtent = function (own) {
  let dim = own?core.getval(this,'dimension'):this.dimension;
  if (dim !== undefined) {
    return Point.mk(dim,dim);
  }
  if (own) {
    dim = this.dimension; // dimension rules, and if it is in the prototype, there is no "own" extent
    if (dim !== undefined) {
      return undefined;
    }
  }
  // for imagecontainers, for example, we set the width in the instance, but keep height in the prototype, and want this to be regarded as
  // having extent in the prototype. So both widht and height need to be in the prototype.
  if  (own) {
    if (core.getval(this,'width') && core.getval(this,'height')) {
      return Point.mk(this.width,this.height);
    } else {
      return undefined;
    }
  } else if (((typeof this.width) === 'number') && ((typeof this.height)==='number')) {
    return Point.mk(this.width,this.height);
  } else {
    return undefined;
  }
}

geometric.getOwnExtent = function () {
  return this.getExtent(true);
}


/*  THIS is the object whose extent is being modified, which might be a prototype when modifying from the resizer.
 * If it is, then each instance should be updated.  */
geometric.setExtent = function (extent,whichExtent) {
  if (this.__assembly) {
    let sc = (extent.x)/(this.width) ;
    this.setScale(sc);
    return;
  }
  if (this.__setExtent) {
    this.__setExtent(extent);
    return;
  }
  if (this.dimension) {
    if (whichExtent === 'width') {
      this.dimension = this.width = this.height = extent.x;
    } else if (whichExtent === 'height') {
      this.dimension = this.width = this.height = extent.y;
    } else {
      this.dimension = this.width = this.height = Math.max(extent.x,extent.y);
    }
  } else {
    if (whichExtent === 'width') {
      this.width = extent.x;
      if (this.scalable) {
        this.height = extent.y;
      }
    }  else if (whichExtent === 'height') {
      this.height = extent.y;
    } else {
      this.width = extent.x;
      this.height = extent.y
    }
  }
  let weo = {whichExtent};
  if (core.isPrototype(this)) {
    let beenUpdated = [];
    this.__forVisibleInheritors(function (inh) {
      let diagram = core.containingKit(inh);
      if (diagram) {
        if (beenUpdated.indexOf(diagram) === -1) {
          diagram.__update(weo);
          diagram.draw();
          beenUpdated.push(diagram);
        }
      } else {
        inh.__update(weo);
        inh.draw();
      }
    });
  } else {
    this.__update(weo);
    this.draw();    
  }
}

geometric.setWidth = function (width) {
  this.setExtent(Point.mk(width,geometric.height),'width');
}

geometric.scalingRelAncestor = function (ancestor,sofar) {
  let s = (sofar===undefined)?1:sofar;
  let pr = this.__get('__parent');
  let xf;
  if ((!pr) || (pr === ancestor)) {
    return s;
  }
  xf =this.__get("transform");
  if (xf) {
    s = xf.scale * s;
  }
 
 return pr.scalingRelAncestor(ancestor,s);
}

geometric.scalingDownHere = geometric.scalingRelAncestor;

defineOnArray('scalingRelAncestor');

// ancestor = undefined is equivalent to ancestor = core.root
geometric.toAncestorCoords = function (ip,ancestor) {
  let p = ip?ip:Point.mk(0,0);
  let pr = this.__get('__parent');
  let xf;
  if ((!pr) || (this === ancestor)) {
    return p;
  }
  xf =this.__get("transform");
  if (xf) {
    p = p.applyTransform(xf);
  }
  return pr.toAncestorCoords(p,ancestor);
}

defineOnArray('toAncestorCoords');

geometric.toGlobalCoords = geometric.toAncestorCoords;

// ip is in global coords. Return ip's coords in the coords associated with nd's parent
// (If we wish to move nd to p, we want p expressed in nd's parent's coords)
geometric.toLocalCoords = function (ip,toOwn) {
 let p = ip?ip:Point.mk(0,0);
 let pr = this.__get('__parent');
 let prIsRoot = (!pr);
 if (prIsRoot) {
   return toOwn?toCoords(this,p):p;
 }
 let gpr = pr.__get('__parent');
 prIsRoot = !(isGeometric(gpr) || core.ArrayNode.isPrototypeOf(gpr));
 if (prIsRoot) {
   return toOwn?toCoords(this,p):p;
 }
 p = pr.toLocalCoords(p); // p in the coords of the grandparent
 p = toCoords(pr,p);
 return toOwn?toCoords(this,p):p;
}
defineOnArray('toLocalCoords');


  
}
export {defineGeometric};
