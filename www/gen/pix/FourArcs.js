//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;

om.install(["http://s3.prototypejungle.org/pj/repo0/pix/Bezier5"],function () {
  var pix = __pj__.setIfMissing("pix");
  var om = __pj__.om;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var top = pix.set("FourArcs",om.DNode.mk());
  top.set("arcproto",geom.Arc.mk({startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  var arcp = top.arcproto;
  arcp.hide();
  top.set("arc0",arcp.instantiate()).show();;
  top.set("arc1",arcp.instantiate()).show();
  top.set("arc2",arcp.instantiate()).show();
  top.set("arc3",arcp.instantiate()).show();
  top.arc0.radius = 50;
  top.arc1.radius = 75;
  top.arc2.radius = 100;
  top.arc3.radius = 125;
  var pair0 = top.set("pair0",pix.Bezier5.instantiate());
  var pair1 = top.set("pair1",pix.Bezier5.instantiate());
  pair0.set("arc0",top.arc0);
  pair0.set("arc1",top.arc1);
  pair1.set("arc0",top.arc2);
  pair1.set("arc1",top.arc3);
 
  
  
  om.save(top);
 
    
});
})();
  
