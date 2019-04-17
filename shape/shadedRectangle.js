

// This is the simplest shape with a custom control, or "handle".
// Click on the rectangle and drag the handle to see it in action.

core.require(function () {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.cornerRadiusFraction = 0.3;
item.stroke = 'black';
item['stroke-width'] = .1;
item.outerFill = 'rgb(200,200,240)';
item.innerFill = 'white';
/*end  adjustable parameters */
item.outerFill = 'rgb(100,100,240)';

item.fill = 'transparent';
item.resizable = true;
item.role = 'vertex';


let  gradient = svg.Element.mk('<linearGradient/>');
let stop1,stop2,stop3;
gradient.gradientTransform = "rotate(90)";
gradient.set('stop0',svg.Element.mk('<stop offset="0%" stop-opacity="1" />'));
gradient.set('stop1',svg.Element.mk('<stop offset="15%" stop-opacity="1" />'));
gradient.set('stop2',svg.Element.mk(' <stop offset="30%"   stop-opacity="1" />'));

let defs = svg.Element.mk('<defs/>');
item.set('defs',defs);
item.defs.set('gradient',gradient);//

item.set("__contents",svg.Element.mk('<rect/>'));
item.__contents.neverselectable = true;

let count = 0;

item.update =  function () {
  let rect = this.__contents;
  let gradient = this.defs.gradient;
  let id = 'g'+(count++);
  gradient.id = id;
  var wd = this.width;
  var ht = this.height;
  rect.width = wd;
  rect.height = ht;
  var radius = this.cornerRadiusFraction * Math.min(wd,ht);
  rect.setDomAttribute('x',-0.5*wd);
  rect.setDomAttribute('y',-0.5*ht);
  rect.setDomAttribute('rx',radius);
  rect.setDomAttribute('ry',radius);
  //gradient.y1 = "0";
 // gradient.y2 = "0.2";
  gradient.stop0['stop-color'] =this.outerFill;
  gradient.stop1['stop-color'] =this.innerFill;
  gradient.stop2['stop-color'] = this.outerFill;
  rect.fill = 'url(#'+id+')'

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

/* adjustable parameters 
item.dimension = 100;
item.shadeStart = 10;
item.shadeOpacity = 0.5;
item.outerFill = 'black';
item.innerFill = 'red';
item.stroke = 'transparent';
end adjustable parameters */

/*
item.role = 'vertex'; // in a network diagram, this can play the role of vertex
item.resizable = true;

// r can also be used for radius
Object.defineProperty(item, 'r', { set: function(x) {this.dimension = 2 * x; } });

let  gradient = svg.Element.mk('<radialGradient/>');
let stop1,stop2,stop3;

gradient.set('stop0',svg.Element.mk('<stop offset="0%" stop-opacity="0" />'));
gradient.set('stop1',svg.Element.mk('<stop offset="80%" stop-opacity="0" />'));
gradient.set('stop2',svg.Element.mk(' <stop offset="100%"   stop-opacity="0.5" />'));

let defs = svg.Element.mk('<defs/>');
item.set('defs',defs);
item.defs.set('gradient',gradient);//

item.set("__contents",svg.Element.mk('<circle/>'));
item.__contents.neverselectable = true;

let count = 0;
item.update = function () {
  let circle = this.__contents;
  let gradient = this.defs.gradient;
  let id = 'g'+(count++);
  gradient.id = id;
  gradient.cx = "0.25"
  gradient.cy = "0.25"
  gradient.r = "0.25";
  gradient.stop1['stop-color'] =this.innerFill;
  gradient.stop1.offset = this.shadeStart + "%"
  gradient.stop2['stop-color'] = this.outerFill;
  gradient.stop2['stop-opacity'] = String(this.shadeOpacity);
  circle.fill = 'url(#'+id+')'
  circle.r = 0.5 * this.dimension;
}
 
// Needed for positioning connectors (eg arrows) running to or from this item
graph.installCirclePeripheryOps(item);

 // UI configuration for this item. Show the color widget for the fills, and
 // hide the r,__contents,defs properties
item.setFieldType('outerFill','svg.Rgb');
item.setFieldType('innerFill','svg.Rgb');
ui.hide(item,['fill','r','__contents','defs']);
return item;
});
*/

