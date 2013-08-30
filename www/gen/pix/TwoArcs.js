
(function () {
  var om = __pj__.om;
om.install([],function () {
  var pix = __pj__.setIfMissing("pix");
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var  qw = pix.set("TwoArcs",geom.Shape.mk()).namedType();

  qw.set("arcproto",geom.Arc.mk({startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  var arcp = qw.arcproto;
  arcp.hide();
  qw.set("arc0",arcp.instantiate());
  qw.set("arc1",arcp.instantiate());
  qw.arc0.show();
  qw.arc0.radius = 50;
  qw.arc0.draggable = 1;
  qw.arc1.radius = 100;
  qw.arc1.show();
  qw.arc1.draggable = 1;
  qw.spin = 0;
  qw.degreesField('spin');
  qw.setNote("spin","Move the destination of the lines around by this angle");;
  qw.set("bzproto",geom.Bezier.instantiate());
  var bzp = qw.bzproto;
  bzp.hide();


 
 bzp.randomFactor = 8;
 bzp.setNote("randomFactor","How wiggly to make the lines");
 bzp.setInputF('randomFactor',om,'checkNonNegative');

 bzp.segCount = 5;
 bzp.setInputF('segCount',om,'checkPositiveInteger');

  qw.bzproto.update = function () {
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var om = __pj__.om;
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
    }
  }
  
  
  qw.lineCount = 10;
  qw.setInputF('lineCount',om,"checkPositiveInteger");

  qw.reverse = 0;
  qw.setNote("reverse","Reverse the order of traversal of the second arc, when computing where to attach lines.");
  qw.booleanField("reverse");
  
  
  qw.update = function (ovr) {
    
    var om = __pj__.om;
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var cnt = 0;
    var interval = 2*Math.PI/this.lineCount;
    var ca = 0;
    var curves = this.set("curves",om.LNode.mk());
   // var curves = this.createChild("curves",om.LNode.mk);
    curves.computed();
    if (ovr) {
      var ovrc = ovr.curves;
    }  
    for (var i=0;i<this.lineCount;i++) {
      var bz = curves[i];
      if (!bz) {
        var bz = this.bzproto.instantiate();
        curves.pushChild(bz);
      }
      // apply the override before the computation
      if (ovrc) {
        var ovrt = ovrc[i];
        if (ovrt) {
          for (var k in ovr) {
            bz[k] = ovrt[k];
          }
        }
      }
      var t = i/(this.lineCount);
      if (this.reverse) var t1 = 1-t; else t1 = t;
      var pp0 = this.arc0.pathPosition(t);
      var pp1 = this.arc1.pathPosition(t1+(this.spin/(2*Math.PI)));
      var gpp0 = this.arc0.toGlobalCoords(pp0,draw.wsRoot);
      var gpp1 = this.arc1.toGlobalCoords(pp1,draw.wsRoot);
      bz.show();
      bz.startPoint = gpp0;
      bz.endPoint = gpp1;
      bz.update();
      ca = ca + interval;
    }
    
  }
  
  
  om.save(qw);
 
    
});
})();
  
