
// the restored file contains the prototype examples.Nested
__pj__.om.restore(["http://s3.prototypejungle.org/item/13/iofvnynbuw"],
    function () {
      var examples = __pj__.examples;
      var top = examples.set("top",om.DNode.mk());
      
      var n1  = top.set("n1",examples.Nested.instantiate());
      var n2  = top.set("n2",examples.Nested.instantiate());
      
      // adjust some parameters
      n2.arcP.radius = 30;
      n2.arcP.style.strokeStyle = "red";
      om.save(top);
    }
  );

