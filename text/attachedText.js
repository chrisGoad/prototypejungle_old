// arrow

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
         "sep"];


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,propList,own);
}

// arcArrow computes the position and passes it in

item.update = function (ipos) {
  let pos;
  let parent = this.__parent;
  if (ipos) {
     pos = ipos;
  } else {
    let {end0,end1} = parent;
    let length = end0.distance(end1);
    let direction = end1.difference(end0).normalize();
    let normal = direction.normal();
    let toSide = normal.times(this.sep);
    if (this.side === 'left') {
      toSide = toSide.times(-1);
    }
    let along = parent.end0.plus(direction.times(length*this.fractionAlong));
    pos = along.plus(toSide);//radius+this.textSep);
  }
  this.setText(parent.text);
  this.moveto(pos);
  this.center();
}

ui.hide(item,['text','text-anchor','y']);

item.setFieldType('fill','svg.Rgb');

return item;
});

