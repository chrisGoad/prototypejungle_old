
// the restored file contains the prototype examples.Nested
__pj__.om.restore(["http://s3.prototypejungle.org/pj/repo0/examples/Nested"],
    function () {
      var om = __pj__.om;
      var geom = __pj__.geom;
      var item = __pj__.set("/examples/twoNestedArcs",geom.Shape.mk());

      var examples = __pj__.examples;
      var top = examples.set("twoNestedArcs",geom.Shape.mk());
      
      var n1  = top.set("n1",examples.Nested.instantiate());
      var n2  = top.set("n2",examples.Nested.instantiate());
      
      // adjust some parameters
      n2.arcP.radius = 30;
      n2.arcP.style.strokeStyle = "red";
      om.save(top);
    }
  );


