
(function () {
  var examples = __pj__.setIfMissing("examples");
  var geom = __pj__.geom;
  var om = __pj__.om;
  var Nested = examples.set("Nested",om.DNode.mk());
  Nested.namedType();
  // The arc prototype
  var arcP =Nested.set("arcP",
              geom.Arc.mk({radius:100,startAngle:0,endAngle:2*Math.PI}));
  arcP.hide();
  Nested.radiusFactor = 0.9;
  Nested.count = 10;
  
  Nested.update = function () {
    var arcs = om.LNode.mk().computed();
    this.set("arcs",arcs);
    var crad = this.arcP.radius;
    var cnt = this.count;
    for (var i=0;i<this.count;i++) {
      var ca = this.arcP.instantiate();
      ca.show();
      arcs.pushChild(ca);
      ca.setf("radius",crad);  // freeze the radius
      crad = crad * this.radiusFactor;
    }
  };
  om.save(Nested);
})();
  

