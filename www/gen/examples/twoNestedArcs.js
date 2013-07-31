

// the restored anon contains the prototype examples.Nested
__pj__.om.restore(["http://s3.amazonaws.com/prototypejungle/item/11/anon.353299696"],
    function () {
      var examples = __pj__.setIfMissing("examples");
      var geom = __pj__.geom;
      var nex = examples.set("nex",om.DNode.mk());
      
      var n1  = nex.set("n1",examples.Nested.instantiate());
      var n2  = nex.set("n2",examples.Nested.instantiate());
      
      om.save(nex);
    }
  );

