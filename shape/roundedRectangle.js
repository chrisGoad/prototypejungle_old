// This is the simplest shape with a custom control, or "handle".
// Click on the rectangle and drag the handle to see it in action.

core.require(function () {

let item = svg.Element.mk('<rect/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.cornerRadiusFraction = 0.3;
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width'] = 1;
/*end  adjustable parameters */

item.resizable = true;
item.role = 'vertex';


item.update =  function () {
  var wd = this.width;
  var ht = this.height;
  var radius = this.cornerRadiusFraction * Math.min(wd,ht);
  this.setDomAttribute('x',-0.5*wd);
  this.setDomAttribute('y',-0.5*ht);
  this.setDomAttribute('rx',radius);
  this.setDomAttribute('ry',radius);
}


const sqrt2 = Math.sqrt(2);
// where to put the handle
item.controlPoints = function () {
  let hw = this.width/2;
  let mhh = -this.height/2;
  let crf = this.cornerRadiusFraction;
  let cr = crf * Math.min(this.width,this.height);
  let cext = cr/sqrt2;
  let rs =  Point.mk(-hw+cext,mhh);
  return [rs];
}

//supports updateControlPoint 
item.newCornerRadiusFraction = function (idx,pos) {
  let hw = this.width/2;
  let ext = pos.x + hw;
  let cr = ext * sqrt2;
  let crf =  cr/Math.min(this.width,this.height);
  return crf;
}

// adjust the shape to the handle's position
item.updateControlPoint = function (idx,pos) {
  let crf = this.newCornerRadiusFraction(idx,pos);
  this.setActiveProperty('cornerRadiusFraction',crf); // might set the prototypes cornerRadiusFraction
  ui.updateInheritors(ui.whatToAdjust); // needed in case the prototype was updated
}

graph.installRectanglePeripheryOps(item);


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}


return item;
});
