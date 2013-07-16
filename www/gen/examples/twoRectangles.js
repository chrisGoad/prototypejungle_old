//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;
  var example = __pj__.setIfMissing("example");
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var TwoR = __pj__.installType("TwoR");
 // qw.set("__bounds__", geom.Rectangle.mk({corner:[-200,-200],extent:[200,200]}));
  var rectP = TwoR.set("rectP",geom.Rectangle.mk({corner:[0,0],extent:[100,100],style:{strokeStyle:"black",lineWidth:1}}));
  TwoR.set("r1",rectP.instantiate());
  TwoR.set("r2",rectP.instantiate());
  TwoR.r2.corner.x = 200;
  om.done(TwoR);
})();
  
