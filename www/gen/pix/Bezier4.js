//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;
  //var lib = draw.emptyWs("smudge");
om.install([],function () {
  var pix = __pj__.setIfMissing("pix");
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var  qw = pix.installType("Bezier4");
 // qw.set("__bounds__", geom.Rectangle.mk({corner:[-200,-200],extent:[200,200]}));
 qw.set("arcproto",geom.Arc.mk({startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  var arcp = qw.arcproto;
  qw.set("arc0",arcp.instantiate());
  qw.set("arc1",arcp.instantiate());
  qw.arc0.radius = 50;
  qw.arc1.radius = 100;
  qw.spin = 0;
 qw.set("bzproto",Object.create(geom.Bezier));
 var bzp = qw.bzproto;
 bzp.hidden = 1;
  bzp.lbcolor = "rgb(0,0,0)";
  bzp.setNote("lbcolor","Lower bound of randomly chosen rgb");

  bzp.ubcolor = "rgb(255,255,255)";
    bzp.setNote("ubcolor","Upper bound of randomly chosen rgb");

  bzp.alpha = 1.0;

      bzp.setNote("alpha","Alpha (opacity) for the randomly chosen rgba");

 
 bzp.setN("style",{lineWidth:1,strokeStyle:"blue"});
 bzp.randomFactor = 4;
 bzp.setNote("randomFactor","How wiggly to make the lines");
 bzp.segCount = 5;
 // qw.setNote("setCount","How many wiggles do the lines have");
// vert = vertical ; posx, posy are 1, -1
  qw.bzproto.update = function () {
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    this.style.__computed__ = 1;
    var st = this.style.getFieldStatus("strokeStyle");
    if (st != "overridden") {
      this.style.strokeStyle = draw.randomColor(this.lbcolor,this.ubcolor,this.alpha);
    }
    var e0 = this.startPoint;
    var e1 = this.endPoint;
    
     var vc = e1.difference(e0);
    var vcs = vc.times(1/this.segCount);
    var qvcs = vcs.times(1/4);
    var vcn  = vc.normalize();
    var vcnn = vcn.normal();
    var cp = e0;
    var segs = om.LNode.mk();
    this.set("segments",segs);
    for (var i = 0;i<this.segCount;i++) {
      var odd = i%2;
      var dr = odd?-1:1;
      var np = cp.plus( vcs);
      var d = (dr*Math.random()) * this.randomFactor;
      var dsp = vcnn . times(d);
      var lastDsp;
      if (i==0) {
        var cp1 = cp.plus(dsp.plus(qvcs));
      } else {
        var cp1 = cp.plus((lastDsp.times(-1)).plus(qvcs)); // make this cp1 match the last cp2
      }
      lastDsp = dsp;
      var cp2 = np.difference(qvcs).plus(dsp);
      var bzs = Object.create(geom.BezierSegment);
      segs.pushChild(bzs);
      bzs.set("dest",np);
      bzs.set("cp1",cp1);
      bzs.set("cp2",cp2);
      cp = np;
      //code
    }
  }
  
  
  // qw.outerRadius = 200;
  //qw.innerRadius = 20;
  qw.lineCount = 10;
  
  qw.update = function () {
    var cnt = 0;
    var interval = 2*Math.PI/this.lineCount;
    var ca = 0;
    var curves = this.createChild("curves",om.LNode.mk);
    for (var i=0;i<this.lineCount;i++) {
      var bz = curves[i];
      if (!bz) {
        var bz = this.bzproto.instantiate();
        bz.__computed__ = 1;
        curves.pushChild(bz);
      }
      var t = i/(this.lineCount);
      //if (this.pdir0) var t0 = t; else t0 = 1-t;
      //if (this.pdir1) var t1 = t; else t1 = 1-t;
      var pp0 = this.arc0.pathPosition(t);
      var pp1 = this.arc1.pathPosition(t+this.spin);
      // note: interesting with irad*xp,irad*xp
      //this.segCount = 1+Math.floor(Math.random()*5);
      bz.hidden = 0;
      bz.startPoint = pp0;
      bz.endPoint = pp1;
      bz.update();
      ca = ca + interval;
    }
    
  }
  
  qw.contract = function () {
    delete this.curves;
  }

  
  //top.quadw =  top.QuadWedge.instantiate();
  //top.qw.update();
  om.save(qw);//,"replicators/ArcSmudge2");
  
    
});
})();
  
