


(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.set("draw",__pj__.om.DNode.mk());
  draw.__externalReferences__ = [];

  draw.viewerMode = 0;
  draw.theContext = undefined;
  draw.hitContext = undefined;
  draw.defaultLineWidth = 1;
  draw.hitCanvasDebug = 0;
  draw.computeBoundsEnabled = 1;
  draw.computeBoundsFromHitCanvas = 0;
  draw.hitCanvasEnabled = 1;
  draw.hitCanvasActive = 1;
  draw.dragEnabled = 1;
  draw.selectionEnabled = 1;
  draw.autoFit = 0;
  draw.panEnabled = 1;
  /* drawing is done in parallel on the main canvas, and hit canvas. Each shape has an index that is
   coded into the color drawn onto the hit canvas. I got this idea from kineticjs.
  */
  
  draw.set("Style",om.DNode.mk()).namedType();

  
  draw.Style.mk = function (o) { // supports mkLine([1,2],[2,4])
    rs = Object.create(draw.Style);
    rs.setProperties(o);
    return rs;   
  }
  
  

  draw.installType("Rgb");
  // without selection, no need for the hit canvas
  
  draw.mainCanvasActive = 1; // turned off when generating images for bounds computation on hit canvas
 
  draw.drawOps = om.DNode.mk();
  
  draw.drawOps.beginPath = function () {
    if (draw.mainCanvasActive) draw.theContext.beginPath();
    if (draw.hitCanvasActive)  draw.hitContext.beginPath();
  }
  
  draw.test = function () {
    var cn = draw.theContext;
    cn.fillStyle = "rgba(255,0,0,1)";
    cn.fillRect(25,25,100,100);
  }
  
  draw.mainSaveDepth = 0; // for debugging
  draw.hitSaveDepth = 0; // for debugging
  draw.drawOps.save = function () {
    if (draw.mainCanvasActive) {
      draw.theContext.save();
      draw.mainSaveDepth++;
      om.log("saveDepth","mainSaveDepth up",draw.mainSaveDepth);
    }
    if (draw.hitCanvasActive) {
      draw.hitContext.save();
      draw.hitSaveDepth++;
      om.log("saveDepth","hitSaveDepth up",draw.hitSaveDepth);
    }
  }
  
  
  draw.drawOps.moveTo = function (ix,iy) {
    if (typeof ix=="number") {
      var x=ix,y=iy;
    } else {
      var x=ix.x,y=ix.y;
    }
    if (draw.mainCanvasActive) draw.theContext.moveTo(x,y);
    if (draw.hitCanvasActive) draw.hitContext.moveTo(x,y);
  }
  
  draw.drawOps.lineTo = function (ix,iy){
    if (typeof ix=="number") {
      var x=ix,y=iy;
    } else {
      var x=ix.x,y=ix.y;
    }
    if (draw.mainCanvasActive) draw.theContext.lineTo(x,y);
    if (draw.hitCanvasActive) draw.hitContext.lineTo(x,y);
  }
  
  draw.drawOps.arc =   function (x,y,r,sa,ea,counterClockwise) {
    if (draw.mainCanvasActive) draw.theContext.arc(x,y,r,sa,ea,counterClockwise);
    if (draw.hitCanvasActive) draw.hitContext.arc(x,y,r,sa,ea,counterClockwise);
  }

  draw.drawOps.bezierCurveTo = function(x1,y1,x2,y2,x,y) {
    if (draw.mainCanvasActive) draw.theContext.bezierCurveTo(x1,y1,x2,y2,x,y);
    if (draw.hitCanvasActive) draw.hitContext.bezierCurveTo(x1,y1,x2,y2,x,y);
 }
    
  draw.drawOps.fillRect = function (x,y,wd,ht) {
    if (draw.mainCanvasActive) draw.theContext.fillRect(x,y,wd,ht);
    if (draw.hitCanvasActive) draw.hitContext.fillRect(x,y,wd,ht);
  }
  
  
  
  draw.drawOps.clearRect = function (x,y,wd,ht) {
    if (draw.mainCanvasActive) draw.theContext.clearRect(x,y,wd,ht);
    if (draw.hitCanvasActive) draw.hitContext.clearRect(x,y,wd,ht);
  }
  
  
  draw.drawOps.strokeRect = function (x,y,wd,ht) {
    if (draw.mainCanvasActive) draw.theContext.strokeRect(x,y,wd,ht);
    if (draw.hitCanvasActive) draw.hitContext.strokeRect(x,y,wd,ht);
  }
  
    
  draw.drawOps.restore = function () {
    if (draw.mainCanvasActive) {
      draw.theContext.restore();
      draw.mainSaveDepth--;
      om.log("saveDepth","mainSaveDepth up",draw.mainSaveDepth);
    }
    if (draw.hitCanvasActive) {
      draw.hitContext.restore();
      draw.hitSaveDepth--;
      om.log("saveDepth","hitSaveDepth down",draw.hitSaveDepth);
    }
  }
  
  
  draw.drawOps.stroke = function () {
    if (draw.mainCanvasActive) draw.theContext.stroke();
    if (draw.hitCanvasActive) draw.hitContext.stroke();
  }
  
  
  
  draw.drawOps.fill = function () {
     if (draw.mainCanvasActive) draw.theContext.fill();
    if (draw.hitCanvasActive) draw.hitContext.fill();
  }
  
  
  
  draw.drawOps.fillText = function (txt,x,y) {
    if (draw.mainCanvasActive) draw.theContext.fillText(txt,x,y);
    if (draw.hitCanvasActive) draw.hitContext.fillText(txt,x,y);
  }
  
  draw.drawOps.measureText = function (txt) {
    return draw.theContext.measureText(txt);
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
  om.DNode.setStrokeStyle = function(s) {
    var hcl = this.get("__hitColor__");
    if (draw.mainCanvasActive) draw.theContext.strokeStyle = s;
    if (draw.hitCanvasActive) draw.hitContext.strokeStyle = hcl;
  }
  
  om.DNode.setLineWidth = function(lw) {
    if (draw.mainCanvasActive) draw.theContext.lineWidth = lw;
    if (draw.hitCanvasActive) draw.hitContext.lineWidth = Math.max(2,lw);
    return true;
    }
  
  om.DNode.isSelected = function () {
    return this.get("__selected__")||this.get("__selectedPart__");
  }
  
  // Only for drawable nodes
  om.DNode.setFillStyle = function(s) {
    var hcl = this.get("__hitColor__");
    if (draw.mainCanvasActive) draw.theContext.fillStyle = s;
    if (draw.hitCanvasActive) draw.hitContext.fillStyle = hcl;
  }
  
  draw.drawOps.setFillStyle = function (s) {
     if (draw.mainCanvasActive) draw.theContext.fillStyle = s;
    if (draw.hitCanvasActive) draw.hitContext.fillStyle = "black";
  }
  
  
  draw.drawOps.setFont = function (f) {
    if (draw.mainCanvasActive) draw.theContext.font = f;
    if (draw.hitCanvasActive) draw.hitContext.font = f;
  }
  

  var drawops = draw.drawOps;
  
  // for one dim things
  
  
  om.DNode.draw1d = function (drawfun) {
    var sel = this.isSelected();
    var st = this.style;
    if (sel) {
      this.setStrokeStyle(draw.highlightColor);
      this.setLineWidth(st.lineWidth+3);
      drawfun();  
    }
    this.setStrokeStyle(st.strokeStyle);
    this.setLineWidth(st.lineWidth);
    drawfun();
  }
 
 // todo needs to be an option where there is only one draw fun
  om.DNode.draw2d = function (draw1d,draw2d) {
    //several cases: normal draw, selected draw, with either or both of a fillstyle and strokestyle
    if (!this.style) return; // not a drawable
    var st = this.style;
    var fs = st.fillStyle;
    var ss = st.strokeStyle;
    var lw = st.lineWidth;
    if (!lw) lw = 1;
    var sel = this.isSelected();
    if (fs  && draw2d) {
      this.setFillStyle(fs);
      draw2d();
    }
    if (sel && draw1d) {
      this.setStrokeStyle(draw.highlightColor);
      this.setLineWidth(lw+2);
      draw1d();
    }
    if (draw1d && ss  && ((!sel) || (!fs))) {
      this.setStrokeStyle(ss);
      this.setLineWidth(lw);
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
      var wd = this.widgetDiv;
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
  
  draw.clear = function () {
    var wd = draw.theCanvas.width();
    var ht = draw.theCanvas.height();
    drawops.clearRect(0,0,wd,ht); 
  }
  
  draw.setBkColor = function (cl) {
    var wd = draw.theCanvas.width();
    var ht = draw.theCanvas.height();
    var ctx = draw.theContext;
    var hctx = draw.hitContext;
    drawops.save();
     if (draw.mainCanvasActive) ctx.globalCompositeOperation = "destination-over";
    if (draw.hitCanvasActive) hctx.globalCompositeOperation = "destination-over";
     if (draw.mainCanvasActive) ctx.fillStyle = draw.bkColor;
    if (draw.hitCanvasActive) hctx.fillStyle = "white";
      drawops.fillRect(0,0,wd,ht);
      drawops.restore();
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
  
  om.DNode.deepDraw = function (topLevel) {
    if (topLevel) {
      draw.clearHitColors();
    }
    if (this.style && this.style.hidden) return;
    var xf = this.getTransform();   
    if (xf) {
      var ctx = draw.theContext;
      var hctx = draw.hitContext;
      drawops.save();
      if (draw.mainCanvasActive) xf.applyToContext(ctx);
      if (draw.hitCanvasActive) xf.applyToContext(hctx);
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
        mth.call(this);
      }
    } else {
      this.shapeTreeIterate(function (v) {
        if (om.isNode(v)) {
          v.deepDraw();
        }
      });
    }
    if (xf) {
      drawops.restore();
    }
  }  
  
  om.LNode.deepDraw = function () {
    var xf = this.getTransform();   
    if (xf) {
      alert("TRANSORM of LNODE");
      var ctx = draw.theContext;
      drawops.save();
       if (draw.mainCanvasActive) xf.applyToContext(ctx);
    }
    this.shapeTreeIterate(
      function (v) {
        if (om.isNode(v)) {
          v.deepDraw();
        }
      });
    if (xf) {
      drawops.restore();
    }
  } 

 
  draw.relCanvas = function (div,e) {
     var ofs = div.offset();
      var x = e.clientX - ofs.left;
      var y = e.clientY - ofs.top;
      var px = e.pageX- ofs.left;
      var py = e.pageY - ofs.top;
      return geom.Point.mk(px,py);
  }
  
  draw.dataDim = 15; // dimensions of the square in which to look for a hit
  draw.hitImageData = function (p) {
    var d = Math.floor((draw.dataDim)/2)
    return draw.hitContext.getImageData(p.x-d,p.y-d, draw.dataDim,draw.dataDim);
  }
   // how big is the hitCanvas? 
  draw.hitDim = 400;
  draw.hitDivs = 40;
  // chrome dies if this is done all in one swallow. Funky chrome!
  // so split up the job into hitDivs steps in x and y.
 draw.computeBounds1 = function () {
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
        var imd = draw.hitContext.getImageData(cx,cy,qwd,qht);
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
 
 /*
  
   draw.computeBounds1 = function () {
    
    var minx = Infinity;
    var maxx = -Infinity;
    var miny = Infinity;
    var maxy = -Infinity;
    var wd = draw.hitDim;
    var ht = draw.hitDim;
    var divs = draw.hitDivs;
    var qwd = wd/divs;
    var qht = ht/divs;
    for (qx = 0;qx<divs;qx++) {
      for (qy=0;qy<divs;qy++) {
        
      }
    }
    function isZero(dt,x,y) {
          var idx = (y*wd + x)*4;
          return (dt[idx]==0)&&(dt[idx+1]==0)&&(dt[idx+2]==0)&&(dt[idx+3]==0)
    }
    var imd = draw.hitContext.getImageData(0,0,wd,ht);
    var dt = imd.data;
    for (var i=0;i<wd;i++) {
      for (var j=0;j<ht;j++) {
        var z = isZero(dt,i,j);
        if (!z) {
          if (i < minx) minx = i;
          if (i > maxx) maxx = i;
          if (j < miny) miny = j;
          if (j > maxy) maxy = j;
        }
      }
    }
    if (minx == Infinity) return undefined; // nothing found
    return geom.Rectangle.mk({corner:[minx,miny],extent:[maxx-minx,maxy-miny]});
  }
 */
 
  draw.boundsTransform = geom.Transform.mk({scale:0.2,translation:[draw.hitDim/2,draw.hitDim/2]});
  draw.boundsTransformI = draw.boundsTransform.inverse();
  draw.defaultBounds = geom.Rectangle.mk({corner:[0,0],extent:[1000,1000]});
  // rule: draw to hitSize = hitDim*5 by hitSize canvas with origin at -hitSize/2,-hitSize/2 compute bounds on this
  // by shriking town to hitDim by hitDim, and rescaling result
  draw.computeBounds = function () {
    var ws = draw.wsRoot;
    if (!draw.computeBoundsFromHitCanvas) {
      var b = ws.deepBounds(); // computed shape by shape
      console.log("BOUNDS",b);
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
    console.log("bounds from image ",bnds,"bounds from computation ",cb);
    draw.mainCanvasActive = 1;
    draw.hitCanvas.attr({width:draw.canvasWidth,height:draw.canvasHeight});
    if (bnds) {
      var bnds = bnds.applyTransform(draw.boundsTransformI);
    } else {
      bnds = draw.defaultBounds;
    }
    return bnds;
  }
  
  draw.fitTransform = function (shape) {
    var bnds = shape.deepBounds();
    if (!bnds) return;
    return draw.fitIntoCanvas(bnds,0.95);
  }
  
  draw.fitContents = function () {
    if (!draw.autoFit) return;
    var bnds = draw.computeBounds();
    if (!bnds) return;
    var xf = draw.fitIntoCanvas(bnds,0.95);
    draw.wsRoot.set("transform",xf);
    //draw.refresh();
  }

  
  draw.fitIntoPage = function () {
    var bnds = draw.computeBounds();
    draw.canvasWidth = $(window).width();
    draw.canvasHeight = $(window).height();
    var xf = draw.fitIntoCanvas(bnds,0.8);
    draw.wsRoot.set("transform",xf);
    draw.refresh();
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
  
  
  draw.rootTransform = function() {
    var rt = draw.wsRoot;
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
  
   draw.setZoom = function (trns,ns) {
    var cntr = geom.Point.mk(draw.canvasWidth/2,draw.canvasHeight/2);// center of the screen
    var ocntr = trns.applyInverse(cntr);
    trns.scale = ns;
    var ntx = cntr.x - (ocntr.x) * ns;
    var nty = cntr.y - (ocntr.y) * ns;
    var tr = trns.translation;
    tr.x = ntx;
    tr.y = nty;
  }
  
  // adjust the tranform so that it fits the canvas in the same way for the current canvas as trns did for cdims
  draw.adjustTransform = function(trns,cdims) {
    //var cntr =  cdims.times(0.5);
    //var ocntr = trns.applyInverse(cntr);
    if (!trns) return;
    console.log("adjust",cdims.x,cdims.y,draw.canvasWidth,draw.canvasWidth);
    var minDim = Math.min(cdims.x,cdims.y);
    var cminDim = Math.min(draw.canvasWidth,draw.canvasHeight);
    var s = trns.scale;
    var ns = s * cminDim/minDim;
    var  cntr = cdims.times(0.5);
    var ocntr = trns.applyInverse(cntr);
    console.log("ocntr",ocntr.x,ocntr.y);
    var ncntrx = 0.5 * draw.canvasWidth;
    var ncntry = 0.5 * draw.canvasHeight;
    var ntx = ncntrx - (ocntr.x) * ns;
    var nty = ncntry - (ocntr.y) * ns;
    var tr = trns.translation;
    tr.x = ntx;
    tr.y = nty;
    trns.scale = ns;
    // a check
    var chk = ocntr.applyTransform(trns);
    console.log("check",2*chk.x,2*chk.y);
    
  }
  
  
  draw.init = function () {
    if (draw.hitCanvasActive && !draw.hitCanvasDebug) {
      draw.hitCanvas.css({'display':'none'});
    }
    if (draw.selectionEnabled || draw.panEnabled) {
      draw.theCanvas.__element__.mousedown(function (e) {
        dom.unpop();
        var rc = draw.relCanvas(draw.theCanvas.__element__,e);
        om.log("untagged","relCanvas",rc.x,rc.y);
        draw.refPoint = rc;
        var trns = draw.rootTransform();
        var tr = trns.translation;
        draw.refTranslation = geom.Point.mk(tr.x,tr.y);
        om.log("untagged",rc.x,rc.y);
        if (!draw.selectionEnabled) {
          return;
        }
        var idt = draw.hitImageData(rc);
        var dt = idt.data;
        var ssh = draw.interpretImageData(dt);
        om.log("drag","SELECTED ",ssh);
        dt = undefined; //  get rid of pointers to this chunk of data expeditiously
        if (ssh) {
          om.log("drag","selected",ssh.__name__);
          ssh.select("canvas");
          if (draw.dragEnabled && ssh) {
            var sl = ssh.draggableAncestor();; // todo reintroduce the nth ancestor method, maybe
            om.log("drag","DRAGGING ",sl);
            if (sl) {
              draw.dragees = [sl];
              draw.refPos = [sl.toGlobalCoords()];
              om.log("drag","refPos",draw.refPos);
            } else {
              draw.dragees = undefined;
            }
          }
        } else { 
          om.log("drag","No shape selected");
          if (draw.dragEnabled && !draw.panEnabled){
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
              draw.dragees = drgs;
              draw.refPos = rfp;
            } else {
              draw.dragees = undefined;
            }
            //code
          }
        }
        if (draw.dragEnabled) {
          draw.tree_of_selections = draw.wsRoot.treeOfSelections();
        }
        if (draw.dragees) {
          var s = "";
          draw.dragees.forEach(function (dr) {
            s += " " + dr.__name__;
          });
          om.log("drag","starting drag of ",s);
          //code
        }
        return;
      
      });
      var doMove = function (e) {
        om.log("drag","doMove");
        if (!(draw.dragees)) {
          return;
        }
        var rc = draw.relCanvas(draw.theCanvas.__element__,e);
        var delta = rc.difference(draw.refPoint);
        var ln = draw.dragees.length;
        for (var i=0;i<ln;i++) {
          var dr = draw.dragees[i];
          var rfp = draw.refPos[i];
          var npos = rfp.plus(delta);
          om.log("drag",dr.__name__,"delta",delta,"npos",npos);
          dr.moveto(npos);
          var trns = dr.transform;
          //var tr = dr.transform.translation;
          trns.translation.transferToOverride(draw.overrides,draw.wsRoot,["x","y"]);
          trns.transferToOverride(draw.overrides,["scale","rotation"]);
        }
        //draw.refresh();
      }
      
      var doPan = function (e) {
        var rc = draw.relCanvas(draw.theCanvas.__element__,e);
        var delta = rc.difference(draw.refPoint);
        om.log("drag","doPan",delta.x,delta.y);

        //console.log("delta",delta.x,delta.y);
        var trns = draw.rootTransform();
        var tr = trns.translation;
        var s = trns.scale;
        tr.x = draw.refTranslation.x + delta.x;// / s;
        tr.y = draw.refTranslation.y + delta.y;// / s;
        //draw.refresh();
      }
      var mouseUpOrOut = function (e) {
        om.log("drag","mouseup");
        //doMove(e);
        draw.refPoint = undefined;
        draw.dragees = undefined;
        //om.unselect();
        if (draw.wsRoot) {
          if (!draw.viewerMode) {
            draw.wsRoot.deepUpdate(draw.overrides);
            draw.fitContents();
            __pj__.tree.adjust();
          }
          draw.refresh();
        }
  
      }
      draw.theCanvas.__element__.mouseup(mouseUpOrOut);
      draw.theCanvas.__element__.mouseleave(mouseUpOrOut);
     
      draw.theCanvas.__element__.mousemove(function (e) {
        if (draw.dragees) {
          doMove(e);
          draw.wsRoot.deepUpdate(draw.overrides,draw.tree_of_selections);
        } else if (draw.panEnabled && draw.refPoint) {
          doPan(e);
        }
        draw.refresh();
      });
    }
  }
  
  
  
  draw.bkColor = "rgb(10,10,30)";
  
  draw.refresh = function (dontClear) {
   if (!dontClear) {
      draw.clear();
      if (draw.mainCanvasActive && draw.theContext) {
        drawops.save();
        var ctx = draw.theContext;
        var cl = draw.wsRoot.backgroundColor;
        if (!cl) {
          cl = draw.bkColor
        }
        ctx.fillStyle = cl;
        var wd = draw.theCanvas.__element__.width();
        var ht = draw.theCanvas.__element__.height();
        ctx.fillRect(0,0,wd,ht);
        drawops.restore();

      }
    }
   draw.wsRoot.deepDraw(1);
  }

  
  draw.postFrame = function (movie,frameNum,cb) {
    var cnv = this.theCanvas;
    var img = canvas.toDataURL("image/jpeg");
    var url = "/api/addFrame";
    var data = {movie:movie,frameNum:frameNum,jpeg:img}
    om.log("untagged","posting Frame ",frameNum);
    om.post(url,data,function(rs) {
      om.log("untagged","POSTED");
      if (cb) cb(rs);
    });
  }
  
  
  
  draw.postCanvas = function (name,cb) {
    var cnv = this.theCanvas;
    var img = canvas.toDataURL("image/jpeg");
    var url = "/api/postCanvas";
    var data = {path:name,jpeg:img}
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
   draw.fitIntoCanvas = function (bnds,ff) {
     var dst = geom.Point.mk(draw.canvasWidth,draw.canvasHeight).toRectangle().scaleCentered(ff);
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
  
  
  function zoomStep(factor) {
    var trns = draw.rootTransform();
    var s = trns.scale;
    draw.setZoom(trns,s*factor);
    draw.refresh();
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
  
  
})(__pj__);

