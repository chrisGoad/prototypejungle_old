


(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  draw.__externalReferences__ = [];
  draw.enabled = 1; // for non-standalone items, draw is disabled;   only checked at a few entry points
  draw.viewerMode = 0;
 // draw.theContext = undefined;
 // draw.hitContext = undefined;
  draw.defaultLineWidth = 1;
  draw.hitCanvasDebug = 0;
  draw.computeBoundsEnabled = 1;
  draw.computeBoundsFromHitCanvas = 0;
 // draw.hitCanvasActive = 1;
 // draw.dragEnabled = 1;
 // draw.selectionEnabled = 1;
  draw.autoFit = 0;
 // draw.panEnabled = 1;
  /* drawing is done in parallel on the main canvas, and hit canvas. Each shape has an index that is
   coded into the color drawn onto the hit canvas. I got this idea from kineticjs.
  */
  
  draw.mainCanvas = undefined;
  draw.canvases = [];
  
  var Canvas =draw.set("Canvas",om.DNode.mk()).namedType();
  Canvas.theContext = undefined;
  Canvas.dragEnabled = true;
  Canvas.panEnabled = true;
  Canvas.selectionEnabled= true;
  Canvas.mainCanvasActive = 1; // turned off when generating images for bounds computation on hit canvas

  
  Canvas.mk = function (div,hitDiv) {
    var rs = Object.create(Canvas);
    rs.div = div;
    rs.hitDiv = hitDiv;
    return rs;
  }
  
  Canvas.width = function () {
    return this.div.__element__.width();
  }
  
  
  Canvas.height = function () {
    return this.div.__element__.height();
  }
  
  draw.set("Style",om.DNode.mk()).namedType();

  
  draw.Style.mk = function (o) { // supports mkLine([1,2],[2,4])
    rs = Object.create(draw.Style);
    rs.setProperties(o);
    return rs;   
  }
  
  

  draw.installType("Rgb");
  // without selection, no need for the hit canvas
  
  Canvas.beginPath = function () {
    if (this.mainCanvasActive) this.theContext.beginPath();
    if (this.hitCanvasActive)  this.hitContext.beginPath();
  }
  
  Canvas.test = function () {
    var cn = this.theContext;
    cn.fillStyle = "rgba(255,0,0,1)";
    cn.fillRect(25,25,100,100);
  }
  
  Canvas.mainSaveDepth = 0; // for debugging
  Canvas.hitSaveDepth = 0; // for debugging
  Canvas.save = function () {
    if (this.mainCanvasActive) {
      this.theContext.save();
      this.mainSaveDepth++;
      om.log("saveDepth","mainSaveDepth up",this.mainSaveDepth);
    }
    if (this.hitCanvasActive) {
      this.hitContext.save();
      this.hitSaveDepth++;
      om.log("saveDepth","hitSaveDepth up",this.hitSaveDepth);
    }
  }
  
  
  Canvas.moveTo = function (ix,iy) {
    if (typeof ix=="number") {
      var x=ix,y=iy;
    } else {
      var x=ix.x,y=ix.y;
    }
    if (this.mainCanvasActive) this.theContext.moveTo(x,y);
    if (this.hitCanvasActive) this.hitContext.moveTo(x,y);
  }
  
  Canvas.lineTo = function (ix,iy){
    if (typeof ix=="number") {
      var x=ix,y=iy;
    } else {
      var x=ix.x,y=ix.y;
    }
    if (this.mainCanvasActive) this.theContext.lineTo(x,y);
    if (this.hitCanvasActive) this.hitContext.lineTo(x,y);
  }
  
  Canvas.arc =   function (x,y,r,sa,ea,counterClockwise) {
    if (this.mainCanvasActive) this.theContext.arc(x,y,r,sa,ea,counterClockwise);
    if (this.hitCanvasActive) this.hitContext.arc(x,y,r,sa,ea,counterClockwise);
  }

  Canvas.bezierCurveTo = function(x1,y1,x2,y2,x,y) {
    if (this.mainCanvasActive) this.theContext.bezierCurveTo(x1,y1,x2,y2,x,y);
    if (this.hitCanvasActive) this.hitContext.bezierCurveTo(x1,y1,x2,y2,x,y);
 }
    
  Canvas.fillRect = function (x,y,wd,ht) {
    if (this.mainCanvasActive) this.theContext.fillRect(x,y,wd,ht);
    if (this.hitCanvasActive) this.hitContext.fillRect(x,y,wd,ht);
  }
  
  
  
  Canvas.clearRect = function (x,y,wd,ht) {
    if (this.mainCanvasActive) this.theContext.clearRect(x,y,wd,ht);
    if (this.hitCanvasActive) this.hitContext.clearRect(x,y,wd,ht);
  }
  
  
  Canvas.strokeRect = function (x,y,wd,ht) {
    if (this.mainCanvasActive) this.theContext.strokeRect(x,y,wd,ht);
    if (this.hitCanvasActive) this.hitContext.strokeRect(x,y,wd,ht);
  }
  
    
  Canvas.restore = function () {
    if (this.mainCanvasActive) {
      this.theContext.restore();
      this.mainSaveDepth--;
      om.log("saveDepth","mainSaveDepth up",this.mainSaveDepth);
    }
    if (this.hitCanvasActive) {
      this.hitContext.restore();
      this.hitSaveDepth--;
      om.log("saveDepth","hitSaveDepth down",this.hitSaveDepth);
    }
  }
  
  
  Canvas.stroke = function () {
    if (this.mainCanvasActive) this.theContext.stroke();
    if (this.hitCanvasActive) this.hitContext.stroke();
  }
  
  
  
  Canvas.fill = function () {
     if (this.mainCanvasActive) this.theContext.fill();
    if (this.hitCanvasActive) this.hitContext.fill();
  }
  
  
  
  Canvas.fillText = function (txt,x,y) {
    if (this.mainCanvasActive) this.theContext.fillText(txt,x,y);
    if (this.hitCanvasActive) this.hitContext.fillText(txt,x,y);
  }
  
  Canvas.measureText = function (txt) {
    return this.theContext.measureText(txt);
  }
  
  // formats supported "rgb(r,g,b) #xxxxxx three nums
  // g is treated as noAlpha if r is a string
  draw.Rgb.mk = function (r,g,b,a) {
    var rs = Object.create(draw.Rgb);
    if (typeof(r) == "number") {
      rs.r = r;
      rs.g = g;
      rs.b = b;
      if (typeof a=="number") {
        rs.alpha = a;
      }
      return rs;
    } else if (typeof r == "string") {
      var noAlpha = g;
      var re = /rgb\((\d*)\,(\d*)\,(\d*)\)$/
      var m = r.match(re);
      if (m) {
        return draw.Rgb.mk(parseInt(m[1]),parseInt(m[2]),parseInt(m[3]));
      } else {
        if (noAlpha) return undefined;
        //var re = /rgba\((\d*)\,(\d*)\,(\d*)\,(1|(?:\d*\.\d*))\)/
        var re = /rgba\((\d*)\,(\d*)\,(\d*)\,(1|(?:\d*\.\d*))\)/
        var m = r.match(re);
        if (m) {
          return draw.Rgb.mk(parseInt(m[1]),parseInt(m[2]),parseInt(m[3]),parseFloat(m[4]));
        } else {
          return m;
          
        }
      }
    }
  }
  
  draw.Rgb.toString = function () {
    var a = this.alpha;
    var r = this.r;
    var g = this.g;
    var b = this.b;
    if (typeof a=="number") {
      return "rgba("+r+","+g+","+b+","+a+")";
    } else {
      return "rgb("+r+","+g+","+b+")";

    }
  }
  
  // no color names allowed
  
  draw.checkRgb = function (v) {
    return om.check(v,"expected rgb(r,g,b)",
      function (x) {
        var rgb = draw.Rgb.mk(x,true);
        if  (!rgb) return undefined;
        return rgb.toString();
      });
  }
  
  draw.checkColor = function (v) {
    return om.check(v,"expected a lower case color name, or rgb(r,g,b) or rgba(r,g,b,a)",
      function (x) {
        var sx = String(x);
        var re = /^[a-z]+$/
        if (sx.match(re)) return sx;
        var rgb = draw.Rgb.mk(x);
        if  (!rgb) return undefined;
        return rgb.toString();
      });
  }
  
  
  draw.Style.setInputF("strokeStyle",draw,"checkColor");
    draw.Style.setInputF("fillStyle",draw,"checkColor");

  draw.randomRgb = function (lb,ub) {
    function rint() { return Math.floor(Math.random()*255); }
    return draw.Rgb.mk(rint(),rint(),rint()).toString();
  }
  
   draw.randomColor = function (ilb,iub,alpha) {
    if (typeof ilb == "string") {
      var lb = draw.Rgb.mk(ilb);
      var ub = draw.Rgb.mk(iub);
    } else {
      lb = ilb;
      ub = iub;
    }
    function rint(lb,ub) {return Math.floor(lb + (ub-lb)*Math.random());}
    return draw.Rgb.mk(rint(lb.r,ub.r),rint(lb.g,ub.g),rint(lb.b,ub.b),alpha).toString();
  }
  
  draw.indexToRgb = function (i) {
    var n = i*30;
    var base = 256;
    var b = n % base;
    var g = Math.floor(n/base)%base;
    var bsq = base*base;
    var r = Math.floor(n/bsq)%base;
    return "rgba("+r+","+g+","+b+",1)";    
  }
  
  draw.rgbToIndex = function (r,g,b) {
    var base = 256;
    var bsq = base * base;
    return b + base*g + bsq * r;
  }
  
  // Only for drawable nodes
  om.DNode.setStrokeStyle = function(canvas,s) {
    var hcl = this.get("__hitColor__");
    if (canvas.mainCanvasActive) canvas.theContext.strokeStyle = s;
    if (canvas.hitCanvasActive) canvas.hitContext.strokeStyle = hcl;
  }
  
  om.DNode.setLineWidth = function(canvas,lw) {
    if (canvas.mainCanvasActive) canvas.theContext.lineWidth = lw;
    if (canvas.hitCanvasActive) canvas.hitContext.lineWidth = Math.max(2,lw);
    return true;
    }
  
  om.DNode.isSelected = function () {
    return this.get("__selected__")||this.get("__selectedPart__");
  }
  
  // Only for drawable nodes
  om.DNode.setFillStyle = function(canvas,s) {
    var hcl = this.get("__hitColor__");
    if (canvas.mainCanvasActive) canvas.theContext.fillStyle = s;
    if (canvas.hitCanvasActive) canvas.hitContext.fillStyle = hcl;
  }
  
  Canvas.setFillStyle = function (s) {
    if (this.mainCanvasActive) this.theContext.fillStyle = s;
    if (this.hitCanvasActive) this.hitContext.fillStyle = "black";
  }
  
  
  Canvas.setFont = function (f) {
    if (this.mainCanvasActive) this.theContext.font = f;
    if (this.hitCanvasActive) this.hitContext.font = f;
  }
  

  
  // for one dim things
  
  
  om.DNode.draw1d = function (canvas,drawfun) {
    var sel = canvas.isMain  && this.isSelected();
    var st = this.style;
    if (sel) {
      this.setStrokeStyle(canvas,draw.highlightColor);
      this.setLineWidth(canvas,st.lineWidth+3);
      drawfun();  
    }
    this.setStrokeStyle(canvas,st.strokeStyle);
    this.setLineWidth(canvas,st.lineWidth);
    if (!drawfun) {
      debugger;
    } else {
      drawfun();
    }
  }
 
 // todo needs to be an option where there is only one draw fun
  om.DNode.draw2d = function (canvas,draw1d,draw2d) {
    //several cases: normal draw, selected draw, with either or both of a fillstyle and strokestyle
    if (!this.style) return; // not a drawable
    var st = this.style;
    var fs = st.fillStyle;
    var ss = st.strokeStyle;
    var lw = st.lineWidth;
    if (!lw) lw = 1;
    var sel = this.isSelected();
    if (fs  && draw2d) {
      this.setFillStyle(canvas,fs);
      draw2d();
    }
    if (sel && draw1d) {
      this.setStrokeStyle(canvas,draw.highlightColor);
      this.setLineWidth(canvas,lw+2);
      draw1d();
    }
    if (draw1d && ss  && ((!sel) || (!fs))) {
      this.setStrokeStyle(canvas,ss);
      this.setLineWidth(canvas,lw);
      draw1d();
    }
  }
    

  draw.highlightColor = "magenta";

  
  om.DNode.inWs = function () {
    if (this == draw.wsRoot) return true;
    var pr = this.get("__parent__");
    if (!pr) return false;
    return pr.inWs();
  }
  
  om.LNode.inWs = om.DNode.inWs;

  
  om.DNode.select = function (src) { // src = "canvas" or "tree"
    if (src == "canvas") {
      om.unselect();
    }
    this.__selected__ = 1;
    this.deepSetProp("__selectedPart__",1);
    this.setPropForAncestors("__descendantSelected__",1,draw.wsRoot);
    draw.refresh();
    if (src == "canvas") {
      //__pj__.tree.adjust();
      this.expandToHere();
      var wd = this.get("widgetDiv");
      if (wd) wd.selectThisLine();
    }
  }
  
  
  om.LNode.select = om.DNode.select;
  
  draw.mSelect = function (nodes) {
    om.unselect();
    nodes.forEach(function (n) {
      n.select("tree");
    });
    draw.refresh();
  }
  
  function allSelected(rs,nd) {
    if (nd.__selected__) {
      rs.push(nd);
    } else {
      nd.iterTreeItems(function (c) {
        allSelected(rs,c)
      },true);
    }
  }
  
  draw.allSelected = function () {
    var rs = [];
    allSelected(rs,draw.wsRoot);
    return rs;
  }
  
    
  om.DNode.unselect = function () {
    var dd = this.__descendantSelected__;
    if (!dd) return;
    this.__descendantSelected__ = 0;
    if (this.__selected__) {
      this.deepSetProp("__selectedPart__",0);
      this.__selected__ = 0;
    }
    this.iterTreeItems(function (c) {
      c.unselect();
    },true);
  }
  
  om.LNode.unselect = om.DNode.unselect;

  om.unselect = function () {
    var ws = draw.wsRoot;
    if (ws) ws.unselect();
  }
  
  Canvas.clear = function () {
    var wd = this.div.width();
    var ht = this.div.height();
    this.clearRect(0,0,wd,ht); 
  }
  
  draw.setBkColor = function (cl) {
    var wd = this.div.width();
    var ht = this.div.height();
    var ctx = this.theContext;
    var hctx = this.hitContext;
    this.save();
     if (this.mainCanvasActive) ctx.globalCompositeOperation = "destination-over";
    if (this.hitCanvasActive) hctx.globalCompositeOperation = "destination-over";
     if (this.mainCanvasActive) ctx.fillStyle = this.bkColor;
    if (this.hitCanvasActive) hctx.fillStyle = "white";
      this.fillRect(0,0,wd,ht);
      this.restore();
  }
  

  
  geom.Transform.applyToContext = function (ctx) {
    var xf = this;
    var pnt = xf.translation;
    if (pnt) {
      var x = pnt.x;
      var y = pnt.y;
    }
    var sc = xf.scale;
    var r = xf.rotation;
    if (pnt) ctx.translate(x,y);
    if (sc) ctx.scale(sc,sc);
    if (typeof(r)=="number") ctx.rotate(r);
  }  
  
  draw.clearHitColors = function () {
    var byh = draw.shapesByHitColor;
    if (byh) {
      for (var k in byh) {
        var s = byh[k];
        delete s.__hitColor__;
      }
    }
    draw.shapesByHitColor = {};

  }
  
  om.DNode.getTransform = function () {
    return this.get("transform");    
  }
  
  om.LNode.getTransform = om.DNode.getTransform;
  
  om.DNode.deepDraw = function (canvas,topLevel) {
   // if (topLevel) {
   //   draw.clearHitColors();
   // }
    if (this.style && this.style.hidden) return;
    var xf = this.getTransform();   
    if (xf) {
      var ctx = canvas.theContext;
      var hctx = canvas.hitContext;
      canvas.save();
      if (canvas.mainCanvasActive) xf.applyToContext(ctx);
      if (canvas.hitCanvasActive) xf.applyToContext(hctx);
    }
    var hsm = om.hasMethod(this,"draw");
    if (hsm) {
      if (this.style) {
        var hcl = this.get("__hitColor__");
        if (!hcl) {
          this.__hitColor__ = hcl = draw.randomRgb();
          draw.shapesByHitColor[hcl] = this;
        }
        var mth = this["draw"]
        mth.call(this,canvas);
      }
    } else {
      this.shapeTreeIterate(function (v) {
        if (om.isNode(v)) {
          v.deepDraw(canvas);
        }
      },true);//sort by __setIndex__
    }
    if (xf) {
      canvas.restore();
    }
  }  
  
  om.LNode.deepDraw = function (canvas) {
    var xf = this.getTransform();   
    if (xf) {
      alert("TRANSORM of LNODE");
      var ctx = canvas.theContext;
      canvas.save();
       if (draw.mainCanvasActive) xf.applyToContext(ctx);
    }
    this.shapeTreeIterate(
      function (v) {
        if (om.isNode(v)) {
          v.deepDraw(canvas);
        }
      });
    if (xf) {
      drawops.restore();
    }
  } 

 
  Canvas.relCanvas = function (e) {
    var div = this.div.__element__;
     var ofs = div.offset();
      var x = e.clientX - ofs.left;
      var y = e.clientY - ofs.top;
      var px = e.pageX- ofs.left;
      var py = e.pageY - ofs.top;
      return geom.Point.mk(px,py);
  }
  
  draw.dataDim = 15; // dimensions of the square in which to look for a hit
  Canvas.hitImageData = function (p) {
    var d = Math.floor((draw.dataDim)/2)
    return this.hitContext.getImageData(p.x-d,p.y-d, draw.dataDim,draw.dataDim);
  }
   // how big is the hitCanvas? 
  draw.hitDim = 400;
  draw.hitDivs = 40;
  // chrome dies if this is done all in one swallow. Funky chrome!
  // so split up the job into hitDivs steps in x and y.
 draw.computeBounds1 = function (canvas) {
    var minx = Infinity;
    var maxx = -Infinity;
    var miny = Infinity;
    var maxy = -Infinity;
    var wd = draw.hitDim;
    var ht = draw.hitDim;
    var divs = draw.hitDivs;
    var qwd = wd/divs;
    var qht = ht/divs;
    function isZero(dt,x,y) {
      var idx = (y*qwd + x)*4;
      return (dt[idx]==0)&&(dt[idx+1]==0)&&(dt[idx+2]==0)&&(dt[idx+3]==0)
    }
 
    for (qx=0;qx<divs;qx++) {
      for (qy=0;qy<divs;qy++) {
        // corner of the current  quadrant
        var cx = qx * qwd;
        var cy = qy * qht;
        var imd = canvas.hitContext.getImageData(cx,cy,qwd,qht);
        var dt = imd.data;
        for (var i=0;i<qwd;i++) {
          for (var j=0;j<qht;j++) {
            var z = isZero(dt,i,j);
            if (!z) {
              var x = i + cx;
              var y = j + cy;
              if (x < minx) minx = x;
              if (x > maxx) maxx = x;
              if (y < miny) miny = y;
              if (y > maxy) maxy = y;
            }
          }
        }
      }
    }
    if (minx == Infinity) return undefined; // nothing found
    return geom.Rectangle.mk({corner:[minx,miny],extent:[maxx-minx,maxy-miny]});
 }   
 

  // COMPUTE BOUNDS FROM HIT CANVAS IS NOT IN USE AT THE MOMENT, and needs updating for multi-canvas
  draw.boundsTransform = geom.Transform.mk({scale:0.2,translation:[draw.hitDim/2,draw.hitDim/2]});
  draw.boundsTransformI = draw.boundsTransform.inverse();
  draw.defaultBounds = geom.Rectangle.mk({corner:[0,0],extent:[1000,1000]});
  // rule: draw to hitSize = hitDim*5 by hitSize canvas with origin at -hitSize/2,-hitSize/2 compute bounds on this
  // by shriking town to hitDim by hitDim, and rescaling result
  Canvas.computeBounds = function () {
    var ws = this.contents;
    if (1 || !draw.computeBoundsFromHitCanvas) {
      var b = ws.deepBounds(true); // computed shape by shape;
      return b?b:draw.defaultBounds;
    }
    if (!(draw.hitCanvasActive && draw.computeBoundsEnabled)){
      return draw.defaultBounds;
    }
    var xf = ws.transform;
    ws.set("transform",draw.boundsTransform);
    draw.hitCanvas.attr({width:draw.hitDim,height:draw.hitDim});
    draw.mainCanvasActive = 0;
    draw.refresh();
    var bnds = draw.computeBounds1();
    var cb = ws.deepBounds(); // computed shape by shape
    om.log("draw","bounds from image ",bnds,"bounds from computation ",cb);
    draw.mainCanvasActive = 1;
    draw.hitCanvas.attr({width:this.width(),height:this.height()});
    if (bnds) {
      var bnds = bnds.applyTransform(draw.boundsTransformI);
    } else {
      bnds = draw.defaultBounds;
    }
    return bnds;
  }
  
  Canvas.fitTransform = function () {
    var bnds = this.contents.deepBounds(true); // don't take the shape's own transform into account; that is what we are trying to compute!
    if (!bnds) return;
    return this.fitIntoCanvas(bnds,0.90);
  }
 /*
  p=prototypeJungle;
  p.om.root.rectangle.translate(105,0);
  p.draw.fitContents(1);
  
  */
 
  
  
  Canvas.fitContents = function (force) {
    if (!draw.enabled) return;
    if (!force && !draw.autoFit) return;
    this.refresh(); // text needs drawing to be measured
    var bnds = this.computeBounds();
    if (!bnds) return;
    var xf = this.fitIntoCanvas(bnds,0.90);
    // For the main canvas, the transform is an attribute of the contents, not the canvas.
    if (this.isMain) {
      this.contents.set("transform",xf);
    } else {
      this.set("transform",xf);
    }
    //draw.refresh();
  }

  
  draw.fitIntoPage = function () { // for the viewer OBSOLEE
    var mc = this.mainCanvas;
    var bnds = mc.computeBounds();
    mc.canvasWidth = $(window).width();
    mc.canvasHeight = $(window).height();
    var xf = mc.fitIntoCanvas(bnds,0.8);
    mc.contents.set("transform",xf);
    mc.refresh();
  }
  
  
  draw.refPoint = null; // where the mouse was clicked
  
  draw.interpretedImageData = [];
  
  om.nodeMethod("draggableAncestor",function () {
    if (this==__pj__) return undefined;
    if (!this.draggable) {
      return this.__parent__.draggableAncestor();
    }
    return this;
  });
  
  
  om.nodeMethod("uncomputedAncestor",function () {
    if (this.isComputed()) {
      return this.__parent__.uncomputedAncestor();
    }
    return this;
  });
  
  
  draw.interpretImageData = function (dt) {
    var ln = (dt.length)/4;
    var dim = draw.dataDim;
    var hdim = Math.floor(dim/2);
    var cdist = Infinity; //  dist squared actually
    for (var i=0;i<ln;i++) {
      
      var xc = i%dim - hdim;
      var yc = Math.floor(i/dim) - hdim;
      var dsq = xc*xc + yc*yc;
      if (dsq < cdist) {
        var din = i * 4;
        var r = dt[din];
        var g = dt[din+1]
        var b = dt[din+2];
        var rgb = draw.Rgb.mk(r,g,b).toString();
        var sh = draw.shapesByHitColor[rgb];
        if (sh) {
          if (geom.Text.isPrototypeOf(sh)) {
            //text gets preference
            return sh;
          }
          var rs = sh;
          cdist = dsq;
          om.log("untagged","cdist ",sh.pathOf(__pj__),cdist);
        }
      }
    }
    return rs;
  }
  
  
  
  Canvas.transform = function () {
    var rt = this.contents;
    if (rt) {
      var trns = rt.transform;
      if (!trns) {
        trns = geom.Transform.mk();
        rt.set("transform",trns);
        //code
      }
      return trns;
    }
  }
  
   Canvas.setZoom = function (trns,ns) {
    var cntr = geom.Point.mk(this.width()/2,this.height()/2);// center of the screen
    var ocntr = trns.applyInverse(cntr);
    trns.scale = ns;
    var ntx = cntr.x - (ocntr.x) * ns;
    var nty = cntr.y - (ocntr.y) * ns;
    var tr = trns.translation;
    tr.x = ntx;
    tr.y = nty;
  }
  
  // adjust the tranform so that it fits the canvas in the same way for the current canvas as trns did for cdims
  Canvas.adjustTransform = function(trns,cdims) {
    //var cntr =  cdims.times(0.5);
    //var ocntr = trns.applyInverse(cntr);
    if (!trns) return;
    var minDim = Math.min(cdims.x,cdims.y);
    var wd = this.width();
    var ht = this.height();
    var cminDim = Math.min(wd,ht);
    var s = trns.scale;
    var ns = s * cminDim/minDim;
    var  cntr = cdims.times(0.5);
    var ocntr = trns.applyInverse(cntr);
    var ncntrx = 0.5 * wd;
    var ncntry = 0.5 * ht;
    var ntx = ncntrx - (ocntr.x) * ns;
    var nty = ncntry - (ocntr.y) * ns;
    var tr = trns.translation;
    tr.x = ntx;
    tr.y = nty;
    trns.scale = ns;
    // a check
    var chk = ocntr.applyTransform(trns);
    
  }
  
  
  Canvas.init = function () {
    this.theContext = this.div.__element__[0].getContext('2d');
    if (this.hitDiv) {
      this.selectionEnabled = 1;
      this.hitCanvasActive= 1;
      this.hitContext = this.hitDiv.__element__[0].getContext('2d');
    }
    
    var thisHere = this;
    if (!draw.enabled) return;
    if (this.hitCanvasActive && !draw.hitCanvasDebug) {
      this.hitDiv.css({'display':'none'});
    }
    if (this.selectionEnabled || this.panEnabled) {
      this.div.__element__.mousedown(function (e) {
        dom.unpop();
        var rc = thisHere.relCanvas(e);
        om.log("untagged","relCanvas",rc.x,rc.y);
        thisHere.refPoint = rc;
        var trns = thisHere.transform();
        var tr = trns.translation;
        thisHere.refTranslation = geom.Point.mk(tr.x,tr.y);
        om.log("untagged",rc.x,rc.y);
        if (!thisHere.selectionEnabled) {
          return;
        }
        var idt = thisHere.hitImageData(rc);
        var dt = idt.data;
        var ssh = draw.interpretImageData(dt);
        om.log("drag","SELECTED ",ssh);
        dt = undefined; //  get rid of pointers to this chunk of data expeditiously
        if (ssh) {
          om.log("drag","selected",ssh.__name__);
          ssh.select("canvas");
          if (thisHere.dragEnabled && ssh) {
            var sl = ssh.draggableAncestor();; // todo reintroduce the nth ancestor method, maybe
            om.log("drag","DRAGGING ",sl);
            if (sl) {
              thisHere.dragees = [sl];
              thisHere.refPos = [sl.toGlobalCoords()];
              om.log("drag","refPos",thisHere.refPos);
            } else {
              thisHere.dragees = undefined;
            }
          }
        } else { 
          om.log("drag","No shape selected");
          if (thisHere.dragEnabled && !thisHere.panEnabled){
            var als = draw.allSelected();
            var drgs = [];
            var rfp = [];
            als.forEach(function (snd) {
              if (snd.draggable) {
                drgs.push(snd);
                rfp.push(snd.toGlobalCoords());
              }
            });
            if (drgs.length) {
              thisHere.dragees = drgs;
              thisHere.refPos = rfp;
            } else {
              thisHere.dragees = undefined;
            }
            //code
          }
        }
        if (thisHere.dragEnabled) {
          thisHere.tree_of_selections = draw.wsRoot.treeOfSelections();
        }
        if (thisHere.dragees) {
          var s = "";
          thisHere.dragees.forEach(function (dr) {
            s += " " + dr.__name__;
          });
          om.log("drag","starting drag of ",s);
          //code
        }
        return;
      
      });
      var doMove = function (e) {
        om.log("drag","doMove");
        if (!(thisHere.dragees)) {
          return;
        }
        var rc = thisHere.relCanvas(e);
        var delta = rc.difference(thisHere.refPoint);
        var ln = thisHere.dragees.length;
        for (var i=0;i<ln;i++) {
          var dr = thisHere.dragees[i];
          var rfp = thisHere.refPos[i];
          var npos = rfp.plus(delta);
          om.log("drag",dr.__name__,"delta",delta,"npos",npos);
          dr.moveto(npos);
          var trns = dr.transform;
          //var tr = dr.transform.translation;
          trns.translation.transferToOverride(draw.overrides,draw.wsRoot,["x","y"]);
          trns.transferToOverride(draw.overrides,["scale","rotation"]);
          whenStateChanges();
        }
        //draw.refresh();
      }
      
      var doPan = function (e) {
        var rc = thisHere.relCanvas(e);
        var delta = rc.difference(thisHere.refPoint);
        om.log("drag","doPan",delta.x,delta.y);

        var trns =  thisHere.transform();
        var tr = trns.translation;
        var s = trns.scale;
        tr.x = thisHere.refTranslation.x + delta.x;// / s;
        tr.y = thisHere.refTranslation.y + delta.y;// / s;
      }
      var mouseUpOrOut = function (e) {
        om.log("drag","mouseup");
        //doMove(e);
        thisHere.refPoint = undefined;
        thisHere.dragees = undefined;
        //om.unselect();
        if (draw.wsRoot) {
          if (!draw.viewerMode) {
            draw.wsRoot.deepUpdate(draw.overrides);
            thisHere.fitContents();
            __pj__.tree.adjust();
          }
          thisHere.refresh();
        }
  
      }
      thisHere.div.__element__.mouseup(mouseUpOrOut);
      thisHere.div.__element__.mouseleave(mouseUpOrOut);
     
      thisHere.div.__element__.mousemove(function (e) {
        if (thisHere.dragees) {
          doMove(e);
          draw.wsRoot.deepUpdate(draw.overrides,draw.tree_of_selections);
        } else if (thisHere.panEnabled && thisHere.refPoint) {
          doPan(e);
        }
        draw.refresh();
      });
    }
  }
  
  draw.addCanvas = function (c) {
    draw.canvases.push(c);
    if (c.isMain) {
      draw.mainCanvas = c;
      //code
    }
    c.init();
  }
  draw.init = function () {
    this.canvases.forEach(function (c) {
      c.init();
    });
  }
  
  
  draw.bkColor = "rgb(10,10,30)";
  
  Canvas.refresh = function (dontClear) {
    
    if (!draw.enabled) return;
    if (!dontClear) {
      this.clear();
      if (this.mainCanvasActive && this.theContext) {
        this.save();
        var ctx = this.theContext;
        if (draw.wsRoot) {
          var cl = draw.wsRoot.backgroundColor;
        }
        if (!cl) {
          cl = this.bkColor
        }
        ctx.fillStyle = cl;
        var wd = this.div.__element__.width();
        var ht = this.div.__element__.height();
        ctx.fillRect(0,0,wd,ht);
        this.restore();

      }
    }
    if (this.contents) {
      this.contents.deepDraw(this,1);
    }
  }
  
  draw.refresh = function () {
    draw.clearHitColors();
    draw.canvases.forEach(function(c) {
      c.refresh();
    });
  }

  
  Canvas.postFrame = function (movie,frameNum,cb) {
    var cnv = this.div;
    var img = cnv.toDataURL("image/jpeg");
    var url = "/api/addFrame";
    var data = {movie:movie,frameNum:frameNum,jpeg:img}
    om.log("untagged","posting Frame ",frameNum);
    om.post(url,data,function(rs) {
      om.log("untagged","POSTED");
      if (cb) cb(rs);
    });
  }
  
  
  
  Canvas.postCanvas = function (name,cb) {
    var cnv = this.div;
    var img = cnv.toDataURL("image/jpeg");
    var url = "/api/saveImage";
    var data = {path:"/"+name,jpeg:img}
    om.log("untagged","posting Frame ",name);
    om.ajaxPost(url,data,function(rs) {
      om.log("untagged","POSTED");
      if (cb) cb(rs);
    });
  }

  
   // a standard initial tree for geometric apps
   // name is the name of the workspace.
  
  draw.emptyWs = function (nm,scr){
    if (scr) {
      var cwd = scr.width;
      var cht = scr.height;
      var ofs = scr.offset;
      if (ofs) {
        var ofx = ofs.x;
        var ofy = ofs.y;
      } else {
        ofx = 0;
        ofy = 0;
      }
    }
    var wsRoot = draw.wsRoot = geom.Shape.mk();
    

    __pj__.set(nm,wsRoot);
    if (scr) {
      var trns = geom.mkTranslation(geom.Point.mk(ofx + cwd/2,ofy + cht/2));
      wsRoot.set("transform",trns);
      if (scr.scale) trns.scale = scr.scale;
    }
    return wsRoot;
  }
  
  draw.clearWs = function () {
    var wsr = draw.wsRoot;
    if (wsr) {
      var nm = wsr.__name__;
      delete __pj__.top[nm];
    }
  }
  
  draw.update = function () {
    om.deepUpdate(om.root);
  }
  
  draw.stateChangeCallbacks = [];
 
  function whenStateChanges() {
    draw.stateChangeCallbacks.forEach(function (cb) {
      cb();
    });
  }
  
  // The drawn nodes which are affected by modifying p on nd; return the set drawn nodes which inherit, treewise from nd[p]
  om.DNode.visibleProtoEffects1 = function (rs,nd,p) {
    if (om.hasMethod(this,"draw")) {
      var isP = p !== undefined;
      if (isP) {
        if (this.treeInheritsPropertyFrom(nd,p)) {
          rs.push(this);
        }
      } else {
        if (this.treeInheritsSomePropertyFrom(nd)) {
          rs.push(this);
        }
      }
    } else {
      this.iterTreeItems(function (cnd) {
        cnd.visibleProtoEffects1(rs,nd,p)
      },true);
      //code
    }
  } 
  
  om.LNode.visibleProtoEffects1  = om.DNode.visibleProtoEffects1;
  
  
  om.DNode.visibleProtoEffects = function (p) {
    var rs = [];
    draw.wsRoot.visibleProtoEffects1(rs,this,p);
    return rs;
  }
  
  
  // highlighting for the main/shape tree
  // a node may be selected above, at, or below the frontier of drawn nodes (with a draw method)
  om.DNode.drawnAncestor= function () { 
    // look for a drawn ancestor, the most distant one
    var cnd  = this;
    var rs = undefined;
    while (cnd !== draw.wsRoot) {
      if (om.hasMethod(cnd,"draw")) {
        rs = cnd;
      }
      cnd = cnd.__parent__;
    }
    return rs;
  }
  
  om.LNode.drawnAncestor  = om.DNode.drawnAncestor;


   om.DNode.drawnDescendants1 = function (rs) {
    if (om.hasMethod(this,"draw")) {
      rs.push(this);
      return;
    }
    this.iterTreeItems(function (nd) {
      nd.drawnDescendants1(rs);
    },true);
   }
   
   om.LNode.drawnDescendants1  = om.DNode.drawnDescendants1;
   
   om.DNode.drawnDescendants = function () {
    var rs = [];
    this.drawnDescendants1(rs);
    return rs;
   }

   om.LNode.drawnDescendants =  om.DNode.drawnDescendants;
 
   // returns the transform that will fit bnds into the canvas, with fit factor ff (0.9 means the outer 0.05 will be padding)
   Canvas.fitIntoCanvas = function (bnds,ff) {
     var dst = geom.Point.mk(this.width(),this.height()).toRectangle().scaleCentered(ff);
     var rs = bnds.transformTo(dst);
     return rs;
    
   }

  om.DNode.hide = function () {
    var st = this.style;
    if (!st) {
      var st = this.set("style",om.DNode.mk());
    }
    st.hidden = 1;
    return this;
  }
  
  om.DNode.show = function () {
    var st = this.style;
    if (st) {
      st.hidden = 0;
    }
    return this;
  }
  
  draw.animateStep = function () {
    var st = draw.wsRoot.step;
    if (st && (typeof st == "function")) {
      st();
      draw.refresh();
    }
  }
  
  draw.animate = function () {
    var  fps = draw.wsRoot.framesPerSecond;
    var frameCount =  draw.wsRoot.frameCount;
    var state = draw.wsRoot.initialState();
    var ccnt = 0;
    var delay = 1000/fps;
    var animate0 = function () {
      ccnt = ccnt + 1;
      if (frameCount && (ccnt>frameCount)) return;
      state = draw.wsRoot.step(state);
      draw.refresh();
      setTimeout(animate0,delay);
    }
    animate0();
      
  }
  draw.manimd = 500;
  draw.manimate = function (n) {
    if (n==0) return;
    draw.animate();
    setTimeout(function () {
      draw.manimate(n-1);
    },draw.manimd);
    
  }
  
  // zooming is only for the main canvas, at least for now
  function zoomStep(factor) {
    var trns = draw.mainCanvas.transform();
    var s = trns.scale;
    draw.mainCanvas.setZoom(trns,s*factor);
    draw.mainCanvas.refresh();
   // whenStateChanges();
  }
  
  var nowZooming = false;
  var zoomFactor = 1.1;
  var zoomInterval = 150;
  function zoomer() {
    if (nowZooming) {
      zoomStep(cZoomFactor);
      setTimeout(zoomer,zoomInterval);
    }
  }
  
  
  draw.startZooming = function () {
    cZoomFactor = zoomFactor;
    if (!nowZooming) {
      nowZooming = 1;
      zoomer();
    }
  }
  
  draw.startUnZooming = function () {
    cZoomFactor = 1/zoomFactor;
    if (!nowZooming) {
      nowZooming = 1;
      zoomer();
    }
  }
  
  draw.stopZooming = function() {
    nowZooming = 0;
  }
  
  
})(prototypeJungle);

