// attachedText

core.require(function () {

let item = svg.Element.mk('<text text-anchor="middle" fill="black" font-size="12" font-style="normal" '+
                          ' font-family="arial" stroke-width="0.2">1</text>');

item.side = 'left';
item.sep = 15;
item.fractionAlong = 0.5;


let propList = ['font-size',
         "stroke-width",
         "font-style",
         "font-family",
         "fill",
         "fractionAlong",
         "side",
         "lineSep"];


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,propList,own);
}

// arcArrow computes the position and passes it in

item.update = function (ipos) {
  let pos;
  let parent = this.__parent;
  this.setText(parent.text);

  if (ipos) {
     pos = ipos;
  } else {
    let {end0,end1} = parent;
    let length = end0.distance(end1);
    let direction = end1.difference(end0).normalize();
	let angle = Math.atan2(direction.y,direction.x);
	let bnds = this.bounds();
	let htx = 0.5 * bnds.extent.x;
	let dist = htx * Math.sin(angle); // this is the distance by which the text should be displaced along normal
    let normal = direction.normal();   
	let  side = (direction.y > 0) === (this.sep > 0); 
	let displacement = normal.times((side?-dist:dist) - this.lineSep);
    let along = parent.end0.plus(direction.times(length*this.fractionAlong));
    pos = along.plus(displacement);//radius+this.textSep);
 }
  this.moveto(pos);
  this.center();
}

ui.hide(item,['text','text-anchor','y']);

item.setFieldType('fill','svg.Rgb');

return item;
});

