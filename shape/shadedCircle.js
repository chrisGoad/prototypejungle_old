//shadedCircle
// this code implements the shaded circle element in the shape catalog
core.require(function () {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.dimension = 100;
item.midpoint = 0.7;
item.midOpacity = 0.7;
item.finalOpacity = 1;
item.outerFill = 'rgb(100,100,240)';
item.innerFill = "rgb(230,230,230)";
item.stroke = 'transparent';
item.fx = 0.2;
item.fy = 0.2;
/* end adjustable parameters */

item.role = 'vertex'; // in a network diagram, this can play the role of vertex
item.resizable = true;

// r can also be used for radius
Object.defineProperty(item, 'r', { set: function(x) {this.dimension = 2 * x; } });

let  gradient = svg.Element.mk('<radialGradient/>');
let stop1,stop2,stop3;

gradient.set('stop0',svg.Element.mk('<stop offset="0" stop-opacity="0" />'));
gradient.set('stop1',svg.Element.mk('<stop />'));
gradient.set('stop2',svg.Element.mk(' <stop offset="1" stop-opacity="1"  />'));

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
  gradient.r = 0.5;
  gradient.fx = this.fx;
  gradient.fy = this.fy;
  gradient.stop0['stop-color'] = this.innerFill;
  gradient.stop1['stop-color'] =this.outerFill;
  gradient.stop1.offset = this.midpoint;
  gradient.stop1['stop-opacity'] = this.midOpacity;
  gradient.stop2['stop-color'] = this.outerFill;
  gradient.stop2['stop-opacity'] = this.finalOpacity;
  circle.fill = 'url(#'+id+')'
  circle.r = 0.5 * this.dimension;
}
 
// Needed for positioning connectors (eg arrows) running to or from this item
graph.installCirclePeripheryOps(item);

item.setFieldType('outerFill','svg.Rgb');
item.setFieldType('innerFill','svg.Rgb');
ui.hide(item,['fill','r','__contents','defs']);
return item;
});
