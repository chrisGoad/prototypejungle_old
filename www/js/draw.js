

__pj__.set("draw",__pj__.om.DNode.mk());


(function () {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  draw.theContext = undefined;
  draw.hitContext = undefined;
  draw.defaultLineWidth = 1;
  draw.hitCanvasDebug = 0;
  /* drawing is done in parallel on the main canvas, and hit canvas. Each shape has an index that is
   coded into the color drawn onto the hit canvas. I got this idea from kineticjs.
  */
  
  draw.installType("Rgb");
  
  
  draw.mainCanvasActive = 1; // turned off when generating images for bounds computation on hit canvas
 
  draw.drawOps = om.DNode.mk();
  
  draw.drawOps.beginPath = function () {
    if (draw.mainCanvasActive) draw.theContext.beginPath();
    draw.hitContext.beginPath();
  }
  
  
  draw.drawSaveDepth = 0; // for debugging
  draw.drawOps.save = function () {
    if (draw.mainCanvasActive) draw.theContext.save();
    draw.hitContext.save();
  }
  
  draw.drawOps.moveTo = function (x,y) {
     if (draw.mainCanvasActive) draw.theContext.moveTo(x,y);
    draw.hitContext.moveTo(x,y);
  }
  
  draw.drawOps.lineTo = function (x,y){
     if (draw.mainCanvasActive) draw.theContext.lineTo(x,y);
    draw.hitContext.lineTo(x,y);
  }
  
  draw.drawOps.arc =   function (x,y,r,sa,ea,counterClockwise) {
     if (draw.mainCanvasActive) draw.theContext.arc(x,y,r,sa,ea,counterClockwise);
    draw.hitContext.arc(x,y,r,sa,ea,counterClockwise);
  }

  draw.drawOps.bezierCurveTo = function(x1,y1,x2,y2,x,y) {
    if (draw.mainCanvasActive) draw.theContext.bezierCurveTo(x1,y1,x2,y2,x,y);
    draw.hitContext.bezierCurveTo(x1,y1,x2,y2,x,y);
 }
    
  draw.drawOps.fillRect = function (x,y,wd,ht) {
     if (draw.mainCanvasActive) draw.theContext.fillRect(x,y,wd,ht);
    draw.hitContext.fillRect(x,y,wd,ht);
  }
  
  
  draw.drawOps.clearRect = function (x,y,wd,ht) {
     if (draw.mainCanvasActive) draw.theContext.clearRect(x,y,wd,ht);
    draw.hitContext.clearRect(x,y,wd,ht);
  }
  
  
  draw.drawOps.strokeRect = function (x,y,wd,ht) {
     if (draw.mainCanvasActive) draw.theContext.strokeRect(x,y,wd,ht);
    draw.hitContext.strokeRect(x,y,wd,ht);
  }
  
    
  draw.drawOps.restore = function () {
    draw.drawSaveDepth--;
     if (draw.mainCanvasActive) draw.theContext.restore();
    draw.hitContext.restore();
  }
  
  
  draw.drawOps.stroke = function () {
     if (draw.mainCanvasActive) draw.theContext.stroke();
    draw.hitContext.stroke();
  }
  
  
  
  draw.drawOps.fill = function () {
     if (draw.mainCanvasActive) draw.theContext.fill();
    draw.hitContext.fill();
  }
  
  
  
  draw.drawOps.fillText = function (txt,x,y) {
     if (draw.mainCanvasActive) draw.theContext.fillText(txt,x,y);
    draw.hitContext.fillText(txt,x,y);
  }
  
  draw.drawOps.measureText = function (txt) {
    return draw.theContext.measureText(txt);
  }
  
  draw.toRgb = function (r,g,b) {
    if (typeof(r) == "number") {
      return "rgb("+r+","+g+","+b+")";
    } else {
      return draw.toRgb(r.red,r.green,r.blue);
    }
  }
  
  /* several import formats supported
  toRgba({red:2,green:3,blue:4},0.4)
  toRgba(2,3,4,0.4)
  toRgba({red:2,green:3,blue:4,alpha:0.4});
  */
  
  draw.toRgba = function (r,g,b,a) {
    if (typeof(r) == "number") {
      return "rgba("+r+","+g+","+b+","+a+")";
    } else if (g === undefined) {
        return draw.toRgba(r.red,r.green,r.blue,r.alpha);
    } else {
      return draw.toRgba(r.red,r.green,r.blue,g);
    }
  }
  draw.randomRgb = function (lb,ub) {
    function rint() { return Math.floor(Math.random()*255); }
    return draw.toRgb(rint(),rint(),rint());
  }
  
   draw.randomColor = function (lb,ub,alpha) {
    function rint(lb,ub) {return Math.floor(lb + (ub-lb)*Math.random());}
    return draw.toRgba(rint(lb.r,ub.r),rint(lb.g,ub.g),rint(lb.b,ub.b),alpha);
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
    draw.hitContext.strokeStyle = hcl;
  }
  
  om.DNode.setLineWidth = function(lw) {
     if (draw.mainCanvasActive) draw.theContext.lineWidth = lw;
    draw.hitContext.lineWidth = Math.max(2,lw);
    return true;
    }
  
  om.DNode.isSelected = function () {
    return this.get("__selected__")||this.get("__selectedPart__");
  }
  
  // Only for drawable nodes
  om.DNode.setFillStyle = function(s) {
    var hcl = this.get("__hitColor__");
     if (draw.mainCanvasActive) draw.theContext.fillStyle = s;
    draw.hitContext.fillStyle = hcl;
  }
  
  draw.drawOps.setFillStyle = function (s) {
     if (draw.mainCanvasActive) draw.theContext.fillStyle = s;
    draw.hitContext.fillStyle = "black";
  }
  
  
  draw.drawOps.setFont = function (f) {
    if (draw.mainCanvasActive) draw.theContext.font = f;
    draw.hitContext.font = f;
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
 
 
  om.DNode.draw2d = function (draw1d,draw2d) {
    //several cases: normal draw, selected draw, with either or both of a fillstyle and strokestyle
    if (!this.style) return; // not a drawable
    var st = this.style;
    var fs = st.fillStyle;
    var ss = st.strokeStyle;
    var lw = st.lineWidth;
    if (!lw) lw = 1;
    var sel = this.isSelected();
    if (fs) {
      this.setFillStyle(fs);
      draw2d();
    }
    if (sel) {
      this.setStrokeStyle(draw.highlightColor);
      this.setLineWidth(lw+2);
      draw1d();
    }
    if (ss  && ((!sel) || (!fs))) {
      this.setStrokeStyle(ss);
      this.setLineWidth(lw);
      draw1d();
    }
  }
    

  draw.highlightColor = draw.toRgba({red:100,green:140,blue:255,alpha:1});
  draw.highlightColor = "magenta";

  
  om.DNode.inWs = function () {
    if (this == draw.wsRoot) return true;
    var pr = om.getval(this,"__parent__");
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
    //ws.deepSetProp("__selectedPart__",0);
    //ws.deepSetProp("__selected__",0);
  }
  
  draw.clear = function () {
    var wd = draw.theCanvas.width;
    var ht = draw.theCanvas.height;
    drawops.clearRect(0,0,wd,ht); 
  }
  
  draw.setBkColor = function (cl) {
    var wd = draw.theCanvas.width;
    var ht = draw.theCanvas.height;
    var ctx = draw.theContext;
    var hctx = draw.hitContext;
    drawops.save();
     if (draw.mainCanvasActive) ctx.globalCompositeOperation = "destination-over";
    hctx.globalCompositeOperation = "destination-over";
     if (draw.mainCanvasActive) ctx.fillStyle = draw.bkColor;
    hctx.fillStyle = "white";
     var wd = draw.theCanvas.width;
      var ht = draw.theCanvas.height;
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
    //console.log("=====Translate ",x,y,"of",om.pathOf(this,__pj__).join("/"));
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
  
  om.DNode.drawable = function (knownToHaveDrawMethod) {
    if (knownToHaveDrawMethod) {
      var hsm = 1;
    } else {
      hsm = om.hasMethod(this,"draw");
    }
    if (hsm) {
      return (this.style) && (!this.hidden);
    }
    return false;
  }
  
  om.DNode.getTransform = function () {
    var xf = this.get("transform");    
    if (!xf) { // backwards compatibility hack
      xf = this.get("__xform__");
      if (xf) this.set("transform",xf); 
    }
    return xf;
  }
  
  om.LNode.getTransform = om.DNode.getTransform;
  
  om.DNode.deepDraw = function (topLevel) {
    if (topLevel) {
      draw.clearHitColors();
    }
    if (this.__name__ == "testin") debugger;
    if (this.get("hidden")) return;
    var xf = this.getTransform();   
    if (xf) {
      var ctx = draw.theContext;
      var hctx = draw.hitContext;
      drawops.save();
      if (draw.mainCanvasActive) xf.applyToContext(ctx);
      xf.applyToContext(hctx);
    }
    var hsm = om.hasMethod(this,"draw");
    if (hsm) {
      if  (this.drawable()) {
        var hcl = this.get("__hitColor__");
        if (!hcl) {
          this.__hitColor__ = hcl = draw.randomRgb();
          draw.shapesByHitColor[hcl] = this;
        }
        var mth = this["draw"]
        mth.call(this);
      }
    } else {
      this.iterValues(function (v) {
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
    this.iterValues(
      function (v) {
        if (om.isNode(v)) {
          v.deepDraw();
        }
      });
    if (xf) {
      drawops.restore();
    }
  } 

  om.DNode.absolutePos = function () {
    var pr = this.get("__parent__");
    if (!pr) {
      return geom.Point.mk(0,0);
    }
    var prpos = pr.absolutePos();
    var xf =this.getTransform();
    if (xf) {
      return prpos.applyTransform(xf);
    }   
    return prpos; 
  }
  
  om.LNode.absolutePos = om.DNode.absolutePos;
  
  /* obsolete
  
  draw.setSelectedCallback = undefined;
  draw.setSelected = function (node) {
    var nh = draw.selected;
    if (nh) {
      nh.setTransient("selected",false);
    }
    draw.selected = node;
    if (node) {
      node.setTransient("selected",true);
      if (draw.setSelectedCallback) {
        draw.setSelectedCallback(node,true);
      }
    }
    draw.refresh(); 
  }
  
   draw.setHovered = function (node) {
    var nh = draw.hovered;
    if (nh) {
      nh.setTransient("hovered",false);
    }
    draw.hovered = node;
    if (node) {
      node.setTransient("hovered",true);
    }
    draw.refresh(); 
  }
   draw.clearHovered = function (node) {
   
    draw.hovered = undefined;

    if (node) {
      node.setTransient("hovered",false);
    }
    draw.refresh();
    
  }
 
  */
  draw.relCanvas = function (div,e) {
     var ofs = div.offset();
      var x = e.clientX - ofs.left;
      var y = e.clientY - ofs.top;
      var px = e.pageX- ofs.left;
      var py = e.pageY - ofs.top;
      return geom.Point.mk(px,py);
  }
  
  draw.dataDim = 11;
  draw.hitImageData = function (p) {
    var d = Math.floor((draw.dataDim)/2)
    return draw.hitContext.getImageData(p.x-d,p.y-d, draw.dataDim,draw.dataDim);
  }
  
  draw.computeBounds1 = function () {
    
    var minx = Infinity;
    var maxx = -Infinity;
    var miny = Infinity;
    var maxy = -Infinity;
    var wd = 200;
    var ht = 200;
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
  
  draw.boundsTransform = geom.Transform.mk({scale:0.2,translation:[100,100]});
  draw.boundsTransformI = draw.boundsTransform.inverse();
 //  draw.boundsTransform = geom.Transform.mk({scale:1,translation:[00,00]});
  draw.boundsOffset = geom.Point.mk(-100,-100);

  // rule: draw on the 1000 by 1000 canvas with origin at -500,-500; compute bounds on this
  // by shriking town to 200 by 200, and rescaling result
  draw.computeBounds = function () {
    var ws = draw.wsRoot;
    var xf = ws.transform;
    ws.set("transform",draw.boundsTransform);
    draw.hitCanvas.attr({width:200,height:200});
    //draw.mainCanvas.attr({width:200,height:200});
    draw.mainCanvasActive = 0;
    draw.refresh();
    var bnds = draw.computeBounds1();
    draw.mainCanvasActive = 1;
    draw.hitCanvas.attr({width:draw.canvasWidth,height:draw.canvasHeight});
    if (bnds) {
      var bnds = bnds.applyTransform(draw.boundsTransformI);
    }
    return bnds;
  }
  
  draw.fitContents = function () {
    var bnds = draw.computeBounds();
    if (!bnds) return;
    var xf = draw.fitIntoCanvas(bnds,0.8);
    draw.wsRoot.set("transform",xf);
    draw.refresh();
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
  
  draw.dragEnabled = 0;
  draw.interpretedImageData = [];
  
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
        var rgb = draw.toRgb(r,g,b);
        var sh = draw.shapesByHitColor[rgb];
        if (sh) {
          var ssh = sh;
          var rs = ssh;
          cdist = dsq;
        } else {
          ssh = undefined;
        }
        //draw.interpretedImageData[i] = ssh;  for debugging
      }
    }
      // @todo get the closest fellow; for now anything works
    return rs;
  }
  
  
  draw.init = function () {
    draw.theCanvasDiv.mousedown(function (e) {
      var rc = draw.relCanvas(draw.theCanvasDiv,e);
      console.log("relCanvas",rc.x,rc.y);
      draw.refPoint = rc;
      console.log(rc.x,rc.y);
      var idt = draw.hitImageData(rc);
      var dt = idt.data;
      var ssh = draw.interpretImageData(dt);
      if (ssh) {
         console.log("selected",ssh.__name__);
         ssh.select("canvas");
      } else {
        console.log("No shape selected");
      }
      return;
    //@todo bring this back, or get rid of it
      var cl = draw.wsRoot.closest(rc,1000000000.0);
      console.log('closest',cl);
      if (cl) {
        var sl = cl[0];
        var so = om.selectionOption(); // which ancestor to select
        sl = sl.nthAncestor(so);
        sl.select("canvas");
        if (!draw.dragEnabled) return;
        var xf = sl.getTransform();
        if (xf) {
          draw.refPos = xf.get("translation");
        } else {
          draw.refPos = geom.Point.mk(0,0);
        }
        
      } else {
        draw.refPos = undefined;
      }
      return;
    });
    function doMove(e) {
      if (!draw.refPos) return;
      var rc = draw.relCanvas(draw.theCanvasDiv,e);
      var delta = rc.difference(draw.refPoint);
      var npos = draw.refPos.plus(delta);
      om.selectedNode.moveto(npos);
      draw.refresh();
    
    }
    draw.theCanvasDiv.mouseup(function (e) {
      if (!draw.refPoint) return;
      doMove(e);
      draw.refPoint = undefined;
    });
     
     draw.theCanvasDiv.mousemove(function (e) {
      if (!draw.refPoint) return;
      doMove(e);
    });
  }
  
  
  
  draw.bkColor = "rgb(10,10,30)";
  
  draw.refresh = function (dontClear) {
   if (!dontClear) {
      draw.clear();
      if (draw.mainCanvasActive) {
        drawops.save();
        var ctx = draw.theContext;
        ctx.fillStyle = draw.bkColor;
        var wd = draw.theCanvas.__element__.width();
        var ht = draw.theCanvas.__element__.height();
        ctx.fillRect(0,0,wd,ht);
        /*
        ctx.fillStyle = "grey";
        ctx.fillRect(0,0,60,26);
        ctx.font = '12pt Arial';
        ctx.fillStyle = 'white';
        ctx.fillText("Inspect",5,20);
        */
      }
    }
   draw.wsRoot.deepDraw(1);
  }

  
  draw.postFrame = function (movie,frameNum,cb) {
    var cnv = this.theCanvas;
    var img = canvas.toDataURL("image/jpeg");
    var url = "/api/addFrame";
    var data = {movie:movie,frameNum:frameNum,jpeg:img}
    console.log("posting Frame ",frameNum);
    om.post(url,data,function(rs) {
      console.log("POSTED");
      if (cb) cb(rs);
    });
  }
  
  
  draw.postCanvas = function (name,cb) {
    var cnv = this.theCanvas;
    var img = canvas.toDataURL("image/jpeg");
    var url = "/api/postCanvas";
    var data = {name:name,jpeg:img}
    console.log("posting Frame ",name);
    om.ajaxPost(url,data,function(rs) {
      console.log("POSTED");
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
    var wsRoot = draw.wsRoot = om.DNode.mk();
    __pj__.set(nm,wsRoot);
    if (scr) {
      var trns = geom.translate(geom.Point.mk(ofx + cwd/2,ofy + cht/2));
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
  
  draw.whenReady = function (cb) {
      draw.theCanvasDiv = $('#canvasDiv');
      /*
       *var cnv = document.getElementById('canvas');
      draw.theContext = draw.theCanvas.getContext('2d');
      var hitcnv = document.getElementById('hitcanvas');
      if (!draw.hitCanvasDebug) {
        $(hitcnv).css('display','none');
      }
      draw.hitContext = hitc.getContext('2d');
       var features = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=600,height=300";
      */
      draw.init();
      cb();
  }
  
  draw.update = function () {
    om.deepUpdate(om.root);
  }
  draw.animate = function (framesLeft,delay) {
    if (!draw.numFrames) draw.numFrames = framesLeft;
    var fcnt = draw.numFrames - framesLeft;
    console.log("frame ",fcnt);
    
    if (framesLeft <=0) {
      draw.refresh();
      return;
    }
    draw.refresh();
    draw.update();
    var nextFrame = function () {
      setTimeout(function () {draw.animate(framesLeft-1,delay);},delay);
    }
    if (0 && (fcnt >= 150) && (fcnt < 200)) {
      draw.postFrame("smudge1",fcnt-150,nextFrame);
    } else {
      nextFrame();
    }
  }
  
 
  draw.redraw = function (n,delay) {
    if (n == 0) return;
    draw.refresh();
    setTimeout(function () {draw.redraw(n-1,delay)},delay);
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
     var dst = geom.Point.mk(draw.canvasWidth,draw.canvasHeight).toRectangle().scale(ff);
     var rs = bnds.transformTo(dst);
     return rs;
    
   }
 
  
})();

