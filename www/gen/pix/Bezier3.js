//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;
  //var lib = draw.emptyWs("smudge");
om.install([],function () {
  var pix = __pj__.setIfMissing("pix");
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var  qw = pix.installType("Bezier3");
  qw.setN("lbcolor",{r:0,g:0,b:0});
  qw.setN("ubcolor",{r:255,g:255,b:255});
  qw.bzAlpha = 1.0;
  qw.set("__bounds__", geom.Rectangle.mk({corner:[-200,-200],extent:[200,200]}));

  qw.set("arc0",geom.Arc.mk({radius:50,startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  qw.set("arc1",geom.Arc.mk({radius:100,startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  qw.spin = 0.3;
 qw.set("bzproto",Object.create(geom.Bezier));
 qw.bzproto.hidden = 1;
 qw.set("value",om.mkLNode());
 qw.bzproto.setN("style",{lineWidth:1,strokeStyle:"blue"});
 qw.randomFactor = 4;
 qw.incFactor = 0.2;
 qw.segCount = 5;
 // vert = vertical ; posx, posy are 1, -1
  qw.genBez = function (idx,e0,e1,first) {
    var om = __pj__.om;
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    if (first) {
      //code
      var bz = this.bzproto.instantiate();
      bz.hidden = 0;
      if (!this.value) {
        this.set("value",om.mkLNode());
      }
      this.value.set(idx,bz);
    } else {
      bz  = this.value[nm];
    } 
    bz.style.strokeStyle = draw.randomColor(this.lbcolor,this.ubcolor,this.bzAlpha);
    bz.set("startPoint",e0);
    var vc = e1.difference(e0);
    var vcs = vc.times(1/this.segCount);
    var qvcs = vcs.times(1/4);
    var vcn  = vc.normalize();
    var vcnn = vcn.normal();
    var cp = e0;
    if (first) {
      var segs = om.mkLNode();
      bz.set("segments",segs);
      var st = this.set("state",om.mkLNode());
    } else {
      segs = bz.segments;
      st = this.state;
    }
    for (var i = 0;i<this.segCount;i++) {
      var odd = i%2;
      var dr = odd?-1:1;
      var np = cp.plus( vcs);
      if (first) {
        var d = (dr*Math.random()) * this.randomFactor;
        st.push(d);
      } else {
        var ld = st[i];
        d = ld + Math.random() * this.incFactor;
        st[i] = d;
      }
      var dsp = vcnn . times(d);
      var lastDsp;
      
      if (i==0) {
        var cp1 = cp.plus(dsp.plus(qvcs));
      } else {
        var cp1 = cp.plus((lastDsp.times(-1)).plus(qvcs)); // make this cp1 match the last cp2
      }
      lastDsp = dsp;
      var cp2 = np.difference(qvcs).plus(dsp);
      if (first) {
        var bzs = Object.create(geom.BezierSegment);
        segs.pushChild(bzs);
     } else {
        bzs = segs[i];
      }
      bzs.set("dest",np);
      bzs.set("cp1",cp1);
      bzs.set("cp2",cp2);
      cp = np;
      //code
    }
  
  }
  // qw.outerRadius = 200;
  //qw.innerRadius = 20;
  qw.lineCount = 1;
  qw.pdir0 = 1;
  qw.pdir1 = 1;
  
  qw.update = function () {
      var cnt = 0;
    var interval = 2*Math.PI/this.lineCount;
    var ca = 0;
    
    for (var i=0;i<this.lineCount;i++) {
      var t = i/(this.lineCount);
      if (this.pdir0) var t0 = t; else t0 = 1-t;
      if (this.pdir1) var t1 = t; else t1 = 1-t;
      var pp0 = this.arc0.pathPosition(t0);
      var pp1 = this.arc1.pathPosition(t1+this.spin);
      // note: interesting with irad*xp,irad*xp
      //this.segCount = 1+Math.floor(Math.random()*5);
      this.genBez(i,pp0,pp1,1);
      ca = ca + interval;
    }
    this.value.length = this.lineCount;
    
  }
  
  qw.step = function () {
     for (var i=0;i<this.lineCount;i++) {
      var t = i/(this.lineCount);
      if (this.pdir0) var t0 = t; else t0 = 1-t;
      if (this.pdir1) var t1 = t; else t1 = 1-t;
      var pp0 = this.arc0.pathPosition(t0);
      var pp1 = this.arc1.pathPosition(t1*t1);
      // note: interesting with irad*xp,irad*xp
      //this.segCount = 1+Math.floor(Math.random()*5);
      this.genBez(i,pp0,pp1,0);
      draw.refresh();
      
    } 
    
    
  }
  //top.quadw =  top.QuadWedge.instantiate();
  //top.qw.update();
  om.save(qw);//,"replicators/ArcSmudge2");
  
    
});

})();
  
/*
term-ite.org/item.html?pix/c2_0
term-ite.org/item.html?pix/QuadWedge
http://term-ite.org/item/pix/QuadWedge
draw.postCanvas("smudge5")
term-ite.org/stills/smudge5.jpg
draw.postCanvas("smudge_light_2")
term-ite.org/stills/smudge_light_2.jpg

*/
 
  

  

    
    
    
