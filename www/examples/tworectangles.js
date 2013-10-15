(function (pj) {
  var om = pj.om;
  var draw = pj.draw;
  var geom = pj.geom;
  var item=pj.set("TwoR",geom.Shape.mk()); 
  // A rectangle prototype
  var rectP=item.set("rectP",
      geom.Rectangle.mk(
          {corner:[0,0],extent:[100,100],
           style:{hidden:1,strokeStyle:"black",fillStyle:"green",lineWidth:4}}).hide());
  item.set("r1",rectP.instantiate().show());
  item.set("r2",rectP.instantiate().show());
  item.r2.corner.x = 140;
  item.r2.style.fillStyle = "blue";
  // $('document').ready(function () { //Needed in stand alone version, but not in the scratch pad
  var cnv = draw.initCanvas('#canvas');
  cnv.bkColor = "white";
  cnv.fitFactor = 0.7;
  cnv.contents = item;
  cnv.fitContents(true);
  cnv.refresh();
  //});
})(prototypeJungle);
