// Radiant


core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="black"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.numRays = 20;
item.dimension = 50;
item.innerRatio= 0.9;
kit.includeArrows = false;

/* end adjustable parameters */

item.role = 'vertex';
item.resizable = true;


item.update = function () {
  let i;
  let path = '';
  const p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+' ';
  }
  let innerRadius = 0.5*this.dimension * this.innerRatio;
  for (i=0;i<this.numRays;i++) {
    let angle = 2*(i/this.numRays)*Math.PI;//*Math.random();
    let dir = geom.Point.mk(Math.cos(angle),Math.sin(angle));
    let inner = dir.times(innerRadius);
    let outer = dir.times(0.5*this.dimension);
    path += p2str('M',inner,' ');
    path += p2str('L',outer,' ');     
   }
   this.d = path;
}

item.controlPoints = function () {
  let innerRadius = 0.5*this.dimension * this.innerRatio;
  let pnt = geom.Point.mk(innerRadius,0);
  return [pnt];
}

item.updateControlPoint = function (idx,pos) {
  let wta = ui.whatToAdjust;
  wta.innerRatio = 2*pos.x/this.dimension;
  ui.updateInheritors(wta);
}
// used to compute where connections (eg arrows) terminate on this shape's periphery
graph.installCirclePeripheryOps(item);


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

ui.hide(item,['d']);

return item;
});
//();
