
/*
 lib.Translate.prototype.containsPoint = function (p) { // @todo only translation is handled for now
   var tr = this.translation;
   var d = p.difference(p);
   return this.subject.containsPoint(d);
 }
*/
/*
  lib.AlongPathIterator = function (o) {
    this.setProperties(o,["iterator","path"]);
  }
  
  lib.AlongPathIterator.prototype = Object.create(om.Iterator();
  
  lib.AlongPathIterator.prototype.next = function () {
    var pth = this.path");
    var itr = this.iterator");
    var nv = itr.next();
    if (nv === undefined) return nv;
    var pp = pth.pathPosition(nv);
    return pp;
  }
  
  
  // subject iterator is optional
  
  lib.AlongPathReplicator = function (o) {
    this.setProperties(o,["template","positionIterator","path","subjectIterator"]);
    this.__type__  = "AlongPathReplicator"
  }
  

  
  //lib.AlongPathReplicator.prototype = Object.create(om.Replicator();
  lib.AlongPathReplicator.prototype = om.mkDNode();
 
  lib.AlongPathReplicator.prototype.expand = function () {
    if (this.__isPrototype__) return;
    var vl = this.value;
    if (vl) {
      om.deepExpand(vl);
      return;
    }
    var pit = Object.create(geom.AlongPathIterator({iterator:this.positionIterator,path:this.path});
    var its = om.mkDNode({translation:pit});
    var sbi = this.subjectIterator;
    if (sbi) {
      this.set("subject",subjectIterator);
    }
  //var r = Object.create(om.Replicator({count:4,iterators:its,template:ctrns});
    var r = Object.create(om.Replicator({iteratorTree:its,template:this.template});
    this.set("value",r);
  }
  
  // generates a random line from the top to the bottom of the rectangle
  // the top point in chosen at random at x, and y is chosen at random beteen x+lb and x + yb
  
  
  lib.RandomLines = function (o) {
    this.setProperties(o,["rectangle","lb","ub"]);
  }
  
  lib.RandomLines.prototype = Object.create(om.Iterator();
  
  lib.RandomLines.prototype.next = function () {
    var r = this.rectangle;
    var c = r.corner;
    var top_y = c.y;
    var xt = r.extent;
    var bot_y = top_y + (xt.y);
    var lft = c.x;
    var top_x =  lft + Math.random() * (xt.x);
    var bot_x = (top_x + this.lb) + Math.random() * (this.ub-this.lb);
    var top = geom.mkPoint(top_x,top_y);
    var bot = geom.mkPoint(bot_x,bot_y);
    return Object.create(geom.Line({e0:top,e1:bot});
  }
  */

