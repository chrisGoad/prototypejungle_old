// bulls eye

core.require(function () {
  
let item =  svg.Element.mk('<g/>');

/* adjustable parameters */
item.dimension = 30;
item.numCircles = 2;
item.lineWidthFactor = 1;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width']  = 5;
/* end adjustable parameters */

item.circlesBuilt = 0;
item.role = 'spot';
item.resizable = true;

item.update =  function () {
  let built = this.circlesBuilt;
  let numCircles = this.numCircles; 
  this['stroke-width'] = (this.dimension * this.lineWidthFactor)/(this.numCircles * 4);
  if (built === numCircles) {
    for (let i=0;i<built;i++) {
      let c = this['c'+i];
      core.setProperties(c,this,['stroke','stroke-width','fill']);
      c.r = (this.dimension * (built-i))/(2*built);
    } 
    return;
  }
  if (built > numCircles) {
    for (let i=numCircles; i<built;i++) {
      this['c'+i].remove();
    }
    this.circlesBuilt = numCircles;
    this.update();
    return;
  }
  for (let i=built; i<numCircles;i++) {
    let c = this.set('c'+i,svg.Element.mk('<circle/>'));
    c.neverselectable = true;
    c.__hideInUI = true;
  }
  this.circlesBuilt = numCircles;
  this.update();
}

// used to compute where connections (eg arrows) terminate on this shape's periphery
graph.installCirclePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}


return item;
});

