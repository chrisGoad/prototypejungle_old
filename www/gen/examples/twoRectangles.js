
(function () {
    var om = __pj__.om;
    geom = __pj__.geom;
    // the item being built 
    var item=__pj__.set("/examples/TwoR",geom.Shape.mk()); 
    // A rectangle prototype
    var rectP=item.set("rectP",
        geom.Rectangle.mk(
            {corner:[0,0],extent:[100,100],
             style:{hidden:1,strokeStyle:"black",fillStyle:"green",lineWidth:4}}));
    item.set("r1",rectP.instantiate().show());
    item.set("r2",rectP.instantiate().show());
    item.r2.corner.x = 140;
    item.r2.style.fillStyle = "blue";
    item.r1.draggable = 1;
    item.r2.draggable = 1;
    item.__about__ = 'Suggested exercise: change the lineWidth and x-extent in the prototype, then the y-extent in one of the instances.'
    om.save(item); 
})();
