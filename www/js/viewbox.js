 (function (__pj__) {
  var om = __pj__.om;
  var geom  = __pj__.geom;
  var svg = __pj__.svg;
 
  svg.set("ViewBox",svg.g.mk()).namedType();
  svg.ViewBox.handleSize = 10;
  
  svg.ViewBox.mk = function () {
    return Object.create(svg.ViewBox);
  }
  
  svg.set("ViewBoxHandle",svg.rect.mk()).namedType();

  svg.ViewBox.addHandle = function (nm) {
    var rs = Object.create(svg.ViewBoxHandle);
    var sz = this.handleSize;
    rs.width = sz;
    rs.height = sz;
    var mhsz = -0.5*sz;
    rs.x = mhsz;
    rs.y = mhsz;
    rs.fill = "red";
    rs.draggable = 1;
    this.set(nm,rs);
    return rs;
  }
    
  
  svg.ViewBox.handleNames = ["upperLeft","middleLeft","lowerLeft","upperMiddle","lowerMiddle",
                      "upperRight","middleRight","lowerRight"];
  
  svg.ViewBox.handleCursors = ["nw-resize","w-resize","sw-resize","n-resize","s-resize",
                       "sw-resize","w-resize","se-resize"];

  
  svg.Root.addViewBox = function () {
    
    var vb = this.contents.viewBox;
    if (vb) {
      return vb;
    }
    var vb = svg.ViewBox.mk();
    var hsz = vb.handleSize;

    var mb =  svg.shape.mk('<rect stroke="red" fill="transparent"  x="0" y="0" width="100" height="100"/>');
    this.contents.set("viewBox",vb);
    vb.set("main",mb);
    //var handles =  svg.g.mk();
    //vb.set("handles",handles);
    var thisHere = this;
    svg.ViewBox.handleNames.forEach(function (hn) {
      var h = vb.addHandle(hn);
      return;
    });
    return vb;
  }
  
 // svg.dragViewboxHandle = function (h) {
  
  svg.ViewBox.update = function () {
    var r = this.rectangle;
    var hsz = 0.5*this.handleSize;
    var xt = r.extent;
    var c = r.corner;
    //var handles = vb.handles;
    var mb =this.main;
    mb.x = c.x;
    mb.y = c.y;
    mb.width = xt.x;
    mb.height = xt.y;
    mb.setAttributes();
    var thisHere = this;
    svg.ViewBox.handleNames.forEach(function (hn) {
      var gop = geom.Rectangle[hn];
      var p = gop.apply(r);
      
      var h = thisHere[hn];
      h.translate(p);
      //h.x = p.x - hsz;
      //h.y = p.y - hsz;
      h.setAttributes();
    });
      
  }
  
  svg.ViewBox.setRectangle = function (r) {
    this.set("rectangle",r);
    this.update();
  }
  
  
  svg.Root.setViewBox = function (r) {
    var vb = this.addViewBox();
    vb.setRectangle(r);
  }
 
  
  svg.ViewBoxHandle.onDrag = function (delta) {
    var tr = this.transform;
    var p = tr.translation;
    console.log("Dragging viewbox handle ",this.__name__," to ",p.x,p.y);
    var nm = this.__name__;
    var op = geom.Rectangle[nm];
    var vb = this.__parent__;
    var r = vb.rectangle;
    console.log("  Rectangle corner",r.corner.x,r.corner.y)
    op.call(r,p);
    vb.update();
  }
  
  
  

  geom.Rectangle.upperLeft = function (p) {
    if (p) {
      return this.setUpperLeft(p);
    }
    var c = this.corner;
    return geom.Point.mk(c.x,c.y);//copy
  }
  
  geom.Rectangle.setUpperLeft = function (p) {
    var d = this.upperLeft().difference(p);
    this.setPoint("extent",this.extent.plus(d).nonNegative());
    this.corner.setTo(p);
  }
  
  geom.Rectangle.middleLeft = function (p) {
    if (p) {
      return this.setMiddleLeft(p);
    }
    var c = this.corner;
    var ht = this.height();
    return c.plusY(0.5*ht);
  }
  
  geom.Rectangle.setMiddleLeft = function (p) {
    var dx = this.upperLeft().x - p.x;
    this.extent.x = Math.max(0,this.extent.x + dx);
    this.corner.x = p.x;
  }
    
  geom.Rectangle.lowerLeft = function (p) {
    if (p) {
      return this.setLowerLeft(p);
    }
    var c = this.corner;
    var ht = this.height();
    return c.plusY(ht);
  }
  
  geom.Rectangle.setLowerLeft = function (p) {
    var d = this.lowerLeft().difference(p);
    d.y = -(d.y);
    this.setPoint("extent",this.extent.plus(d).nonNegative());
    this.corner.x = p.x;
  }

  geom.Rectangle.upperMiddle = function (p) {
    if (p) {
      return this.setUpperMiddle(p);
    }
    var c = this.corner;
    var wd = this.width();
    return c.plusX(0.5*wd);
  }
  
  geom.Rectangle.setUpperMiddle = function (p) {
    var dy = this.upperLeft().y - p.y;
    this.extent.y = Math.max(0,this.extent.y + dy);
    this.corner.y = p.y;
  }
    
  geom.Rectangle.lowerMiddle = function (p) {
    if (p) {
      return this.setLowerMiddle(p);
    }
    var c = this.corner;
    var xt = this.extent;
    return geom.Point.mk(c.x+0.5*(xt.x),c.y+xt.y);
  }

  geom.Rectangle.setLowerMiddle = function (p) {
    var dy = p.y - this.lowerMiddle().y;
    this.extent.y = Math.max(0,this.extent.y + dy);
  }
  
  geom.Rectangle.upperRight = function (p) {
    if (p) {
      return this.setUpperRight(p);
    }
    var c = this.corner;
    var wd = this.width();
    return c.plusX(wd);
  }
  
  geom.Rectangle.setUpperRight = function (p) {
    var d = p.difference(this.upperRight());
    d.y = -(d.y);
    this.setPoint("extent",this.extent.plus(d).nonNegative());
    console.log("corner x ",p.x);
    this.corner.y = p.y;
  }
  
  geom.Rectangle.middleRight = function (p) {
    if (p) {
      return this.setMiddleRight(p);
    }
    var c = this.corner;
    var xt = this.extent;
    return geom.Point.mk(c.x+xt.x,c.y+0.5*(xt.y));
  }

  geom.Rectangle.setMiddleRight = function (p) {
    var dx = p.x - this.middleRight().x;
    this.extent.x = Math.max(0,this.extent.x + dx);
    //this.corner.x = p.x;
  }
  
  geom.Rectangle.lowerRight = function (p) {
    if (p) {
      return this.setLowerRight(p);
    }
    return this.corner.plus(this.extent);
  }
  
  
  geom.Rectangle.setLowerRight = function (p) {
    var d = p.difference(this.lowerRight());
    console.log("upperleft delta",d.x,d.y);
    this.setPoint("extent",this.extent.plus(d).nonNegative());
  }
    
  
 })(pj);
 