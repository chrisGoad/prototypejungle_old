
__pj__.om.install(["http://s3.amazonaws.com/prototypejungle/item/11/anon.353299696"],
    function () {
      var examples = __pj__.setIfMissing("examples");
      var geom = __pj__.geom;
      var nex = examples.set("nex",om.DNode.mk());
      
      var n1  = nex.set("n1",examples.Nested.instantiate());
      var n2  = nex.set("n2",examples.Nested.instantiate());
      
      om.done(nex);
    }
  );

