//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;
  var pix = __pj__.setIfMissing("pix");
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var item=__pj__.set("/pix/Bezier0",geom.Shape.mk()); 

  item.set("arcproto",geom.Arc.mk({startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  var arcp = item.arcproto;
  arcp.hide();
  item.set("arc0",arcp.instantiate());
  item.set("arc1",arcp.instantiate());
  item.arc0.show();
  item.arc0.radius = 50;
  item.arc1.radius = 100;
  item.arc1.show();
  item.spin = 0;
  item.degreesField('spin');
  item.setNote("spin","Move the destination of the lines around by this angle");;
  item.set("bzproto",geom.Bezier.instantiate());
  var bzp = item.bzproto;
  bzp.hide();


 
 bzp.randomFactor = 8;
 bzp.setNote("randomFactor","How wiggly to make the lines");
 bzp.setInputF('randomFactor',om,'checkNonNegative');

  bzp.segCount = 5;
  bzp.setInputF('segCount',om,'checkPositiveInteger');

  item.bzproto.update = function () {
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
  
  
  item.lineCount = 10;
  item.setInputF('lineCount',om,"checkPositiveInteger");

  item.reverse = 0;
  item.setNote("reverse","Reverse the order of traversal of the second arc, when computing where to attach lines.");
  item.booleanField("reverse");
  
  
  item.update = function () {
    var om = __pj__.om;
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var cnt = 0;
    var interval = 2*Math.PI/this.lineCount;
    var ca = 0;
    var curves = this.createChild("curves",om.LNode.mk);
    curves.computed();
    for (var i=0;i<this.lineCount;i++) {
      var bz = curves[i];
      if (!bz) {
        var bz = this.bzproto.instantiate();
        curves.pushChild(bz);
      }
      var t = i/(this.lineCount);
      if (this.reverse) var t1 = 1-t; else t1 = t;
      var pp0 = geom.toGlobalCoords(this.arc0.pathPosition(t),draw.wsRoot);
      var pp1 = geom.toGlobalCoords(this.arc1.pathPosition(t1+(this.spin/(2*Math.PI))),draw.wsRoot);
      bz.show();
      bz.startPoint = pp0;
      bz.endPoint = pp1;
      bz.update();
      ca = ca + interval;
    }
    
  }
  om.save(item);
 
})();
  
