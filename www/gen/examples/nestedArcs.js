
(function () {
  var examples = __pj__.setIfMissing("examples");
  var geom = __pj__.geom;
  var om = __pj__.om;
  var Nested = examples.set("Nested",om.DNode.mk());
  var arcP =Nested.set("arcP",geom.Arc.mk({radius:100,startAngle:0,endAngle:2*Math.PI}));
  Nested.radiusFactor = 0.9;
  Nested.count = 10;
  Nested.set("arcs",om.LNode.mk());
  
  Nested.update = function () {
    // retain existing arcs, if present
    // this retains changes that may have been made in the inspector
    var arcs = this.arcs;
    var crad = this.arcP.radius;
    var cnt = this.count;
    var ln = arcs.length;
    for (var i=0;i<this.count;i++) {
      if (i < ln) {
        var ca  = arcs[i];
      } else  {
        ca = this.arcP.instantiate();
        arcs.pushChild(ca);
      }
      ca.radius = crad;
      crad = crad * this.radiusFactor;
    }
    arcs.length = cnt;
  };
  om.save(Nested);
})();
  

