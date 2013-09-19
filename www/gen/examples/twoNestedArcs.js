
(function (pj) {
  pj.om.restore(["http://s3.prototypejungle.org/pj/repo0/examples/Nested"],
    function () {
      var om = pj.om;
      var geom = pj.geom;
      var item = pj.set("/examples/TwoNestedArcs",geom.Shape.mk());
      
      var n1  = top.set("n1",pj.examples.Nested.instantiate());
      var n2  = top.set("n2",pj.examples.Nested.instantiate());
      
      // adjust some parameters
      n2.arcP.radius = 30;
      n2.arcP.style.strokeStyle = "red";
      om.save(top);
    }
  );
})();