//updater takes as input subject,i,j where i,j are grid coords
  // the templates are assumed to be translation nodes. the translations are set to be the grid points
  lib.GridReplicator = function (o) {
    this.setProperties(o,["template","gridRect","countX","countY","updater"]);
    this.__type__  = "GridReplicator"
  }
  
  
  lib.GridReplicator.prototype = om.mkDNode();
  
  lib.GridReplicator.prototype.expand = function () {
    var cx = this.countX;
    var cy = this.countY;
    var tmp = this.template;
    var upd = this.updater;
    var gr = this.gridRect;
    var xt = gr.extent;
    var xtx = ext.x;
    var xty = ext.y;
    var dx = xtx/cx;
    var dy = xty/cy;
    var c = gr.corner;
    var cx = c.x;
    var cy = c.y;
    
    for (var i = 0;i<cx;i++) {
      for (var j=0;j<cx;j++) {
        var sb = om.deepInstantiate(tmp);
        var psx = cx + i * dx;
        var psy = cy + j * dy;
        
        if (upd) {
          upd(sb,i,j);
        }
      }
    }
  }
  
  lib.GridIterator = function (o) {
    this.setProperties(o,["rectangle","countX","countY","operator"]);
    this.__type__  = "GridIterator"
  }
  
  
  lib.GridIterator.prototype = om.mkDNode();
  
  lib.GridIterator.prototype.draw = function () {
    var op = this.operator;
    var cntx = this.countX;
    var cnty = this.countY;
    var gr = this.rectangle;
    var xt = gr.extent;
    var xtx = xt.x;
    var xty = xt.y;
    var dx = xtx/(cntx-1);
    var dy = xty/(cnty-1);
    var c = gr.corner;
    var cx = c.x;
    var cy = c.y;
    var ctx = draw.theContext;
    ctx.save();
    for (var i = 0;i<cntx;i++) {
      for (var j=0;j<cnty;j++) {
        var psx = cx + i * dx;
        var psy = cy + j * dy;
        op(i,j,psx,psy,dx,dy);
      }
    }
    ctx.restore();
  }
  
  
  
  
  // @todo needs updating
  lib.Smudge = function (o) {
    this.setProperties(o,["circle","count","spotRadius","color"]);
  }
  
  
  lib.Smudge.prototype = om.mkDNode();

  
  lib.Smudge.prototype.draw = function () {
    var crc = this.circle;
    var c = crc.center;
    var r = crc.radius;
    var cnt = this.count;
    var ctx = draw.theContext;
    ctx.fillStyle = this.color;
    var sr = this.spotRadius;
    function randomPoint() {
      var rn0 = Math.random();
      var rn1 = Math.random();
      var rr = rn0 * rn0;
    //  var rr = rn0*rn1; // this turns the thing into a spiral
     //  var rr = 0.5 * (rn0+rn1); // this turns the thing into a spiral
    var dr = rn1 * 2 * Math.PI;
      var dx = r*rr*Math.cos(dr);
      var dy = r*rr*Math.sin(dr);
      return c.plus(lib.mkPoint(dx,dy));
    }
    for (var i=0;i<cnt;i++) {
      var p = randomPoint();
      ctx.beginPath();
      ctx.arc(p.x,p.y,sr,0,Math.PI*2,0);
      ctx.fill();
      ctx.closePath();
    }
  }
  
  
  lib.ParticleLine = function (o) {
    this.setProperties(o,["line","count","particle","updater","value"]);
    this.__type__ = "ParticleLine";
    this.particle.__isPrototype__ = 1;
    var abc = 22;
  }
  
  
  lib.ParticleLine = om.mkDNode();

  
  lib.ParticleLine.expand = function () {
    var ln = this.line;
    var e0 = ln.e0;
    var e1 = ln.e1;
    var lnth = ln.pathLength();
    var cnt = this.count;
    var tmp = this.particle;
    var rs = Object.create(om.LNode);
    var updater = this.updater;
    for (var i=0;i<cnt;i++) {
      var e = om.deepInstantiate(tmp);
      
      var pp = ln.pathPosition(Math.random());
      e.translate(pp);
      //e.translate(geom.mkPoint(40,20));
     
      
      if (updater) updater.apply([e]);
      rs.pushChild(e);
    }
    this.set("value",rs);
  }
  
  

  /*
  lib.installType("PolyLine");
  
  lib.mkPolyLine = function (points) {
    var rs = Object.create(lib.PolyLine);
    if (points) {
      rs.set("points", points);
    } else {
      rs.set("points", lib.mkLNode());
    }
    return rs;
  }
  
  lib.mkPolyLineFAA = function (points) { // here points has the form of an array of arrays: [[2,3],[3,4]] etc'
    var pnts = om.mkLNode();
    points.forEach(function (p) {
      var pnt = lib.mkPoint(p[0],p[1]);
      pnts.pushChild(pnt)
    });
    return lib.mkPolyLine(pnts);
  }
  */
  
  
 /* needs update for hit canvas, if to be reintroduced at all 
  geom.PolyLine.draw = function (mode) {
    // @needfix
    var pnts = this.points;
    var ln = pnts.length;
    var ctx = lib.theContext;
    var p0 = pnts[0];
    drawops.save()
    if (mode=="highlight") {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(200,0,0,0.5)";
    } else if (mode=="hover") {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(200,200,200,0.5)";
    } else {
      var sst = this.strokeStyle;
      if (sst) ctx.strokeStyle =sst;
    }
    ops.beginPath();
   // ctx.beginPath();
    ctx.moveTo(p0.x,p0.y);
    for (var i=1;i<ln;i++) {
      var p = pnts[i];
      ctx.lineTo(p.x,p.y);
    }
    //ctx.closePath();
    drawops.stroke();
    drawops.restore();
    if (!mode) {
      if (this.getTransient("selected")) {
        this.draw("highlight");
      } else if (this.getTransient("hovered")) {
        this.draw("hover");
      }
    }

    
  }
  */
  lib.LNode.evalElements = function () {
    var ln = this.length;
    var iseval = false;
    var rs;
    for (var i=0;i<ln;i++) {
      var ca = this[i];
      var cae = lib.eval(ca);
      if (cae == ca) {
        if (iseval) {
          rs.push(cae);
        }
      } else {
        if (iseval) {
          rs.push(cae);
        } else { // first arg with an eval
          rs = [];
          for (var j=0;j<i;j++) {
            rs.push(this[j]);
          }
          rs.push(cae);
          iseval = true;
        }
          
      }
    }
    if (iseval) return rs;
    return this;
  }
  
  lib.App = lib.mkDNode();
  lib.App.evalVerbose = 0;
  
  lib.App.eval = function () {
    var v = lib.App.evalVerbose;
    if (this.__value__ !== undefined) {
      return this.__value__;
    }
    var args = this.arguments;
    var op = this.operator;
    var self = this.self;
    var se = undefined;
    if (self) {
      var se = lib.eval(self);
      var fn = se[op];
      if (!fn) {
        lib.error("Missing method "+op);
        return;
      }
      if (typeof(fn) != "function") {
        lib.error(op + "is not a method");
        return;
      }
    } else {
      var fn = fnlib[op];

    }
    if (lib.isObject(args)) {
      if (args.__type__ == "LNode")  {
        var ee = args.evalElements();
        var rs = fn.apply(se,ee);
        this.__value__ = rs;
        if (v) console.log("eval of ",fn,"on",ee,"yields",rs);
        return rs;
      } 
    } 
    var ev = lib.eval(args)
    rs = fn.apply(se,[ev]);
    this.__value__ = rs;
    if (v) console.log("eval of ",fn,"yields",rs);
    return rs;
    
    
  }
  
  
  lib.App.removeValue = function () {
    this.__value__ = undefined;
  }
  
  /*
   a path is a sequence of segments, each of which should have pathLength and pathPosition methods 

  geom.PolyLine.pointDistance = function (p,lb) {
    var pnts = this.points;
    var ln = pnts.length;
    var d = lb;
    for (var i=0;i<ln-1;i++) {
      var e0 = pnts[i];
      var e1 = pnts[i+1];
      var nd = geom.distanceToLine(e0,e1,p,d);
      if (nd < d) d = nd;
    }
    return d;
  }

  geom.PolyLine.computeSegmentLengths = function () {
    var sgln = this.__segment_lengths__;
    if (sgln) return sgln;
    var pnts = this.points;
    var ln = pnts.length;
    var rs = [];
    var tln = 0;
    for (var i=0;i<ln-1;i++) {
      var p0 = pnts[i];
      var p1 = pnts[i+1];
      var d = p0.distance(p1);
      rs .push(d);
      tln += d;
    }
    this.__segment_lengths__ = rs;
    this.__pathLength__ = tln;
    return rs;
    
  }
  
  geom.PolyLine.pathLength = function () {
    this.computeSegmentLengths();
    return this.__pathLength__;
  }
  // returns {index:index,soFar:} index of the segment where t lies, and the cummulative lenght of prev segments
  geom.PolyLine.findSegment = function (t) {
    if (t > 1) om.error("t > 1 in findSegment",t);
    var lns = this.computeSegmentLengths();
    var tln = this.__pathLength__;
    var lnsf = 0;
    var llnsf = 0;
    var fcln = t * tln;
    var nsgs = lns.length;
    var whichSeg = 0;
    for (var i = 0;i<nsgs;i++) {
      llnsf = lnsf;
      lnsf += lns[i];
      if (lnsf >= fcln) {
        return {index:i,soFar:llnsf}
        
      }
    }
  }
  
  
  geom.PolyLine.pathPosition = function (pln) {
    // if t is the length along the path
    
    var lns = this.computeSegmentLengths();
    var tln = this.pathLength();
    var t = pln/tln;
    var pnts = this.points;
    var fs = this.findSegment(t);
    var lnsf = fs.soFar;
    var whichSeg = fs.index;
    var p0 = pnts[whichSeg];
    var p1 = pnts[whichSeg+1];
    var sgfc = (t *  tln  - lnsf)/lns[whichSeg];
    return p0.interpolate(p1,sgfc);
  }
  
  
  lib.installType("Path");
 
  geom.Path.computeSegmentLengths = function () {
    var sgln = this.__segment_lengths__;
    if (sgln) return sgln;
    var segs = this.segments;
    var ln = segs.length;
    var rs = [];
    var tln = 0;
    for (var i=0;i<ln;i++) {
      var cpe = segs[i];
      var cln = cpe.pathLength();
      rs .push(cln);
      tln += cln;
    }
    this.__segment_lengths__ = rs;
    this.__pathLength__ = tln;
    return rs;
    
  }
  
  geom.Path.pathLength = function () {
    this.computeSegmentLengths();
    return this.__pathLength__;
  }
  
  
  geom.Path.findSegment = geom.PolyLine.findSegment;
  
  geom.Path.pathPosition = function (pln) {
   // if (pln > 0) debugger;
    var lns = this.computeSegmentLengths();
    var tln = this.pathLength();
    var t = pln/tln;
    if (t > 1) {
      t = 1;
    }
    var segs = this.segments;
    var fs = this.findSegment(t);
    var lnsf = fs.soFar;
    var whichSeg = fs.index;
    
    var sg = this.segments[whichSeg];
    var sgt = (t *  tln  - lnsf)/lns[whichSeg];
    var rs = sg.pathPosition(sgt);
    //console.log("sg",whichSeg,sgt,rs.x,rs.y);
    return rs;
  }
  
  */
  
  
  

  var loadAsPrototype = function (pth,cb) {
    // see if it is already present
    var nd = tree.evalPath(__dm__,pth);
    if (nd) {
      if (cb) cb(nd);
      return;
    }
    function afterLoad(nd) {
      nd.moveto(geom.Point.mk(0,0));
      nd.addWidgetLine(tree.protoTree);
      if (cb) cb(nd);
    }
    om.install(pth,cb,pth);
  }

  
  var instantiatePrototype = function () {
     filesLB.pop();
     fileBox.hide();
     var fel = filesLB.element;
     fel.setOkClick(function () {
       var fln = fel.fileName();
          var ias = fel.instantiateAs();
       //alert ("77 "+fln+" "+ias);
        loadAsPrototype(fln,function (nd) {
         var rs = nd.instantiate();
         draw.wsRoot.addAtPath(ias,rs);
         rs.addWidgetLine();
         draw.refresh();
         filesLB.dismiss();
       });
     })
   }
    
    
    
    var showWS = function () {
      var txt = JSON.stringify(om.addExtrefs(draw.wsRoot));
      mpg.lightbox.pop();
      var ht = "<textarea>"+txt+"</textarea>"; // @todo
      mpg.lightbox.setTextArea(txt);    
    }
    
  
    var saveWS = function () {
      function mkLink(url) {
        return '<a href="'+url+'">'+url+'</a>';
      }
      om.s3Save(draw.wsRoot,function (nm) {
        mpg.lightbox.pop();
        var fnm = "https://s3.amazonaws.com/inspectable/item/"+nm
        var ht = '<div>'+mkLink(fnm)+'</div>'; // @todo
        var itm = "http://inspectable.org?item="+fnm;
        ht += '<div>'+mkLink(itm)+'</div>';
        mpg.lightbox.setHtml(ht);
      });
    }
    
    
    om.walkDir("", function (rs) {
      console.log(rs);
      __dm__.set("fileTree",rs); // 
     // om.fileTreeWidget = om.attachTreeWidgets($('#fileDiv'),[rs],clickFun);
      page.fileTreeWidget = tree.attachTreeWidgets(filesEl.__element__,[rs],clickFun,fileTextFun);
      page.fileTreeWidget.fileTree = 1;

      
      
      
  
    lightbox.fileEx = lightbox.template.instantiate();
    
    var treeC = dom.newJQ({
      tag:"div",
      style:{
        padding:"3px",
        height:"80%",
        border:"thin solid green",
        overflow:"auto"
        
      }
      });
    
    var fcn =  lightbox.fileEx.selectChild("content");
    fcn.addChild("treeC",treeC);
    
    
    var line1 = dom.newJQ({tag:"div"});
    fcn.addChild("fileName",line1);
    line1.addChild("caption",dom.newJQ({tag:"span",html:"Filename:"}));
    line1.addChild("inputField", jqp.textInput.instantiate());
   
   
    var line2 = dom.newJQ({tag:"div"});
    fcn.addChild("instantiateAs",line2);
    line2.addChild("caption",dom.newJQ({tag:"span",html:"Instantiate as:"}));
    line2.addChild("inputField",jqp.textInput.instantiate());
   
   
   
   var okbut2 = jqp.button.instantiate();
   okbut2.html = "OK";
   fcn.addChild("ok",okbut2);
   
     lightbox.fileEx.setOkClick = function (c) {
      var el = this.cssSelect("#content>#ok").__element__;
      el.off("click");
      el.click(c);
      };
   lightbox.fileEx.fileName = function () {
     var iel = this.cssSelect("#content>#fileName>#inputField");
     var jel = iel.__element__;
     return jel.attr("value");
   }
   
    lightbox.fileEx.setFileName = function (vl) {
     var iel = this.cssSelect("#content>#fileName>#inputField");
     var jel = iel.__element__;
     return jel.attr("value",vl);
   }
   
    lightbox.fileEx.instantiateAs = function () {
     var iel = this.cssSelect("#content>#instantiateAs>#inputField");
     var jel = iel.__element__;
     return jel.attr("value");
   }

    });
    
    
    
    //for dragging
    
    
  
  draw.init = function () {
    if (draw.selectionEnabled) {
      //code
    }
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

//animation

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
  
  
  // file tree support
  
  om.storageDir = "/mnt/ebs1/termite/storage/"
 om.walkToTree = function (w) {
  function stripTop(pth) {
    var ln = om.storageDir.length;
    return pth.substr(ln);
  }
  function insertPath(tr,pth) {
    if (pth=="") return tr;
    var sp = pth.split("/");
    var ct = tr;
    sp.forEach(function (nm) {
      var cv = ct[nm];
      if (!cv) {
        cv = om.DNode.mk();
        ct.set(nm,cv);
      }
      ct = cv;
    });
    return ct;
  }  
  var rs = om.DNode.mk();
  w.forEach(function (v) {
    var irs = rs;//for debugging
    var pth = v[0];
    var fls = v[2];
    var spth = stripTop(pth);
    console.log("spth",spth);
    var tr = insertPath(rs,spth);
    fls.forEach(function (v) {
      var lf = om.DNode.mk();
      lf.set("__leaf__",1);
      tr.set(v,lf);
    })
  });
  return rs;
  
 }
 om.walkDir = function (pth,cb) {
  var dt = {path:pth,pw:om.pw}
  om.ajaxPost("/api/walkDirectory",dt,function (rs) {
    var abc = 55;
    rs.path = pth;
    var tr = om.walkToTree(rs.value);
    
    cb(tr);
  });
 }
 
 
 =============
 
 
 
// how many times is x hereditarily instantiated within this?
om.DNode.instantiationCount = function (x) {
  var rs = 0;
  if (x.isPrototypeOf(this)) {
    var rs = 1;
  } else {
    rs = 0;
  }
  this.iterTreeItems(function (v) {
    var c = v.instantiationCount(x);
    rs = rs +c;
  },true);
  return rs;
}

om.LNode.instantiationCount = om.DNode.instantiationCount;



 
  // n is the index of the next script to fetch
  om.getScripts = function (scripts,cb,n) {
    if (1) { // disabled for now
      cb();
      return;
    }
    var ln = scripts.length;
    if (n == ln) {
      cb();
      return;
    }
    if (typeof n == "number") {
      var i = n;
    } else {
      var i = 0;
    }
    om.getScript(scripts[i],function () {om.getScripts(scripts,cb,i+1)});
  }
  