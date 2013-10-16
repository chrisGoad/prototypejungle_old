


(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;

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
  Canvas.showSelection = 1; // do the highlighting for a selection; turned off except on the main canvas
  Canvas.fitFactor = 0.9;
  Canvas.refreshCount = 0; // used to see whether text needs drawing in fitTransform
  
  Canvas.mk = function (div,hitDiv) {
    var rs = Object.create(Canvas);
    rs.div = div;
    rs.hitDiv = hitDiv;
    return rs;
  }
  
  Canvas.width = function () {
    return this.div.__element__.prop('width');;
  }
  
  
  Canvas.height = function () {
    return this.div.__element__.prop('height');
  }
  
  Canvas.dims = function () {
    return geom.Point.mk(this.width(),this.height());
  }
  //Cause the canvas to have attributes that match its div
  Canvas.adjustDims = function () {
    
  }
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
    if (typeof ix==="number") {
      var x=ix,y=iy;
    } else {
      var x=ix.x,y=ix.y;
    }
    if (this.mainCanvasActive) this.theContext.moveTo(x,y);
    if (this.hitCanvasActive) this.hitContext.moveTo(x,y);
  }
  
  Canvas.lineTo = function (ix,iy){
    if (typeof ix==="number") {
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
    var sel = this.isSelected() && canvas.isMain;
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
    if (typeof(r)==="number") ctx.rotate(r);
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
  
  // for canvases other than main, xtr is associated with the canvas, not the object, and overrides the former
  om.DNode.deepDraw = function (canvas,xtr) {
   // if (topLevel) {
   //   draw.clearHitColors();
   // }
    if (this.style && this.style.hidden) return;
    if (xtr) {
      var xf = xtr;
    } else {
      var xf = this.getTransform();
    }
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
        if (!hcl && canvas.hitCanvasActive) {
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
  // this function does an integrety check for the shapesbyhitcolor(for chasing a bug)
  draw.checkSBHC = function () {
    var sha = draw.shapesByHitColor;
    for (var k in sha) {
      var cob  = sha[k];
      if (om.isNode(cob)) {
        var ca = cob.checkAncestry();
        if (ca) return ca;
      }
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
      return (dt[idx]===0)&&(dt[idx+1]===0)&&(dt[idx+2]===0)&&(dt[idx+3]===0)
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
  
  
    // returns the transform that will fit bnds into the canvas, with fit factor ff (0.9 means the outer 0.05 will be padding)
   Canvas.fitIntoCanvas = function (bnds) {
     var dst = geom.Point.mk(this.width(),this.height()).toRectangle().scaleCentered(this.fitFactor);
     var rs = bnds.transformTo(dst);
     return rs;
    
   }

  
  Canvas.fitTransform = function () {
    if (this.refreshCount===0) {
      this.refresh();// so that text can be measured
    }
    var cn = this.contents;
    var bnds = this.contents.deepBounds(true); // don't take the shape's own transform into account; that is what we are trying to compute!
    if (!bnds) return;
    return this.fitIntoCanvas(bnds);
  }
 
 
  
  Canvas.fitContents = function (force) {
    if (!draw.enabled) return;
    if (!force && !draw.autoFit) return;
    this.refresh(); // text needs drawing to be measured
    var xf = this.fitTransform();
    if (this.isMain) {
      this.contents.set("transform",xf);
    } else {
      this.set("xform",xf);
    }
    return;
    var bnds = this.computeBounds();
    if (!bnds) return;
    var xf = this.fitIntoCanvas(bnds,this.fitFactor);
    // For the main canvas, the transform is an attribute of the contents, not the canvas.
    if (this.isMain) {
      this.contents.set("transform",xf);
    } else {
      this.set("transform",xf);
    }
    //draw.refresh();
  }
  
  draw.fit = function () {
    draw.mainCanvas.fitContents(true);
    draw.mainCanvas.refresh();
  }

  
  draw.fitIntoPage = function () { // for the viewer OBSOLEE
    var mc = this.mainCanvas;
    var bnds = mc.computeBounds();
    mc.canvasWidth = $(window).width();
    mc.canvasHeight = $(window).height();
    var xf = mc.fitIntoCanvas(bnds);
    mc.contents.set("transform",xf);
    mc.refresh();
  }
  
  
  draw.refPoint = null; // where the mouse was clicked
  
  draw.interpretedImageData = [];
  
  om.nodeMethod("draggableAncestor",function () {
    if (this===__pj__) return undefined;
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
        if (trns) {
          var tr = trns.translation;
          thisHere.refTranslation = geom.Point.mk(tr.x,tr.y);
        }
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
          thisHere.tree_of_selections = om.root.treeOfSelections();
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
          if (dr.isComputed()) {
            trns.translation.transferToOverride(om.overrides,draw.wsRoot,["x","y"]);
            trns.transferToOverride(om.overrides,draw.wsRoot,["scale","rotation"]);
          }
          whenStateChanges();
        }
        //draw.refresh();
      }
      
      var doPan = function (e) {
        if (!thisHere.refTranslation) {
          return; // will happend with an empty canvas
        }
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
            draw.wsRoot.deepUpdate(om.overrides)
            thisHere.fitContents();
            if (__pj__.tree) {
              __pj__.tree.adjust();
            }
          }
          thisHere.refresh();
        }
  
      }
      thisHere.div.__element__.mouseup(mouseUpOrOut);
      thisHere.div.__element__.mouseleave(mouseUpOrOut);
     
      thisHere.div.__element__.mousemove(function (e) {
        if (thisHere.dragees) {
          doMove(e);
          draw.wsRoot.deepUpdate(om.overrides,draw.tree_of_selections);
          draw.refresh();

        } else if (thisHere.panEnabled && thisHere.refPoint) {
          doPan(e);
          draw.refresh();

        } else if (0) {// later for hover
          var rc = thisHere.relCanvas(e);
          var idt = thisHere.hitImageData(rc);
          var dt = idt.data;
          var ssh = draw.interpretImageData(dt);
          if (ssh) {
            var nm = ssh.__name__;
          } else {
            nm = "none";
          }
        }
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
    this.refreshCount = this.refreshCount + 1;
    var ctr = this.xform; // the canvas's own transform; not present for the main canvas.
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
        var wd = this.width();
        var ht = this.height();
        ctx.fillRect(0,0,wd,ht);
        this.restore();

      }
    }
    draw.clearHitColors();
    if (this.contents) {
      this.contents.deepDraw(this,ctr);
    }
  }
  
  draw.refresh = function () {
    draw.clearHitColors();
    draw.mainCanvas.refresh();
    //draw.canvases.forEach(function(c) {
     // c.refresh();
    //  });
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
    var cnv = this.div.__element__;
    var img = cnv[0].toDataURL("image/jpeg");
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
    om.root.deepUpdate(om.overrides);
  }
  
  draw.stateChangeCallbacks = [];
 
  function whenStateChanges() {
    draw.stateChangeCallbacks.forEach(function (cb) {
      cb();
    });
  }
  
  draw.animateStep = function () {
    var st = draw.wsRoot.step;
    if (st && (typeof st === "function")) {
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
    if (n===0) return;
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

