
(function () {
  var om = __pj__.om;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var item=__pj__.set("/pix/TwoArcs",geom.Shape.mk()); 
  item.set("arcproto",geom.Arc.mk({startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  var arcp = item.arcproto;
  arcp.hide();
  item.set("arc0",arcp.instantiate());
  item.set("arc1",arcp.instantiate());
  item.arc0.show();
  item.arc0.radius = 50;
  item.arc0.draggable = 1;
  item.arc1.radius = 100;
  item.arc1.show();
  item.arc1.draggable = 1;
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
    console.log("BZPROTO UPDATE");
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
  
  
  item.lineCount = 1;
  item.setInputF('lineCount',om,"checkPositiveInteger");

  item.reverse = 0;
  item.setNote("reverse","Reverse the order of traversal of the second arc, when computing where to attach lines.");
  item.booleanField("reverse");
  
  
  item.update = function (ovr) {
    
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
      console.log("UUU");
      var bz = curves[i];
      if (1 || !bz) {
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

  om.save(item);
 
})();
  
