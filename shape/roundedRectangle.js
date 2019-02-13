//okok

core.require(function () {

var item = svg.Element.mk('<rect/>');

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
  this.outlinePadFraction =   0.6*this.cornerRadiusFraction;//0.6 to give a little extra room
  this.setDomAttribute('x',-0.5*wd);
  this.setDomAttribute('y',-0.5*ht);
  this.setDomAttribute('rx',radius);
  this.setDomAttribute('ry',radius);
}


var sqrt2 = Math.sqrt(2);

item.controlPoints = function () {
  var hw = this.width/2;
  var mhh = -this.height/2;
  var crf = this.cornerRadiusFraction;
  var cr = crf * Math.min(this.width,this.height);
  var cext = cr/sqrt2;
  let rs =  Point.mk(-hw+cext,mhh);
  return [rs];
}

//supports updateControlPoint for this, and for roundedRectangleWithText
item.newCornerRadiusFraction = function (idx,pos) {
  var hw = this.width/2;
  var ext = pos.x + hw;
  var cr = ext * sqrt2;
  let crf =  cr/Math.min(this.width,this.height);
  return crf;
}


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
