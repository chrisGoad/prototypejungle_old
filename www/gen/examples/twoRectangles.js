
(function () {
  var examples = __pj__.setIfMissing("examples");
  var geom = __pj__.geom;
  var om = __pj__.om;
  var TwoR = examples.installType("TwoR");
  //var rectP = TwoR.set("rectP",geom.Rectangle.mk({hidden:1,corner:[0,0],extent:[100,100],style:{lineWidth:2}}));
  var rectP = TwoR.set("rectP",geom.Rectangle.mk({hidden:1,corner:[0,0],extent:[100,100],style:{strokeStyle:"black",fillStyle:"green",lineWidth:4}}));
 TwoR.set("r1",rectP.instantiate().show());
  TwoR.set("r2",rectP.instantiate().show());
  TwoR.r2.corner.x = 140;
  TwoR.r2.style.fillStyle = "yellow";
  TwoR.__about__ = 'Suggested exercise: change the lineWidth  and x-extent in the prototype, then the y-extent in one of the instances.'
  console.log(TwoR.__about__);
   om.done(TwoR);
})();
  

