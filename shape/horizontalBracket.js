
core.require(function () {



let item = svg.Element.mk('<polyline/>');
item.hookHeight = 10;
item['stroke-width'] = 3;
item.stroke = 'black';
item.width = 30;
item.height = 5;
item.update = function () {
  let points = '';
  this.fill = 'none';
  let w = this.width;
  let h = this.height;
  const addPoint = function (x,y,eol) {
    points += x+','+y+eol;
  }
  addPoint(0.5*w,0.5*h - this.hookHeight,',');
  addPoint(0.5*w,0.5*h,',');
  addPoint(-0.5*w,0.5*h,',');
  addPoint(-0.5*w,0.5*h - this.hookHeight,'');
  this.points = points;
  return;

}


//peripheryOps.installOps(item);
//ui.setTransferredProperties(item,ui.stdTransferredProperties);

/*
item.__transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}
*/
return item;

});
