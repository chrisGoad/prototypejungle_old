
(function () {
  var examples = __pj__.setIfMissing("examples");
  var geom = __pj__.geom;
  var om = __pj__.om;
  var TwoR = examples.set("TwoR",om.DNode.mk());
  var rectP = TwoR.set("rectP",geom.Rectangle.mk({corner:[0,0],extent:[100,100],style:{hidden:1,strokeStyle:"black",fillStyle:"green",lineWidth:4}}));
  TwoR.set("r1",rectP.instantiate().show());
  TwoR.set("r2",rectP.instantiate().show());
  TwoR.r2.corner.x = 140;
  TwoR.r2.style.fillStyle = "yellow";
  TwoR.__about__ = 'Suggested exercise: change the lineWidth  and x-extent in the prototype, then the y-extent in one of the instances.'
  om.done(TwoR);
})();
  

