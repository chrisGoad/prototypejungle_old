// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("__contents",svg.Element.mk(
   '<circle fill="rgb(39, 49, 151)" stroke="black" stroke-width="2" \ r="20" />'));
item.__contents.__unselectable = true;
item.__contents.__show();
item.dimension = 100;
item.fill = item.__contents.fill;
item.stroke = item.__contents.stroke;
item['stroke-width'] = 2;
item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({dimension:'N',fill:'S',stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.fill = color;
  this.__contents.fill = color;
}



item.update = function () {
  var contents = this.__contents;
  if (this.hasOwnProperty('dimension')) {
    contents.r = 0.5 * this.dimension;
  }
  pj.setPropertiesFromOwn(contents,this,['fill','stroke','stroke-width']);
}

item.__adjustable = true;
item.__draggable = true;
// support for the resizer 

item.__getExtent = function () {
  var dim = this.dimension;
  return geom.Point.mk(dim,dim);
}

item.__ownsExtent = function () {
  return this.hasOwnProperty('dimension')
}

item.__setExtent = function (extent,nm) {
  var event,ext;
  console.log('nm',nm);
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if (nm === 'c12')  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
  this.update();
  this.extentEvent.node = this;
  //event = pj.Event.mk('extentChange',this);
  this.extentEvent.emit();
}
 

item.__updateControlPoint = function (idx,pos) {
 
}

ui.hide(item,['__contents']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
