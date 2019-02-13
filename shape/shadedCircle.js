//okok
//shadedCircle
// this code implements the shaded circle element in the shape catalog
core.require(function () {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.dimension = 100;
item.shadeStart = 10;
item.shadeOpacity = 0.5;
item.outerFill = 'black';
item.innerFill = 'red';
item.stroke = 'transparent';
/* end adjustable parameters */


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
