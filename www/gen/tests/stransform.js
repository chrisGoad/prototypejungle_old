
(function () {
  debugger;
  var examples = __pj__.setIfMissing("tests");
  var geom = __pj__.geom;
  var om = __pj__.om;
  var top = examples.set("SimpleTransformTest",om.DNode.mk());
  var rectP = top.set("rectP",geom.Rectangle.mk({corner:[0,0],extent:[100,100],style:{hidden:1,strokeStyle:"black",fillStyle:"green",lineWidth:4}}));
  top.set("r1",rectP.instantiate().show());
  top.r1.draggable = 1;
  top.set("r2",rectP.instantiate().show());
  top.r2.style.fillStyle = "blue";
  top.r2.translate(400,400);
  top.r2.setScale(0.5);
  top.r2.rotate(Math.PI/4);
  
  top.r2.draggable = 1;
  top.translate(50,50);
  top.setScale(2);
 
  om.save(top);
})();


 /*
   var geom = __pj__.geom;
   var draw = __pj__.draw;
   var p = geom.toPoint(0,0);
   var nd = draw.wsRoot.r2;
   var lc = nd.toLocalCoords(p);
   var gl = nd.toGlobalCoords(lc);
   var gl0 = nd.toGlobalCoords(p);

  */

